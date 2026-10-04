import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';
import * as xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

// Ensure uploads folder exists outside public directory for privacy
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Systematically archive file on disk
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedFilename = `${Date.now()}_${sanitizedFilename}`;
    const filePath = path.join(uploadsDir, storedFilename);
    fs.writeFileSync(filePath, buffer);

    let recordsAdded = 0;
    let errors = [];
    const processedStudentIds = new Set();
    const skippedStudents = new Set();

    // Helper to extract value from row matching list of potential column names
    const getVal = (row, keys) => {
      for (const k of keys) {
        for (const rowKey of Object.keys(row)) {
          if (rowKey.trim().toLowerCase() === k.toLowerCase()) {
            return row[rowKey];
          }
        }
      }
      return undefined;
    };
    
    // Process standard flat row
    const processFlatRow = async (row) => {
      const studentId = getVal(row, ['Student ID', 'ID', 'student_id', 'id', 'SR NO.', 'PRN', 'Roll No', 'ROLL NO'])?.toString();
      const studentName = getVal(row, ['Student Name', 'Name', 'student_name', 'name', 'NAME OF STUDENT'])?.toString();
      const semester = getVal(row, ['Semester', 'semester', 'SEM', 'Sem'])?.toString() || 'SEM-1';

      if (!studentId || !studentName) {
        return { success: false, error: `Row missing required fields (ID, Name): ${JSON.stringify(row).substring(0, 100)}...` };
      }

      const email = getVal(row, ['Email', 'email'])?.toString();
      const contact = getVal(row, ['Contact', 'contact', 'Phone', 'Mobile'])?.toString();
      const batch = getVal(row, ['Batch', 'batch', 'BATCH', 'Batch Year', 'Session', 'Academic Year', 'Year of Admission'])?.toString();
      const department = getVal(row, ['Department', 'department', 'DEPARTMENT', 'Branch', 'branch', 'BRANCH', 'Dept', 'Course'])?.toString();
      
      const rawCgpa = getVal(row, ['CGPA', 'cgpa', 'GPA', 'gpa', 'SGPA', 'sgpa']);
      
      let cgpa = null;
      let isDrop = false;
      
      const rawCgpaStr = rawCgpa !== undefined && rawCgpa !== null ? rawCgpa.toString().trim().toUpperCase() : '';
      if (!rawCgpaStr || rawCgpaStr === 'DROP' || rawCgpaStr === 'NA' || rawCgpaStr === 'N/A') {
        isDrop = true;
        cgpa = 0;
      } else {
        cgpa = parseFloat(rawCgpa);
        if (isNaN(cgpa)) {
          cgpa = null;
          isDrop = true;
        }
      }
      
      const rawCredits = getVal(row, ['Total Credits', 'total_credits', 'Credits', 'CREDITS']);
      const totalCredits = rawCredits !== undefined && rawCredits !== null ? parseFloat(rawCredits) : null;

      const standardKeys = [
        'student id', 'id', 'student_id', 'sr no.', 'prn', 'roll no',
        'student name', 'name', 'student_name', 'name of student',
        'semester', 'sem', 'email', 'contact', 'phone', 'mobile',
        'batch', 'batch year', 'session', 'academic year', 'year of admission',
        'department', 'branch', 'dept', 'course', 'cgpa', 'gpa', 'sgpa',
        'total credits', 'total_credits', 'credits'
      ];

      const academicData = { isDrop };
      for (const [key, value] of Object.entries(row)) {
        if (!standardKeys.includes(key.trim().toLowerCase()) && value !== undefined && value !== null && value !== '') {
          academicData[key] = value;
        }
      }

      try {
        await prisma.student.upsert({
          where: { id: studentId },
          update: {
            name: studentName,
            ...(email && { email }),
            ...(contact && { contact }),
            ...(batch && { batch }),
            ...(department && { department })
          },
          create: {
            id: studentId,
            name: studentName,
            email: email || null,
            contact: contact || null,
            batch: batch || null,
            department: department || null,
          }
        });

        await prisma.semester.upsert({
          where: {
            studentId_semester: {
              studentId: studentId,
              semester: semester
            }
          },
          update: {
            cgpa: (cgpa !== null && !isNaN(cgpa)) ? cgpa : null,
            totalCredits: (totalCredits !== null && !isNaN(totalCredits)) ? totalCredits : null,
            academicData: JSON.stringify(academicData)
          },
          create: {
            studentId: studentId,
            semester: semester,
            cgpa: (cgpa !== null && !isNaN(cgpa)) ? cgpa : null,
            totalCredits: (totalCredits !== null && !isNaN(totalCredits)) ? totalCredits : null,
            academicData: JSON.stringify(academicData)
          }
        });
        processedStudentIds.add(studentId);
        return { success: true };
      } catch (err) {
        return { success: false, error: `Error processing student ${studentId}: ${err.message}` };
      }
    };

    // Helper to process horizontal format (SEM-1, SEM-2 as columns)
    const processHorizontalData = async (grid) => {
      let headerRowIndex = -1;
      let headers = [];
      
      let globalBatch = null;
      let globalDept = null;
      
      for (let i = 0; i < grid.length; i++) {
        const row = grid[i];
        if (!row) continue;
        const rowStr = JSON.stringify(row).toUpperCase();
        
        // Extract global batch/dept before finding header row
        if (headerRowIndex === -1) {
          for (const cell of row) {
            if (!cell) continue;
            const text = cell.toString().trim();
            
            // Check for Batch
            const batchRegex = /(?:Batch|Session|Academic Year)\s*[:=-]?\s*([A-Za-z0-9-]+)/i;
            const bMatch = text.match(batchRegex);
            if (bMatch && bMatch[1]) {
              globalBatch = bMatch[1].trim();
            } else if (/Batch/i.test(text)) {
              globalBatch = text.replace(/Batch/i, '').replace(/[:=-]/g, '').trim();
            }

            // Check for Department
            const deptRegex = /(?:Department|Branch|Dept|Course)\s*[:=-]?\s*([A-Za-z0-9\s&]+)/i;
            const dMatch = text.match(deptRegex);
            if (dMatch && dMatch[1]) {
              const matchVal = dMatch[1].trim();
              if (matchVal) globalDept = matchVal;
              else globalDept = text.replace(/(?:Department|Branch|Dept|Course)/i, '').replace(/[:=-]/g, '').trim();
            } else if (/(Engineering|Technology|Science|Arts|Commerce|Dept)/i.test(text) && !/Batch/i.test(text)) {
              globalDept = text;
            }
          }
        }

        if (rowStr.includes('NAME') || rowStr.includes('STUDENT')) {
          headerRowIndex = i;
          headers = row.map(cell => cell ? cell.toString().trim().toUpperCase() : '');
          break;
        }
      }

      if (headerRowIndex === -1) {
        throw new Error("Could not find a valid header row containing student names.");
      }

      const nameIdx = headers.findIndex(h => h.includes('NAME'));
      const idIdx = headers.findIndex(h => h.includes('ID') || h.includes('PRN') || h.includes('SR NO') || h.includes('ROLL'));
      const batchIdx = headers.findIndex(h => h.includes('BATCH') || h.includes('SESSION') || h.includes('YEAR'));
      const deptIdx = headers.findIndex(h => h.includes('BRANCH') || h.includes('DEPT') || h.includes('COURSE') || h.includes('DEPARTMENT'));

      const semColumns = [];
      headers.forEach((h, idx) => {
        if (h.includes('SEM-') || h.includes('SEMESTER') || /^SEM\s*\d+/i.test(h)) {
          semColumns.push({ index: idx, name: h });
        }
      });

      if (nameIdx === -1 || semColumns.length === 0) {
        throw new Error("Could not find Name or Semester columns in horizontal format.");
      }

      for (let i = headerRowIndex + 1; i < grid.length; i++) {
        const row = grid[i];
        if (!row || row.length === 0 || !row[nameIdx]) continue;
        
        if (row[nameIdx].toString().toUpperCase().includes('CGPA') || row[nameIdx].toString().toUpperCase().includes('R/DSE')) {
          continue;
        }

        const studentName = row[nameIdx].toString().trim();
        const studentId = (idIdx !== -1 && row[idIdx]) ? row[idIdx].toString().trim() : studentName.replace(/\s+/g, '_').toLowerCase();
        let batch = (batchIdx !== -1 && row[batchIdx]) ? row[batchIdx].toString().trim() : null;
        if (!batch) batch = globalBatch;
        
        let department = (deptIdx !== -1 && row[deptIdx]) ? row[deptIdx].toString().trim() : null;
        if (!department) department = globalDept;

        const academicData = {};
        headers.forEach((h, idx) => {
          if (idx !== nameIdx && idx !== idIdx && !h.includes('SEM-') && !h.includes('SEMESTER') && row[idx]) {
            if (h !== '') academicData[h] = row[idx];
          }
        });

        try {
          await prisma.student.upsert({
            where: { id: studentId },
            update: {
              name: studentName,
              ...(batch && { batch }),
              ...(department && { department })
            },
            create: {
              id: studentId,
              name: studentName,
              batch: batch,
              department: department
            }
          });
          processedStudentIds.add(studentId);
        } catch (err) {
          errors.push(`Error creating student ${studentName}: ${err.message}`);
          continue;
        }

        let addedSemForStudent = false;
        for (const semCol of semColumns) {
          const val = row[semCol.index];
          let cgpa = 0;
          let isDrop = false;
          
          const valStr = val !== undefined && val !== null ? val.toString().trim().toUpperCase() : '';
          if (!valStr || valStr === 'DROP' || valStr === 'NA' || valStr === 'N/A') {
            isDrop = true;
          } else {
            cgpa = parseFloat(val);
            if (isNaN(cgpa)) continue;
          }

          try {
            await prisma.semester.upsert({
              where: {
                studentId_semester: {
                  studentId: studentId,
                  semester: semCol.name
                }
              },
              update: {
                cgpa: cgpa,
                academicData: JSON.stringify({ ...academicData, isDrop })
              },
              create: {
                studentId: studentId,
                semester: semCol.name,
                cgpa: cgpa,
                academicData: JSON.stringify({ ...academicData, isDrop })
              }
            });
            recordsAdded++;
            addedSemForStudent = true;
          } catch (err) {
            errors.push(`Error adding ${semCol.name} for ${studentName}: ${err.message}`);
          }
        }
        
        if (!addedSemForStudent) {
          errors.push(`No valid semester data found for student ${studentName}`);
        }
      }
    };

    // File format routing
    if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const grid = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      
      if (grid.length === 0) {
        return NextResponse.json({ error: 'The Excel file is empty.' }, { status: 400 });
      }

      // Detect if it's a horizontal format or flat format
      let isHorizontal = false;
      if (grid[0] && grid[0].length > 0) {
        const firstRowStr = JSON.stringify(grid[0]).toUpperCase();
        if (!firstRowStr.includes('ID') && !firstRowStr.includes('NAME') && !firstRowStr.includes('SEMESTER') && !firstRowStr.includes('ROLL')) {
          isHorizontal = true;
        }
      } else {
        isHorizontal = true; // Header is not on row 0
      }

      if (isHorizontal) {
        try {
          await processHorizontalData(grid);
        } catch (err) {
          errors.push(`Horizontal parsing failed: ${err.message}`);
        }
      } else {
        const flatData = xlsx.utils.sheet_to_json(sheet);
        for (const row of flatData) {
          const res = await processFlatRow(row);
          if (res.success) recordsAdded++;
          else errors.push(res.error);
        }
      }
    } else if (file.name.toLowerCase().endsWith('.csv')) {
      if (buffer.includes(0x00)) {
        return NextResponse.json({ error: 'Invalid CSV file. It appears to be a binary file (like an Excel file renamed to .csv). Please upload a valid CSV file.' }, { status: 400 });
      }
      
      const text = buffer.toString('utf-8');
      
      // Parse as 2D array grid first to determine format
      const gridResult = Papa.parse(text, { header: false, skipEmptyLines: true });
      const grid = gridResult.data;
      
      if (grid.length === 0) {
        return NextResponse.json({ error: 'The CSV file is empty.' }, { status: 400 });
      }

      // Detect if it's a horizontal format or flat format
      let isHorizontal = false;
      const firstRowStr = JSON.stringify(grid[0]).toUpperCase();
      
      // If the first row contains standard headers, it's flat. Otherwise it's likely horizontal with metadata headers.
      if (!firstRowStr.includes('ID') && !firstRowStr.includes('NAME') && !firstRowStr.includes('SEMESTER') && !firstRowStr.includes('ROLL')) {
        isHorizontal = true;
      }
      
      if (isHorizontal) {
        try {
          await processHorizontalData(grid);
        } catch (err) {
          errors.push(`Horizontal parsing failed: ${err.message}`);
        }
      } else {
        const flatResult = Papa.parse(text, { header: true, skipEmptyLines: true });
        for (const row of flatResult.data) {
          const res = await processFlatRow(row);
          if (res.success) recordsAdded++;
          else errors.push(res.error);
        }
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file format. Please upload CSV or Excel (.xlsx) files.' }, { status: 400 });
    }

    // Slice errors to prevent 500 error if there are thousands of errors
    if (errors.length > 100) {
      const totalErrors = errors.length;
      errors = errors.slice(0, 50);
      errors.push(`... and ${totalErrors - 50} more errors.`);
    }

    // Log upload history
    await prisma.uploadHistory.create({
      data: {
        filename: file.name,
        status: errors.length === 0 && recordsAdded > 0 ? 'SUCCESS' : (recordsAdded > 0 ? 'PARTIAL' : 'FAILED'),
        recordsAdded,
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
        studentIds: processedStudentIds.size > 0 ? JSON.stringify(Array.from(processedStudentIds)) : null,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed file and imported ${recordsAdded} records.`,
      errors: errors.length > 0 ? errors : undefined,
      skippedStudents: skippedStudents.size > 0 ? Array.from(skippedStudents) : undefined,
      storedAs: storedFilename
    });

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

const fs = require('fs');
const Papa = require('papaparse');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testLogic() {
  try {
    const buffer = fs.readFileSync('public/uploads/1786945807084_Summary_91-120.csv');
    const text = buffer.toString('utf-8');
    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
    
    let recordsAdded = 0;
    let errors = [];
    const processedStudentIds = new Set();
    
    console.log(`Parsed ${result.data.length} rows.`);

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

    const processFlatRow = async (row) => {
      const studentId = getVal(row, ['Student ID', 'ID', 'student_id', 'id', 'SR NO.', 'PRN', 'Roll No', 'ROLL NO'])?.toString();
      const studentName = getVal(row, ['Student Name', 'Name', 'student_name', 'name', 'NAME OF STUDENT'])?.toString();
      const semester = getVal(row, ['Semester', 'semester', 'SEM', 'Sem'])?.toString() || 'SEM-1';

      if (!studentId || !studentName) {
        return { success: false, error: `Row missing ID/Name.` };
      }

      const email = getVal(row, ['Email', 'email'])?.toString();
      const contact = getVal(row, ['Contact', 'contact', 'Phone', 'Mobile'])?.toString();
      const batch = getVal(row, ['Batch', 'batch', 'BATCH', 'Batch Year', 'Session', 'Academic Year', 'Year of Admission'])?.toString();
      const department = getVal(row, ['Department', 'department', 'DEPARTMENT', 'Branch', 'branch', 'BRANCH', 'Dept', 'Course'])?.toString();
      
      const rawCgpa = getVal(row, ['CGPA', 'cgpa', 'GPA', 'gpa', 'SGPA', 'sgpa']);
      const cgpa = rawCgpa !== undefined && rawCgpa !== null ? parseFloat(rawCgpa) : null;
      
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

      const academicData = {};
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
        return { success: false, error: err.message };
      }
    };

    for (let i = 0; i < result.data.length; i++) {
      const res = await processFlatRow(result.data[i]);
      if (res.success) recordsAdded++;
      else errors.push(res.error);
    }
    console.log(`Processed all rows. Records added: ${recordsAdded}, Errors: ${errors.length}`);
    
    console.log('Testing uploadHistory.create...');
    await prisma.uploadHistory.create({
      data: {
        filename: 'Summary_91-120.csv',
        status: errors.length === 0 ? 'SUCCESS' : (recordsAdded > 0 ? 'PARTIAL' : 'FAILED'),
        recordsAdded,
        errors: errors.length > 0 ? JSON.stringify(errors) : null,
        studentIds: processedStudentIds.size > 0 ? JSON.stringify(Array.from(processedStudentIds)) : null,
      }
    });
    console.log('Done!');
  } catch (err) {
    console.error('Fatal Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
testLogic();

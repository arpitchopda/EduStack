import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const batch = searchParams.get('batch');
    const department = searchParams.get('department');
    const gender = searchParams.get('gender');
    const joiningType = searchParams.get('joiningType');
    const dropperSem = searchParams.get('dropperSem'); // e.g. "SEM-3"

    const whereClause = {};

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { id: { contains: query } }
      ];
    }

    if (batch && batch !== 'ALL') {
      whereClause.batch = batch;
    }

    if (department && department !== 'ALL') {
      whereClause.department = department;
    }

    let students = await prisma.student.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      include: {
        semesters: true // Include all to check for dropouts
      }
    });

    // In-memory filtering for advanced JSON properties & dropout logic
    if ((gender && gender !== 'ALL') || (joiningType && joiningType !== 'ALL') || (dropperSem && dropperSem !== 'ALL')) {
      students = students.filter(student => {
        let sGender = '';
        let sJoiningType = '';
        
        if (student.semesters.length > 0 && student.semesters[0]?.academicData) {
          try {
            const ad = JSON.parse(student.semesters[0].academicData);
            sGender = ad['GENDER'] || ad['gender'] || '';
            sJoiningType = ad['JOINING TYPE'] || ad['joining type'] || '';
          } catch (e) {}
        }

        if (gender && gender !== 'ALL' && !sGender.toLowerCase().startsWith(gender.toLowerCase())) {
          return false;
        }

        if (joiningType && joiningType !== 'ALL' && sJoiningType !== joiningType) {
          return false;
        }

        if (dropperSem && dropperSem !== 'ALL') {
          const normalizedExpected = dropperSem.toUpperCase().replace(/[\s-]/g, '').replace('SEMESTER', 'SEM');
          const found = student.semesters.find(s => {
            const normS = s.semester.toUpperCase().replace(/[\s-]/g, '').replace('SEMESTER', 'SEM');
            return normS === normalizedExpected;
          });
          
          if (!found) {
            // If they don't have a record for this semester, we can't definitively call them a dropper for it
            // (they might just be in a lower semester). Exclude them.
            return false;
          }
          
          let isDrop = false;
          try {
            const ad = JSON.parse(found.academicData || '{}');
            if (ad.isDrop === true) isDrop = true;
          } catch(e) {}
          
          // If it's NOT a drop, and they have a valid cgpa, they are not a dropper for this sem
          if (!isDrop && found.cgpa !== null && found.cgpa !== undefined) {
            return false;
          }
        }

        return true;
      });
    }

    // Return unique batches, departments, and joining types for frontend dropdowns
    const batchesSet = new Set();
    const deptsSet = new Set();
    const joiningTypesSet = new Set();

    const allStudentsForFilters = await prisma.student.findMany({ include: { semesters: { take: 1 } } });
    allStudentsForFilters.forEach(s => {
      if (s.batch) batchesSet.add(s.batch);
      if (s.department) deptsSet.add(s.department);
      if (s.semesters[0]?.academicData) {
        try {
          const ad = JSON.parse(s.semesters[0].academicData);
          if (!s.batch && ad['BATCH']) batchesSet.add(ad['BATCH'].toString());
          if (!s.department && ad['BRANCH']) deptsSet.add(ad['BRANCH'].toString());
          if (!s.department && ad['DEPARTMENT']) deptsSet.add(ad['DEPARTMENT'].toString());
          if (ad['JOINING TYPE']) joiningTypesSet.add(ad['JOINING TYPE'].toString());
        } catch(e) {}
      }
    });

    return NextResponse.json({ 
      students: students.slice(0, 500), // Limit results to avoid massive payloads
      availableFilters: {
        batches: Array.from(batchesSet).sort(),
        departments: Array.from(deptsSet).sort(),
        joiningTypes: Array.from(joiningTypesSet).sort()
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

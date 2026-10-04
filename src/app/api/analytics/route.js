import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterBatch = searchParams.get('batch');
    const filterDept = searchParams.get('department');
    const filterGender = searchParams.get('gender');
    const minCgpa = searchParams.get('minCgpa') ? parseFloat(searchParams.get('minCgpa')) : null;
    const maxCgpa = searchParams.get('maxCgpa') ? parseFloat(searchParams.get('maxCgpa')) : null;
    const isDrop = searchParams.get('isDrop') === 'true';

    // Fetch all students to extract available filter options
    const allStudentsRaw = await prisma.student.findMany({
      include: { semesters: true }
    });

    if (allStudentsRaw.length === 0) {
      return NextResponse.json({
        totalFilteredStudents: 0,
        availableFilters: {
          batches: [],
          departments: []
        },
        topScorers: [],
        leastScorers: [],
        semesterTrend: [],
        gradeDistribution: [],
        batchDistribution: [],
        departmentDistribution: [],
        demographics: {
          gender: [],
          joiningType: []
        },
        totalDropouts: 0,
        dropsPerSemester: [],
        droppers: []
      });
    }

    // Extract unique batches and departments for UI filter dropdowns
    const batchesSet = new Set();
    const deptsSet = new Set();

    allStudentsRaw.forEach(s => {
      if (s.batch) batchesSet.add(s.batch);
      if (s.department) deptsSet.add(s.department);

      // Check academicData for batch/department if not set on Student directly
      if (s.semesters[0]?.academicData) {
        try {
          const ad = JSON.parse(s.semesters[0].academicData);
          if (!s.batch && ad['BATCH']) batchesSet.add(ad['BATCH'].toString());
          if (!s.department && ad['BRANCH']) deptsSet.add(ad['BRANCH'].toString());
          if (!s.department && ad['DEPARTMENT']) deptsSet.add(ad['DEPARTMENT'].toString());
        } catch(e) {}
      }
    });

    const availableBatches = Array.from(batchesSet).sort();
    const availableDepartments = Array.from(deptsSet).sort();

    // Filter students based on query parameters
    let filteredStudents = allStudentsRaw.filter(student => {
      // Batch filter
      if (filterBatch && filterBatch !== 'ALL') {
        let sBatch = student.batch;
        if (!sBatch && student.semesters[0]?.academicData) {
          try {
            const ad = JSON.parse(student.semesters[0].academicData);
            sBatch = ad['BATCH'];
          } catch(e) {}
        }
        if (sBatch !== filterBatch) return false;
      }

      // Department filter
      if (filterDept && filterDept !== 'ALL') {
        let sDept = student.department;
        if (!sDept && student.semesters[0]?.academicData) {
          try {
            const ad = JSON.parse(student.semesters[0].academicData);
            sDept = ad['BRANCH'] || ad['DEPARTMENT'] || ad['Dept'];
          } catch(e) {}
        }
        if (sDept !== filterDept) return false;
      }

      // Gender filter
      if (filterGender && filterGender !== 'ALL') {
        let gender = '';
        if (student.semesters[0]?.academicData) {
          try {
            const ad = JSON.parse(student.semesters[0].academicData);
            gender = ad['GENDER'] || ad['gender'] || '';
          } catch(e) {}
        }
        if (!gender.toLowerCase().startsWith(filterGender.toLowerCase())) return false;
      }

      return true;
    });

    let allSemesters = [];
    let genderCounts = { Male: 0, Female: 0, Other: 0 };
    let joiningTypeCounts = {};
    let batchCounts = {};
    let deptCounts = {};
    let studentAverages = [];
    let droppers = [];
    const MAX_SEMESTERS = 8;
    
    const EXPECTED_SEMESTERS = ['SEM-1', 'SEM-2', 'SEM-3', 'SEM-4', 'SEM-5', 'SEM-6', 'SEM-7', 'SEM-8'];
    let semesterDrops = { 'SEM-1': 0, 'SEM-2': 0, 'SEM-3': 0, 'SEM-4': 0, 'SEM-5': 0, 'SEM-6': 0, 'SEM-7': 0, 'SEM-8': 0 };

    // Grade Distribution Histogram
    const gradeBins = {
      '9.00 - 10.00 (O)': 0,
      '8.00 - 8.99 (A+)': 0,
      '7.00 - 7.99 (A)': 0,
      '6.00 - 6.99 (B+)': 0,
      '5.50 - 5.99 (B)': 0,
      '5.00 - 5.49 (C)': 0,
      '4.00 - 4.99 (P)': 0,
      'Below 4.00 (F)': 0,
      'Dropped (DROP)': 0,
    };

    for (const student of filteredStudents) {
      if (student.semesters.length === 0) continue;

      let totalCgpa = 0;
      let validSems = 0;

      let hasDrop = false;

      student.semesters.forEach(sem => {
        allSemesters.push(sem);
        
        let semIsDrop = false;
        try {
          const ad = JSON.parse(sem.academicData || '{}');
          if (ad.isDrop) semIsDrop = true;
        } catch(e) {}

        if (semIsDrop) hasDrop = true;

        if (sem.cgpa !== null && sem.cgpa !== undefined && !semIsDrop) {
          totalCgpa += sem.cgpa;
          validSems++;
        }
      });

      const avgCgpa = validSems > 0 ? parseFloat((totalCgpa / validSems).toFixed(2)) : 0;

      // Apply Filter
      if (isDrop && !hasDrop) continue;
      if (!isDrop && minCgpa !== null && avgCgpa < minCgpa) continue;
      if (!isDrop && maxCgpa !== null && avgCgpa > maxCgpa) continue;

      if (validSems > 0 || hasDrop) {
        studentAverages.push({
          id: student.id,
          name: student.name,
          avgCgpa: avgCgpa,
          semCount: validSems,
          batch: student.batch || 'N/A',
          department: student.department || 'N/A'
        });

        // Histogram binning
        if (hasDrop && validSems === 0) gradeBins['Dropped (DROP)']++;
        else if (avgCgpa >= 9.0) gradeBins['9.00 - 10.00 (O)']++;
        else if (avgCgpa >= 8.0) gradeBins['8.00 - 8.99 (A+)']++;
        else if (avgCgpa >= 7.0) gradeBins['7.00 - 7.99 (A)']++;
        else if (avgCgpa >= 6.0) gradeBins['6.00 - 6.99 (B+)']++;
        else if (avgCgpa >= 5.5) gradeBins['5.50 - 5.99 (B)']++;
        else if (avgCgpa >= 5.0) gradeBins['5.00 - 5.49 (C)']++;
        else if (avgCgpa >= 4.0) gradeBins['4.00 - 4.99 (P)']++;
        else gradeBins['Below 4.00 (F)']++;
      }

      if (hasDrop) {
        droppers.push({
          id: student.id,
          name: student.name,
          completed: validSems
        });
      }

      // Dropout / Missing GPA calculation for Sem 1 to 8 (Kept for the chart)
      EXPECTED_SEMESTERS.forEach(expectedSem => {
        // Normalize semester strings to compare (e.g. "SEM-1", "SEM 1", "SEMESTER 1")
        const normalizedExpected = expectedSem.toUpperCase().replace(/[\s-]/g, '').replace('SEMESTER', 'SEM');
        const found = student.semesters.find(s => {
          const normS = s.semester.toUpperCase().replace(/[\s-]/g, '').replace('SEMESTER', 'SEM');
          return normS === normalizedExpected;
        });
        
        if (found) {
          let isDrop = false;
          try {
            const ad = JSON.parse(found.academicData || '{}');
            if (ad.isDrop) isDrop = true;
          } catch(e) {}
          
          if (isDrop || found.cgpa === null || found.cgpa === undefined) {
            semesterDrops[expectedSem]++;
          }
        }
      });

      // Demographic & Batch/Department distribution for filtered set
      const bKey = student.batch || 'Unspecified Batch';
      batchCounts[bKey] = (batchCounts[bKey] || 0) + 1;

      const dKey = student.department || 'Unspecified Dept';
      deptCounts[dKey] = (deptCounts[dKey] || 0) + 1;

      if (student.semesters[0]?.academicData) {
        try {
          const ad = JSON.parse(student.semesters[0].academicData);
          if (ad['GENDER']) {
            const g = ad['GENDER'].toString().toLowerCase();
            if (g.startsWith('m')) genderCounts.Male++;
            else if (g.startsWith('f')) genderCounts.Female++;
            else genderCounts.Other++;
          }
          if (ad['JOINING TYPE']) {
            const jt = ad['JOINING TYPE'];
            joiningTypeCounts[jt] = (joiningTypeCounts[jt] || 0) + 1;
          }
        } catch(e) {}
      }
    }

    studentAverages.sort((a, b) => b.avgCgpa - a.avgCgpa);
    const topScorers = studentAverages.slice(0, 5);
    const leastScorers = studentAverages.slice(-5).reverse();

    // Semester Trends
    const semMap = {};
    allSemesters.forEach(sem => {
      if (sem.cgpa !== null && sem.cgpa !== undefined) {
        if (!semMap[sem.semester]) {
          semMap[sem.semester] = { total: 0, count: 0 };
        }
        semMap[sem.semester].total += sem.cgpa;
        semMap[sem.semester].count++;
      }
    });

    const semesterTrend = Object.keys(semMap).sort().map(sem => ({
      name: sem,
      average: parseFloat((semMap[sem].total / semMap[sem].count).toFixed(2))
    }));

    const genderData = [
      { name: 'Male', value: genderCounts.Male },
      { name: 'Female', value: genderCounts.Female }
    ].filter(d => d.value > 0);

    const joiningData = Object.entries(joiningTypeCounts).map(([k, v]) => ({ name: k, value: v }));
    const batchData = Object.entries(batchCounts).map(([k, v]) => ({ name: k, value: v }));
    const deptData = Object.entries(deptCounts).map(([k, v]) => ({ name: k, value: v }));

    const gradeDistribution = Object.entries(gradeBins).map(([range, count]) => ({
      range,
      count
    }));

    const dropsPerSemester = Object.entries(semesterDrops).map(([semester, drops]) => ({
      semester,
      drops
    }));

    return NextResponse.json({
      totalFilteredStudents: studentAverages.length,
      availableFilters: {
        batches: availableBatches,
        departments: availableDepartments
      },
      topScorers,
      leastScorers,
      semesterTrend,
      gradeDistribution,
      batchDistribution: batchData,
      departmentDistribution: deptData,
      demographics: {
        gender: genderData,
        joiningType: joiningData
      },
      totalDropouts: droppers.length,
      dropsPerSemester: dropsPerSemester,
      droppers: droppers.slice(0, 10)
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

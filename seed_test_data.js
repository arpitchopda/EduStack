const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const students = [
    {
      id: 'S2020_01',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@college.edu',
      contact: '9876543210',
      batch: '2020-21',
      department: 'Computer Science',
      semesters: [
        { semester: 'SEM-1', cgpa: 8.8, totalCredits: 20 },
        { semester: 'SEM-2', cgpa: 9.1, totalCredits: 22 },
        { semester: 'SEM-3', cgpa: 9.4, totalCredits: 21 },
        { semester: 'SEM-4', cgpa: 9.2, totalCredits: 20 },
      ]
    },
    {
      id: 'S2020_02',
      name: 'Ananya Patel',
      email: 'ananya.p@college.edu',
      contact: '9876543211',
      batch: '2020-21',
      department: 'Computer Science',
      semesters: [
        { semester: 'SEM-1', cgpa: 9.5, totalCredits: 20 },
        { semester: 'SEM-2', cgpa: 9.6, totalCredits: 22 },
        { semester: 'SEM-3', cgpa: 9.8, totalCredits: 21 },
        { semester: 'SEM-4', cgpa: 9.7, totalCredits: 20 },
      ]
    },
    {
      id: 'S2020_03',
      name: 'Rohan Mehta',
      email: 'rohan.m@college.edu',
      contact: '9876543212',
      batch: '2020-21',
      department: 'Electrical Engineering',
      semesters: [
        { semester: 'SEM-1', cgpa: 7.2, totalCredits: 20 },
        { semester: 'SEM-2', cgpa: 7.5, totalCredits: 22 },
        { semester: 'SEM-3', cgpa: 7.1, totalCredits: 21 },
      ]
    },
    {
      id: 'S2021_01',
      name: 'Diya Verma',
      email: 'diya.v@college.edu',
      contact: '9876543213',
      batch: '2021-22',
      department: 'Computer Science',
      semesters: [
        { semester: 'SEM-1', cgpa: 8.9, totalCredits: 20 },
        { semester: 'SEM-2', cgpa: 9.0, totalCredits: 22 },
      ]
    },
    {
      id: 'S2021_02',
      name: 'Kabir Singh',
      email: 'kabir.s@college.edu',
      contact: '9876543214',
      batch: '2021-22',
      department: 'Mechanical Engineering',
      semesters: [
        { semester: 'SEM-1', cgpa: 6.8, totalCredits: 20 },
        { semester: 'SEM-2', cgpa: 6.4, totalCredits: 22 },
      ]
    },
    {
      id: 'S2022_01',
      name: 'Isha Reddy',
      email: 'isha.r@college.edu',
      contact: '9876543215',
      batch: '2022-23',
      department: 'Information Technology',
      semesters: [
        { semester: 'SEM-1', cgpa: 9.2, totalCredits: 20 },
      ]
    }
  ];

  for (const s of students) {
    await prisma.student.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        email: s.email,
        contact: s.contact,
        batch: s.batch,
        department: s.department
      },
      create: {
        id: s.id,
        name: s.name,
        email: s.email,
        contact: s.contact,
        batch: s.batch,
        department: s.department
      }
    });

    for (const sem of s.semesters) {
      await prisma.semester.upsert({
        where: {
          studentId_semester: {
            studentId: s.id,
            semester: sem.semester
          }
        },
        update: {
          cgpa: sem.cgpa,
          totalCredits: sem.totalCredits,
          academicData: JSON.stringify({ BATCH: s.batch, BRANCH: s.department })
        },
        create: {
          studentId: s.id,
          semester: sem.semester,
          cgpa: sem.cgpa,
          totalCredits: sem.totalCredits,
          academicData: JSON.stringify({ BATCH: s.batch, BRANCH: s.department })
        }
      });
    }
  }

  console.log('Database seeded with sample batch data (2020-21, 2021-22, 2022-23)!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());

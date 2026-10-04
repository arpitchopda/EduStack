const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearData() {
  console.log('Clearing all student, semester, and upload history records...');
  
  await prisma.semester.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.uploadHistory.deleteMany({});

  console.log('Database successfully cleared! All records reset.');
}

clearData()
  .catch(err => {
    console.error('Error clearing database:', err);
  })
  .finally(() => {
    prisma.$disconnect();
  });

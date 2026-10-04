const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const students = await prisma.student.findMany({ take: 2 });
    const studentIds = students.map(s => s.id);
    console.log('studentIds to update:', studentIds);
    
    if (studentIds.length > 0) {
      const result = await prisma.student.updateMany({
        where: {
          id: { in: studentIds }
        },
        data: {
          batch: "TEST_BATCH_123"
        }
      });
      console.log('Update result:', result);
    } else {
      console.log('No students found to test');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

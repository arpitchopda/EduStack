const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log("Exporting data from SQLite...");
  const students = await prisma.student.findMany({
    include: {
      semesters: true,
    }
  });
  
  const uploadHistory = await prisma.uploadHistory.findMany();

  const data = {
    students,
    uploadHistory
  };

  fs.writeFileSync('db_backup.json', JSON.stringify(data, null, 2));
  console.log(`Exported ${students.length} students and ${uploadHistory.length} upload history records.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

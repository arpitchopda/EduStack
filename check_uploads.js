const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const uploads = await prisma.uploadHistory.findMany({
    orderBy: { uploadDate: 'desc' },
    take: 5
  });
  console.log('Latest 5 uploads:');
  uploads.forEach(u => {
    console.log(`- ${u.filename}: recordsAdded=${u.recordsAdded}, studentIds=${u.studentIds ? 'PRESENT (' + JSON.parse(u.studentIds).length + ')' : 'NULL'}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const all = await prisma.student.findFirst({
    include: { semesters: true }
  });
  console.log(JSON.stringify(all, null, 2));
}
check();

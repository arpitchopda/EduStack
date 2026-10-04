if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@apshah.edu' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@apshah.edu',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'ADMIN',
    },
  });
  
  console.log('Seeded admin user:', user.email, 'password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

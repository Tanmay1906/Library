require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seedAdmin() {
  const password = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@library.com',
      phone: '+911234567890',
      password
    }
  });
  console.log('Seeded initial admin');
  process.exit();
}

seedAdmin();

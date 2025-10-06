const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const seedAdmin = async () => {
  try {
    console.log('🌱 Starting admin seeding process...');

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { email: 'admin@librarymate.com' },
          { email: 'super@librarymate.com' }
        ]
      }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Skipping seeding.');
      console.log(`📧 Existing admin email: ${existingAdmin.email}`);
      return;
    }

    // Hash password for security
    const hashedPassword = await bcrypt.hash('LibraryMate@123', 10);

    // Create default admin user
    const admin = await prisma.admin.create({
      data: {
        name: 'System Administrator',
        email: 'admin@librarymate.com',
        phone: '+919876543210',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@librarymate.com');
    console.log('🔒 Password: LibraryMate@123');
    console.log('🆔 Admin ID:', admin.id);
    console.log('\n⚠️  IMPORTANT: Change the default password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run if called directly
if (require.main === module) {
  seedAdmin()
    .then(() => {
      console.log('🎉 Admin seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAdmin };

/**
 * Database Diagnostic Script
 * Check database connection and tables
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Check if tables exist
    try {
      const bookCount = await prisma.book.count();
      console.log(`📚 Books table exists. Found ${bookCount} books.`);
    } catch (error) {
      console.log('❌ Books table does not exist:', error.message);
    }
    
    // Check other tables
    try {
      const adminCount = await prisma.admin.count();
      console.log(`👥 Admins table exists. Found ${adminCount} admins.`);
    } catch (error) {
      console.log('❌ Admins table does not exist:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
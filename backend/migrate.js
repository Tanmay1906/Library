#!/usr/bin/env node
/**
 * Database Migration Script
 * Run this to set up database tables
 */

const { exec } = require('child_process');

console.log('🔄 Starting database migration...');

exec('npx prisma migrate deploy', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  
  if (stderr) {
    console.warn('⚠️ Migration warnings:', stderr);
  }
  
  console.log('✅ Migration completed successfully!');
  console.log(stdout);
  
  // Optionally run seed data
  console.log('🌱 Running seed data...');
  exec('npm run seed', (seedError, seedStdout, seedStderr) => {
    if (seedError) {
      console.warn('⚠️ Seeding failed (this is optional):', seedError.message);
    } else {
      console.log('✅ Sample data seeded!');
      console.log(seedStdout);
    }
    process.exit(0);
  });
});
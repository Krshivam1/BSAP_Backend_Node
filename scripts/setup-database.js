#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting database setup...');

// Check if required environment variables are set
const requiredEnvVars = ['DB_NAME', 'DB_USERNAME', 'DB_PASSWORD', 'DB_HOST'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.log('\n💡 Please set these variables in your .env file');
  process.exit(1);
}

// Check if migrations directory exists
const migrationsPath = path.join(__dirname, 'src', 'migrations');
const seedersPath = path.join(__dirname, 'src', 'seeders');

if (!fs.existsSync(migrationsPath)) {
  console.error('❌ Migrations directory not found:', migrationsPath);
  process.exit(1);
}

if (!fs.existsSync(seedersPath)) {
  console.error('❌ Seeders directory not found:', seedersPath);
  process.exit(1);
}

// Function to run command and return promise
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${description}...`);
    console.log(`   Command: ${command}`);
    
    exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Failed: ${description}`);
        console.error('Error:', error.message);
        if (stderr) console.error('Stderr:', stderr);
        reject(error);
      } else {
        console.log(`✅ Success: ${description}`);
        if (stdout) console.log('Output:', stdout);
        resolve(stdout);
      }
    });
  });
}

async function setupDatabase() {
  try {
    // Step 1: Create database if it doesn't exist
    await runCommand(
      `npx sequelize-cli db:create`,
      'Creating database'
    );

    // Step 2: Run migrations
    await runCommand(
      `npx sequelize-cli db:migrate`,
      'Running database migrations'
    );

    // Step 3: Run seeders
    await runCommand(
      `npx sequelize-cli db:seed:all`,
      'Running database seeders'
    );

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Database Summary:');
    console.log('   • All tables created with proper relationships');
    console.log('   • Initial data seeded for all entities');
    console.log('   • Admin user created (username: admin, password: admin123)');
    console.log('   • Test user created (username: testuser, password: test123)');
    console.log('   • Sample performance data and configurations loaded');
    
    console.log('\n🔐 Default Admin Credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@performancestatistics.in');
    
    console.log('\n🔗 Next Steps:');
    console.log('   1. Start the application: npm start');
    console.log('   2. Access the API at: http://localhost:3000');
    console.log('   3. Login with the admin credentials above');

  } catch (error) {
    console.error('\n❌ Database setup failed!');
    console.error('Error details:', error.message);
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('   1. Ensure MySQL server is running');
    console.log('   2. Check database credentials in .env file');
    console.log('   3. Verify database user has necessary permissions');
    console.log('   4. Check if database already exists and has conflicting data');
    
    console.log('\n🔄 Reset Database (if needed):');
    console.log('   npx sequelize-cli db:drop');
    console.log('   npm run db:setup');
    
    process.exit(1);
  }
}

// Handle script arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('\n📖 Database Setup Script');
  console.log('\nUsage: npm run db:setup [options]');
  console.log('\nOptions:');
  console.log('  --help, -h     Show this help message');
  console.log('  --force        Force database recreation (drops existing)');
  console.log('\nEnvironment Variables Required:');
  console.log('  DB_NAME        Database name');
  console.log('  DB_USERNAME    Database username');
  console.log('  DB_PASSWORD    Database password');
  console.log('  DB_HOST        Database host (default: localhost)');
  console.log('  DB_PORT        Database port (default: 3306)');
  process.exit(0);
}

if (args.includes('--force')) {
  console.log('⚠️  Force mode enabled - existing database will be dropped!');
  console.log('Press Ctrl+C within 5 seconds to cancel...');
  
  setTimeout(async () => {
    try {
      await runCommand(
        `npx sequelize-cli db:drop`,
        'Dropping existing database'
      );
      await setupDatabase();
    } catch (error) {
      console.error('❌ Force setup failed:', error.message);
      process.exit(1);
    }
  }, 5000);
} else {
  setupDatabase();
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Database setup cancelled by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Database setup terminated');
  process.exit(0);
});
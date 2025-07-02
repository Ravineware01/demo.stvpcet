#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Welcome to SalesMart Setup!');
console.log('=====================================\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ Node.js version 16 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Function to run command with error handling
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'pipe' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`);
    console.error(error.message);
    process.exit(1);
  }
}

// Function to create environment file
function createEnvFile() {
  const envPath = path.join(__dirname, 'server', '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists, skipping creation');
    return;
  }

  const envTemplate = `NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/salesmart
JWT_SECRET=your_super_secret_jwt_key_here_${Math.random().toString(36).substring(2)}
JWT_EXPIRE=30d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Client URL
CLIENT_URL=http://localhost:3000`;

  try {
    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ Environment file created at server/.env');
    console.log('📝 Please update the environment variables with your actual values');
  } catch (error) {
    console.error('❌ Failed to create environment file:', error.message);
  }
}

// Main setup function
async function setup() {
  try {
    // Install dependencies
    runCommand('npm install', 'Installing root dependencies');
    runCommand('npm run install-server', 'Installing server dependencies');
    runCommand('npm run install-client', 'Installing client dependencies');

    // Create environment file
    createEnvFile();

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Start MongoDB (if using local installation)');
    console.log('2. Update server/.env with your actual configuration values');
    console.log('3. Run "npm run seed" to populate the database with sample data');
    console.log('4. Run "npm run dev" to start the development server');
    console.log('\n🔗 Useful links:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000');
    console.log('   API Health: http://localhost:5000/api/health');
    console.log('\n🔑 Default credentials (after seeding):');
    console.log('   Admin: admin@salesmart.com / admin123');
    console.log('   User: john.doe@email.com / password123');
    console.log('\n📚 Documentation: See README.md for detailed instructions');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Check if MongoDB is running (optional check)
function checkMongoDB() {
  try {
    execSync('mongod --version', { stdio: 'pipe' });
    console.log('✅ MongoDB is available');
  } catch (error) {
    console.log('⚠️  MongoDB not found in PATH (you may be using MongoDB Atlas)');
  }
}

// Run setup
console.log('🔍 Checking system requirements...');
checkMongoDB();
console.log();

setup();
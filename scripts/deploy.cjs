#!/usr/bin/env node

/**
 * Smart deployment script for Little Trip with Yunsol
 * Includes safety checks and environment validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}📋 Step ${step}:${colors.reset} ${message}`, 'blue');
}

function runCommand(command, description) {
  log(`  → ${description}...`, 'yellow');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`  ✅ ${description} completed`, 'green');
  } catch (error) {
    log(`  ❌ ${description} failed`, 'red');
    process.exit(1);
  }
}

function checkPrerequisites() {
  logStep(1, 'Checking prerequisites');
  
  // Check if firebase.json exists
  if (!fs.existsSync('firebase.json')) {
    log('❌ firebase.json not found. Make sure you\'re in the project root.', 'red');
    process.exit(1);
  }
  
  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    log('❌ package.json not found. Make sure you\'re in the project root.', 'red');
    process.exit(1);
  }
  
  // Check Firebase CLI
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    log('  ✅ Firebase CLI is installed', 'green');
  } catch (error) {
    log('  ❌ Firebase CLI not found. Please install it first.', 'red');
    log('  Run: npm install -g firebase-tools', 'yellow');
    process.exit(1);
  }
}

function deploy(type = 'production') {
  log(`\n${colors.bold}🚀 Starting ${type} deployment for Little Trip with Yunsol${colors.reset}`, 'blue');
  
  checkPrerequisites();
  
  if (type === 'production') {
    logStep(2, 'Running linting checks');
    runCommand('npm run lint', 'Code linting');
  }
  
  logStep(type === 'production' ? 3 : 2, 'Building the application');
  runCommand('npm run build', 'Project build');
  
  // Check if dist folder was created
  if (!fs.existsSync('dist')) {
    log('❌ Build failed - dist folder not found', 'red');
    process.exit(1);
  }
  
  logStep(type === 'production' ? 4 : 3, 'Deploying to Firebase');
  
  if (type === 'preview') {
    runCommand('firebase hosting:channel:deploy preview', 'Preview deployment');
  } else {
    runCommand('firebase deploy --only hosting', 'Production deployment');
  }
  
  log(`\n${colors.green}${colors.bold}🎉 Deployment completed successfully!${colors.reset}`, 'green');
  
  if (type === 'production') {
    log('\n📱 Your site is live at:', 'blue');
    log('  • https://little-trip-with-yunsol-43695.web.app', 'green');
    log('  • https://little-trip-with-yunsol-43695.firebaseapp.com', 'green');
  } else {
    log('\n📱 Check the output above for your preview URL', 'blue');
  }
  
  log('\n💡 Tip: It may take 1-2 minutes for changes to appear due to CDN caching', 'yellow');
}

// Parse command line arguments
const deployType = process.argv[2];

if (deployType === 'preview') {
  deploy('preview');
} else if (deployType === 'quick') {
  deploy('quick');
} else {
  deploy('production');
}

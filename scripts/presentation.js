#!/usr/bin/env node

/**
 * Presentation Suite
 * Complete workflow: Run tests → Generate Executive Report
 * 
 * Usage: npm run presentation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║          🎬 PRESENTATION SUITE - Local Edition              ║');
console.log('║     Tests + Videos + Executive Report (All in One)          ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Step 1: Run tests
console.log('📋 Step 1: Running Playwright tests...\n');
try {
    execSync('npm run test', { stdio: 'inherit' });
    console.log('\n✅ Tests completed successfully!\n');
} catch (error) {
    console.error('\n❌ Tests failed. Check output above.\n');
    process.exit(1);
}

// Step 2: Generate executive report
console.log('\n📊 Step 2: Generating Executive Report...\n');
try {
    execSync('node scripts/generate-executive-report.js', { stdio: 'inherit' });
} catch (error) {
    console.error('\n⚠️  Report generation had issues. Check output above.\n');
}

// Step 3: Summary
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                   ✨ ALL DONE!                              ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📁 Available Reports:\n');
console.log('  1. 📊 Executive Report (with videos)');
console.log('     → executive-report/index.html\n');
console.log('  2. 📈 Playwright Reports (detailed)');
console.log('     → playwright-report/index.html\n');
console.log('  3. 📹 Raw Videos');
console.log('     → test-results/*/video.webm\n');

console.log('💡 Next Steps:\n');
console.log('  • Open executive-report/index.html to see videos');
console.log('  • Share executive-report folder with your team');
console.log('  • All videos and HTML are self-contained and portable\n');

console.log('═══════════════════════════════════════════════════════════\n');

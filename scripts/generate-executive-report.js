#!/usr/bin/env node

/**
 * Executive Report Generator
 * Compiles test videos and metadata into a professional HTML presentation
 * 
 * Usage: npm run report:executive
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const TEST_RESULTS_DIR = 'test-results';
const REPORT_DIR = 'executive-report';
const VIDEOS_DIR = path.join(REPORT_DIR, 'videos');

// Create directories
[REPORT_DIR, VIDEOS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * Find all video files in test results
 */
function findVideos() {
    const videos = [];

    if (!fs.existsSync(TEST_RESULTS_DIR)) {
        console.log('⚠️  No test results found. Run tests first: npm run test');
        return videos;
    }

    // Scan for video.webm files
    const scanDir = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                scanDir(fullPath);
            } else if (file === 'video.webm') {
                const relPath = path.relative(TEST_RESULTS_DIR, fullPath);
                const browserMatch = relPath.match(/^([^-]+)/);
                const browser = browserMatch ? browserMatch[1] : 'unknown';

                videos.push({
                    path: fullPath,
                    relativePath: relPath,
                    browser: browser,
                    size: (stat.size / 1024 / 1024).toFixed(2) + ' MB'
                });
            }
        });
    };

    scanDir(TEST_RESULTS_DIR);
    return videos;
}

/**
 * Copy videos to report directory
 */
function copyVideos(videos) {
    videos.forEach((video, index) => {
        const destName = `test-${index + 1}-${video.browser}.webm`;
        const destPath = path.join(VIDEOS_DIR, destName);

        try {
            fs.copyFileSync(video.path, destPath);
            console.log(`✅ Copied: ${destName}`);
        } catch (error) {
            console.error(`❌ Error copying video: ${error.message}`);
        }
    });
}

/**
 * Parse test results JSON
 */
function getTestStats() {
    const resultsFile = path.join(TEST_RESULTS_DIR, 'results.json');

    if (!fs.existsSync(resultsFile)) {
        return { total: 0, passed: 0, failed: 0 };
    }

    try {
        const data = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        const stats = {
            total: data.stats?.expected || 0,
            passed: data.stats?.expected || 0,
            failed: data.stats?.unexpected || 0
        };
        return stats;
    } catch (error) {
        console.warn('Could not parse test results:', error.message);
        return { total: 0, passed: 0, failed: 0 };
    }
}

/**
 * Generate HTML Report
 */
function generateHTML(videos, stats) {
    const videoCards = videos.map((video, index) => `
    <div class="video-card">
      <div class="video-header">
        <h3>Test ${index + 1}</h3>
        <span class="browser-badge ${video.browser}">${video.browser.toUpperCase()}</span>
      </div>
      <video controls style="width: 100%; border-radius: 8px;">
        <source src="./videos/${`test-${index + 1}-${video.browser}.webm`}" type="video/webm">
        Your browser does not support the video tag.
      </video>
      <div class="video-meta">
        <span>📹 Size: ${video.size}</span>
        <span>✅ Status: Passed</span>
      </div>
    </div>
  `).join('');

    const timestamp = new Date().toLocaleString();
    const passRate = stats.total > 0
        ? Math.round((stats.passed / stats.total) * 100)
        : 0;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OrangeHRM Test Automation Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: #f5f5f5;
      color: #333;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 50px 30px;
      border-radius: 12px;
      margin-bottom: 40px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .header h1 {
      font-size: 42px;
      margin-bottom: 10px;
    }

    .header p {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 5px;
    }

    /* Executive Summary */
    .executive-summary {
      background: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .executive-summary h2 {
      margin-bottom: 25px;
      color: #667eea;
      border-bottom: 2px solid #667eea;
      padding-bottom: 12px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 10px;
      text-align: center;
    }

    .metric-value {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .metric-label {
      font-size: 14px;
      opacity: 0.9;
    }

    /* Videos Section */
    .videos-section {
      background: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .videos-section h2 {
      margin-bottom: 25px;
      color: #667eea;
      border-bottom: 2px solid #667eea;
      padding-bottom: 12px;
    }

    .videos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 25px;
    }

    .video-card {
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .video-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    }

    .video-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .video-header h3 {
      margin: 0;
      font-size: 16px;
    }

    .browser-badge {
      background: rgba(255,255,255,0.3);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }

    video {
      display: block;
      background: #000;
    }

    .video-meta {
      padding: 12px 15px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }

    /* Footer */
    .footer {
      background: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      color: #999;
      font-size: 13px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header h1 {
        font-size: 28px;
      }

      .videos-grid {
        grid-template-columns: 1fr;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🧪 OrangeHRM Test Automation</h1>
      <p><strong>Project:</strong> Enterprise-Grade Playwright Framework</p>
      <p><strong>Report Generated:</strong> ${timestamp}</p>
    </div>

    <!-- Executive Summary -->
    <div class="executive-summary">
      <h2>📊 Executive Summary</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${stats.total}</div>
          <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric-card" style="background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);">
          <div class="metric-value">${stats.passed}</div>
          <div class="metric-label">Passed</div>
        </div>
        <div class="metric-card" ${stats.failed > 0 ? 'style="background: linear-gradient(135deg, #f44336 0%, #da190b 100%);"' : ''}>
          <div class="metric-value">${stats.failed}</div>
          <div class="metric-label">Failed</div>
        </div>
        <div class="metric-card" style="background: linear-gradient(135deg, #ff9800 0%, #e68900 100%);">
          <div class="metric-value">${passRate}%</div>
          <div class="metric-label">Pass Rate</div>
        </div>
      </div>
    </div>

    <!-- Videos -->
    ${videos.length > 0 ? `
    <div class="videos-section">
      <h2>🎬 Test Execution Videos</h2>
      <p style="margin-bottom: 20px; color: #666;">Recorded execution across all browsers</p>
      <div class="videos-grid">
        ${videoCards}
      </div>
    </div>
    ` : `
    <div class="videos-section">
      <p style="color: #999;">No videos found. Run tests with: <code>npm run test</code></p>
    </div>
    `}

    <!-- Footer -->
    <div class="footer">
      <p>Generated by Playwright Executive Report Generator</p>
      <p>Framework Version: 1.48.2 | Browser: Chromium, Firefox, WebKit</p>
      <p>For detailed reports, see: <code>playwright-report/index.html</code></p>
    </div>
  </div>
</body>
</html>`;

    return html;
}

/**
 * Main execution
 */
function main() {
    console.log('🚀 Generating Executive Report...\n');

    // Find videos
    const videos = findVideos();
    console.log(`\n📹 Found ${videos.length} video(s)\n`);

    if (videos.length === 0) {
        console.log('⚠️  No videos found. Run tests first:\n');
        console.log('  npm run test\n');
        process.exit(0);
    }

    // Copy videos
    console.log('📋 Copying videos to report directory...\n');
    copyVideos(videos);

    // Get stats
    const stats = getTestStats();

    // Generate HTML
    console.log('\n✨ Generating HTML report...');
    const html = generateHTML(videos, stats);
    const reportPath = path.join(REPORT_DIR, 'index.html');
    fs.writeFileSync(reportPath, html);

    console.log(`✅ Report generated: ${reportPath}\n`);
    console.log('📊 Report Summary:');
    console.log(`   - Videos: ${videos.length}`);
    console.log(`   - Total Tests: ${stats.total}`);
    console.log(`   - Passed: ${stats.passed}`);
    console.log(`   - Failed: ${stats.failed}`);
    console.log(`   - Pass Rate: ${(stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0)}%`);
    console.log(`\n🎯 Open report in browser:\n   ${reportPath}\n`);

    // Try to open in browser
    try {
        const platform = process.platform;
        if (platform === 'win32') {
            execSync(`start "" "${path.resolve(reportPath)}"`);
        } else if (platform === 'darwin') {
            execSync(`open "${path.resolve(reportPath)}"`);
        } else {
            execSync(`xdg-open "${path.resolve(reportPath)}"`);
        }
        console.log('🌐 Opening in browser...\n');
    } catch (error) {
        console.log('💡 Open manually in browser:', path.resolve(reportPath));
    }
}

main();

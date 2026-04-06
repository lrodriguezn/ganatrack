/**
 * Badge Generation Script
 * 
 * Generates SVG badges for coverage and Lighthouse scores.
 * Reads from coverage/coverage-final.json and .lighthouseci/ for data.
 * Outputs to badges/ directory.
 */

import { makeBadge } from 'badge-maker';
import * as fs from 'fs';
import * as path from 'path';

// Configuration - use __dirname to resolve from script location
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BADGES_DIR = path.join(PROJECT_ROOT, 'badges');
const COVERAGE_JSON_PATH = path.join(PROJECT_ROOT, 'coverage', 'coverage-final.json');
const LHCI_DIR = path.join(PROJECT_ROOT, '.lighthouseci');

// Ensure badges directory exists
if (!fs.existsSync(BADGES_DIR)) {
  fs.mkdirSync(BADGES_DIR, { recursive: true });
}

// Color coding based on percentage
function getCoverageColor(percentage: number): string {
  if (percentage >= 75) return 'brightgreen';
  if (percentage >= 50) return 'yellow';
  return 'red';
}

// Generate a badge SVG
function generateBadgeSvg(label: string, value: string, color: string): string {
  const badge = makeBadge({
    label,
    message: value,
    color,
    style: 'flat',
  });
  return badge;
}

// Extract overall coverage from coverage-final.json
function getOverallCoverage(): number {
  try {
    const coverageData = JSON.parse(fs.readFileSync(COVERAGE_JSON_PATH, 'utf8'));
    
    // Calculate overall coverage from all files
    let totalLines = 0;
    let coveredLines = 0;
    
    for (const [filePath, data] of Object.entries(coverageData)) {
      const fileData = data as { lines: { total: number; covered: number } };
      if (fileData.lines) {
        totalLines += fileData.lines.total;
        coveredLines += fileData.lines.covered;
      }
    }
    
    if (totalLines === 0) return 0;
    return Math.round((coveredLines / totalLines) * 100);
  } catch {
    console.warn('Could not read coverage-final.json, generating badge with 0%');
    return 0;
  }
}

// Read Lighthouse CI results
interface LighthouseResult {
  json: {
    categories: {
      performance: { score: number };
      accessibility: { score: number };
      'best-practices': { score: number };
      seo: { score: number };
      pwa: { score: number };
    };
    configSettings?: {
      formFactor?: string;
    };
  };
}

function getLighthouseScores(): { desktop: number; mobile: number } {
  let desktopScore = 0;
  let mobileScore = 0;
  
  try {
    // Check both desktop and mobile directories
    const desktopDir = path.join(LHCI_DIR, 'desktop');
    const mobileDir = path.join(LHCI_DIR, 'mobile');
    
    // Process desktop directory
    if (fs.existsSync(desktopDir)) {
      const files = fs.readdirSync(desktopDir);
      const lhrFiles = files.filter(f => f.endsWith('.lhr.json'));
      
      for (const file of lhrFiles) {
        const filePath = path.join(desktopDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8')) as LighthouseResult;
        
        if (content.json && content.json.categories && content.json.categories.performance) {
          desktopScore = Math.round(content.json.categories.performance.score * 100);
        }
      }
    }
    
    // Process mobile directory
    if (fs.existsSync(mobileDir)) {
      const files = fs.readdirSync(mobileDir);
      const lhrFiles = files.filter(f => f.endsWith('.lhr.json'));
      
      for (const file of lhrFiles) {
        const filePath = path.join(mobileDir, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8')) as LighthouseResult;
        
        if (content.json && content.json.categories && content.json.categories.performance) {
          mobileScore = Math.round(content.json.categories.performance.score * 100);
        }
      }
    }
    
    // Fallback: if directories don't exist, check root LHCI dir with formFactor detection
    if (desktopScore === 0 && mobileScore === 0 && fs.existsSync(LHCI_DIR)) {
      const files = fs.readdirSync(LHCI_DIR);
      const lhrFiles = files.filter(f => f.endsWith('.lhr.json'));
      
      for (const file of lhrFiles) {
        const filePath = path.join(LHCI_DIR, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8')) as LighthouseResult;
        
        if (content.json && content.json.categories && content.json.categories.performance) {
          const score = Math.round(content.json.categories.performance.score * 100);
          const formFactor = content.json.configSettings?.formFactor;
          
          if (formFactor === 'mobile') {
            mobileScore = score;
          } else {
            desktopScore = score;
          }
        }
      }
    }
  } catch (error) {
    console.warn('Could not read Lighthouse CI results:', error);
  }
  
  return { desktop: desktopScore, mobile: mobileScore };
}

// Generate badges
function generateBadges(): void {
  console.log('Generating quality badges...');
  
  // Coverage badge
  const coveragePercent = getOverallCoverage();
  const coverageColor = getCoverageColor(coveragePercent);
  const coverageSvg = generateBadgeSvg('Coverage', `${coveragePercent}%`, coverageColor);
  fs.writeFileSync(path.join(BADGES_DIR, 'coverage.svg'), coverageSvg);
  console.log(`  ✓ Coverage badge: ${coveragePercent}% (${coverageColor})`);
  
  // Lighthouse desktop badge
  const { desktop, mobile } = getLighthouseScores();
  
  const desktopColor = desktop >= 80 ? 'brightgreen' : desktop >= 60 ? 'yellow' : 'orange';
  const desktopSvg = generateBadgeSvg('LH Desktop', `${desktop}`, desktopColor);
  fs.writeFileSync(path.join(BADGES_DIR, 'lighthouse-desktop.svg'), desktopSvg);
  console.log(`  ✓ Lighthouse Desktop badge: ${desktop} (${desktopColor})`);
  
  const mobileColor = mobile >= 70 ? 'brightgreen' : mobile >= 50 ? 'yellow' : 'orange';
  const mobileSvg = generateBadgeSvg('LH Mobile', `${mobile}`, mobileColor);
  fs.writeFileSync(path.join(BADGES_DIR, 'lighthouse-mobile.svg'), mobileSvg);
  console.log(`  ✓ Lighthouse Mobile badge: ${mobile} (${mobileColor})`);
  
  console.log(`\nBadges generated in ${BADGES_DIR}/`);
}

generateBadges();

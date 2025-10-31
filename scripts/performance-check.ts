/**
 * Performance Check Script
 * 
 * Analyzes build output for performance issues:
 * - Bundle size analysis
 * - Large dependencies
 * - Code splitting effectiveness
 * - Asset optimization
 */

import * as fs from 'fs';
import * as path from 'path';

interface AssetInfo {
  name: string;
  size: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
}

interface PerformanceReport {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  assets: AssetInfo[];
  warnings: string[];
  recommendations: string[];
}

class PerformanceChecker {
  private distPath: string;
  private report: PerformanceReport;

  // Size thresholds (in bytes)
  private readonly THRESHOLDS = {
    maxJsChunkSize: 500 * 1024, // 500 KB
    maxCssSize: 100 * 1024, // 100 KB
    maxImageSize: 200 * 1024, // 200 KB
    maxTotalJs: 1024 * 1024, // 1 MB
    maxTotalSize: 3 * 1024 * 1024, // 3 MB
  };

  constructor(distPath: string = './dist') {
    this.distPath = distPath;
    this.report = {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      imageSize: 0,
      assets: [],
      warnings: [],
      recommendations: [],
    };
  }

  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }

  private getAssetType(filename: string): AssetInfo['type'] {
    const ext = path.extname(filename).toLowerCase();
    
    if (['.js', '.mjs'].includes(ext)) return 'js';
    if (['.css'].includes(ext)) return 'css';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return 'image';
    if (['.woff', '.woff2', '.ttf', '.eot', '.otf'].includes(ext)) return 'font';
    
    return 'other';
  }

  private scanDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      throw new Error(`Directory not found: ${dirPath}`);
    }

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const relativePath = path.relative(this.distPath, fullPath);
        const type = this.getAssetType(file);
        const size = stat.size;

        this.report.assets.push({
          name: relativePath,
          size,
          type,
        });

        this.report.totalSize += size;

        switch (type) {
          case 'js':
            this.report.jsSize += size;
            break;
          case 'css':
            this.report.cssSize += size;
            break;
          case 'image':
            this.report.imageSize += size;
            break;
        }
      }
    }
  }

  private analyzeAssets(): void {
    // Sort assets by size
    this.report.assets.sort((a, b) => b.size - a.size);

    // Check for large JS chunks
    const largeJsChunks = this.report.assets.filter(
      asset => asset.type === 'js' && asset.size > this.THRESHOLDS.maxJsChunkSize
    );

    if (largeJsChunks.length > 0) {
      this.report.warnings.push(
        `⚠️  Found ${largeJsChunks.length} large JavaScript chunk(s) (>${this.formatSize(this.THRESHOLDS.maxJsChunkSize)})`
      );
      largeJsChunks.forEach(chunk => {
        this.report.warnings.push(`   - ${chunk.name}: ${this.formatSize(chunk.size)}`);
      });
      this.report.recommendations.push(
        '💡 Consider code splitting or lazy loading for large components'
      );
    }

    // Check for large CSS files
    const largeCssFiles = this.report.assets.filter(
      asset => asset.type === 'css' && asset.size > this.THRESHOLDS.maxCssSize
    );

    if (largeCssFiles.length > 0) {
      this.report.warnings.push(
        `⚠️  Found ${largeCssFiles.length} large CSS file(s) (>${this.formatSize(this.THRESHOLDS.maxCssSize)})`
      );
      largeCssFiles.forEach(file => {
        this.report.warnings.push(`   - ${file.name}: ${this.formatSize(file.size)}`);
      });
      this.report.recommendations.push(
        '💡 Consider removing unused CSS or splitting into critical/non-critical CSS'
      );
    }

    // Check for unoptimized images
    const largeImages = this.report.assets.filter(
      asset => asset.type === 'image' && asset.size > this.THRESHOLDS.maxImageSize
    );

    if (largeImages.length > 0) {
      this.report.warnings.push(
        `⚠️  Found ${largeImages.length} large image(s) (>${this.formatSize(this.THRESHOLDS.maxImageSize)})`
      );
      largeImages.forEach(img => {
        this.report.warnings.push(`   - ${img.name}: ${this.formatSize(img.size)}`);
      });
      this.report.recommendations.push(
        '💡 Optimize images using compression tools or convert to WebP format'
      );
    }

    // Check total JS size
    if (this.report.jsSize > this.THRESHOLDS.maxTotalJs) {
      this.report.warnings.push(
        `⚠️  Total JavaScript size is ${this.formatSize(this.report.jsSize)} (exceeds ${this.formatSize(this.THRESHOLDS.maxTotalJs)})`
      );
      this.report.recommendations.push(
        '💡 Review dependencies and remove unused code. Consider tree-shaking and minification.'
      );
    }

    // Check total bundle size
    if (this.report.totalSize > this.THRESHOLDS.maxTotalSize) {
      this.report.warnings.push(
        `⚠️  Total bundle size is ${this.formatSize(this.report.totalSize)} (exceeds ${this.formatSize(this.THRESHOLDS.maxTotalSize)})`
      );
      this.report.recommendations.push(
        '💡 Overall bundle is large. Review all assets and consider aggressive optimization.'
      );
    }

    // Check for source maps in production build
    const sourceMaps = this.report.assets.filter(asset => asset.name.endsWith('.map'));
    if (sourceMaps.length > 0) {
      this.report.warnings.push(
        `⚠️  Found ${sourceMaps.length} source map(s) in production build`
      );
      this.report.recommendations.push(
        '💡 Disable source maps in production or use external source maps storage'
      );
    }

    // General recommendations based on bundle composition
    if (this.report.jsSize > this.report.totalSize * 0.7) {
      this.report.recommendations.push(
        '💡 JavaScript makes up >70% of bundle. Consider lazy loading or code splitting.'
      );
    }
  }

  private printReport(): void {
    console.log('\n════════════════════════════════════════');
    console.log('      PERFORMANCE ANALYSIS REPORT');
    console.log('════════════════════════════════════════\n');

    // Summary
    console.log('📊 BUNDLE SIZE SUMMARY');
    console.log('─────────────────────────────────────────');
    console.log(`Total Bundle Size:    ${this.formatSize(this.report.totalSize)}`);
    console.log(`JavaScript Size:      ${this.formatSize(this.report.jsSize)} (${((this.report.jsSize / this.report.totalSize) * 100).toFixed(1)}%)`);
    console.log(`CSS Size:             ${this.formatSize(this.report.cssSize)} (${((this.report.cssSize / this.report.totalSize) * 100).toFixed(1)}%)`);
    console.log(`Images Size:          ${this.formatSize(this.report.imageSize)} (${((this.report.imageSize / this.report.totalSize) * 100).toFixed(1)}%)`);
    console.log(`Total Assets:         ${this.report.assets.length} files\n`);

    // Top 10 largest assets
    console.log('📦 TOP 10 LARGEST ASSETS');
    console.log('─────────────────────────────────────────');
    this.report.assets.slice(0, 10).forEach((asset, index) => {
      const typeIcon = {
        js: '📜',
        css: '🎨',
        image: '🖼️',
        font: '🔤',
        other: '📄',
      }[asset.type];
      console.log(`${index + 1}. ${typeIcon} ${asset.name}`);
      console.log(`   ${this.formatSize(asset.size)}`);
    });
    console.log('');

    // Warnings
    if (this.report.warnings.length > 0) {
      console.log('⚠️  WARNINGS');
      console.log('─────────────────────────────────────────');
      this.report.warnings.forEach(warning => console.log(warning));
      console.log('');
    }

    // Recommendations
    if (this.report.recommendations.length > 0) {
      console.log('💡 RECOMMENDATIONS');
      console.log('─────────────────────────────────────────');
      this.report.recommendations.forEach(rec => console.log(rec));
      console.log('');
    }

    // Overall score
    const score = this.calculateScore();
    console.log('🎯 PERFORMANCE SCORE');
    console.log('─────────────────────────────────────────');
    this.printScore(score);
    console.log('\n════════════════════════════════════════\n');
  }

  private calculateScore(): number {
    let score = 100;

    // Deduct points for issues
    if (this.report.totalSize > this.THRESHOLDS.maxTotalSize) {
      score -= 20;
    } else if (this.report.totalSize > this.THRESHOLDS.maxTotalSize * 0.8) {
      score -= 10;
    }

    if (this.report.jsSize > this.THRESHOLDS.maxTotalJs) {
      score -= 15;
    }

    const largeChunks = this.report.assets.filter(
      a => a.type === 'js' && a.size > this.THRESHOLDS.maxJsChunkSize
    );
    score -= largeChunks.length * 5;

    const largeImages = this.report.assets.filter(
      a => a.type === 'image' && a.size > this.THRESHOLDS.maxImageSize
    );
    score -= largeImages.length * 3;

    return Math.max(0, Math.min(100, score));
  }

  private printScore(score: number): void {
    let emoji = '🔴';
    let rating = 'Poor';
    
    if (score >= 90) {
      emoji = '🟢';
      rating = 'Excellent';
    } else if (score >= 75) {
      emoji = '🟡';
      rating = 'Good';
    } else if (score >= 60) {
      emoji = '🟠';
      rating = 'Fair';
    }

    console.log(`${emoji} Score: ${score}/100 (${rating})`);
    
    if (score < 60) {
      console.log('   ⚠️  Immediate optimization recommended');
    } else if (score < 75) {
      console.log('   ℹ️  Some optimization opportunities available');
    } else if (score < 90) {
      console.log('   ✓  Performance is acceptable');
    } else {
      console.log('   ✓✓ Excellent performance!');
    }
  }

  private saveReport(): void {
    const reportPath = path.join(this.distPath, 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);
  }

  async check(): Promise<PerformanceReport> {
    console.log('🔍 Analyzing build output...\n');

    try {
      this.scanDirectory(this.distPath);
      this.analyzeAssets();
      this.printReport();
      this.saveReport();
    } catch (error) {
      console.error('❌ Performance check failed:', error);
      throw error;
    }

    return this.report;
  }
}

// Main execution
async function main() {
  const distPath = process.argv[2] || './dist';

  if (!fs.existsSync(distPath)) {
    console.error(`❌ Build directory not found: ${distPath}`);
    console.error('\nPlease run "npm run build" first\n');
    process.exit(1);
  }

  const checker = new PerformanceChecker(distPath);
  
  try {
    const report = await checker.check();
    
    // Exit with error code if score is too low
    const score = checker['calculateScore']();
    if (score < 60) {
      console.log('❌ Performance score is below acceptable threshold (60)');
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during performance check:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { PerformanceChecker, PerformanceReport, AssetInfo };

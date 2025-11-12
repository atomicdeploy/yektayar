#!/usr/bin/env node

/**
 * Auto-Label Issues and PRs Script
 * 
 * This script analyzes existing issues and pull requests and automatically
 * suggests or applies appropriate labels based on their content.
 * 
 * Usage:
 *   node scripts/auto-label-issues.js [options]
 * 
 * Options:
 *   --apply       Actually apply labels (default is dry-run)
 *   --issues      Process issues (default)
 *   --prs         Process pull requests
 *   --all         Process both issues and PRs
 *   --limit       Limit number of items to process (default: 50)
 *   --token       GitHub personal access token (or set GITHUB_TOKEN env var)
 *   --repo        Repository in format owner/repo (default: from git remote)
 * 
 * Examples:
 *   # Analyze issues (dry run)
 *   node scripts/auto-label-issues.js --token ghp_xxx
 * 
 *   # Apply labels to issues
 *   node scripts/auto-label-issues.js --apply --token ghp_xxx
 * 
 *   # Process PRs
 *   GITHUB_TOKEN=ghp_xxx node scripts/auto-label-issues.js --prs --apply
 * 
 * Requirements:
 *   - GitHub personal access token with 'repo' scope
 *   - Node.js 18+
 */

const https = require('https');
const { execSync } = require('child_process');

// GitHub API helper
class GitHubAPI {
  constructor(token, repo) {
    this.token = token;
    this.repo = repo;
    this.baseUrl = `https://api.github.com/repos/${repo}`;
  }

  async request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}${endpoint}`);
      
      const options = {
        method,
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'YektaYar-Auto-Labeler',
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(url, options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(body ? JSON.parse(body) : {});
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async listIssues(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request('GET', `/issues?${queryParams}`);
  }

  async addLabels(issueNumber, labels) {
    return this.request('POST', `/issues/${issueNumber}/labels`, { labels });
  }
}

// Label suggestion engine
class LabelSuggester {
  constructor() {
    // Keywords for different label types
    this.patterns = {
      // Type patterns
      bug: /\b(bug|error|crash|issue|broken|fix|not working|doesn't work|failing)\b/i,
      feature: /\b(feature|enhancement|add|new|implement|support|want|would like|request)\b/i,
      documentation: /\b(docs?|documentation|readme|guide|tutorial|example)\b/i,
      question: /\b(question|how to|help|what is|why|when|confused|clarify)\b/i,
      security: /\b(security|vulnerability|exploit|attack|xss|sql injection|csrf)\b/i,
      performance: /\b(performance|slow|speed|optimize|memory|cpu|lag)\b/i,
      
      // Component patterns
      backend: /\b(backend|api|server|endpoint|database|postgres|sql)\b/i,
      frontend: /\b(frontend|ui|ux|interface|design|css|html)\b/i,
      mobile: /\b(mobile|app|android|ios|capacitor|ionic)\b/i,
      admin: /\b(admin|panel|dashboard)\b/i,
      
      // Priority patterns (in title usually indicates importance)
      critical: /\b(critical|urgent|emergency|blocker|asap)\b/i,
      high: /\b(high priority|important|severe)\b/i,
    };
  }

  suggestLabels(issue) {
    const labels = new Set();
    const text = `${issue.title} ${issue.body || ''}`.toLowerCase();
    
    // Check for existing labels to avoid duplicates
    const existingLabels = new Set((issue.labels || []).map(l => l.name));
    
    // Skip if already has many labels
    if (existingLabels.size >= 5) {
      return [];
    }
    
    // Type detection
    if (this.patterns.bug.test(text) && !existingLabels.has('🐛 bug')) {
      labels.add('🐛 bug');
    }
    if (this.patterns.feature.test(text) && !existingLabels.has('✨ feature')) {
      labels.add('✨ feature');
    }
    if (this.patterns.documentation.test(text) && !existingLabels.has('📝 documentation')) {
      labels.add('📝 documentation');
    }
    if (this.patterns.question.test(text) && !existingLabels.has('❓ question')) {
      labels.add('❓ question');
    }
    if (this.patterns.security.test(text) && !existingLabels.has('🔒 security')) {
      labels.add('🔒 security');
    }
    if (this.patterns.performance.test(text) && !existingLabels.has('⚡ performance')) {
      labels.add('⚡ performance');
    }
    
    // Component detection
    if (this.patterns.backend.test(text) && !existingLabels.has('🖥️ backend')) {
      labels.add('🖥️ backend');
    }
    if (this.patterns.frontend.test(text) && !existingLabels.has('🎨 frontend')) {
      labels.add('🎨 frontend');
    }
    if (this.patterns.mobile.test(text) && !existingLabels.has('📱 mobile-app')) {
      labels.add('📱 mobile-app');
    }
    if (this.patterns.admin.test(text) && !existingLabels.has('👨‍💼 admin-panel')) {
      labels.add('👨‍💼 admin-panel');
    }
    
    // Priority detection (only from title)
    if (this.patterns.critical.test(issue.title) && !existingLabels.has('🔴 priority: critical')) {
      labels.add('🔴 priority: critical');
    } else if (this.patterns.high.test(issue.title) && !existingLabels.has('🟠 priority: high')) {
      labels.add('🟠 priority: high');
    }
    
    // Add needs-triage if no labels at all
    if (existingLabels.size === 0 && labels.size === 0) {
      labels.add('🔍 status: needs-triage');
    }
    
    return Array.from(labels);
  }
}

// Get repository from git remote
function getRepoFromGit() {
  try {
    const remote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
    const match = remote.match(/github\.com[:/](.+\/.+?)(\.git)?$/);
    return match ? match[1].replace('.git', '') : null;
  } catch (error) {
    return null;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    apply: args.includes('--apply'),
    issues: args.includes('--issues') || (!args.includes('--prs') && !args.includes('--all')),
    prs: args.includes('--prs') || args.includes('--all'),
    limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : 50,
    token: args.includes('--token') ? args[args.indexOf('--token') + 1] : process.env.GITHUB_TOKEN,
    repo: args.includes('--repo') ? args[args.indexOf('--repo') + 1] : getRepoFromGit()
  };

  // Validate
  if (!options.token) {
    console.error('❌ Error: GitHub token required. Use --token flag or set GITHUB_TOKEN environment variable.');
    console.error('\nTo create a token: https://github.com/settings/tokens/new');
    console.error('Required scope: repo (Full control of private repositories)');
    process.exit(1);
  }

  if (!options.repo) {
    console.error('❌ Error: Repository not specified. Use --repo owner/repo or run from git repository.');
    process.exit(1);
  }

  console.log(`🏷️  Auto-Label Script for ${options.repo}\n`);
  if (!options.apply) {
    console.log('🔍 DRY RUN MODE - Labels will only be suggested, not applied');
    console.log('   Use --apply to actually add labels\n');
  }

  const api = new GitHubAPI(options.token, options.repo);
  const suggester = new LabelSuggester();

  try {
    // Process issues
    if (options.issues) {
      console.log('📋 Fetching issues...');
      const issues = await api.listIssues({
        state: 'open',
        per_page: options.limit,
        filter: 'all'
      });
      
      const realIssues = issues.filter(i => !i.pull_request);
      console.log(`Found ${realIssues.length} open issues\n`);

      let processed = 0;
      let labeled = 0;

      for (const issue of realIssues) {
        const suggestedLabels = suggester.suggestLabels(issue);
        
        if (suggestedLabels.length > 0) {
          console.log(`\n#${issue.number}: ${issue.title}`);
          console.log(`   Current labels: ${issue.labels.map(l => l.name).join(', ') || 'none'}`);
          console.log(`   Suggested: ${suggestedLabels.join(', ')}`);
          
          if (options.apply) {
            try {
              await api.addLabels(issue.number, suggestedLabels);
              console.log(`   ✅ Labels applied`);
              labeled++;
            } catch (error) {
              console.log(`   ❌ Failed to apply labels: ${error.message}`);
            }
          }
        }
        
        processed++;
      }

      console.log(`\n📊 Issues Summary:`);
      console.log(`   Processed: ${processed}`);
      console.log(`   Labeled: ${labeled}`);
    }

    // Process PRs
    if (options.prs) {
      console.log('\n📋 Fetching pull requests...');
      const prs = await api.listIssues({
        state: 'open',
        per_page: options.limit,
        filter: 'all'
      });
      
      const realPRs = prs.filter(i => i.pull_request);
      console.log(`Found ${realPRs.length} open pull requests\n`);

      let processed = 0;
      let labeled = 0;

      for (const pr of realPRs) {
        const suggestedLabels = suggester.suggestLabels(pr);
        
        if (suggestedLabels.length > 0) {
          console.log(`\n#${pr.number}: ${pr.title}`);
          console.log(`   Current labels: ${pr.labels.map(l => l.name).join(', ') || 'none'}`);
          console.log(`   Suggested: ${suggestedLabels.join(', ')}`);
          
          if (options.apply) {
            try {
              await api.addLabels(pr.number, suggestedLabels);
              console.log(`   ✅ Labels applied`);
              labeled++;
            } catch (error) {
              console.log(`   ❌ Failed to apply labels: ${error.message}`);
            }
          }
        }
        
        processed++;
      }

      console.log(`\n📊 PRs Summary:`);
      console.log(`   Processed: ${processed}`);
      console.log(`   Labeled: ${labeled}`);
    }

    console.log('\n✅ Done!');
    if (!options.apply) {
      console.log('\n💡 Run with --apply to actually add these labels');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { LabelSuggester };

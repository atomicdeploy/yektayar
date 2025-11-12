#!/usr/bin/env node

/**
 * GitHub Label Management Script
 * 
 * This script manages GitHub labels for the YektaYar repository.
 * It can create, update, and sync labels based on the configuration in .github/labels.yml
 * 
 * Usage:
 *   node scripts/manage-github-labels.js [options]
 * 
 * Options:
 *   --sync        Sync all labels (create new, update existing)
 *   --create      Only create missing labels
 *   --list        List all existing labels
 *   --dry-run     Show what would be done without making changes
 *   --token       GitHub personal access token (or set GITHUB_TOKEN env var)
 *   --repo        Repository in format owner/repo (default: from git remote)
 * 
 * Examples:
 *   # List existing labels
 *   node scripts/manage-github-labels.js --list --token ghp_xxx
 * 
 *   # Sync labels (dry run)
 *   node scripts/manage-github-labels.js --sync --dry-run --token ghp_xxx
 * 
 *   # Create missing labels
 *   GITHUB_TOKEN=ghp_xxx node scripts/manage-github-labels.js --create
 * 
 * Requirements:
 *   - GitHub personal access token with 'repo' scope
 *   - Node.js 18+
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Parse YAML manually (avoiding external dependencies)
function parseYAML(content) {
  const lines = content.split('\n');
  const labels = [];
  let currentLabel = null;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // New label entry
    if (trimmed.startsWith('- name:')) {
      if (currentLabel && currentLabel.name) {
        labels.push(currentLabel);
      }
      currentLabel = { name: trimmed.split('"')[1] || trimmed.split("'")[1] };
    } else if (currentLabel) {
      if (trimmed.startsWith('color:')) {
        currentLabel.color = trimmed.split('"')[1] || trimmed.split("'")[1];
      } else if (trimmed.startsWith('description:')) {
        currentLabel.description = trimmed.split('"')[1] || trimmed.split("'")[1];
      }
    }
  }
  
  // Add last label
  if (currentLabel && currentLabel.name) {
    labels.push(currentLabel);
  }
  
  return labels;
}

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
          'User-Agent': 'YektaYar-Label-Manager',
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

  async listLabels() {
    const labels = [];
    let page = 1;
    
    while (true) {
      const pageLabels = await this.request('GET', `/labels?per_page=100&page=${page}`);
      if (pageLabels.length === 0) break;
      labels.push(...pageLabels);
      page++;
    }
    
    return labels;
  }

  async createLabel(label) {
    return this.request('POST', '/labels', label);
  }

  async updateLabel(oldName, label) {
    const encodedName = encodeURIComponent(oldName);
    return this.request('PATCH', `/labels/${encodedName}`, label);
  }

  async deleteLabel(name) {
    const encodedName = encodeURIComponent(name);
    return this.request('DELETE', `/labels/${encodedName}`);
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
    sync: args.includes('--sync'),
    create: args.includes('--create'),
    list: args.includes('--list'),
    dryRun: args.includes('--dry-run'),
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

  // Default to sync if no action specified
  if (!options.sync && !options.create && !options.list) {
    options.sync = true;
  }

  console.log(`🏷️  GitHub Label Manager for ${options.repo}\n`);
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  const api = new GitHubAPI(options.token, options.repo);

  try {
    // List labels
    if (options.list) {
      console.log('📋 Fetching existing labels...');
      const existingLabels = await api.listLabels();
      console.log(`\nFound ${existingLabels.length} labels:\n`);
      
      existingLabels.forEach(label => {
        console.log(`  ${label.name.padEnd(40)} #${label.color} ${label.description || ''}`);
      });
      return;
    }

    // Load configuration
    const configPath = path.join(__dirname, '..', '.github', 'labels.yml');
    if (!fs.existsSync(configPath)) {
      console.error('❌ Error: labels.yml not found at', configPath);
      process.exit(1);
    }

    const configContent = fs.readFileSync(configPath, 'utf-8');
    const desiredLabels = parseYAML(configContent);
    console.log(`📄 Loaded ${desiredLabels.length} labels from configuration\n`);

    // Get existing labels
    console.log('📋 Fetching existing labels...');
    const existingLabels = await api.listLabels();
    const existingLabelMap = new Map(existingLabels.map(l => [l.name, l]));
    console.log(`Found ${existingLabels.length} existing labels\n`);

    // Process labels
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const desiredLabel of desiredLabels) {
      const existing = existingLabelMap.get(desiredLabel.name);

      if (!existing) {
        // Create new label
        console.log(`➕ Creating: ${desiredLabel.name}`);
        if (!options.dryRun) {
          await api.createLabel({
            name: desiredLabel.name,
            color: desiredLabel.color,
            description: desiredLabel.description || ''
          });
        }
        created++;
      } else if (options.sync) {
        // Update existing label if changed
        const colorChanged = existing.color.toLowerCase() !== desiredLabel.color.toLowerCase();
        const descChanged = (existing.description || '') !== (desiredLabel.description || '');
        
        if (colorChanged || descChanged) {
          console.log(`🔄 Updating: ${desiredLabel.name}`);
          if (!options.dryRun) {
            await api.updateLabel(desiredLabel.name, {
              name: desiredLabel.name,
              color: desiredLabel.color,
              description: desiredLabel.description || ''
            });
          }
          updated++;
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    console.log('\n✅ Done!');
    console.log(`   Created: ${created}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    
    if (options.dryRun) {
      console.log('\n💡 Run without --dry-run to apply these changes');
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

module.exports = { parseYAML, GitHubAPI };

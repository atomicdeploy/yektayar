# GitHub Management System

This directory contains configuration files for GitHub issue and PR management.

## 📁 Contents

### Issue Templates (`ISSUE_TEMPLATE/`)
- **bug_report.yml** - Report bugs or unexpected behavior
- **feature_request.yml** - Suggest new features or enhancements
- **documentation.yml** - Report documentation issues
- **question.yml** - Ask questions about the project
- **config.yml** - Template configuration and contact links

### Pull Request Template
- **PULL_REQUEST_TEMPLATE.md** - Template for all pull requests

### Label Configuration
- **labels.yml** - Defines all labels for the repository (70+ labels)

## 🏷️ Quick Label Reference

### Type Labels
- 🐛 bug - Something isn't working
- ✨ feature - New feature request
- 🔧 enhancement - Improvement to existing feature
- 📝 documentation - Documentation improvements
- 🔒 security - Security-related changes
- ⚡ performance - Performance improvements

### Component Labels
- 🖥️ backend - Backend/API work
- 🎨 frontend - Frontend work
- 📱 mobile-app - Mobile app work
- 👨‍💼 admin-panel - Admin panel work
- 📦 shared - Shared package work

### Priority Labels
- 🔴 priority: critical - Needs immediate attention
- 🟠 priority: high - Important to address soon
- 🟡 priority: medium - Normal timeline
- 🟢 priority: low - Nice to have

### Status Labels
- 🔍 status: needs-triage - Needs review
- ✅ status: ready - Ready to work on
- 🚧 status: in-progress - Being worked on
- 👀 status: review-needed - Needs code review
- ⛔ status: blocked - Blocked by dependencies

### Size Labels
- 📏 size: XS - Extra small (< 1 hour)
- 📏 size: S - Small (1-4 hours)
- 📏 size: M - Medium (4-8 hours)
- 📏 size: L - Large (1-2 days)
- 📏 size: XL - Extra large (> 2 days)

### Special Labels
- 👍 good first issue - Good for newcomers
- 🆘 help wanted - Extra attention needed
- ❓ question - Information requested
- 🎯 breaking-change - Contains breaking changes

## 📚 Documentation

For complete information about using the GitHub management system:

- **[GitHub Management Guide](../docs/GITHUB-MANAGEMENT-GUIDE.md)** - Complete guide to labels, templates, and workflows
- **[Discord Integration Guide](../docs/GITHUB-DISCORD-INTEGRATION.md)** - Set up team collaboration with Discord

## 🛠️ Management Scripts

Two helper scripts are available in the `scripts/` directory:

### 1. Label Management (`scripts/manage-github-labels.js`)

Create and sync labels from the `labels.yml` configuration.

```bash
# List existing labels
node scripts/manage-github-labels.js --list --token YOUR_TOKEN

# Sync labels (dry run first)
node scripts/manage-github-labels.js --sync --dry-run --token YOUR_TOKEN

# Apply label changes
GITHUB_TOKEN=YOUR_TOKEN node scripts/manage-github-labels.js --sync
```

### 2. Auto-Label Issues (`scripts/auto-label-issues.js`)

Automatically suggest and apply labels to issues/PRs based on content.

```bash
# Analyze issues (dry run)
node scripts/auto-label-issues.js --token YOUR_TOKEN

# Apply labels to issues
GITHUB_TOKEN=YOUR_TOKEN node scripts/auto-label-issues.js --apply

# Process both issues and PRs
GITHUB_TOKEN=YOUR_TOKEN node scripts/auto-label-issues.js --all --apply
```

## 🔑 Getting a GitHub Token

To use the management scripts:

1. Go to https://github.com/settings/tokens/new
2. Give it a name: "YektaYar Label Management"
3. Select scope: **repo** (Full control of private repositories)
4. Click "Generate token"
5. Copy the token (you won't see it again!)

## 🚀 Quick Start for New Issues

1. Go to [New Issue](../../issues/new/choose)
2. Choose the appropriate template:
   - 🐛 Bug Report - For bugs and errors
   - ✨ Feature Request - For new features
   - 📝 Documentation - For doc issues
   - ❓ Question - For questions
3. Fill out the template
4. Submit!

## 📝 Quick Start for Pull Requests

1. Create your feature branch
2. Make your changes
3. Push to GitHub
4. Open a pull request
5. Fill out the PR template (it will auto-populate)
6. Request reviews
7. Address feedback
8. Merge when approved

## 💡 Best Practices

### For Issues
- Use the right template
- Provide clear, detailed information
- Add appropriate labels
- Link related issues with `#123`

### For Pull Requests
- Keep PRs focused and small
- Fill out the entire template
- Add screenshots for UI changes
- Request reviews from appropriate team members
- Respond to feedback promptly

### For Labels
- Add type label (bug, feature, etc.)
- Add scope labels (backend, frontend, etc.)
- Add priority if clear
- Update status as work progresses

## 🤝 Getting Help

If you need help:

1. Check the [GitHub Management Guide](../docs/GITHUB-MANAGEMENT-GUIDE.md)
2. Ask in Discord (see [Discord Integration Guide](../docs/GITHUB-DISCORD-INTEGRATION.md))
3. Open an issue with the `❓ question` label

---

**Last Updated**: 2025-11-12

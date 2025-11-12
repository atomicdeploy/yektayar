# GitHub Issue and PR Management Guide

This guide explains how to use the GitHub management system for the YektaYar project.

## Table of Contents

- [Labels System](#labels-system)
- [Issue Templates](#issue-templates)
- [Pull Request Template](#pull-request-template)
- [Management Scripts](#management-scripts)
- [Best Practices](#best-practices)
- [Automation](#automation)

## Labels System

YektaYar uses a comprehensive labeling system to organize issues and pull requests effectively.

### Label Categories

#### 🏷️ Type Labels - What kind of work is this?

| Label | Description | Color | When to Use |
|-------|-------------|-------|-------------|
| 🐛 bug | Something isn't working | Red | Broken functionality, errors, crashes |
| ✨ feature | New feature request | Blue | New functionality requests |
| 🔧 enhancement | Improvement to existing feature | Blue | Improvements to working features |
| 📝 documentation | Documentation improvements | Blue | Docs updates, additions |
| 🎨 design | UI/UX design work | Pink | Visual design, user experience |
| ♻️ refactor | Code refactoring | Yellow | Code cleanup without new features |
| ⚡ performance | Performance improvements | Orange | Speed, memory, optimization |
| 🧪 test | Adding or updating tests | Purple | Test coverage, test improvements |
| 🔒 security | Security-related | Red | Vulnerabilities, security fixes |
| 🚀 deployment | Deployment and CI/CD | Green | Deployment, build, CI/CD |
| 🔨 build | Build system or dependencies | Yellow | Build tools, dependencies |
| 🧹 chore | Routine tasks | Light Yellow | Maintenance tasks |

#### 📦 Scope/Area Labels - Which part of the codebase?

| Label | Description | When to Use |
|-------|-------------|-------------|
| 🖥️ backend | Backend/API related | Node.js, Express, API endpoints |
| 🎨 frontend | General frontend work | UI components, views |
| 📱 mobile-app | Mobile app | Ionic, Capacitor, mobile-specific |
| 👨‍💼 admin-panel | Admin panel | Vue.js admin interface |
| 📦 shared | Shared package | @yektayar/shared code |
| 🗄️ database | Database related | PostgreSQL, schemas, queries |
| 🔌 api | API endpoints | REST APIs, GraphQL |
| 🎭 ui | User interface | UI components, styling |
| 🌐 i18n | Internationalization | Translations, locales |
| 🔐 auth | Authentication | Login, permissions, tokens |
| 📧 notifications | Notifications | Email, SMS, push |
| 📊 analytics | Analytics and reporting | Metrics, reports, tracking |

#### 🎯 Priority Labels - How important is this?

| Label | Description | When to Use |
|-------|-------------|-------------|
| 🔴 priority: critical | Critical priority | App-breaking, data loss, security |
| 🟠 priority: high | High priority | Important features, major bugs |
| 🟡 priority: medium | Medium priority | Normal work items |
| 🟢 priority: low | Low priority | Nice-to-have, minor issues |

#### 📊 Status Labels - What state is this in?

| Label | Description | When to Use |
|-------|-------------|-------------|
| 🔍 status: needs-triage | Needs review | New issues not yet categorized |
| ✅ status: ready | Ready to work on | Approved and ready for development |
| 🚧 status: in-progress | Being worked on | Active development |
| ⏸️ status: on-hold | Temporarily paused | Waiting for something external |
| ⛔ status: blocked | Blocked by dependencies | Cannot proceed |
| 👀 status: review-needed | Needs code review | Ready for PR review |
| 🔄 status: needs-rebase | Needs to be rebased | Merge conflicts |
| 🔧 status: needs-work | Needs additional work | Changes requested in PR |

#### 📏 Size/Effort Labels - How much work is this?

| Label | Description | Time Estimate |
|-------|-------------|---------------|
| 📏 size: XS | Extra small | < 1 hour |
| 📏 size: S | Small | 1-4 hours |
| 📏 size: M | Medium | 4-8 hours |
| 📏 size: L | Large | 1-2 days |
| 📏 size: XL | Extra large | > 2 days |

#### 🎁 Special Labels

| Label | Description |
|-------|-------------|
| 👍 good first issue | Good for newcomers |
| 🆘 help wanted | Extra attention needed |
| ❓ question | Information requested |
| 🚫 wontfix | Will not be worked on |
| 📋 duplicate | Already exists |
| ❌ invalid | Doesn't seem right |
| 🎯 breaking-change | Contains breaking changes |
| 📚 needs-documentation | Documentation update needed |
| 🤖 dependencies | Dependency updates |
| 🐞 bug-confirmed | Confirmed and reproduced |
| 💬 discussion | Discussion/RFC needed |
| 🎉 hacktoberfest | Hacktoberfest eligible |

### How to Apply Labels

#### For New Issues

1. **Type**: Add one type label (bug, feature, etc.)
2. **Scope**: Add one or more scope labels (backend, frontend, etc.)
3. **Priority**: Add one priority label if it's clear
4. **Status**: New issues get `🔍 status: needs-triage` automatically

Example:
```
🐛 bug
🖥️ backend
🔴 priority: critical
🔍 status: needs-triage
```

#### For Pull Requests

1. **Type**: What kind of change is this?
2. **Scope**: Which components are affected?
3. **Size**: How big is this PR?
4. **Status**: Current state

Example:
```
✨ feature
📱 mobile-app
📏 size: M
👀 status: review-needed
```

## Issue Templates

We provide four issue templates to ensure consistent and complete issue reports.

### 🐛 Bug Report

Use this template when reporting bugs or unexpected behavior.

**Required Information**:
- Bug description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Component affected
- Severity
- Environment details

### ✨ Feature Request

Use this template when suggesting new features or enhancements.

**Required Information**:
- Problem statement
- Proposed solution
- Alternatives considered
- Component/area
- Priority
- Use cases

### 📝 Documentation

Use this template for documentation issues.

**Required Information**:
- Documentation type (missing, incorrect, unclear, etc.)
- Location
- Problem description
- Suggested improvement
- Related component

### ❓ Question

Use this template when you have questions.

**Required Information**:
- Your question
- Question category
- Context
- Related component

## Pull Request Template

Our PR template ensures all necessary information is provided for effective code review.

### Key Sections

1. **Description**: Brief overview of changes
2. **Type of Change**: What kind of PR is this?
3. **Related Issues**: Link to issues
4. **Changes Made**: Specific changes
5. **Component(s) Affected**: Which parts of the codebase
6. **Testing**: How was it tested?
7. **Screenshots/Videos**: For UI changes
8. **Checklist**: Pre-merge requirements

### PR Best Practices

- ✅ Fill out all relevant sections
- ✅ Link to related issues
- ✅ Add screenshots for UI changes
- ✅ Complete the checklist
- ✅ Request reviews from appropriate team members
- ✅ Keep PRs focused and small
- ✅ Update documentation if needed

## Management Scripts

We provide two scripts to help manage GitHub labels and issues.

### 1. Label Management Script

**Purpose**: Create, update, and sync labels from `.github/labels.yml`

**Location**: `scripts/manage-github-labels.js`

#### Usage

```bash
# List existing labels
node scripts/manage-github-labels.js --list --token YOUR_GITHUB_TOKEN

# Dry run (see what would change)
node scripts/manage-github-labels.js --sync --dry-run --token YOUR_GITHUB_TOKEN

# Create missing labels
GITHUB_TOKEN=YOUR_TOKEN node scripts/manage-github-labels.js --create

# Sync all labels (create new, update existing)
GITHUB_TOKEN=YOUR_TOKEN node scripts/manage-github-labels.js --sync
```

#### Creating a GitHub Token

1. Go to https://github.com/settings/tokens/new
2. Give it a name: "YektaYar Label Management"
3. Select scope: **repo** (Full control of private repositories)
4. Click "Generate token"
5. Copy the token (you won't see it again!)

#### Options

- `--list`: List all existing labels
- `--sync`: Sync all labels (create new, update existing)
- `--create`: Only create missing labels
- `--dry-run`: Show what would be done without making changes
- `--token`: GitHub personal access token
- `--repo`: Repository in format owner/repo

### 2. Auto-Label Script

**Purpose**: Automatically suggest and apply labels to existing issues and PRs based on content analysis

**Location**: `scripts/auto-label-issues.js`

#### Usage

```bash
# Analyze issues (dry run)
node scripts/auto-label-issues.js --token YOUR_GITHUB_TOKEN

# Apply labels to issues
node scripts/auto-label-issues.js --apply --token YOUR_GITHUB_TOKEN

# Process pull requests
GITHUB_TOKEN=YOUR_TOKEN node scripts/auto-label-issues.js --prs --apply

# Process both issues and PRs
GITHUB_TOKEN=YOUR_TOKEN node scripts/auto-label-issues.js --all --apply --limit 100
```

#### Options

- `--apply`: Actually apply labels (default is dry-run)
- `--issues`: Process issues (default)
- `--prs`: Process pull requests
- `--all`: Process both issues and PRs
- `--limit`: Limit number of items to process (default: 50)
- `--token`: GitHub personal access token
- `--repo`: Repository in format owner/repo

#### How It Works

The script analyzes issue/PR titles and bodies for keywords:

**Type Detection**:
- `bug`: bug, error, crash, issue, broken, fix, not working
- `feature`: feature, enhancement, add, new, implement
- `documentation`: docs, documentation, readme, guide
- `question`: question, how to, help, what is, why

**Component Detection**:
- `backend`: backend, api, server, endpoint, database
- `frontend`: frontend, ui, ux, interface, design
- `mobile`: mobile, app, android, ios, capacitor
- `admin`: admin, panel, dashboard

**Priority Detection** (from title):
- `critical`: critical, urgent, emergency, blocker
- `high`: high priority, important, severe

## Best Practices

### For Issue Creators

1. **Use the right template**: Choose the appropriate issue template
2. **Be specific**: Provide clear, detailed information
3. **Add labels**: Apply appropriate labels if you can
4. **Link related issues**: Use `#issue_number` to reference
5. **Follow up**: Respond to questions and provide updates
6. **Search first**: Check if issue already exists

### For Maintainers

1. **Triage regularly**: Review `🔍 status: needs-triage` issues
2. **Label promptly**: Add appropriate labels to new issues
3. **Set priorities**: Assign priority labels
4. **Estimate size**: Add size labels to help planning
5. **Keep updated**: Update status labels as work progresses
6. **Close duplicates**: Mark and close duplicate issues
7. **Be responsive**: Reply to questions and comments

### For Contributors

1. **Check labels**: Look for `👍 good first issue` or `🆘 help wanted`
2. **Assign yourself**: Comment that you're working on it
3. **Update status**: Add `🚧 status: in-progress` when starting
4. **Link PRs**: Reference issue number in PR description
5. **Request review**: Add `👀 status: review-needed` when ready
6. **Be patient**: Wait for review feedback

### For Reviewers

1. **Review promptly**: Respond to `👀 status: review-needed` PRs
2. **Be constructive**: Provide helpful, specific feedback
3. **Check completeness**: Ensure PR template is filled out
4. **Test locally**: Try changes before approving
5. **Approve or request changes**: Don't leave PRs in limbo
6. **Merge when ready**: Merge approved PRs promptly

## Automation

### GitHub Actions

Consider setting up these automations:

1. **Auto-label PRs**: Based on changed files
2. **Stale issues**: Close inactive issues after warning
3. **Welcome bot**: Greet first-time contributors
4. **Size labeler**: Auto-add size labels based on changes
5. **PR checks**: Ensure template is filled out

### Example Workflows

#### Auto-label by File Path

```yaml
name: Auto Label
on: [pull_request]
jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v4
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
```

#### Stale Issues

```yaml
name: Close Stale Issues
on:
  schedule:
    - cron: '0 0 * * *'
jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v8
        with:
          stale-issue-message: 'This issue is stale...'
          days-before-stale: 90
          days-before-close: 14
```

## Common Workflows

### Creating an Issue

1. Go to [Issues](https://github.com/atomicdeploy/yektayar/issues)
2. Click "New Issue"
3. Choose the appropriate template
4. Fill out all required fields
5. Add labels if you can
6. Submit

### Creating a Pull Request

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit with clear messages
4. Push to GitHub
5. Open PR and fill out the template
6. Add appropriate labels
7. Request reviews
8. Address feedback
9. Merge when approved

### Triaging Issues

1. Review new issues with `🔍 status: needs-triage`
2. Read the issue carefully
3. Add type label (bug, feature, etc.)
4. Add scope labels (backend, frontend, etc.)
5. Add priority if clear
6. Change status to `✅ status: ready` if actionable
7. Add `💬 discussion` if needs more input
8. Close as `📋 duplicate` or `❌ invalid` if appropriate

## Getting Help

If you have questions about the GitHub management system:

1. Check this documentation
2. Open an issue with `❓ question` label
3. Ask in Discord (see [GITHUB-DISCORD-INTEGRATION.md](./GITHUB-DISCORD-INTEGRATION.md))
4. Contact a maintainer

---

**Happy contributing! 🎉**

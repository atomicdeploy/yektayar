# Git Sync Command

The `git sync` command is a powerful utility that automates the entire workflow of synchronizing your local repository with the remote, managing dependencies, and ensuring everything is up to date.

## What It Does

The `git sync` command performs the following operations automatically:

1. **Checks Git Status** - Verifies you're on a valid branch
2. **Stashes Changes** - Safely stashes any uncommitted local changes
3. **Fetches Updates** - Fetches latest changes from all remotes
4. **Pulls Changes** - Pulls and rebases the current branch with remote
5. **Pushes Commits** - Pushes any unpushed local commits to remote
6. **Updates Dependencies** - Installs/updates npm dependencies if package files changed
7. **Runs Builds** - Builds the shared package if needed
8. **Restores Changes** - Restores your previously stashed changes
9. **Runs Checks** - Validates system requirements and dependencies

## Usage

You can run the sync command in three different ways:

### Option 1: Using Git Alias (Recommended)

```bash
git sync
```

This is the most convenient way after running the setup script.

### Option 2: Using npm Script

```bash
npm run sync
```

This works immediately after cloning without any setup.

### Option 3: Direct Script Execution

```bash
./scripts/git-sync.sh
```

## Initial Setup

To enable the `git sync` command (git alias), run the setup script once:

```bash
./scripts/setup-git-sync.sh
```

This configures a local git alias that makes `git sync` available in your repository.

**Note:** The npm script `npm run sync` works without any setup.

## Use Cases

### After Cloning the Repository

```bash
git clone https://github.com/atomicdeploy/yektayar.git
cd yektayar
npm run sync  # or git sync after running setup-git-sync.sh
```

This will install all dependencies, build necessary packages, and verify your environment is ready.

### Daily Development Workflow

```bash
git sync  # Fetch latest changes and ensure everything is up to date
npm run dev  # Start development
```

### After Pulling Changes

Instead of manually running multiple commands, just run:

```bash
git sync
```

This replaces:
```bash
git fetch
git pull
npm install
npm run build -w @yektayar/shared
node scripts/check-requirements.js
```

### Before Starting Work

```bash
git sync  # Sync with remote and update everything
git checkout -b feature/my-new-feature
```

### Sharing Your Changes

```bash
git add .
git commit -m "Add: my awesome feature"
git sync  # Push your changes and sync with remote
```

## What Happens Behind the Scenes

### Smart Stashing

- Only stashes if you have uncommitted changes
- Creates a timestamped stash name for easy identification
- Automatically restores your changes after sync completes
- If restore fails, tells you how to recover your stash

### Intelligent Dependency Management

- Detects if `package.json` or lock files changed
- Only runs install if dependencies are actually out of date
- Uses the repository's custom `install-dependencies.js` script
- Handles workspace monorepo structure correctly

### Safe Remote Operations

- Checks if your branch has a remote tracking branch
- Skips push/pull if no remote is configured
- Uses rebase to keep history clean
- Detects and warns about merge conflicts

### Build Optimization

- Only builds packages that need rebuilding
- Checks if source files are newer than build outputs
- Focuses on critical shared package first

## Error Handling

The script handles various error scenarios gracefully:

### Merge Conflicts

If pulling causes conflicts, the script will:
1. Stop the sync process
2. Restore your stashed changes
3. Display an error message
4. Let you resolve conflicts manually

### No Remote Branch

If your branch has no remote tracking branch, the script will:
1. Skip push and pull operations
2. Continue with other sync steps
3. Inform you about the skipped operations

### Stash Restore Failure

If restoring stashed changes fails, the script will:
1. Show an error message
2. Tell you the stash name
3. Provide instructions to manually restore

## Tips

### First Time Use

After cloning the repository for the first time:
```bash
./scripts/setup-git-sync.sh  # Setup git alias
git sync                      # Initialize and sync everything
```

### Regular Development

```bash
# Start your day
git sync

# Work on features...
git add .
git commit -m "Add: feature"

# Share and sync
git sync
```

### Multiple Machines

The git alias is repository-local, so you need to run the setup script on each machine:
```bash
./scripts/setup-git-sync.sh
```

Or just use `npm run sync` which works everywhere without setup.

## Troubleshooting

### "Not in a git repository"

Make sure you're in the yektayar repository directory:
```bash
cd /path/to/yektayar
git sync
```

### "Failed to fetch from remote"

Check your network connection and GitHub access:
```bash
git fetch --all  # Test fetch manually
```

### "Failed to pull changes"

You may have merge conflicts. The script will notify you. Resolve them manually:
```bash
git status
git diff
# Resolve conflicts
git add .
git rebase --continue
```

### Stash Not Restoring

Your stashed changes are safe. Find and restore them:
```bash
git stash list           # Find your stash
git stash pop stash@{0}  # Restore the latest stash
```

## Advanced Usage

### Skip Dependency Installation

If you want to skip dependency updates (not recommended), you can comment out the dependency installation step in the script. However, it's better to let the script handle this automatically as it only installs when needed.

### Custom Checks

The script runs `scripts/check-requirements.js` at the end. You can customize this file to add your own checks.

## Benefits

✅ **Saves Time** - One command instead of many  
✅ **Prevents Errors** - Automatic stashing prevents losing changes  
✅ **Keeps Dependencies Updated** - Never work with outdated packages  
✅ **Ensures Clean Builds** - Rebuilds when necessary  
✅ **Validates Environment** - Checks system requirements  
✅ **Safe Operations** - Handles errors gracefully  
✅ **Beginner Friendly** - Complex workflow made simple  
✅ **Team Consistency** - Everyone uses the same workflow

## Comparison to Manual Workflow

### Without Git Sync:
```bash
git stash                          # 1. Stash changes
git fetch --all                    # 2. Fetch updates
git pull --rebase                  # 3. Pull changes
git push                           # 4. Push commits
git stash pop                      # 5. Restore changes
npm install                        # 6. Update dependencies
npm run build -w @yektayar/shared  # 7. Build shared package
node scripts/check-requirements.js # 8. Check requirements
```

### With Git Sync:
```bash
git sync  # Does everything above automatically
```

## Contributing

If you find issues or have suggestions for improving the sync script, please:

1. Open an issue on GitHub
2. Submit a pull request with improvements
3. Discuss in team meetings

## See Also

- [Development Guide](../DEVELOPMENT.md) - Development workflow and best practices
- [Quick Start Guide](../QUICK-START.md) - Getting started quickly
- [Environment Configuration](../ENV-GUIDE.md) - Setting up environment variables

# Git File-Based Parsing Documentation

## Overview

The git utility now includes comprehensive file-based parsing capabilities that allow reading git repository information directly from `.git` directory files without executing git commands. This provides a fast, secure, and reliable way to access git information even when the git command is not available.

## Use Cases

1. **Fallback mechanism** - When git command is not installed or not in PATH
2. **Security** - No command execution, eliminating command injection risks
3. **Performance** - Direct file reading is faster than spawning git processes
4. **Read-only operations** - Perfect for getting repository info without modifying anything
5. **Restricted environments** - Works in containers or systems where git execution is restricted

## Available Methods

### Core File-Based Functions

#### `isGitRepositoryFromFile(cwd?: string): Promise<boolean>`
Checks if a directory is a git repository by checking for `.git` directory.
```typescript
const isRepo = await isGitRepositoryFromFile('/path/to/repo')
// Returns: true or false
```

#### `readBranchFromFile(cwd?: string): Promise<string | null>`
Reads the current branch name from `.git/HEAD` file.
```typescript
const branch = await readBranchFromFile('/path/to/repo')
// Returns: "main" or "feature/my-feature" or null
```

#### `readCommitFromFile(cwd?: string, branch?: string): Promise<string | null>`
Reads commit hash from `.git/refs/heads/` files or packed-refs.
```typescript
const commit = await readCommitFromFile('/path/to/repo')
// Returns: "abc123def456..." or null
```

#### `readRemoteFromFile(cwd?: string, remoteName?: string): Promise<string | null>`
Parses remote URL from `.git/config` file.
```typescript
const remote = await readRemoteFromFile('/path/to/repo', 'origin')
// Returns: "https://github.com/user/repo.git" or null
```

#### `readBranchesFromFile(cwd?: string): Promise<string[]>`
Lists all local branches from `.git/refs/heads/` directory.
```typescript
const branches = await readBranchesFromFile('/path/to/repo')
// Returns: ["main", "develop", "feature/my-feature"]
```

#### `readTagsFromFile(cwd?: string): Promise<string[]>`
Lists all tags from `.git/refs/tags/` directory.
```typescript
const tags = await readTagsFromFile('/path/to/repo')
// Returns: ["v1.0.0", "v1.1.0"]
```

### Comprehensive Info Functions

#### `getGitInfoFromFiles(cwd?: string): Promise<GitFileInfo>`
Gets all available git information from files in a single call.
```typescript
const info = await getGitInfoFromFiles('/path/to/repo')
// Returns:
// {
//   branch: "main",
//   commit: "abc123...",
//   shortCommit: "abc123",
//   remote: "https://github.com/user/repo.git",
//   branches: ["main", "develop"],
//   tags: ["v1.0.0"],
//   isRepository: true
// }
```

#### `getGitInfoWithFallback(cwd?: string, preferFiles?: boolean): Promise<GitInfoResult>`
Hybrid function that tries file-based methods first, then falls back to git commands if needed.
```typescript
const info = await getGitInfoWithFallback('/path/to/repo', true)
// Returns:
// {
//   branch: "main",
//   commit: "abc123...",
//   shortCommit: "abc123",
//   remote: "https://github.com/user/repo.git",
//   fromFiles: true  // Indicates which method was used
// }
```

## How It Works

### Reading Branch Name
1. Reads `.git/HEAD` file
2. Parses format: `ref: refs/heads/branch-name`
3. Returns branch name or detects detached HEAD state

### Reading Commit Hash
1. Reads `.git/refs/heads/branch-name` file for direct refs
2. Falls back to `.git/packed-refs` for packed references
3. Supports reading from specific branches or current HEAD

### Parsing Remote URL
1. Reads `.git/config` file
2. Parses git config format to find `[remote "origin"]` section
3. Extracts `url = ...` value

### Listing Branches
1. Recursively reads `.git/refs/heads/` directory
2. Handles nested branch names (e.g., `feature/my-branch`)
3. Returns array of all local branch names

### Listing Tags
1. Reads `.git/refs/tags/` directory
2. Returns array of tag names
3. Does not include annotated tag metadata

## File Structure Reference

```
.git/
├── HEAD                    # Current branch reference
├── config                  # Repository configuration
├── refs/
│   ├── heads/             # Local branches
│   │   ├── main
│   │   └── feature/
│   │       └── my-branch
│   └── tags/              # Tags
│       ├── v1.0.0
│       └── v1.1.0
└── packed-refs            # Packed references (alternative storage)
```

## Limitations

The file-based methods have some limitations compared to full git commands:

1. **Status information** - Cannot determine dirty/clean status or uncommitted changes
2. **Commits ahead/behind** - Cannot calculate sync status with remote
3. **Commit metadata** - Cannot read commit messages, authors, or dates
4. **Complex operations** - Cannot perform write operations (fetch, pull, commit, etc.)

For these operations, use the command-based methods which execute actual git commands.

## Best Practices

1. **Use file-based methods for read-only queries** when performance matters
2. **Use fallback mechanism** in production to handle both scenarios
3. **Combine approaches** - Use files for basic info, commands for detailed operations
4. **Check return values** - File methods return null if data cannot be read
5. **Handle errors gracefully** - File operations may fail due to permissions or corruption

## Example Usage

```typescript
import { 
  getGitInfoFromFiles, 
  getGitInfoWithFallback,
  readBranchFromFile 
} from '@yektayar/shared'

// Quick branch check (file-based only)
const branch = await readBranchFromFile()
if (branch) {
  console.log(`Current branch: ${branch}`)
}

// Get complete info (file-based only)
const fileInfo = await getGitInfoFromFiles()
if (fileInfo.isRepository) {
  console.log(`Branch: ${fileInfo.branch}`)
  console.log(`Commit: ${fileInfo.shortCommit}`)
  console.log(`Remote: ${fileInfo.remote}`)
}

// Get info with automatic fallback
const info = await getGitInfoWithFallback(undefined, true)
console.log(`Branch: ${info.branch}`)
console.log(`Method: ${info.fromFiles ? 'files' : 'commands'}`)
```

## Testing

Run the test script to verify all file-based methods:

```bash
npm run test:git-files
# or
node scripts/test-git-file-parsing.js
```

## Performance

File-based methods are significantly faster than command execution:
- No process spawning overhead
- No PATH resolution
- Direct file system access
- Minimal parsing required

Typical performance: <1ms per operation vs 10-50ms for git commands.

## Security

File-based methods are inherently more secure:
- ✅ No command execution
- ✅ No shell interpretation
- ✅ No command injection risk
- ✅ Read-only file operations
- ✅ No elevated privileges needed

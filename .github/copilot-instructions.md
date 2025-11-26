# Copilot Coding Instructions for YektaYar

## General Guidelines

These instructions help ensure code consistency and quality across the YektaYar project.

## Logging Standards

**CRITICAL: Always use the logger utility instead of console methods**

### ❌ DO NOT USE:
```typescript
console.log('Something happened')
console.error('An error occurred')
console.warn('Warning message')
console.info('Info message')
console.debug('Debug info')
```

### ✅ ALWAYS USE:
```typescript
import { logger } from '@yektayar/shared'

logger.info('Something happened')
logger.error('An error occurred')
logger.warn('Warning message')
logger.debug('Debug info')
logger.success('Operation completed successfully')
```

### Logger Benefits:
- Consistent formatting across browser and Node.js
- Colorized output with emojis
- Better visibility in production logs
- Easier to filter and search

### Available Logger Methods:
- `logger.success(message, ...args)` - For successful operations
- `logger.error(message, ...args)` - For errors and exceptions
- `logger.info(message, ...args)` - For informational messages
- `logger.warn(message, ...args)` - For warnings
- `logger.debug(message, ...args)` - For debug information
- `logger.custom(emoji, message, color, ...args)` - For custom logging

### Example Usage:
```typescript
// Import the logger
import { logger } from '@yektayar/shared'

// Success message
logger.success('User created successfully', { userId: user.id })

// Error handling
try {
  await someOperation()
} catch (error) {
  logger.error('Operation failed', error)
}

// Info message
logger.info('Processing request', { endpoint: '/api/users' })

// Custom message
logger.custom('🚀', 'Server starting', 'cyan')
```

## Code Quality Standards

### 1. TypeScript
- Always use TypeScript for type safety
- Avoid using `any` type when possible
- Use proper type annotations for function parameters and return values
- Prefer interfaces over type aliases for object shapes

### 2. Testing
- Write tests for new features and bug fixes
- Run tests before committing: `npm run test`
- Ensure all tests pass before creating a PR
- Code coverage should be maintained or improved

### 3. Linting
- Run ESLint before committing: `npm run lint`
- Fix all linting errors before creating a PR
- Use `npm run lint:fix` to automatically fix common issues
- ESLint will catch console.* usage and other code quality issues

### 4. Git Commits
- Write clear, descriptive commit messages
- Keep commits focused on a single change
- Reference issue numbers in commit messages when applicable

### 5. Pull Requests
- All PRs must pass CI checks (linting and tests)
- Request code review before merging
- Address review feedback promptly
- Keep PRs small and focused

## Pre-Commit Checklist

Before committing code, ensure:
- [ ] No direct console.* usage (use logger instead)
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] Type checking passes: `npm run build`
- [ ] Code is formatted consistently
- [ ] No sensitive data or credentials in code

## CI/CD Pipeline

All pull requests and pushes trigger:
1. ESLint checks for code quality
2. Unit tests with Vitest
3. Type checking with TypeScript
4. Code standards validation

Ensure all checks pass before merging.

## Resources

- Logger implementation: `packages/shared/src/utils/logger.ts`
- ESLint config: `eslint.config.js`
- Test config: `vitest.config.ts`
- CI workflow: `.github/workflows/ci.yml`

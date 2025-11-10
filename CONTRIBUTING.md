# Contributing Guidelines

Thank you for your interest in contributing to YektaYar! This document provides guidelines for contributing to the project.

## Development Approach

This project follows a **monorepo** structure with clear separation of concerns between backend, admin panel, mobile app, and shared code.

## Branching Strategy

### Main Branches
- `main` - Production-ready code
- `develop` - Integration branch for features (if needed)

### Feature Branches
- Use descriptive names: `feat/<short-name>`, `fix/<bug-name>`, `docs/<doc-name>`
- Examples:
  - `feat/add-chat-thread-creation`
  - `fix/correct-permission-check`
  - `docs/update-architecture`

## Commit Messages

Follow conventional commit format:

```
<type>: <subject>

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependency updates, etc.

### Examples
```
feat: add chat thread creation endpoint
fix: correct permission check for user notes
docs: update architecture overview
chore: update dependencies
```

## Code Style

### TypeScript/JavaScript
- Use **TypeScript** for all new code
- Follow existing code style
- Use ESLint for linting
- Prefer clear, descriptive names over comments
- Add comments only for complex logic

### Vue/Frontend
- Use **Composition API** for Vue components
- Use `<script setup>` syntax
- Follow Vue.js style guide
- Use TypeScript for type safety

### Backend
- Use async/await for asynchronous operations
- Handle errors properly
- Use proper HTTP status codes
- Document API endpoints

## Pull Requests

### Before Submitting
- [ ] Code builds without errors
- [ ] Linter passes
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
- [ ] Self-review completed

### PR Description
Include:
- What changes were made
- Why the changes were necessary
- Any breaking changes
- Related issues (if any)

### Review Process
- PRs require review before merging
- Address all review comments
- Keep PRs focused and small when possible

## Adding Dependencies

**Think carefully before adding new dependencies.**

Ask yourself:
1. Does this significantly reduce development time or improve quality?
2. Is the package well-maintained and secure?
3. Does it introduce unnecessary complexity?
4. Are there simpler alternatives?

If yes to 1-2 and no to 3-4, proceed with adding the dependency.

## Validation

- Use **Zod** schemas for data validation
- Share schemas between frontend and backend via the `shared` package
- Validate all user input
- Annotate with `// TODO: validate` if skipping for time-critical work

## Security

### Best Practices
- **Never** commit secrets, API keys, or passwords
- Use environment variables for sensitive configuration
- Use parameterized queries (ORM handles this)
- Never log raw passwords, tokens, or sensitive data
- Validate and sanitize all user input
- Use HTTPS in production
- Follow OWASP security guidelines

### Authentication
- Use session-based authentication
- Store sessions server-side
- Implement proper session expiration
- Use secure, httpOnly cookies where applicable

## Testing

### Unit Tests
- Write tests for business logic
- Use appropriate test framework (Vitest recommended)
- Aim for good coverage of critical paths

### Integration Tests
- Test API endpoints
- Test database operations
- Mock external services

### E2E Tests
- Test critical user flows
- Use appropriate E2E framework (Playwright/Cypress)

## Documentation

### Code Documentation
- Document complex functions and algorithms
- Use JSDoc/TSDoc for public APIs
- Keep documentation up-to-date with code

### Project Documentation
- Update README.md when adding features
- Update relevant guides in `docs/`
- Add new guides for significant features
- Update docs/INDEX.md when adding new documentation

## AI Assistance

AI assistance (GitHub Copilot, ChatGPT, etc.) is welcome for:
- Generating boilerplate code
- Writing tests
- Documentation
- Code suggestions

**However:**
- Manually review all AI-generated code
- Pay special attention to:
  - Database operations
  - Authentication/authorization logic
  - Security-sensitive code
  - API contracts

## Questions?

- Open an issue for bugs or feature requests
- Use GitHub Discussions for questions
- Check existing documentation first

---

**Remember:** Quality over speed. Take time to write good code, tests, and documentation.
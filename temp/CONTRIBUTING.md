# Contributing Guidelines (Prototype Phase)

Single developer mode. These guidelines ensure consistency while moving fast.

## Branching
- Use `main` for direct commits (acceptable during prototype).
- Optional feature branches: `feat/<short-name>`.

## Commit Messages
Short, imperative:
```
feat: add chat thread creation endpoint
fix: correct permission check for user notes
docs: update architecture overview
```

## Code Style
- ESLint (warnings only).
- Prefer clear names over comments.
- Defer types (plain JS is fine now).

## PRs
- Optional during prototype; later enforce review.

## Dependencies
Ask: Does this reduce prototype time significantly?
If not, avoid.

## Validations
Use Zod schemas where feasible.
Skip if time-critical but annotate with `// TODO: validate`.

## Security
- Use parameterized queries with Knex.
- Never log raw passwords or TOTP codes.

## AI Assistance
Allowed for generating boilerplate; manually review DB and auth portions.
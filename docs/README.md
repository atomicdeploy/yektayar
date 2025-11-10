# YektaYar Documentation

This directory contains comprehensive guides and documentation for the YektaYar platform.

---

## Available Documentation

### Setup and Configuration

- **[Bun vs NPM](BUN-VS-NPM.md)** - Understanding bun and npm in YektaYar
  - Comparison of bun and npm
  - When to use each tool
  - Installation instructions
  - Usage examples
  - Performance comparisons
  - Troubleshooting

- **[Network Configuration](NETWORK-CONFIGURATION.md)** - Interface and port configuration
  - Interface binding (localhost vs all interfaces)
  - Port configuration for all services
  - Common scenarios with examples
  - Security considerations
  - Quick reference commands

### Deployment

- **[Ubuntu 24.04 Deployment](UBUNTU-24-DEPLOYMENT.md)** - Complete VPS deployment guide
  - Server requirements and setup
  - Software installation
  - Database configuration
  - Application deployment
  - Web server setup (Apache/Nginx)
  - SSL certificates
  - Process management with PM2
  - Monitoring and backups
  - Security best practices

---

## Quick Links

### For Developers

- New to the project? Start with [../README.md](../README.md)
- Setting up development environment? Check [../DEVELOPMENT.md](../DEVELOPMENT.md)
- Need a quick reference? See [../QUICK-START.md](../QUICK-START.md)
- Want to understand bun? Read [BUN-VS-NPM.md](BUN-VS-NPM.md)
- Need to change ports? See [NETWORK-CONFIGURATION.md](NETWORK-CONFIGURATION.md)

### For DevOps

- Deploying to VPS? Follow [UBUNTU-24-DEPLOYMENT.md](UBUNTU-24-DEPLOYMENT.md)
- Configuring network? Check [NETWORK-CONFIGURATION.md](NETWORK-CONFIGURATION.md)
- Understanding runtime? Read [BUN-VS-NPM.md](BUN-VS-NPM.md)

---

## Documentation Structure

```
yektayar/
├── docs/                          # Detailed guides (this directory)
│   ├── README.md                 # This file
│   ├── BUN-VS-NPM.md            # Bun vs NPM guide
│   ├── NETWORK-CONFIGURATION.md  # Interface and port configuration
│   └── UBUNTU-24-DEPLOYMENT.md   # Ubuntu 24.04 VPS deployment
├── README.md                      # Project overview
├── DEVELOPMENT.md                 # Development guide
├── QUICK-START.md                 # Quick reference
└── docs-archive/                  # Archived documentation (reference only)
```

---

## Contributing to Documentation

When adding new documentation:

1. Create the file in this `docs/` directory
2. Use clear, descriptive filenames (e.g., `AWS-DEPLOYMENT.md`)
3. Follow the existing documentation format:
   - Start with a clear title and description
   - Include a table of contents for longer docs
   - Use code blocks with syntax highlighting
   - Add troubleshooting sections where relevant
4. Update this README.md to link to the new document
5. Update the main README.md if the document is important

---

## Documentation Standards

### Structure

Each guide should include:
- Clear title and description
- Table of contents (for longer docs)
- Prerequisites section
- Step-by-step instructions
- Code examples
- Troubleshooting section
- Additional resources/links

### Code Blocks

Always specify the language for code blocks:

```bash
# Bash commands
npm install
```

```typescript
// TypeScript code
const app = new Elysia()
```

```javascript
// JavaScript code
const config = require('./config')
```

### Best Practices

- Use clear, simple language
- Provide context before commands
- Include expected output when helpful
- Add warnings for destructive operations
- Cross-reference related documentation
- Keep content up-to-date

---

## Getting Help

- **Issues**: Report documentation issues on [GitHub Issues](https://github.com/atomicdeploy/yektayar/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/atomicdeploy/yektayar/discussions)
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md) (if exists)

---

**Last Updated**: 2025-11-10  
**Maintained By**: YektaYar Development Team

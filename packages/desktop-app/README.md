# YektaYar Desktop App

Desktop application wrapper for YektaYar Admin Panel, built with Electron.

## Overview

This package provides a Windows desktop application (`.exe`) that wraps the YektaYar Admin Panel web interface. It's similar to the now-unmaintained Nativefier project but built specifically for YektaYar with configuration management.

> **📘 For detailed build instructions, see [BUILD.md](BUILD.md)**

## Features

- ✅ Windows `.exe` installer (NSIS)
- ✅ Configuration via `.env` file
- ✅ Configuration via `config.json` file
- ✅ Automatic API URL configuration
- ✅ Desktop shortcuts and start menu integration
- ✅ Customizable installation directory

## Configuration

The desktop app supports two methods of configuration:

### 1. Environment Variables (`.env` file)

Create a `.env` file in the installation directory:

```env
VITE_API_BASE_URL=https://api.yektayar.ir
VITE_ENVIRONMENT=production
```

### 2. Config File (`config.json`)

Create a `config.json` file in the installation directory:

```json
{
  "apiBaseUrl": "https://api.yektayar.ir",
  "environment": "production"
}
```

### Configuration Priority

The app loads configuration in this priority order:
1. `.env` file variables
2. `config.json` values
3. Default values (localhost:3000)

Example files are provided as `.env.example` and `config.example.json`.

## Building

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Windows (for building Windows executables)

### Build Steps

1. Install dependencies:
```bash
npm install
```

2. Build the web assets (admin panel):
```bash
npm run build:web
```

3. Build the Windows installer:
```bash
npm run build:electron
```

The installer will be created in the `dist` directory.

### Build Outputs

- `YektaYar Admin-Setup-0.1.0.exe` - Windows installer
- Installed location: `C:\Program Files\YektaYar Admin` (default)

## Development

To run in development mode:

```bash
# Terminal 1: Start the admin panel dev server
cd ../admin-panel
npm run dev

# Terminal 2: Start Electron
cd ../desktop-app
npm run dev
```

## Directory Structure

```
desktop-app/
├── electron/           # Electron main process
│   ├── main.js        # Main process entry point
│   └── preload.js     # Preload script for security
├── build/             # Build resources (icons, etc.)
├── dist/              # Build output
├── .env.example       # Example environment file
├── config.example.json # Example config file
├── capacitor.config.ts # Capacitor configuration
└── package.json       # Package configuration
```

## How It Works

1. The desktop app uses Electron to create a native window
2. It loads the built admin panel from the `build` directory
3. On startup, it reads configuration from `.env` and `config.json`
4. Configuration is used to set the API base URL and environment
5. The app runs the admin panel with the configured settings

## Troubleshooting

### Issue: App doesn't connect to API

**Solution**: Check your `.env` or `config.json` file and ensure `VITE_API_BASE_URL` or `apiBaseUrl` points to the correct backend server.

### Issue: Build fails on non-Windows platform

**Solution**: Electron-builder requires Windows to build Windows executables. Use a Windows machine, WSL2, or a CI/CD service with Windows runners.

### Issue: Icon not showing

**Solution**: Ensure `build/icon.ico` exists. You can generate it from the project assets:
```bash
# From project root
npm run generate:icons
```

## Related Packages

- `@yektayar/admin-panel` - The Vue.js admin interface that this app wraps
- `@yektayar/backend` - The backend API server

## License

Proprietary - All Rights Reserved

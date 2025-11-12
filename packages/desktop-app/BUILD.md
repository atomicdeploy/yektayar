# Building YektaYar Desktop App

This guide explains how to build the Windows desktop application.

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Windows OS** (required for building Windows .exe)
  - Or WSL2 with Windows build tools
  - Or CI/CD with Windows runner

## Quick Build

From the project root:

```bash
# Build desktop app (builds admin-panel and packages as .exe)
npm run build:desktop
```

The installer will be created in `packages/desktop-app/dist/`.

## Manual Build Process

### Step 0: Generate Icons (if not already done)

From the project root:

```bash
npm run generate:icons
```

This generates the application icon (256x256 PNG) in the `build/` directory.

### Step 1: Install Dependencies

```bash
cd packages/desktop-app
npm install
```

### Step 2: Build Admin Panel

```bash
npm run build:web
```

This builds the admin panel web assets that will be packaged into the desktop app.

### Step 3: Build Electron Installer

```bash
npm run build:electron
```

This creates the Windows NSIS installer using electron-builder.

### Alternative: Build Directory Only (for testing)

To build without creating an installer (faster for testing):

```bash
npm run build:electron:dir
```

This creates an unpacked directory in `dist/` that you can run directly.

## Build Output

After a successful build, you'll find:

```
packages/desktop-app/dist/
├── YektaYar Admin-Setup-0.1.0.exe    # Windows installer (NSIS)
└── win-unpacked/                      # Unpacked application (if using --dir)
```

## Configuration

The built application will look for configuration files in the installation directory:

- `.env` - Environment variables (see `.env.example`)
- `config.json` - JSON configuration (see `config.example.json`)

Example `.env`:
```env
API_BASE_URL=https://api.yektayar.ir
ENVIRONMENT=production
```

Example `config.json`:
```json
{
  "apiBaseUrl": "https://api.yektayar.ir",
  "environment": "production"
}
```

## Development Mode

To run the desktop app in development mode:

### Option 1: With Dev Server

```bash
# Terminal 1: Start admin panel dev server
cd ../admin-panel
npm run dev

# Terminal 2: Start Electron
cd ../desktop-app
npm run dev
```

The app will connect to the dev server at `localhost:5173`.

### Option 2: With Built Files

```bash
npm run build:web  # Build admin panel once
npm run dev        # Run Electron with built files
```

## Troubleshooting

### Build fails with "Cannot compute electron version"

**Solution**: Make sure all dependencies are installed:
```bash
npm install
```

### Build fails on non-Windows platform

**Solution**: Building Windows executables requires Windows. Options:
1. Use a Windows machine
2. Use WSL2 with Windows build tools
3. Use GitHub Actions or another CI/CD with Windows runners

### Icon not showing in the app

**Solution**: Generate icons first:
```bash
# From project root
npm run generate:icons
```

### App can't connect to backend

**Solution**: 
1. Ensure backend is running
2. Check `.env` or `config.json` has correct `API_BASE_URL`
3. Verify the API URL is accessible from the Windows machine

## Build Customization

Edit `package.json` in the desktop-app directory to customize:

- **appId**: Application identifier
- **productName**: Display name
- **icon**: Application icon (PNG or ICO)
- **nsis**: Installer options (one-click, installation directory, etc.)

See [electron-builder documentation](https://www.electron.build/) for more options.

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Build Desktop App

on:
  push:
    branches: [main]

jobs:
  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build:desktop
      - uses: actions/upload-artifact@v3
        with:
          name: windows-installer
          path: packages/desktop-app/dist/*.exe
```

## Distribution

After building, distribute the `.exe` file:

1. Upload to your static file server
2. Host on GitHub Releases
3. Distribute via your download page

Users can run the installer and install YektaYar Admin to their Windows machine.

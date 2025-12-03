# Dotfiles and Desktop.ini Guide

This document explains the configuration files added to the YektaYar repository for better cross-platform development and Windows folder customization.

## Files Added

### `.editorconfig`

EditorConfig helps maintain consistent coding styles across different editors and IDEs.

**Configuration highlights:**
- 2-space indentation for TypeScript, JavaScript, Vue, JSON, YAML, and Markdown
- UTF-8 character encoding
- LF (Unix-style) line endings for most files
- CRLF (Windows-style) line endings for batch files and PowerShell scripts
- Automatic trailing whitespace removal (except for Markdown)

**Supported file types:**
- TypeScript/JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`)
- Vue.js components (`.vue`)
- Configuration files (`.json`, `.yml`, `.yaml`)
- Shell scripts (`.sh`)
- Markdown (`.md`)

### `.gitattributes`

Git attributes file that ensures consistent file handling across platforms.

**Key configurations:**
- **Line endings**: Normalizes line endings to LF on check-in
- **Windows files**: CRLF line endings for `.bat`, `.cmd`, `.ps1`, and `Desktop.ini`
- **Binary files**: Proper handling for images, fonts, archives, and executables
- **Generated files**: Marks lockfiles as linguist-generated
- **Diff settings**: Custom diff drivers for TypeScript, JavaScript, Vue, JSON, and Markdown

### `Desktop.ini` Files

Windows folder customization files that provide custom icons and tooltips for directories.

**Locations:**
- `/` - Root directory (main project icon and description)
- `/assets` - Assets folder
- `/packages` - Packages monorepo folder
- `/packages/backend` - Backend API server
- `/packages/admin-panel` - Admin panel web UI
- `/packages/mobile-app` - Mobile application
- `/packages/shared` - Shared utilities
- `/scripts` - Automation scripts
- `/config` - Configuration files
- `/docs` - Documentation

**Features:**
- Custom folder icons using `assets/logo/icon.ico`
- Descriptive tooltips explaining each folder's purpose
- Relative paths for icon files (works in any location)

### Icon Files

Generated Windows-compatible icon files from the YektaYar logo:

**Location:** `/assets/logo/`

**Files:**
- `icon.ico` - Multi-size Windows icon (16x16, 32x32, 48x48, 256x256)
- `icon-16x16.png` - 16x16 PNG icon
- `icon-32x32.png` - 32x32 PNG icon
- `icon-48x48.png` - 48x48 PNG icon
- `icon-256x256.png` - 256x256 PNG icon

**Regenerating icons:**
```bash
npm run generate:desktop-icons
```

This command reads `assets/logo/icon.svg` and generates all the icon files.

## Usage

### EditorConfig

Most modern editors automatically recognize `.editorconfig` files:

- **VS Code**: Install the "EditorConfig for VS Code" extension
- **JetBrains IDEs** (WebStorm, IntelliJ): Built-in support
- **Sublime Text**: Install the "EditorConfig" package
- **Atom**: Install the "editorconfig" package

The configuration will be applied automatically when you open any file in the repository.

### Desktop.ini

To enable custom folder icons on Windows:

1. The `Desktop.ini` files are already in place
2. Open File Explorer and navigate to the repository folder
3. The custom icons and tooltips should appear automatically
4. If not, try refreshing the folder view (F5)

**Note:** Desktop.ini files require the folder to have the System attribute set on Windows. This is typically handled automatically by Windows Explorer when Desktop.ini is present.

### Git Attributes

The `.gitattributes` file works automatically with Git. No additional configuration is needed.

**Benefits:**
- Consistent line endings across platforms (Windows, Mac, Linux)
- Proper handling of binary files in diffs
- Better merge strategies for lockfiles
- Cleaner GitHub language statistics (generated files excluded)

## Maintenance

### Updating Icons

If the logo changes, regenerate the desktop icons:

```bash
# Update assets/logo/icon.svg with the new logo
# Then run:
npm run generate:desktop-icons
```

### Adding New Desktop.ini Files

When adding new major directories that warrant custom icons:

1. Create a `Desktop.ini` file in the directory
2. Use relative paths to `assets/logo/icon.ico`
3. Add a descriptive `InfoTip` explaining the folder's purpose
4. Ensure the file uses CRLF line endings (Git will handle this automatically)

Example template:
```ini
[.ShellClassInfo]
IconResource=path\to\assets\logo\icon.ico,0
IconFile=path\to\assets\logo\icon.ico
IconIndex=0
InfoTip=Your folder description here
```

## Troubleshooting

### EditorConfig not working

- Verify your editor has EditorConfig support or the appropriate extension installed
- Check that `.editorconfig` is in the repository root
- Restart your editor

### Desktop.ini icons not showing

- Ensure you're on Windows (Desktop.ini only works on Windows)
- Refresh the folder view (F5)
- Check that the icon file path is correct and the file exists
- Verify the folder has the System attribute (Windows Explorer handles this)

### Line ending issues

- Ensure `.gitattributes` is in the repository root
- Run `git add --renormalize .` to reapply line ending rules
- Check your Git configuration for `core.autocrlf` settings

## References

- [EditorConfig Documentation](https://editorconfig.org/)
- [Git Attributes Documentation](https://git-scm.com/docs/gitattributes)
- [Desktop.ini Microsoft Documentation](https://docs.microsoft.com/en-us/windows/win32/shell/how-to-customize-folders-with-desktop-ini)

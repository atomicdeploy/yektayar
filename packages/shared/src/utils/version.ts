/**
 * Version utility to retrieve package version from package.json
 * This provides a centralized way to access version information across all packages
 * 
 * Each package should read its own version from its package.json file.
 * This file provides helper utilities to make that consistent across the monorepo.
 */

/**
 * Helper type for package.json structure
 */
interface PackageJson {
  version: string;
  [key: string]: any;
}

/**
 * Get the package version by importing package.json
 * This works at build/compile time when package.json is accessible
 * 
 * Usage in each package:
 * ```typescript
 * import packageJson from '../package.json'
 * const version = getVersionFromPackageJson(packageJson)
 * ```
 * 
 * @param packageJson - The imported package.json object
 * @returns The package version string
 * @throws Error if version is not found in package.json
 */
export function getVersionFromPackageJson(
  packageJson: PackageJson | { version?: string }
): string {
  if (!packageJson?.version) {
    throw new Error('Version not found in package.json')
  }
  return packageJson.version
}

/**
 * Gets version from environment variables
 * The version should be injected at build time via bundler's define config
 * 
 * For Vite, add to vite.config.ts:
 * ```typescript
 * import packageJson from './package.json'
 * 
 * export default defineConfig({
 *   define: {
 *     'import.meta.env.APP_VERSION': JSON.stringify(packageJson.version)
 *   }
 * })
 * ```
 * 
 * @param fallback - Optional fallback version string if APP_VERSION is not set (default: 'dev')
 * @returns The package version string
 */
export function getPackageVersion(fallback: string = 'dev'): string {
  // Type guard for bundler environment
  const meta = import.meta as any
  if (typeof meta !== 'undefined' && 
      meta.env && 
      'APP_VERSION' in meta.env &&
      meta.env.APP_VERSION) {
    return meta.env.APP_VERSION as string
  }
  
  // In development mode, log a warning but don't throw
  if (typeof meta !== 'undefined' && meta.env && meta.env.DEV) {
    console.warn(
      '[Version] APP_VERSION not found in import.meta.env. Using fallback version.',
      '\nThis is normal in development mode if the dev server was just started.',
      '\nThe version is set via Vite config define: import.meta.env.APP_VERSION'
    )
  }
  
  return fallback
}


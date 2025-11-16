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
 * @param fallbackVersion - Fallback version if package.json doesn't have version
 * @returns The package version string
 */
export function getVersionFromPackageJson(
  packageJson: PackageJson | { version?: string },
  fallbackVersion: string = '0.1.0'
): string {
  return packageJson?.version || fallbackVersion
}

/**
 * Gets version for frontend apps from Vite environment variables
 * The version should be injected at build time via Vite's define config
 * 
 * Add to vite.config.ts:
 * ```typescript
 * import packageJson from './package.json'
 * 
 * export default defineConfig({
 *   define: {
 *     'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
 *   }
 * })
 * ```
 * 
 * @param fallbackVersion - Fallback version if env var is not set
 * @returns The package version string
 */
export function getVitePackageVersion(fallbackVersion: string = '0.1.0'): string {
  // Type guard for Vite environment
  const meta = import.meta as any
  if (typeof meta !== 'undefined' && 
      meta.env && 
      'VITE_APP_VERSION' in meta.env) {
    return meta.env.VITE_APP_VERSION as string
  }
  return fallbackVersion
}


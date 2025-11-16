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
 * @returns The package version string
 * @throws Error if VITE_APP_VERSION is not set in environment
 */
export function getVitePackageVersion(): string {
  // Type guard for Vite environment
  const meta = import.meta as any
  if (typeof meta !== 'undefined' && 
      meta.env && 
      'VITE_APP_VERSION' in meta.env) {
    return meta.env.VITE_APP_VERSION as string
  }
  throw new Error('VITE_APP_VERSION not found in import.meta.env. Ensure vite.config.ts defines it.')
}


#!/usr/bin/env node

/**
 * List all page URLs/routes for mobile-app or admin-panel
 * This script dynamically extracts routes from the router configuration files
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const APPS = {
  'mobile-app': 'packages/mobile-app/src/router/index.ts',
  'admin-panel': 'packages/admin-panel/src/router/index.ts'
};

/**
 * Parse route definitions from TypeScript router file
 * @param {string} content - The router file content
 * @returns {Array} Array of route objects
 */
function parseRoutes(content) {
  const routes = [];
  
  // Remove comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  content = content.replace(/\/\/.*/g, '');
  
  // Extract the routes array definition
  const routesMatch = content.match(/const\s+routes\s*:\s*(?:Array<RouteRecordRaw>|RouteRecordRaw\[\])\s*=\s*\[([\s\S]*?)\n\]/);
  
  if (!routesMatch) {
    return routes;
  }
  
  const routesArrayContent = routesMatch[1];
  
  // Parse route objects recursively
  function extractRouteObjects(text, parentPath = '') {
    const foundRoutes = [];
    let depth = 0;
    let currentRoute = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const prevChar = i > 0 ? text[i - 1] : '';
      
      // Handle strings
      if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
      }
      
      if (!inString) {
        if (char === '{') {
          if (depth === 0) {
            currentRoute = '{';
          } else {
            currentRoute += char;
          }
          depth++;
        } else if (char === '}') {
          depth--;
          currentRoute += char;
          
          if (depth === 0) {
            // Parse this route object
            const route = parseRouteObject(currentRoute, parentPath);
            if (route) {
              foundRoutes.push(route);
            }
            currentRoute = '';
          }
        } else if (depth > 0) {
          currentRoute += char;
        }
      } else {
        if (depth > 0) {
          currentRoute += char;
        }
      }
    }
    
    return foundRoutes;
  }
  
  function parseRouteObject(routeText, parentPath = '') {
    // Extract path
    const pathMatch = routeText.match(/path:\s*['"`]([^'"`]+)['"`]/);
    if (!pathMatch) return null;
    
    let path = pathMatch[1];
    
    // Build full path
    if (path === '') {
      // Empty path means use parent path
      path = parentPath || '/';
    } else if (path.startsWith('/')) {
      // Absolute path
      path = path;
    } else {
      // Relative path - append to parent
      if (parentPath === '/') {
        path = '/' + path;
      } else if (parentPath) {
        path = parentPath.endsWith('/') ? parentPath + path : parentPath + '/' + path;
      } else {
        path = '/' + path;
      }
    }
    
    // Extract properties from the route object, but not from children
    // First, remove the children block if present to avoid capturing child properties
    let routeTextWithoutChildren = routeText;
    const childrenMatch = routeText.match(/children:\s*\[([\s\S]*)\]/);
    if (childrenMatch) {
      routeTextWithoutChildren = routeText.replace(/children:\s*\[([\s\S]*)\]/, '');
    }
    
    // Extract name
    const nameMatch = routeTextWithoutChildren.match(/name:\s*['"`]([^'"`]+)['"`]/);
    const name = nameMatch ? nameMatch[1] : null;
    
    // Extract redirect
    const redirectMatch = routeTextWithoutChildren.match(/redirect:\s*['"`]([^'"`]+)['"`]/);
    const redirect = redirectMatch ? redirectMatch[1] : null;
    
    // Extract meta title
    const metaTitleMatch = routeTextWithoutChildren.match(/meta:\s*\{[^}]*title:\s*['"`]([^'"`]+)['"`]/);
    const metaTitle = metaTitleMatch ? metaTitleMatch[1] : null;
    
    const route = {
      path,
      name,
      redirect,
      metaTitle
    };
    
    // Check for children
    if (childrenMatch) {
      const childrenText = childrenMatch[1];
      // When passing parent path to children, pass the current path
      const children = extractRouteObjects(childrenText, path);
      route.children = children;
    }
    
    return route;
  }
  
  return extractRouteObjects(routesArrayContent);
}

/**
 * Flatten routes tree and collect all paths
 * @param {Array} routes - Array of route objects
 * @returns {Array} Flat array of route info
 */
function flattenRoutes(routes) {
  const flatRoutes = [];
  
  function flatten(routesList) {
    for (const route of routesList) {
      // Only include routes that have a name, redirect, or no children
      // This filters out layout-only routes
      const isLayoutOnly = route.children && route.children.length > 0 && !route.name && !route.redirect;
      
      if (!isLayoutOnly) {
        flatRoutes.push({
          path: route.path,
          name: route.name,
          redirect: route.redirect,
          metaTitle: route.metaTitle
        });
      }
      
      if (route.children && route.children.length > 0) {
        flatten(route.children);
      }
    }
  }
  
  flatten(routes);
  return flatRoutes;
}

/**
 * Display routes for an app
 * @param {string} appName - Name of the app (mobile-app or admin-panel)
 */
function displayRoutes(appName) {
  const routerPath = APPS[appName];
  if (!routerPath) {
    console.error(`❌ Unknown app: ${appName}`);
    console.error(`Available apps: ${Object.keys(APPS).join(', ')}`);
    process.exit(1);
  }
  
  const fullPath = resolve(__dirname, '..', routerPath);
  
  try {
    const content = readFileSync(fullPath, 'utf-8');
    const routes = parseRoutes(content);
    const flatRoutes = flattenRoutes(routes);
    
    console.log(`\n📱 Routes for ${appName}:\n`);
    console.log('=' .repeat(80));
    
    flatRoutes.forEach((route, index) => {
      console.log(`\n${index + 1}. ${route.path}`);
      
      if (route.name) {
        console.log(`   Name: ${route.name}`);
      }
      
      if (route.metaTitle) {
        console.log(`   Title: ${route.metaTitle}`);
      }
      
      if (route.redirect) {
        console.log(`   → Redirects to: ${route.redirect}`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Total routes: ${flatRoutes.length}\n`);
    
  } catch (error) {
    console.error(`❌ Error reading router file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📋 List Routes - Display all page URLs/routes for YektaYar applications

Usage:
  npm run list-routes [app]
  npm run list-routes -- [app]

Options:
  mobile-app     List routes for the mobile app
  admin-panel    List routes for the admin panel
  all            List routes for all apps (default)
  -h, --help     Show this help message

Examples:
  npm run list-routes
  npm run list-routes mobile-app
  npm run list-routes admin-panel
  npm run list-routes all
`);
    process.exit(0);
  }
  
  const app = args[0] || 'all';
  
  if (app === 'all') {
    Object.keys(APPS).forEach(appName => {
      displayRoutes(appName);
    });
  } else if (APPS[app]) {
    displayRoutes(app);
  } else {
    console.error(`❌ Unknown app: ${app}`);
    console.error(`Available apps: ${Object.keys(APPS).join(', ')}, all`);
    process.exit(1);
  }
}

main();

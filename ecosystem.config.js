/**
 * PM2 Ecosystem Configuration for YektaYar
 * 
 * This file provides advanced PM2 configuration for running YektaYar services.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js            # Start all services
 *   pm2 start ecosystem.config.js --only backend    # Start only backend
 *   pm2 start ecosystem.config.js --env production  # Start with production env
 * 
 * For more information: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    // Backend API Server
    {
      name: 'yektayar-backend',
      cwd: './packages/backend',
      script: 'bun',
      args: 'run --watch src/index.ts',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false, // Bun already has --watch
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    },
    
    // Admin Panel Dev Server
    {
      name: 'yektayar-admin',
      cwd: './packages/admin-panel',
      script: 'npm',
      args: 'run dev',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false, // Vite has its own hot reload
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        VITE_ADMIN_PORT: 5173
      },
      env_production: {
        NODE_ENV: 'production',
        VITE_ADMIN_PORT: 5173
      },
      error_file: './logs/admin-error.log',
      out_file: './logs/admin-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    },
    
    // Mobile App Dev Server
    {
      name: 'yektayar-mobile',
      cwd: './packages/mobile-app',
      script: 'npm',
      args: 'run dev',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false, // Vite has its own hot reload
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        VITE_MOBILE_PORT: 8100
      },
      env_production: {
        NODE_ENV: 'production',
        VITE_MOBILE_PORT: 8100
      },
      error_file: './logs/mobile-error.log',
      out_file: './logs/mobile-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000
    }
  ],

  deploy: {
    // Example deployment configuration for production
    production: {
      user: 'deploy',
      host: 'yektayar.ir',
      ref: 'origin/main',
      repo: 'git@github.com:atomicdeploy/yektayar.git',
      path: '/var/www/yektayar',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};

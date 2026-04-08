module.exports = {
  apps: [
    {
      name: 'inventrix-api',
      script: 'dist/index.js',
      cwd: '/var/www/inventrix/packages/api',
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '512M',
      error_file: '/var/log/inventrix/pm2-error.log',
      out_file: '/var/log/inventrix/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};

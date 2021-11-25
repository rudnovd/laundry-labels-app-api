module.exports = {
  apps: [
    {
      name: 'laundry-labels-app-server',
      script: 'index.js',
      cwd: 'dist',
      max_memory_restart: '256M',
      env: {
        NODE_ENV: 'production',
      },
      max_restarts: 5,
      restart_delay: 1000,
    },
  ],
}

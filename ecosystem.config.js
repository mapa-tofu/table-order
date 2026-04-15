module.exports = {
  apps: [
    {
      name: 'table-order-api',
      script: 'server/dist/index.js',
      instances: 1, // SSE 호환을 위해 단일 프로세스
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '500M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
    },
  ],
};

module.exports = {
  apps: [{
    name: 'dragon-raja-forum',
    script: 'api/server.ts',
    interpreter: 'node',
    interpreter_args: '--import tsx',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    // 自动重启配置
    max_memory_restart: '500M',
    max_restarts: 10,
    restart_delay: 5000,
    // 日志
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
    // 优雅退出
    kill_timeout: 5000,
    listen_timeout: 10000
  }]
};
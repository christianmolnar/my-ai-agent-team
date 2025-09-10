module.exports = {
  apps: [{
    name: 'ai-agent-team',
    script: 'npm',
    args: 'run dev',
    cwd: '/Users/christian/Repos/My-AI-Agent-Team',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 30000,
      FORCE_COLOR: 0
    },
    log_file: './logs/ai-agent-team.log',
    out_file: './logs/ai-agent-team-out.log',
    error_file: './logs/ai-agent-team-error.log',
    time: true,
    merge_logs: true
  }]
}

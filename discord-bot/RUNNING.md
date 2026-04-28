# Discord Bot - Persistent Operation Guide

## Quick Start

### Start the bot
```bash
./start-bot.sh
```

### Stop the bot
```bash
./stop-bot.sh
```

### View logs
```bash
tail -f bot.log
```

## Auto-Start on Mac Boot (Optional)

### Option 1: Create LaunchAgent (Recommended)

1. Create the plist file:
```bash
cat > ~/Library/LaunchAgents/com.christian.discordbot.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.christian.discordbot</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Library/Developer/CommandLineTools/Library/Frameworks/Python3.framework/Versions/3.9/Resources/Python.app/Contents/MacOS/Python</string>
        <string>/Users/christian/Repos/slow-hand-studio/discord-bot/bot.py</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/Users/christian/Repos/slow-hand-studio/discord-bot</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/christian/Repos/slow-hand-studio/discord-bot/bot.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/christian/Repos/slow-hand-studio/discord-bot/bot.log</string>
</dict>
</plist>
EOF
```

2. Load the LaunchAgent:
```bash
launchctl load ~/Library/LaunchAgents/com.christian.discordbot.plist
```

3. Control the service:
```bash
# Start
launchctl start com.christian.discordbot

# Stop
launchctl stop com.christian.discordbot

# Unload (disable auto-start)
launchctl unload ~/Library/LaunchAgents/com.christian.discordbot.plist
```

### Option 2: Use screen (Simple but manual)

```bash
# Start in screen session
screen -S discordbot -dm python3 /Users/christian/Repos/slow-hand-studio/discord-bot/bot.py

# Attach to view
screen -r discordbot

# Detach: Ctrl+A then D
```

## Current Status

Bot is running with:
- **Model**: claude-sonnet-4-6
- **Channel**: #token-macbook-air
- **Projects**: f.insight.AI, slow-hand-studio, Memorias.AI, My-AI-Agent-Team
- **CNS Context**: Loaded from ~/.personal-cns/cns

## Logs Location

- **Runtime logs**: `bot.log` (nohup output)
- **PID file**: `bot.pid` (process ID tracking)

## Troubleshooting

### Bot not responding?
1. Check if running: `ps aux | grep bot.py`
2. Check logs: `tail -50 bot.log`
3. Restart: `./stop-bot.sh && ./start-bot.sh`

### API errors?
- Verify API key in `.env`
- Check Anthropic account has credits
- Verify model name is current: `claude-sonnet-4-6`

### Discord connection issues?
- Bot token valid in `.env`
- MESSAGE CONTENT INTENT enabled in Discord Developer Portal
- Bot invited to server with correct permissions

# Windows PC Quick Start Guide

## TL;DR - Get Bot Running in 15 Minutes

### 1. Install Prerequisites (5 min)
```powershell
# Install Python 3.11+
winget install Python.Python.3.11

# Install Git
winget install Git.Git

# Install NSSM (service manager)
winget install NSSM.NSSM

# Verify
python --version
git --version
```

### 2. Clone Repos (3 min)
```powershell
mkdir C:\Projects
cd C:\Projects

git clone https://github.com/YOUR-USERNAME/My-AI-Agent-Team.git
git clone https://github.com/YOUR-USERNAME/f.insight.AI-Advanced.git
git clone https://github.com/YOUR-USERNAME/Memorias.AI.git
```

### 3. Setup Bot (5 min)
```powershell
cd C:\Projects\My-AI-Agent-Team\discord-bot

# Install dependencies
pip install -r requirements.txt

# Create .env file
notepad .env
```

**Paste into .env**:
```
DISCORD_BOT_TOKEN=your_discord_bot_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Get your tokens from**:
- Discord: https://discord.com/developers/applications
- Anthropic: https://console.anthropic.com/settings/keys

Save and close.

### 4. Update Bot Paths (2 min)

Edit `bot.py` line 26:
```python
# Change from:
CNS_DIR = Path("~/.personal-cns/cns").expanduser()

# To:
CNS_DIR = Path("C:/.personal-cns/cns")
```

Update system prompt (around line 93):
```python
You have access to these projects:
- My-AI-Agent-Team: C:/Projects/My-AI-Agent-Team
- f.insight.AI Advanced: C:/Projects/f.insight.AI-Advanced
- Memorias.AI: C:/Projects/Memorias.AI
```

### 5. Test Bot (1 min)
```powershell
python bot.py
```

Should see:
```
✅ Bot connected as Copilot Assistant#5791
```

Test in Discord → #token-macbook-air → type "hello"

Press Ctrl+C to stop.

### 6. Install as Service (2 min)
```powershell
nssm install DiscordBot "C:\Program Files\Python311\python.exe" "C:\Projects\My-AI-Agent-Team\discord-bot\bot.py"
nssm set DiscordBot AppDirectory "C:\Projects\My-AI-Agent-Team\discord-bot"
nssm set DiscordBot AppStdout "C:\Projects\My-AI-Agent-Team\discord-bot\bot.log"
nssm set DiscordBot AppStderr "C:\Projects\My-AI-Agent-Team\discord-bot\bot.log"
nssm start DiscordBot
```

### 7. Prevent Sleep (1 min)
```powershell
powercfg /change /standby-timeout-ac 0
powercfg /change /monitor-timeout-ac 0
```

## Done! 🎉

Bot is now running 24/7. Test from your phone by messaging in Discord.

## Daily Commands

```powershell
# View logs
Get-Content C:\Projects\My-AI-Agent-Team\discord-bot\bot.log -Wait -Tail 50

# Restart bot
nssm restart DiscordBot

# Check status
nssm status DiscordBot

# Update bot code
cd C:\Projects\My-AI-Agent-Team
git pull
nssm restart DiscordBot
```

## Troubleshooting

**Bot not responding?**
```powershell
# Check service
nssm status DiscordBot

# View last 50 log lines
Get-Content C:\Projects\My-AI-Agent-Team\discord-bot\bot.log -Tail 50

# Restart
nssm restart DiscordBot
```

**CNS files not found?**

You need to get your CNS from Mac to Windows. Quick option:

On Mac:
```bash
cd ~/.personal-cns
tar -czf cns-backup.tar.gz cns/
# Copy cns-backup.tar.gz to USB or upload to Google Drive
```

On Windows:
```powershell
# Extract to C:\.personal-cns\
mkdir C:\.personal-cns
# Copy files there
```

For full details, see WINDOWS-SETUP.md

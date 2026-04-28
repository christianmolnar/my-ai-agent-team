# Windows PC Setup Guide - Discord Development Bot

Complete setup instructions for running the Discord bot as a 24/7 server on your Windows PC.

## Prerequisites

- Windows 10/11 PC (always on)
- Administrator access
- Internet connection
- GitHub account access

## Part 1: Install Python

### Option A: Official Python Installer (Recommended)

1. Download Python 3.11+ from https://www.python.org/downloads/windows/
2. Run installer
3. ✅ **CRITICAL**: Check "Add Python to PATH"
4. Click "Install Now"
5. Verify installation:
```powershell
python --version
# Should show: Python 3.11.x or higher
```

### Option B: Winget (Windows Package Manager)

```powershell
winget install Python.Python.3.11
```

## Part 2: Install Git

### Download and Install

1. Download from https://git-scm.com/download/win
2. Run installer with default options
3. Choose "Git from the command line and also from 3rd-party software"
4. Verify:
```powershell
git --version
```

### Configure Git

```powershell
git config --global user.name "Christian"
git config --global user.email "your-email@example.com"

# Set up GitHub authentication (choose one):

# Option 1: GitHub CLI (recommended)
winget install GitHub.cli
gh auth login

# Option 2: SSH Key
ssh-keygen -t ed25519 -C "your-email@example.com"
# Add public key to GitHub: https://github.com/settings/keys
```

## Part 3: Clone Repositories

```powershell
# Create projects directory
mkdir C:\Projects
cd C:\Projects

# Clone repos
git clone https://github.com/YOUR-USERNAME/My-AI-Agent-Team.git
git clone https://github.com/YOUR-USERNAME/f.insight.AI-Advanced.git
git clone https://github.com/YOUR-USERNAME/Memorias.AI.git
git clone https://github.com/YOUR-USERNAME/get-good.ai.git

# Verify
dir
```

## Part 4: Clone CNS (Central Neural System)

Your bot needs access to your CNS knowledge base:

```powershell
cd C:\
git clone https://github.com/YOUR-USERNAME/personal-cns.git .personal-cns

# Or if CNS is in a separate repo:
# Copy CNS files from Mac to Windows PC
# Use OneDrive, GitHub, or USB drive
```

**Alternative**: If CNS is not in git, use OneDrive/Google Drive sync:
1. On Mac: Copy `~/.personal-cns/` to OneDrive
2. On Windows: `C:\Users\YourName\OneDrive\.personal-cns\`

## Part 5: Setup Discord Bot

```powershell
cd C:\Projects\My-AI-Agent-Team\discord-bot

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
notepad .env
```

**Add to .env**:
```bash
DISCORD_BOT_TOKEN=your_discord_bot_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**Get your tokens**:
- Discord Bot Token: https://discord.com/developers/applications (copy from Bot section)
- Anthropic API Key: https://console.anthropic.com/settings/keys

Save and close.

## Part 6: Update bot.py for Windows Paths

Edit `bot.py` to use Windows paths:

```python
# Change CNS_DIR line:
# From:
CNS_DIR = Path("~/.personal-cns/cns").expanduser()

# To (choose one):
# Option 1: If CNS in C:\
CNS_DIR = Path("C:/.personal-cns/cns")

# Option 2: If CNS in user OneDrive
CNS_DIR = Path.home() / "OneDrive/.personal-cns/cns"

# Option 3: If synced via OneDrive
CNS_DIR = Path("C:/Users/YourUsername/OneDrive/.personal-cns/cns")
```

Also update project paths in system prompt:

```python
system=f"""You are Christian's AI development assistant...

You have access to these projects:
- My-AI-Agent-Team: C:/Projects/My-AI-Agent-Team (TypeScript + Next.js)
- f.insight.AI Advanced: C:/Projects/f.insight.AI-Advanced (Next.js + FastAPI + PostgreSQL)
- Memorias.AI: C:/Projects/Memorias.AI (Next.js + TypeScript)
- get-good.ai: C:/Projects/get-good.ai (Next.js guitar learning)
```

## Part 7: Test Bot

```powershell
cd C:\Projects\My-AI-Agent-Team\discord-bot
python bot.py
```

You should see:
```
🚀 Starting Discord bot...
✅ Bot connected as Copilot Assistant#5791
📱 Responding in: #token-macbook-air, DMs
📁 Projects: My-AI-Agent-Team, f.insight.AI, Memorias.AI, get-good.ai
```

Test in Discord:
- Send "hello" in #token-macbook-air
- Bot should respond

Press `Ctrl+C` to stop (we'll make it run as a service next).

## Part 8: Run as Windows Service

### Option A: NSSM (Non-Sucking Service Manager) - Recommended

```powershell
# Download NSSM
winget install NSSM.NSSM

# Install bot as service
nssm install DiscordBot "C:\Program Files\Python311\python.exe" "C:\Projects\My-AI-Agent-Team\discord-bot\bot.py"

# Set working directory
nssm set DiscordBot AppDirectory "C:\Projects\My-AI-Agent-Team\discord-bot"

# Set output logging
nssm set DiscordBot AppStdout "C:\Projects\My-AI-Agent-Team\discord-bot\bot.log"
nssm set DiscordBot AppStderr "C:\Projects\My-AI-Agent-Team\discord-bot\bot.log"

# Start service
nssm start DiscordBot

# View status
nssm status DiscordBot

# Stop service
nssm stop DiscordBot

# Remove service (if needed)
nssm remove DiscordBot confirm
```

### Option B: PowerShell Startup Script

Create `start-bot.ps1`:
```powershell
# start-bot.ps1
$logFile = "C:\Projects\My-AI-Agent-Team\discord-bot\bot.log"
$botScript = "C:\Projects\My-AI-Agent-Team\discord-bot\bot.py"

Start-Process python -ArgumentList $botScript -WindowStyle Hidden -RedirectStandardOutput $logFile -RedirectStandardError $logFile
```

Add to Windows startup:
1. Press `Win+R`, type `shell:startup`, press Enter
2. Right-click → New → Shortcut
3. Target: `powershell.exe -ExecutionPolicy Bypass -File "C:\Projects\My-AI-Agent-Team\discord-bot\start-bot.ps1"`
4. Name: "Discord Bot"

### Option C: Task Scheduler

1. Open Task Scheduler (`taskschd.msc`)
2. Create Task → General tab:
   - Name: "Discord Bot"
   - ✅ Run whether user is logged on or not
   - ✅ Run with highest privileges
3. Triggers tab:
   - New → At startup
4. Actions tab:
   - New → Start a program
   - Program: `C:\Program Files\Python311\python.exe`
   - Arguments: `bot.py`
   - Start in: `C:\Projects\My-AI-Agent-Team\discord-bot`
5. Conditions tab:
   - ✅ Start only if the following network connection is available: Any connection
6. Settings tab:
   - ✅ Allow task to be run on demand
   - ✅ If the running task does not end when requested, force it to stop
7. OK → Enter admin password

## Part 9: Remote Monitoring

### View Logs from Mac

**Option 1: Simple Web Server**

On Windows, install and run:
```powershell
pip install flask

# Create simple log viewer
notepad log-server.py
```

```python
# log-server.py
from flask import Flask, send_file, Response
import os

app = Flask(__name__)

@app.route('/')
def logs():
    log_path = r'C:\Projects\My-AI-Agent-Team\discord-bot\bot.log'
    with open(log_path, 'r') as f:
        return Response(f.read(), mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
```

Start log server:
```powershell
python log-server.py
```

Access from Mac: `http://WINDOWS-PC-IP:8080/`

**Option 2: Remote Desktop**

Enable on Windows:
1. Settings → System → Remote Desktop → Enable
2. Note your PC name
3. From Mac: Use Microsoft Remote Desktop app

**Option 3: SSH (Advanced)**

Install OpenSSH Server on Windows:
```powershell
Add-WindowsCapability -Online -Name OpenSSH.Server
Start-Service sshd
Set-Service -Name sshd -StartupType 'Automatic'
```

From Mac:
```bash
ssh username@WINDOWS-PC-IP
cd C:/Projects/My-AI-Agent-Team/discord-bot
tail -f bot.log
```

## Part 10: Firewall & Security

### Allow Python through Windows Firewall

```powershell
# Run as Administrator
New-NetFirewallRule -DisplayName "Python Discord Bot" -Direction Inbound -Program "C:\Program Files\Python311\python.exe" -Action Allow
```

### Keep Windows PC Awake

```powershell
# Prevent sleep when plugged in
powercfg /change /standby-timeout-ac 0

# Prevent display sleep
powercfg /change /monitor-timeout-ac 0
```

## Part 11: Maintenance

### Update Bot Code

```powershell
cd C:\Projects\My-AI-Agent-Team
git pull

# Restart service
nssm restart DiscordBot

# Or if using Task Scheduler:
# Stop task → Start task
```

### View Real-Time Logs

```powershell
Get-Content C:\Projects\My-AI-Agent-Team\discord-bot\bot.log -Wait -Tail 50
```

### Check Bot Status

```powershell
# If using NSSM
nssm status DiscordBot

# Or check process
Get-Process -Name python | Where-Object {$_.Path -like "*discord-bot*"}
```

## Troubleshooting

### Bot not starting?

1. Check Python path:
```powershell
where python
python --version
```

2. Check dependencies:
```powershell
pip list | Select-String "discord|anthropic"
```

3. Check .env file:
```powershell
type .env
```

4. Test manually:
```powershell
cd C:\Projects\My-AI-Agent-Team\discord-bot
python bot.py
# Watch for errors
```

### CNS files not found?

Check CNS path exists:
```powershell
dir C:\.personal-cns\cns\brain\
dir C:\Users\YourName\OneDrive\.personal-cns\cns\brain\
```

Update `bot.py` CNS_DIR to match your path.

### Can't access from Mac?

1. Find Windows PC IP:
```powershell
ipconfig | Select-String "IPv4"
```

2. Test connectivity from Mac:
```bash
ping WINDOWS-PC-IP
```

3. Check Windows Firewall allows port 8080 (if using log server)

## Success Checklist

- [ ] Python 3.11+ installed
- [ ] Git installed and configured
- [ ] All repos cloned to C:\Projects\
- [ ] CNS files accessible (C:\.personal-cns\ or OneDrive)
- [ ] discord.py and anthropic packages installed
- [ ] .env file created with tokens
- [ ] bot.py updated for Windows paths
- [ ] Bot tested manually (responds in Discord)
- [ ] Bot running as Windows service (NSSM)
- [ ] Logs accessible (file or web server)
- [ ] Windows PC set to not sleep
- [ ] Firewall allows Python

## Next Steps

Once bot is running 24/7 on Windows PC:

1. **Test from phone**: Message bot in Discord while away from Mac
2. **Add file operations**: Implement Phase 2 capabilities (see ../docs/DISCORD-COPILOT-INTEGRATION-PLAN.md)
3. **Set up auto-updates**: Create scheduled task to git pull daily
4. **Monitor uptime**: Set up health check pings

Your bot is now a permanent member of your development team! 🎉

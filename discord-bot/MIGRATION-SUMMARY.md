# Discord Bot Windows PC Migration - Summary

## What We Just Did

### 1. ✅ Moved Discord Bot to Correct Repo

**From**: `/Users/christian/Repos/slow-hand-studio/discord-bot/`  
**To**: `/Users/christian/Repos/My-AI-Agent-Team/discord-bot/`

**Reason**: Discord bot is part of your AI agent ecosystem, not the slow-hand-studio local project.

### 2. ✅ Created Comprehensive Documentation

- **README.md** - Overview and quick reference
- **WINDOWS-SETUP.md** - Complete Windows PC setup guide (Python, Git, service installation)
- **COORDINATION.md** - How bot works with GitHub Copilot
- **RUNNING.md** - Mac persistence options
- **SETUP.md** - Discord Developer Portal setup

### 3. ✅ Ready to Commit

Files staged for commit:
```
discord-bot/.gitignore
discord-bot/COORDINATION.md
discord-bot/README.md
discord-bot/RUNNING.md
discord-bot/SETUP.md
discord-bot/WINDOWS-SETUP.md
discord-bot/bot-full-access.py
discord-bot/bot.py
discord-bot/requirements.txt
discord-bot/start-bot.sh
discord-bot/stop-bot.sh
```

## Next Steps for You

### Step 1: Commit to Git

```bash
cd /Users/christian/Repos/My-AI-Agent-Team

# Commit discord bot
git commit -m "feat: Add Discord development bot with Windows PC setup

- Move discord bot from slow-hand-studio to My-AI-Agent-Team
- Add comprehensive Windows PC setup guide
- Include Mac and Windows persistence scripts
- Document coordination with GitHub Copilot
- Prepare for 24/7 deployment on dedicated Windows PC"

# Push to GitHub
git push origin main
```

### Step 2: Clone to Windows PC

On your Windows PC:
```powershell
# Open PowerShell as Administrator
cd C:\
mkdir Projects
cd Projects

# Clone the repo
git clone https://github.com/YOUR-USERNAME/My-AI-Agent-Team.git

# Navigate to bot
cd My-AI-Agent-Team\discord-bot

# Follow WINDOWS-SETUP.md from here
```

### Step 3: Windows PC Setup (Follow WINDOWS-SETUP.md)

1. Install Python 3.11+
2. Install Git
3. Clone all repos:
   - My-AI-Agent-Team ✓ (already cloned)
   - f.insight.AI-Advanced
   - Memorias.AI
   - get-good.ai (optional)
4. Copy/sync CNS files to Windows
5. Install dependencies: `pip install -r requirements.txt`
6. Create `.env` file with your tokens
7. Update `bot.py` paths for Windows
8. Test: `python bot.py`
9. Install as Windows service (NSSM)
10. Set Windows PC to never sleep

### Step 4: Cleanup Mac (Optional)

Once bot is running on Windows PC:
```bash
# Stop Mac bot
cd /Users/christian/Repos/slow-hand-studio/discord-bot
./stop-bot.sh

# Remove from slow-hand-studio (since it's now in My-AI-Agent-Team)
cd /Users/christian/Repos/slow-hand-studio
rm -rf discord-bot/

# Or keep as backup
mv discord-bot/ discord-bot-OLD/
```

## Repos for Windows PC

These need to be cloned to `C:\Projects\`:

1. **My-AI-Agent-Team** (includes discord-bot)
   - https://github.com/YOUR-USERNAME/My-AI-Agent-Team.git

2. **f.insight.AI Advanced** (trading platform)
   - https://github.com/YOUR-USERNAME/f.insight.AI-Advanced.git

3. **Memorias.AI** (memory platform)
   - https://github.com/YOUR-USERNAME/Memorias.AI.git

4. **get-good.ai** (guitar learning - optional)
   - https://github.com/YOUR-USERNAME/get-good.ai.git

**NOT needed on Windows**: `slow-hand-studio` (Mac-only local project)

## CNS (Central Neural System) on Windows

You need your CNS files accessible on Windows. Options:

### Option A: Git Repo (Recommended)
If CNS is in a git repo:
```powershell
git clone https://github.com/YOUR-USERNAME/personal-cns.git C:\.personal-cns
```

### Option B: OneDrive Sync
On Mac:
```bash
cp -r ~/.personal-cns ~/Library/CloudStorage/OneDrive-Personal/.personal-cns
```

On Windows (auto-syncs):
```
C:\Users\YourName\OneDrive\.personal-cns\
```

Update bot.py:
```python
CNS_DIR = Path.home() / "OneDrive/.personal-cns/cns"
```

### Option C: Manual Copy
Use USB drive or network transfer:
```powershell
# On Windows, copy to:
C:\.personal-cns\
```

## Bot Configuration Updates for Windows

In `bot.py`, update these lines:

```python
# CNS path (choose based on your setup)
CNS_DIR = Path("C:/.personal-cns/cns")  # Option A
# OR
CNS_DIR = Path.home() / "OneDrive/.personal-cns/cns"  # Option B

# Project paths in system prompt
system=f"""...
You have access to these projects:
- My-AI-Agent-Team: C:/Projects/My-AI-Agent-Team
- f.insight.AI Advanced: C:/Projects/f.insight.AI-Advanced
- Memorias.AI: C:/Projects/Memorias.AI
- get-good.ai: C:/Projects/get-good.ai
..."""
```

## Benefits of Windows PC Deployment

✅ **24/7 Availability** - Bot always online, even when Mac sleeps  
✅ **Remote Development** - Code from phone, tablet, anywhere  
✅ **Resource Separation** - No impact on Mac performance  
✅ **Dedicated Server** - Bot has full PC resources  
✅ **Safe File Operations** - Isolated workspace for bot changes  
✅ **Git Workflow** - Bot commits to branches, you review PRs  

## Testing Checklist

Before considering Windows deployment complete:

- [ ] Bot connects to Discord
- [ ] Bot responds in #token-macbook-air channel
- [ ] CNS context loads (no file not found errors)
- [ ] Project paths accessible
- [ ] Logs visible (C:\Projects\My-AI-Agent-Team\discord-bot\bot.log)
- [ ] Service auto-starts on Windows boot
- [ ] Can access logs from Mac (optional: web server or Remote Desktop)
- [ ] Test from phone while away from home

## Future Enhancements (Phase 2)

Once bot is stable on Windows PC, implement:

1. **File Operations** - Read/write project files
2. **Git Integration** - Commit, push, create PRs
3. **Terminal Commands** - Run npm, python, git commands
4. **Agent Orchestration** - Dispatch specialized agents
5. **Deployment Triggers** - Auto-deploy to Vercel, Railway

See `../docs/DISCORD-COPILOT-INTEGRATION-PLAN.md` for full roadmap.

## Questions to Answer

Before starting Windows setup:

1. Do you have a GitHub username/repo URLs? (needed for clone commands)
2. Is your CNS in a git repo, or should we use OneDrive sync?
3. Does your Windows PC have a static IP on your network? (for remote access)
4. Do you want remote log viewing (web server) or just local logs?

## Ready to Deploy!

You now have everything needed to set up the Windows PC as your 24/7 Discord development bot server. Follow WINDOWS-SETUP.md step by step, and you'll have a permanent AI teammate working around the clock!

---

**Current Status**: Bot working on Mac, ready to migrate to Windows PC  
**Next Action**: Commit to git, push to GitHub, clone on Windows PC

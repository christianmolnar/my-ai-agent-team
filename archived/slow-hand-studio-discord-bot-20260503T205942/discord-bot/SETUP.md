# Discord Development Bot Setup

Full-featured development assistant like GitHub Copilot but via Discord.

## Prerequisites

1. **Python 3.9+** (already have)
2. **Discord bot token** (need to create)
3. **Anthropic API key** (need to get)

## Step 1: Create Discord Bot Application

1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name: **"Copilot Assistant"**
4. Go to **Bot** section
5. Click **"Add Bot"**
6. Under **"Privileged Gateway Intents"**, enable:
   - ✅ MESSAGE CONTENT INTENT (critical!)
7. Click **"Reset Token"** → Copy the token

## Step 2: Invite Bot to Server

1. Go to **OAuth2 → URL Generator**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select permissions:
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Use Slash Commands
   - ✅ Create Public Threads
4. Copy generated URL
5. Open URL in browser
6. Select your server: **"Slow Hand Studio"** (https://discord.gg/4f8H86PVw)
7. Click **"Authorize"**

## Step 3: Get Anthropic API Key

1. Go to https://console.anthropic.com/
2. Navigate to **API Keys**
3. Create new key → Copy it

## Step 4: Install Dependencies

```bash
cd /Users/christian/Repos/slow-hand-studio/discord-bot

# Install packages
python3 -m pip install discord.py anthropic python-dotenv
```

## Step 5: Configure Environment

Create `.env` file:

```bash
cd /Users/christian/Repos/slow-hand-studio/discord-bot

cat > .env << 'EOF'
DISCORD_BOT_TOKEN=your_discord_bot_token_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
EOF
```

Replace `your_discord_bot_token_here` and `your_anthropic_api_key_here` with actual tokens.

## Step 6: Create Channel for Bot

In your Discord server:

1. Create new text channel: **#dev-assistance**
2. Or use existing: **#copilot-chat** or **#development**
3. Bot only responds in these channels + DMs

## Step 7: Run the Bot

```bash
cd /Users/christian/Repos/slow-hand-studio/discord-bot

# Test run
python3 bot-full-access.py
```

You should see:
```
✅ Development Bot connected as Copilot Assistant#1234
📁 Available projects: finsight, slow-hand, memorias, agent-team
```

## Step 8: Test Bot Commands

In Discord **#dev-assistance** channel:

```
@Copilot Assistant What projects do you have access to?

@Copilot Assistant Show me the structure of f.insight.AI

@Copilot Assistant Read the README from slow-hand-studio

@Copilot Assistant What's the git status of memorias?
```

## Available Bot Capabilities

### File Operations
- **Read files**: "Show me app/layout.tsx from memorias"
- **Write files**: "Create a new component at components/Header.tsx"
- **List files**: "What files are in src/app?"

### Git Operations
- **Status**: "What's the git status of finsight?"
- **Diff**: "Show me what's changed in slow-hand"
- **Commit**: "Commit these changes with message 'feat: add header component'"
- **Push**: "Push commits to GitHub"

### Terminal Commands
- **Run commands**: "Run npm test in memorias"
- **Install packages**: "Install react-query in finsight"
- **Build**: "Build the finsight backend"

### Development Workflow
- **Code review**: "Review the changes in Header.tsx"
- **Debug**: "Why is the build failing?"
- **Refactor**: "Extract this logic into a separate function"

## Run Bot in Background (Production)

Once testing works, run in background:

```bash
# Create systemd service (macOS alternative: launchd)
nohup python3 bot-full-access.py > bot.log 2>&1 &

# Or use screen/tmux
screen -S discord-bot
python3 bot-full-access.py
# Press Ctrl+A then D to detach
```

## Security Notes

- ✅ `.env` file in `.gitignore` (never commit tokens!)
- ✅ Bot only responds in designated channels
- ✅ All git commits require explicit confirmation
- ✅ File operations limited to known project directories

## Troubleshooting

**"discord module not found"**
```bash
python3 -m pip install --upgrade discord.py
```

**"Privileged intent provided is not enabled"**
- Go back to Discord Developer Portal
- Enable MESSAGE CONTENT INTENT

**"Bot not responding"**
- Check bot is online in Discord server
- Verify channel name matches (dev-assistance, copilot-chat, or development)
- Check bot.log for errors

**"ANTHROPIC_API_KEY not set"**
```bash
echo $ANTHROPIC_API_KEY  # Should show key
source .env  # If empty
```

## Next Steps

After bot is working:

1. **Phase 2**: Add agent orchestration (Master Orchestrator + specialized agents)
2. **Phase 3**: Add deployment triggers (Vercel, Railway, GitHub Actions)
3. **Integration**: Connect with existing AI Agent Team agents

See: `docs/DISCORD-COPILOT-INTEGRATION-PLAN.md` for full roadmap.

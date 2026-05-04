# 🤖 Discord Bot Setup - Complete Guide

## 🚀 Quick Setup (15 Minutes)

### 1. Create Discord Bot (5 minutes)

**Step 1: Create Discord Application**
1. Go to https://discord.com/developers/applications
2. Click "New Application" 
3. Name it: "AI Development Assistant" (or whatever you prefer)
4. Click "Create"

**Step 2: Create Bot User**
1. Click "Bot" in left sidebar
2. Click "Add Bot" → "Yes, do it!"
3. Under "Token" section, click "Copy" to get your bot token
   - **⚠️ IMPORTANT**: Keep this token secret! Don't share it anywhere.
4. Save the token somewhere secure - you'll need it in step 3

**Step 3: Set Bot Permissions**
1. Still in "Bot" section, scroll down to "Privileged Gateway Intents"
2. Enable "Message Content Intent" (required to read messages)
3. Click "OAuth2" → "URL Generator" in left sidebar
4. Check "bot" under Scopes
5. Check these permissions under "Bot Permissions":
   - Send Messages
   - Read Message History  
   - Use Slash Commands
   - Embed Links
   - Attach Files
   - Read Messages/View Channels
6. Copy the Generated URL at bottom
7. Open URL in new tab and invite bot to your Discord server

### 2. Get Anthropic API Key (3 minutes)

1. Go to https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Name it: "Discord Bot"
4. Copy the key and save it securely

### 3. Run Windows Setup (5 minutes)

1. **Right-click** on [setup-windows.bat](./setup-windows.bat)
2. Select **"Run as administrator"** 
3. Follow the prompts
4. When .env.local file opens, replace the placeholder tokens:
   ```
   DISCORD_BOT_TOKEN=your_actual_discord_bot_token_from_step_1
   ANTHROPIC_API_KEY=your_actual_anthropic_key_from_step_2  
   ```
   
   **🔐 Security Note:** `.env.local` is used instead of `.env` for maximum security - it's never committed to git and keeps your tokens completely private.

5. Save and close the .env.local file
6. Press any key to continue setup

### 4. Test Your Bot (2 minutes)

1. Go to your Discord server
2. Find a channel named one of: `dev-assistance`, `copilot-chat`, `development`, `token-macbook-air`, or `bot-testing`
   - If none exist, create a channel called `bot-testing`
3. Send message: **"hello bot, show me my projects"**
4. Bot should respond with list of your repositories

**If bot doesn't respond:**
- Double-click `check-bot-status.bat` to see if service is running
- Check `bot.log` file for error messages
- Verify your tokens are correct in `.env.local` file

---

## 🎯 What Your Bot Can Do

### 🔧 Development Operations
- **Read any file**: "show me the README for slow-hand-studio"
- **Write/edit files**: "update the package.json to add a new script"
- **Git operations**: "commit these changes with message 'fix bug in API'"
- **Run commands**: "run npm install in the agent-team project"
- **List directories**: "what files are in the components folder?"

### 🧠 Smart Context Awareness
- **Project detection**: Mentions project names to get context
- **CNS integration**: Knows your personal preferences and patterns  
- **Git awareness**: Shows recent commits, current status
- **Multi-repo**: Works across all your repositories simultaneously

### 🔒 Security Features
- **Channel restrictions**: Only responds in designated channels
- **Command whitelist**: Only runs safe, approved commands
- **File backups**: Creates backups before modifying files
- **Confirmation prompts**: Asks before destructive operations

### 📁 Repository Access
Your bot automatically discovers and provides access to:
- ✅ **E:\Repos\my-ai-agent-team** (AI Agent Team)
- ✅ **C:\Repo\slow-hand-studio** (Slow Hand Studio)
- ✅ **C:\Repo\Audiophile_Playbook** (Audiophile Playbook) 
- ✅ **C:\Repo\MyPersonalAssistant** (Personal Assistant)
- ✅ **C:\Repo\atlassian-ai-assistant** (Atlassian Extension)
- ✅ **Auto-discovers** any other Git repositories

---

## 🛠️ Management Commands

After setup, you'll have these Windows batch files:

- **`check-bot-status.bat`** - Check if bot is running and view recent logs
- **`restart-bot.bat`** - Restart the bot service  
- **`stop-bot.bat`** - Stop the bot service
- **`start-bot.bat`** - Start the bot service

---

## 💡 Example Commands to Try

```
# Project Discovery
"discover my projects"
"show me the structure of slow-hand-studio" 

# File Operations  
"read the README file from agent-team"
"show me lines 1-50 of serve.py in slow-hand-studio"
"create a new file called test.md with hello world"

# Git Operations
"what's the git status of agent-team?"
"show me recent commits for slow-hand-studio"
"commit all changes in agent-team with message 'update bot setup'"

# Development Tasks
"run npm install in agent-team"
"list all Python files in slow-hand-studio"  
"check if there are any uncommitted changes across all projects"

# Complex Requests
"help me add a new route to the slow-hand-studio web app"
"create a deployment script for the agent-team project"
"analyze the project structure and suggest improvements"
```

---

## 🚨 Troubleshooting

### Bot Not Responding
1. Check bot is running: `check-bot-status.bat`
2. Verify tokens in `.env.local` file
3. Make sure you're in the right Discord channel
4. Check `bot.log` for errors

### Service Won't Start  
1. Run setup again as administrator
2. Check Python is in PATH: `python --version`
3. Manually test: `python bot-windows-full.py`
4. Check Windows Event Viewer for service errors

### Permission Errors
1. Ensure you ran setup as administrator  
2. Check Discord bot has proper permissions in your server
3. Verify file/folder permissions on repository directories

### API Errors
1. Verify Anthropic API key is valid and has credits
2. Test Discord bot token by checking bot status in Discord Developer Portal
3. Check network connectivity and firewall settings

---

## 📋 Next Steps

1. **Set up CNS integration** (optional but recommended)
   - The bot looks for your personal knowledge base at: `E:\Repos\my-ai-agent-team\.personal-cns\cns`
   - This includes your preferences, principles, and best practices
   - If not found, bot runs without personalization

2. **Customize project configurations** 
   - Edit `bot-windows-full.py` to add more projects or change paths
   - Update channel names in `allowed_channels` list

3. **Set up additional repositories**
   - Bot auto-discovers Git repos in `E:\Repos` and `C:\Repo`  
   - Clone more projects to these folders for automatic access

4. **Create dedicated Discord channels**
   - Recommended: `#dev-assistance` for development help
   - Optional: `#bot-testing` for experimenting safely

Your Discord bot is now a 24/7 AI development assistant with full access to your codebase! 🎉
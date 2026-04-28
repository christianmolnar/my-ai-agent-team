# Discord Development Bot

AI development assistant accessible via Discord, designed to run 24/7 on a dedicated Windows PC server.

## Overview

This bot provides remote development assistance through Discord, with access to your CNS (Central Neural System) knowledge base and full codebase access across all your projects.

## Architecture

```
You (anywhere - phone/computer)
  ↓
Discord (#token-macbook-air channel)
  ↓
Windows PC Bot (24/7 dedicated server)
  ↓
Claude API (claude-sonnet-4-6)
  ↓
GitHub (file operations via git)
  ↓
Your Mac (review changes)
```

## Current Capabilities (Phase 1)

- ✅ Chat-based development assistance
- ✅ CNS context awareness (Prime Principles, Best Practices, Workflows)
- ✅ Project-specific guidance
- ✅ 24/7 availability (when on Windows PC)

## Future Capabilities (Phase 2)

- 🔄 Read/write files in project repos
- 🔄 Execute terminal commands
- 🔄 Git operations (commit, push, PR creation)
- 🔄 Agent orchestration (dispatch specialized agents)
- 🔄 Deployment automation (Vercel, Railway)

## Setup

### Mac (Development/Testing)

See [SETUP.md](./SETUP.md) for full instructions.

Quick start:
```bash
cd /Users/christian/Repos/My-AI-Agent-Team/discord-bot
./start-bot.sh   # Start bot
tail -f bot.log  # View logs
./stop-bot.sh    # Stop bot
```

### Windows PC (Production 24/7 Server)

See [WINDOWS-SETUP.md](./WINDOWS-SETUP.md) for complete Windows PC setup instructions.

## Project Structure

```
discord-bot/
├── bot.py                 # Main bot implementation
├── bot-full-access.py     # Advanced bot with file operations (WIP)
├── .env                   # API keys (DO NOT COMMIT)
├── requirements.txt       # Python dependencies
├── start-bot.sh          # Mac startup script
├── stop-bot.sh           # Mac stop script
├── SETUP.md              # Discord Developer Portal setup
├── WINDOWS-SETUP.md      # Windows PC production setup
├── RUNNING.md            # Persistence options (LaunchAgent, etc)
└── COORDINATION.md       # How bot coordinates with GitHub Copilot
```

## Environment Variables

Required in `.env`:
```bash
DISCORD_BOT_TOKEN=your_discord_bot_token
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Repos Accessed

The bot has context for these projects:
- **My-AI-Agent-Team**: TypeScript agents + Discord bot (this repo)
- **f.insight.AI Advanced**: Next.js + FastAPI + PostgreSQL trading platform
- **Memorias.AI**: Next.js + TypeScript memory platform
- **get-good.ai**: Guitar learning platform (optional)

## Documentation

- [SETUP.md](./SETUP.md) - Discord bot creation and configuration
- [WINDOWS-SETUP.md](./WINDOWS-SETUP.md) - Windows PC production setup
- [RUNNING.md](./RUNNING.md) - Persistent operation options
- [COORDINATION.md](./COORDINATION.md) - How bot works with GitHub Copilot
- [../docs/DISCORD-COPILOT-INTEGRATION-PLAN.md](../docs/DISCORD-COPILOT-INTEGRATION-PLAN.md) - Full roadmap

## Security

- ✅ API keys stored in `.env` (gitignored)
- ✅ Bot only responds in specific channel (#token-macbook-air)
- ✅ All file operations (future) go through git review
- ✅ No secrets exposed in code or logs

## Current Status

- **Phase**: 1 (Chat-only assistance)
- **Model**: claude-sonnet-4-6
- **Platform**: Mac (moving to Windows PC)
- **Availability**: When bot script is running

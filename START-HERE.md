# 🚀 START HERE - AI Agent Team Repository

Welcome to the AI Agent Team ecosystem! This guide will help you get started quickly.

## 🎯 **What This Repository Provides**

- **Personal AI Assistant** with 20+ specialized agent coordination
- **GitHub Copilot CNS** for personalized development assistance  
- **Complete AI agent ecosystem** with TypeScript/Next.js foundation
- **Production-ready infrastructure** with Claude SDK integration

## ⚡ **Get Up and Running (10 Minutes)**

### **🎯 Prescriptive Setup Instructions**

**Option 1: Guided Setup (Recommended)**
```bash
# Run the master setup script - handles everything automatically  
./scripts/setup/master-setup.sh

# After setup, add scripts to PATH for easy CNS access:
echo 'export PATH="$PATH:$(pwd)/scripts/aliases"' >> ~/.bashrc
source ~/.bashrc
# Now you can use: cns "help" instead of ./scripts/cns "help"
```
*This script guides you through all setup steps with skip options and consequence explanations.*

**Option 2: Manual Step-by-Step**
```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys (see guide below)

# 3. Configure GitHub Copilot (optional but recommended)
./.github/setup/personalize.sh
./.github/setup/llm-selector.sh

# 4. Verify everything works
npm run build
npm test

# 5. Start development
npm run dev
```

### **🔑 Essential Configuration**

**Required for Personal Assistant**:
```bash
# Edit .env.local and add:
ANTHROPIC_API_KEY=your_claude_api_key_here
```

**Get Claude API Key**: https://console.anthropic.com/  
**Setup Guide**: [API Keys Setup](AI-Agent-Team-Document-Library/implementation-guides/api-keys-setup.md)

### **🚀 Quick Start Access Points**

After setup, you can immediately use:
- **Personal Assistant UI**: http://localhost:3000/personal-assistant
- **Main Application**: http://localhost:3000  
- **GitHub Copilot**: Will be personalized if you ran the setup
- **CNS Commands**: `./scripts/cns "help"` for AI learning system

### **🧠 Essential CNS Commands**
```bash
# Core CNS functionality (use after setup):
./scripts/cns "help"                    # Show all commands
./scripts/cns "verify your learnings"   # See what the system has learned
./scripts/cns "document my preference"  # Teach the system your preferences

# Quick access (if PATH is configured):
scripts/aliases/cns "help"             # Shorter command
scripts/aliases/cns-help               # Direct help
```

**Quick Setup for CNS**: `[CHEAT-SHEET.md](AI-Agent-Team-Document-Library/CHEAT-SHEET.md)` has complete command reference.

## ⚡ **Alternative Quick Starts**

### **1. Choose Your Experience**

**🤖 Want Personalized GitHub Copilot?**
👉 **[GitHub Copilot Setup Guide](.github/README.md)** - 5-minute personalization

**👨‍💻 Want to Develop/Contribute?** 
👉 **[Development Setup](#development-setup)** - Full development environment

**📚 Want to Understand the Architecture?**
👉 **[Architecture Overview](#architecture-overview)** - System design and documentation

### **2. GitHub Copilot Personalization (Recommended First Step)**

```bash
# Configure for your preferred AI model (Claude/GPT/Gemini/Default)
./.github/setup/llm-selector.sh

# Set up your personal profile (private, never committed)
./.github/setup/personalize.sh

# Edit your preferences
code .github/about-me/user-profile.md
```

**Result**: GitHub Copilot will adapt to your communication style, technical preferences, and current projects.

## 🛠️ **Development Setup**

### **Prerequisites**
- Node.js 18+ and npm
- VS Code (recommended) 
- Git

### **Installation**
```bash
# 1. Clone and install
git clone [repository-url]
cd My-AI-Agent-Team
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys (see SETUP-API-KEYS.md)

# 3. Start development server
npm run dev
```

### **Key Commands**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run test suite
npm run lint         # Code quality check
```

## 🏗️ **Architecture Overview**

### **Core Components**
```
/agents/             ← 20+ specialized AI agents (TypeScript)
/app/               ← Next.js web application
/.github/           ← GitHub Copilot CNS and setup automation
/data/              ← Agent states and learning data
/scripts/           ← Utilities and automation
/tests/             ← Comprehensive test suite
```

### **AI Agent System**
- **Personal Assistant** - Your main interface
- **Master Orchestrator** - Coordinates complex tasks
- **Specialized Agents** - Developers, researchers, analysts, etc.
- **CNS Architecture** - Central nervous system for agent coordination

### **GitHub Copilot Integration**
- **Brain** - Decision-making frameworks
- **Memory** - Learning from interactions
- **Reflexes** - Automatic quality and safety behaviors
- **Personal Profile** - Adapts to your preferences

## 📚 **Documentation Structure**

### **Quick References**
- **[Setup Guide](.github/SETUP-GUIDE.md)** - Complete GitHub Copilot setup
- **[API Keys](AI-Agent-Team-Document-Library/implementation-guides/api-keys-setup.md)** - Claude and other service configuration
- **[Architecture](AI-Agent-Team-Document-Library/system-architecture/OVERVIEW.md)** - System overview

### **Complete Documentation Library**
- **[AI-Agent-Team-Document-Library/](AI-Agent-Team-Document-Library/)** - Single source for all documentation
  - `system-architecture/` - Technical architecture and design decisions
  - `implementation-guides/` - Step-by-step setup and usage guides
  - `status-updates/` - Project status and completion reports
  - `Github-Copilot-Evolution-Strategy/` - CNS documentation and strategy
  - `standards/` - Coding and documentation standards

## 🎯 **Choose Your Path**

### **🚀 For Quick Personal Use**
1. Run GitHub Copilot setup (5 minutes)
2. Start using personalized AI assistance
3. Explore the Personal Assistant interface

### **👨‍💻 For Development**
1. Complete development setup
2. Review architecture documentation
3. Run tests and explore agent implementations
4. Start with Personal Assistant customization

### **🏢 For Team/Enterprise**
1. Review system architecture documentation
2. Plan API key distribution and configuration
3. Customize agent roles for your use case
4. Set up team-specific GitHub Copilot configurations

## 🔧 **Troubleshooting**

### **Setup Issues**
```bash
# Run the verification script
./.github/setup/verify-setup.sh

# Or run the master setup script again
./scripts/setup/master-setup.sh

# Common fixes
npm install                    # Reinstall dependencies
npm run build                 # Test build process
```

### **GitHub Copilot Issues**
- Ensure `.github/copilot-instructions.md` is present
- Check personal profile setup in `.github/about-me/`
- Verify LLM configuration with `llm-selector.sh`

### **Development Issues**
- Check API keys in `.env.local`
- Verify Node.js version (18+)
- Review build logs for specific errors

## 🎉 **What's Next**

After setup, you can:
- **Use the Personal Assistant** for complex tasks
- **Explore agent specializations** (developers, researchers, etc.)
- **Customize agent behaviors** for your specific needs
- **Contribute to the ecosystem** with new agents or features
- **Scale for team use** with shared configurations

## 📞 **Need Help?**

- **Documentation**: Check `AI-Agent-Team-Document-Library/` for comprehensive guides
- **Setup Issues**: Run `./scripts/setup/master-setup.sh` or verification scripts in `.github/setup/`
- **Development**: Review implementation docs in `AI-Agent-Team-Document-Library/implementation-guides/`
- **Architecture**: See system architecture documentation

---

**Welcome to your personalized AI agent team! 🤖✨**

*This repository provides both immediate personal productivity and a foundation for advanced AI agent development.*

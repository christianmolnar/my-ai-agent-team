# GitHub Copilot CNS - Personal AI Assistant Setup

This repository includes a sophisticated **GitHub Copilot Central Nervous System (CNS)** that provides personalized AI assistance while keeping your personal data completely private.

## 🚀 **Quick Setup (5 Minutes)**

### **New User? Start Here:**

1. **Choose your LLM**: `./setup/llm-selector.sh`
2. **Set up personal profile**: `./setup/personalize.sh` 
3. **Edit your preferences**: `code .github/about-me/user-profile.md`
4. **Start using enhanced Copilot** - it now knows your preferences!

### **📖 Complete Setup Guide**
👉 **[Full Setup Instructions](.github/SETUP-GUIDE.md)** - Detailed guide with examples

## 🔒 **Privacy First**
- **Your personal data stays local** - never committed to git
- **Safe repository sharing** - others get clean templates
- **Impossible to accidentally share** personal information

## 🧠 **What You Get**
- **Personalized responses** adapted to your communication style
- **Technical preferences** - suggests your preferred languages/frameworks  
- **Context awareness** - knows your current projects and goals
- **Learning memory** - remembers patterns from your interactions
- **Universal compatibility** - works in VS Code, GitHub.com, CLI

## 🎯 **How It Works**

```bash
# Your private configuration (git-ignored):
.github/about-me/user-profile.md          ← Your personal information
.github/copilot-cns/memory/               ← What Copilot learns about you

# Shared configuration (safe to commit):
.github/copilot-instructions.md           ← Core Copilot behavior
.github/llm-config/                       ← LLM optimizations
.github/setup/                            ← Setup scripts for new users
```

## 📋 **Repository Structure**

This is an **AI Agent Team ecosystem** with:
- Multiple specialized AI agents (`/agents/`)
- Central Nervous System architecture (`/data/agent-states/`)
- GitHub Copilot CNS integration (`/.github/`)
- Comprehensive documentation (`/AI-Agent-Team-Document-Library/`)

The GitHub Copilot CNS integrates seamlessly with the existing agent ecosystem while providing you with personalized assistance.

---

**➡️ Ready to start? Follow the [Complete Setup Guide](.github/SETUP-GUIDE.md)**

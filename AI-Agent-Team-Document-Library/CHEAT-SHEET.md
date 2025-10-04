# AI Agent Team - Quick Commands Cheat Sheet

## 🧠 CNS Learning Commands

### **Natural Language Commands:**
```bash
cns "help"                                 # Show all CNS commands
cns "test your functionality"              # Test CNS functionality
cns "do CNS learning session"              # Generate comprehensive learning report
cns "verify your learnings"                # Show recent learnings and updates
cns "document my preference"               # Auto-detect preference from conversation
cns "document my preference" "specific text"        # Document explicit preference
cns "document my pattern"                  # Auto-detect successful pattern from conversation
cns "document my pattern" "specific text"           # Document explicit pattern
cns "document my anti-pattern"             # Auto-detect anti-pattern from conversation
cns "document my anti-pattern" "specific text"      # Document explicit anti-pattern
cns "document my mannerism" "specific text"         # Document communication style/mannerism
```

**Note:** Commands work automatically - no setup required!

## 🚀 Project Setup & Management
```bash
# Master Setup (first time)
./scripts/setup/master-setup.sh           # Comprehensive guided setup

# Development
npm run dev                                # Start development server
npm run build                             # Build project
npm test                                  # Run tests

# Agent Management
./scripts/utilities/dev-manager.sh start  # Start development environment
./scripts/utilities/dev-manager.sh stop   # Stop development environment
```

## 📁 Key Directories
```bash
/scripts/                                  # All executable scripts
/AI-Agent-Team-Document-Library/          # Single source of truth for docs
/.github/copilot-cns/                     # GitHub Copilot learning system
/agents/                                  # TypeScript AI agents
/data/agent-states/                       # Agent state storage
```

## 🔍 Useful File Operations
```bash
# Verification (always use after file operations)
ls -la "path/to/file"                     # Verify file exists
cat "path/to/file"                        # Verify file content

# Search & Explore
find . -name "*.md" | head -10            # Find markdown files
grep -r "search term" ./                  # Search in files
```

## 📋 Documentation Locations
- **Command Reference**: `AI-Agent-Team-Document-Library/implementation-guides/cns-commands-reference.md`
- **System Architecture**: `AI-Agent-Team-Document-Library/system-architecture/`
- **Setup Guides**: `AI-Agent-Team-Document-Library/implementation-guides/`

---
*Keep this cheat sheet handy for quick reference to essential commands*

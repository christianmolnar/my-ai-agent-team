# PATH Setup for AI Agent Team Commands

This repository includes several methods to add the `scripts/` directory to your PATH, allowing you to use short commands like `cns "document my preference"` instead of `./scripts/cns "document my preference"`.

## Quick Start (Recommended)

**For immediate use:**
```bash
source ./activate
```

This adds scripts to your PATH for the current terminal session and provides helpful environment info.

## Available Methods

### 1. Session Activation (Best for testing)
```bash
source ./activate
# Now you can use: cns "help", cns "document my preference", etc.
# Use 'deactivate' to restore original PATH when done
```

### 2. Permanent PATH (Best for daily use)
```bash
# Automatically add to bashrc:
npm run path-setup

# Or manually add to ~/.bashrc or ~/.zshrc:
export PATH="$PATH:/path/to/My-AI-Agent-Team/scripts"
```

### 3. direnv (Automatic activation)
```bash
brew install direnv
eval "$(direnv hook bash)"   # Add to your shell config

# The .envrc file is already configured
# Scripts will be added to PATH automatically when you cd into the project
```

### 4. npm shortcuts
```bash
npm run activate      # Shows activation instructions
npm run path-setup    # Automatically adds to ~/.bashrc
```

## After Setup

Once any method is active, you can use:
- `cns "help"` - Show all available commands
- `cns "document my preference"` - Auto-detect preferences from conversation
- `cns "document my pattern"` - Auto-detect successful patterns  
- `cns "document my anti-pattern"` - Auto-detect problematic patterns
- `cns "verify your learnings"` - Show recent CNS learnings
- `cns "do CNS learning session"` - Generate comprehensive learning report

## Troubleshooting

**Commands not found after setup?**
- Restart your terminal
- Check: `echo $PATH | grep scripts`
- Verify: `which cns`

**For new contributors:**
The master setup script (`./scripts/setup/master-setup.sh`) automatically explains PATH setup options during project setup.

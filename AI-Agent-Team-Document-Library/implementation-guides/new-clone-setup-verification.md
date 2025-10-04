# Repository Setup Verification Guide

This guide verifies that all CNS learning scripts and PATH setup work correctly for new clones.

## New Clone Setup Instructions

### 1. Basic Repository Clone
```bash
git clone https://github.com/christianmolnar/my-ai-agent-team.git
cd my-ai-agent-team
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up PATH for CNS Commands (Choose One Method)

**Method A: Permanent PATH (Recommended)**
```bash
echo 'export PATH="'$(pwd)'/scripts:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Method B: Session-based PATH**
```bash
source ./activate
```

**Method C: direnv (Automatic)**
```bash
brew install direnv
eval "$(direnv hook bash)"  # Add to ~/.bashrc
# .envrc file will auto-activate when entering directory
```

### 4. Verify CNS Commands Work
```bash
cns "help"                           # Should show command list
cns "test your functionality"        # Should test CNS framework
cns "verify your learnings"          # Should show existing learnings
```

### 5. Test Learning Commands
```bash
cns "document my preference" "Test preference for new clone"
cns "document my pattern" "Test pattern documentation"
cns "document my anti-pattern" "Test anti-pattern capture"
cns "document my mannerism" "Test mannerism documentation"
```

### 6. Verify Duplicate Detection
```bash
# Try same commands again - should detect duplicates
cns "document my preference" "Test preference for new clone"
# Should output: "Already learned: Test preference for new clone"
```

### 7. Check CNS Memory Files
```bash
ls -la .github/copilot-cns/memory/
cat .github/copilot-cns/memory/user-interactions.md
cat .github/copilot-cns/memory/successful-patterns.md
cat .github/copilot-cns/memory/communication-patterns.md
```

## What Should Work Out of the Box

### ✅ CNS Learning System
- All memory files and framework structure
- Duplicate detection on all learning functions
- Auto-detection and manual input for preferences/patterns/anti-patterns
- Communication mannerism capture

### ✅ Command Interface
- Natural language commands: `cns "command"`
- All learning functions accessible
- Help system and verification tools

### ✅ PATH Setup Options
- Multiple setup methods for different user preferences
- Automatic detection of existing setup
- Clear documentation and troubleshooting

### ✅ GitHub Copilot Integration
- Enhanced instructions for better compliance
- CNS memory integration for personalized responses
- Learning triggers and verification protocols

## Troubleshooting

### Commands Not Found
```bash
# Check PATH
echo $PATH | grep scripts

# Verify scripts directory exists
ls -la scripts/cns

# Re-run PATH setup
source ~/.bashrc
```

### CNS Memory Issues
```bash
# Verify CNS directory structure
ls -la .github/copilot-cns/

# Check memory files exist
ls -la .github/copilot-cns/memory/

# Test CNS functionality
cns "test your functionality"
```

### Git Issues
```bash
# If you want to contribute back
git remote -v  # Should show origin
git branch     # Should show main
```

---
*This verification guide ensures the repository is fully functional for new users*

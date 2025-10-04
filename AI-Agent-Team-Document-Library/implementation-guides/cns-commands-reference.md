# CNS Natural Language Commands Documentation
*Quick reference for GitHub Copilot CNS learning commands*

## Available Commands

All commands use the single entry point: `./scripts/cns "command"`

### 🧠 **Learning & Analysis Commands**

#### `./scripts/cns "do CNS learning session"`
**Purpose**: Generate comprehensive session learning report  
**Usage**: `./scripts/cns "do CNS learning session"`  
**Output**: Full analysis of session work, memory updates, and next session improvements  
**When to use**: After completing substantial work, to capture learnings

#### `./scripts/cns "verify your learnings"`
**Purpose**: Show most recent learnings and verify CNS updates  
**Usage**: `./scripts/cns "verify your learnings"`  
**Output**: Recent preferences, patterns, and communication learnings from today  
**When to use**: To check what has been learned recently

### 📝 **Documentation Commands**

#### `./scripts/cns "document my preference" [text]`
**Purpose**: Capture user preference in CNS memory  
**Usage**: 
- `./scripts/cns "document my preference" "your preference description"`
- `./scripts/cns "document my preference"` (auto-detects from conversation)  
**Output**: Confirmation of preference capture  
**When to use**: When you want to explicitly record a preference

### 🔧 **System Commands**

#### `./scripts/cns "test your functionality"`
**Purpose**: Verify CNS framework functionality and health  
**Usage**: `./scripts/cns "test your functionality"`  
**Output**: Complete CNS health check with file verification  
**When to use**: To verify the CNS system is working correctly

## Quick Reference Card

```bash
# Session Management
./scripts/cns "do CNS learning session"    # Generate learning report
./scripts/cns "verify your learnings"      # Check recent learnings

# Document Preferences  
./scripts/cns "document my preference"     # Auto-detect from conversation
./scripts/cns "document my preference" "specific text"  # Explicit preference

# System Health
./scripts/cns "test your functionality"    # Verify CNS health
./scripts/cns "help"                       # Show command help
```

## Location
- **Script Location**: `/scripts/cns` (single entry point, not cluttering root)
- **CNS Memory Location**: `/.github/copilot-cns/memory/`
- **Documentation**: This file and `./scripts/cns help`

## Auto-Detection Features
- **Preference Detection**: `"document my preference"` without text automatically analyzes recent conversation for user preferences
- **Context Awareness**: Commands understand conversation context and can extract preferences automatically

---
*Clean, descriptive commands that respect directory organization preferences*

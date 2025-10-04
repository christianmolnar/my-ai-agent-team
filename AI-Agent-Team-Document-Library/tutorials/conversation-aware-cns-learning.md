# Conversation-Aware CNS Learning Tutorial

## Overview
The GitHub Copilot CNS (Central Nervous System) now includes intelligent conversation-aware auto-detection that can capture user preferences, successful patterns, and anti-patterns directly from the flow of our conversation.

## Auto-Detection Commands

### 1. Document My Preference
```bash
./scripts/cns "document my preference"
```
**What it does**: Analyzes recent conversation for user preference corrections and automatically captures them with proper context.

**Example Auto-Detection**: When user corrects file placement ("those don't belong in root"), it automatically documents:
- **Preference**: Root directory organization must remain clean with only essential files
- **Context**: User corrected file placement violation
- **Evidence**: Specific user correction captured

### 2. Document My Pattern
```bash
./scripts/cns "document my pattern"
```
**What it does**: Identifies successful approaches from recent interactions and captures them as reusable patterns.

**Example Auto-Detection**: When files are successfully moved from root to proper subdirectories, it captures:
- **Pattern**: Moving incorrectly placed files from root to proper subdirectories maintains clean organization
- **Context**: User correction of file placement
- **Application**: Always check file placement against documented preferences

### 3. Document My Anti-Pattern
```bash
./scripts/cns "document my anti-pattern"
```
**What it does**: Recognizes problematic approaches from user corrections and documents them to avoid repetition.

**Example Auto-Detection**: When user corrects root directory violations, it captures:
- **Anti-Pattern**: Placing convenience files in root directory despite documented preferences
- **Why Avoid**: Violates explicitly documented preference for clean root
- **Prevention Strategy**: Check user-interactions.md before file placement

## How Auto-Detection Works

1. **Context Analysis**: Commands analyze recent conversation flow for correction signals
2. **Pattern Recognition**: Identifies user satisfaction/frustration indicators 
3. **Automatic Capture**: Documents learnings with proper categorization and context
4. **Memory Integration**: Stores in appropriate CNS memory files for future reference

## Manual Override Available
All commands also accept explicit text:
```bash
./scripts/cns "document my preference" "I prefer detailed error messages"
./scripts/cns "document my pattern" "Using natural language commands improves clarity"
./scripts/cns "document my anti-pattern" "Cryptic command names cause confusion"
```

## Memory Storage Locations
- **Preferences**: `.github/copilot-cns/memory/user-interactions.md`
- **Patterns**: `.github/copilot-cns/memory/successful-patterns.md`  
- **Anti-Patterns**: `.github/copilot-cns/memory/communication-patterns.md`

## Verification
Always verify learnings captured correctly:
```bash
./scripts/cns "verify your learnings"
```

This ensures the CNS is learning and evolving based on real conversation patterns and user feedback.

# Phase 2 Bot Testing Guide

## What's New - Full Development Capabilities

The bot now has **complete file and git access**! It can:

✅ **Read files** from any project  
✅ **Write/edit files** (creates new files or updates existing)  
✅ **List directories** to explore project structure  
✅ **Run terminal commands** (npm install, python scripts, etc.)  
✅ **Git operations** (status, diff, create branches, commit, push)  
✅ **Safety checks** (dangerous commands blocked, always uses branches)  

## Test Commands

Try these in Discord (#token-macbook-air):

### Test 1: Read a File
```
Read the README.md file from My-AI-Agent-Team
```

Expected: Bot uses `read_file` tool and shows you the README content.

### Test 2: List Files
```
What files are in the discord-bot directory?
```

Expected: Bot uses `list_files` tool and shows directory contents.

### Test 3: Create a File
```
Create a test file at My-AI-Agent-Team/discord-bot/TEST.md with content "# Test File\n\nThis is a test created by the Discord bot."
```

Expected: Bot uses `write_file` tool, creates the file.

### Test 4: Git Status
```
What's the git status of My-AI-Agent-Team?
```

Expected: Bot uses `git_status` tool, shows current branch and uncommitted changes.

### Test 5: Full Workflow - Create Feature
```
Create a new feature in My-AI-Agent-Team:
1. Create a branch called "discord-bot/test-feature"
2. Create a file at test-features/hello.ts with a simple hello world function
3. Show me the git diff
4. Commit the change with message "feat: add hello world test function"
5. Tell me the branch name so I can review it
```

Expected: Bot executes all steps sequentially using tools.

### Test 6: Run Command
```
Run "npm --version" in the My-AI-Agent-Team project
```

Expected: Bot uses `run_command` tool, shows npm version.

## Safety Features

🛡️ **Branch Protection**: Bot always creates a feature branch before changes  
🛡️ **Command Blocking**: Dangerous commands (rm -rf, sudo, etc.) are blocked  
🛡️ **Timeout Protection**: Commands timeout after 30 seconds  
🛡️ **Git Workflow**: All changes go through git for review before merging  

## How It Works

1. **You send message** in Discord
2. **Bot receives message**, calls Claude API with tools
3. **Claude decides** which tools to use
4. **Bot executes tools** (read file, write file, git commands, etc.)
5. **Bot sends results** back to Claude
6. **Claude processes** and may call more tools
7. **Final response** sent to Discord (up to 10 tool iterations)

## Tool Reference

### Available Tools

1. **read_file(path)** - Read file contents
2. **write_file(path, content)** - Write/update files
3. **list_files(path)** - List directory contents
4. **run_command(command, cwd)** - Execute shell commands
5. **git_status(project)** - Get git status
6. **git_diff(project)** - See uncommitted changes
7. **create_branch(project, branch_name)** - Create feature branch
8. **git_commit(project, message)** - Commit changes
9. **git_push(project, branch)** - Push to GitHub

### Project Names

Use these exact names when asking bot to work on projects:
- `My-AI-Agent-Team`
- `f.insight.AI Advanced`
- `Memorias.AI`
- `get-good.ai`

## Example Conversations

### Create a React Component

**You**: "Create a new Button component in Memorias.AI at src/components/Button.tsx"

**Bot**:
1. Creates branch `discord-bot/add-button-component`
2. Writes Button.tsx with proper TypeScript React component
3. Shows git diff
4. Commits: "feat: add Button component"
5. Tells you: "Branch `discord-bot/add-button-component` ready for review"

**You**: Review PR on GitHub, merge when ready

### Fix a Bug

**You**: "The login form in Memorias.AI has a typo. Fix 'Pasword' to 'Password' in src/components/LoginForm.tsx"

**Bot**:
1. Reads LoginForm.tsx
2. Creates branch `discord-bot/fix-password-typo`
3. Updates file with fix
4. Commits: "fix: correct password field label typo"
5. Pushes and tells you branch name

### Add Tests

**You**: "Add tests for the Button component we just created"

**Bot**:
1. Reads Button.tsx to understand component
2. Creates Button.test.tsx with comprehensive tests
3. Runs `npm test` to verify they pass
4. Commits: "test: add Button component tests"

## Troubleshooting

### Bot not responding?
1. Check bot is running: `ps aux | grep bot-with-tools.py`
2. Check for errors: Look at terminal output where bot was started
3. Restart bot: Kill process and run `python3 bot-with-tools.py`

### Tool execution failed?
- Check file paths (use project-relative or absolute)
- Check permissions (bot runs as your user)
- Check git repo state (might need to stash uncommitted changes)

### Bot making wrong changes?
- Be specific in requests
- Ask bot to show you the plan first
- Review git diff before approving commits
- You can always abandon the branch if you don't like changes

## Current Status

🟢 **Bot Running**: bot-with-tools.py (PID: 90288)  
🟢 **Tools Enabled**: All 9 tools active  
🟢 **Projects**: 4 projects accessible  
🟢 **Safety**: Command filtering active  

## Next Steps

1. **Test basic operations** (read file, list files)
2. **Test git workflow** (create branch, commit, push)
3. **Try a real feature** (small component or function)
4. **Review on GitHub** (check the PR created by bot)
5. **Merge if good** (bot becomes official team member!)

Once tested and working, we'll commit this upgraded bot and deploy to Windows PC.

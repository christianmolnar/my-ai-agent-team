# Discord Bot + GitHub Copilot Coordination

## Architecture Overview

You now have **TWO AI assistants** working on your codebase:

### 1. GitHub Copilot (VS Code Extension)
- **Access**: Direct file system access via VS Code
- **Tools**: Can read/write files directly in your workspace
- **Context**: Full workspace awareness, git integration
- **Scope**: Works when you're at your Mac in VS Code

### 2. Discord Bot (Remote Claude Assistant)
- **Access**: Currently NO direct file access (chat only)
- **Tools**: Chat responses only (no file operations yet)
- **Context**: Loaded CNS context, project awareness
- **Scope**: Works from anywhere (phone, other computer)

## Current Limitation

**The Discord bot CANNOT edit files yet.** It only provides:
- Development advice
- Code suggestions (as text)
- Architecture guidance
- CNS-informed responses

## Coordination Strategy

### Phase 1: Chat-Only (CURRENT)
**Discord Bot**: Provides guidance, suggests changes
**You**: Relay instructions to GitHub Copilot in VS Code
**GitHub Copilot**: Executes file changes

Example workflow:
1. (On phone) Ask Discord bot: "How should I refactor the auth system?"
2. Discord bot replies with approach
3. (At Mac) Tell GitHub Copilot: "Implement the auth refactor from Discord"
4. GitHub Copilot makes the changes

### Phase 2: File Operations (NEXT UPGRADE)
Add to Discord bot:
- Read files from projects
- Write file changes
- Create git commits
- Push to GitHub

This requires:
```python
# In bot.py - add tool use capability
tools = [
    {
        "name": "read_file",
        "description": "Read a file from the project",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"}
            }
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string"},
                "content": {"type": "string"}
            }
        }
    }
]
```

### Phase 3: Full Coordination (FUTURE)
- Discord bot makes changes → auto-commits to feature branch
- GitHub Copilot sees changes via git
- You review PR from Discord bot's changes
- Merge when ready

## Avoiding Conflicts

### When Discord bot gets file operations:

1. **Git Branch Strategy**
   - Discord bot works on `discord-feature` branches
   - GitHub Copilot works on `copilot-feature` branches
   - You merge both when ready

2. **Locking Mechanism**
   - Add `.discord-lock` file when Discord bot is working
   - GitHub Copilot checks for lock before editing
   - Remove lock when Discord bot commits

3. **Change Notification**
   - Discord bot commits → sends message: "Committed changes to auth.py"
   - You pull changes in VS Code
   - GitHub Copilot sees updated files

4. **Conflict Resolution**
   - If both edited same file → git merge conflict
   - You review both changes
   - Choose best approach or combine

## Best Practice: Communication Protocol

### Current (Phase 1):
1. Use Discord bot for planning/architecture when remote
2. Use GitHub Copilot for implementation at Mac
3. Keep them in sync by sharing context

### Future (Phase 2+):
1. Discord bot: "I'm going to refactor auth.py - creating branch discord-auth-refactor"
2. Discord bot: Makes changes, commits, pushes
3. Discord bot: "Changes pushed. Review at [GitHub link]"
4. You: Pull branch in VS Code
5. GitHub Copilot: Can now see and build on Discord bot's changes

## Implementation Roadmap

To add file operations to Discord bot, see:
- `/Users/christian/Repos/slow-hand-studio/docs/DISCORD-COPILOT-INTEGRATION-PLAN.md`
- Phase 2: Agent Orchestration (includes file operations)

This will enable Discord bot to:
- Read project files
- Make code changes
- Create commits
- Coordinate with GitHub Copilot via git

## Key Insight

**Both assistants use git as the coordination layer:**
- Discord bot commits to feature branches
- GitHub Copilot sees changes via git pull
- You review and merge
- No direct communication needed between the two AIs

Think of them as two developers on your team - they coordinate through version control, not direct API calls.

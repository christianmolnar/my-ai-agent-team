#!/usr/bin/env python3
"""
Discord Development Bot with Full Codebase Access - Windows Version

Customized for your repository structure:
- Full project directory access across all E:\Repos
- File read/write operations
- Git operations (commit, push)
- Agent orchestration
- 24/7 Windows service support
"""
import os
import discord
import subprocess
import json
import asyncio
from anthropic import Anthropic
from pathlib import Path
from typing import Optional, Dict, List
from dotenv import load_dotenv

# Load environment variables
# Try .env.local first (preferred for security), fallback to .env
if Path(".env.local").exists():
    load_dotenv(".env.local")
else:
    load_dotenv(".env")

# Discord setup
intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

# Claude setup
anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Projects configuration - Updated for your Windows setup
PROJECTS = {
    "agent-team": {
        "name": "My AI Agent Team", 
        "path": Path(r"E:\Repos\my-ai-agent-team"),
        "type": "nextjs-agents",
        "stack": "Next.js + TypeScript + Claude",
        "deployment": "vercel"
    },
    "slow-hand": {
        "name": "Slow Hand Studio",
        "path": Path(r"C:\Repo\slow-hand-studio"),
        "type": "python-webapp", 
        "stack": "Python + Flask",
        "deployment": "local"
    },
    "audiophile": {
        "name": "Audiophile Playbook",
        "path": Path(r"C:\Repo\Audiophile_Playbook"),
        "type": "static-site",
        "stack": "HTML + CSS",
        "deployment": "local"
    },
    "personal-assistant": {
        "name": "MyPersonalAssistant",
        "path": Path(r"C:\Repo\MyPersonalAssistant"),
        "type": "ai-framework",
        "stack": "AI Agent Framework",
        "deployment": "kubernetes"
    },
    "atlassian": {
        "name": "Atlassian AI Assistant",
        "path": Path(r"C:\Repo\atlassian-ai-assistant"),
        "type": "vscode-extension",
        "stack": "TypeScript + VS Code API",
        "deployment": "marketplace"
    },
    # Auto-discover additional repos
    "auto-discover": True
}

# CNS context loading - Windows compatible
CNS_DIR = Path(r"E:\Repos\my-ai-agent-team\.personal-cns\cns")

def discover_repositories():
    """Auto-discover all Git repositories in the workspace folders."""
    discovered = {}
    search_paths = [
        Path(r"E:\Repos"),
        Path(r"C:\Repo")
    ]
    
    for search_path in search_paths:
        if not search_path.exists():
            continue
            
        for item in search_path.iterdir():
            if item.is_dir() and (item / ".git").exists():
                key = item.name.lower().replace("-", "").replace("_", "")
                if key not in PROJECTS:
                    discovered[key] = {
                        "name": item.name,
                        "path": item,
                        "type": "unknown",
                        "stack": "Auto-discovered",
                        "deployment": "unknown"
                    }
    
    return discovered

def load_cns_context() -> str:
    """Load CNS brain, memory, reflexes for Claude context."""
    context = []
    
    if not CNS_DIR.exists():
        return "CNS not found. Bot running without personalization context."
    
    # Load brain
    brain_files = [
        CNS_DIR / "brain/identity.md",
        CNS_DIR / "brain/prime-principles.md", 
        CNS_DIR / "brain/decision-framework.md"
    ]
    
    for file in brain_files:
        if file.exists():
            try:
                context.append(f"## {file.stem}\n{file.read_text(encoding='utf-8')}")
            except Exception as e:
                context.append(f"## {file.stem}\nError reading file: {e}")
    
    # Load memory
    memory_files = [
        CNS_DIR / "memory/semantic/best-practices.md",
        CNS_DIR / "memory/procedural/workflow-patterns.md"
    ]
    
    for file in memory_files:
        if file.exists():
            try:
                context.append(f"## {file.stem}\n{file.read_text(encoding='utf-8')}")
            except Exception as e:
                context.append(f"## {file.stem}\nError reading file: {e}")
    
    return "\n\n---\n\n".join(context)

def load_project_context(project_key: str) -> str:
    """Load project-specific context (README, recent changes, structure)."""
    all_projects = {**PROJECTS, **discover_repositories()}
    project = all_projects.get(project_key)
    
    if not project or not project["path"].exists():
        return f"Project '{project_key}' not found or path doesn't exist."
    
    context = []
    project_path = project["path"]
    
    # Load README
    readme_files = ["README.md", "README.txt", "readme.md"]
    for readme_name in readme_files:
        readme = project_path / readme_name
        if readme.exists():
            try:
                content = readme.read_text(encoding='utf-8')[:2000]
                context.append(f"## {project['name']} README\n{content}")
                break
            except Exception as e:
                context.append(f"## README Error\n{e}")
    
    # Get recent git commits
    try:
        result = subprocess.run(
            ["git", "log", "-10", "--oneline", "--no-merges"],
            cwd=project_path,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        if result.returncode == 0:
            context.append(f"## Recent Commits\n{result.stdout}")
    except Exception as e:
        context.append(f"## Git Log Error\n{e}")
    
    # Get git status
    try:
        result = subprocess.run(
            ["git", "status", "--short"],
            cwd=project_path,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        if result.returncode == 0 and result.stdout.strip():
            context.append(f"## Git Status\n{result.stdout}")
    except Exception as e:
        pass
    
    # Project structure (top-level dirs and important files)
    try:
        items = []
        for item in project_path.iterdir():
            if item.name.startswith('.'):
                continue
            if item.is_dir():
                items.append(f"📁 {item.name}/")
            else:
                items.append(f"📄 {item.name}")
        
        context.append(f"## Project Structure\n" + "\n".join(sorted(items)[:20]))
    except Exception as e:
        context.append(f"## Structure Error\n{e}")
    
    return "\n\n".join(context)

def execute_tool(tool_name: str, tool_input: Dict) -> str:
    """Execute development tools with enhanced Windows support."""
    
    if tool_name == "read_file":
        try:
            file_path = Path(tool_input["path"])
            if not file_path.exists():
                return f"❌ File not found: {file_path}"
            
            # Handle large files
            size = file_path.stat().st_size
            if size > 100000:  # 100KB limit
                return f"❌ File too large ({size} bytes). Use read_file_partial instead."
            
            content = file_path.read_text(encoding='utf-8')
            return f"📄 **{file_path.name}**\n```\n{content}\n```"
        except Exception as e:
            return f"❌ Error reading file: {e}"
    
    elif tool_name == "read_file_partial":
        try:
            file_path = Path(tool_input["path"])
            start_line = tool_input.get("start_line", 1)
            end_line = tool_input.get("end_line", 50)
            
            if not file_path.exists():
                return f"❌ File not found: {file_path}"
            
            lines = file_path.read_text(encoding='utf-8').splitlines()
            selected_lines = lines[start_line-1:end_line]
            content = "\n".join(selected_lines)
            
            return f"📄 **{file_path.name}** (lines {start_line}-{end_line})\n```\n{content}\n```"
        except Exception as e:
            return f"❌ Error reading file: {e}"
    
    elif tool_name == "write_file":
        try:
            file_path = Path(tool_input["path"])
            content = tool_input["content"]
            
            # Create directories if needed
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Backup existing file
            if file_path.exists():
                backup_path = file_path.with_suffix(f"{file_path.suffix}.backup")
                file_path.rename(backup_path)
                
            file_path.write_text(content, encoding='utf-8')
            return f"✅ File written: {file_path}"
        except Exception as e:
            return f"❌ Error writing file: {e}"
    
    elif tool_name == "run_command":
        try:
            command = tool_input["command"]
            cwd = tool_input.get("cwd", ".")
            timeout = tool_input.get("timeout", 30)
            
            # Security: Only allow specific safe commands
            safe_commands = [
                "git", "npm", "node", "python", "pip", "dir", "ls", "cd", 
                "mkdir", "rmdir", "copy", "move", "type", "cat", "head", "tail"
            ]
            
            cmd_parts = command.split()
            if cmd_parts and cmd_parts[0] not in safe_commands:
                return f"❌ Command not allowed for security: {cmd_parts[0]}"
            
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=timeout,
                encoding='utf-8'
            )
            
            output = f"**Command:** `{command}`\n"
            output += f"**Exit Code:** {result.returncode}\n\n"
            
            if result.stdout:
                output += f"**Output:**\n```\n{result.stdout[:2000]}\n```\n"
            if result.stderr:
                output += f"**Errors:**\n```\n{result.stderr[:1000]}\n```"
                
            return output
        except subprocess.TimeoutExpired:
            return f"❌ Command timed out after {timeout}s"
        except Exception as e:
            return f"❌ Error running command: {e}"
    
    elif tool_name == "git_status":
        project_path = Path(tool_input["project_path"])
        return execute_tool("run_command", {"command": "git status", "cwd": str(project_path)})
    
    elif tool_name == "git_diff":
        project_path = Path(tool_input["project_path"])
        return execute_tool("run_command", {"command": "git diff", "cwd": str(project_path)})
    
    elif tool_name == "git_commit":
        try:
            project_path = Path(tool_input["project_path"])
            message = tool_input["message"]
            
            # Stage all changes
            stage_result = subprocess.run(
                ["git", "add", "."],
                cwd=project_path,
                capture_output=True,
                text=True
            )
            
            # Commit
            commit_result = subprocess.run(
                ["git", "commit", "-m", message],
                cwd=project_path,
                capture_output=True,
                text=True
            )
            
            return f"**Git Commit Result:**\n```\n{commit_result.stdout}\n{commit_result.stderr}\n```"
        except Exception as e:
            return f"❌ Git commit error: {e}"
    
    elif tool_name == "git_push":
        project_path = Path(tool_input["project_path"])
        return execute_tool("run_command", {"command": "git push", "cwd": str(project_path)})
    
    elif tool_name == "list_files":
        try:
            dir_path = Path(tool_input["path"])
            if not dir_path.exists():
                return f"❌ Directory not found: {dir_path}"
            
            files = []
            dirs = []
            
            for item in dir_path.iterdir():
                if item.name.startswith('.'):
                    continue
                if item.is_dir():
                    dirs.append(f"📁 {item.name}/")
                else:
                    size = item.stat().st_size
                    files.append(f"📄 {item.name} ({size} bytes)")
            
            result = "**Directories:**\n" + "\n".join(sorted(dirs)[:20])
            result += "\n\n**Files:**\n" + "\n".join(sorted(files)[:20])
            
            return result
        except Exception as e:
            return f"❌ Error listing files: {e}"
    
    elif tool_name == "discover_projects":
        discovered = discover_repositories()
        all_projects = {**PROJECTS, **discovered}
        
        result = "**Available Projects:**\n\n"
        for key, project in all_projects.items():
            if key == "auto-discover":
                continue
            status = "✅" if project["path"].exists() else "❌"
            result += f"{status} **{key}**: {project['name']} ({project['stack']})\n"
            result += f"   📁 {project['path']}\n\n"
        
        return result
    
    return f"❌ Unknown tool: {tool_name}"

# Tool definitions for Claude
TOOLS = [
    {
        "name": "read_file",
        "description": "Read complete contents of a file (max 100KB)",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path (absolute or relative)"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "read_file_partial", 
        "description": "Read specific lines from a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"},
                "start_line": {"type": "integer", "description": "Starting line number (1-based)"},
                "end_line": {"type": "integer", "description": "Ending line number (1-based)"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file (creates backup of existing file)",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"},
                "content": {"type": "string", "description": "File content"}
            },
            "required": ["path", "content"]
        }
    },
    {
        "name": "run_command",
        "description": "Execute a safe terminal command",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "Command to run"},
                "cwd": {"type": "string", "description": "Working directory"},
                "timeout": {"type": "integer", "description": "Timeout in seconds (default 30)"}
            },
            "required": ["command"]
        }
    },
    {
        "name": "git_status",
        "description": "Get git status for a project",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_path": {"type": "string", "description": "Project directory"}
            },
            "required": ["project_path"]
        }
    },
    {
        "name": "git_diff", 
        "description": "Get git diff for a project",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_path": {"type": "string", "description": "Project directory"}
            },
            "required": ["project_path"]
        }
    },
    {
        "name": "git_commit",
        "description": "Commit all staged changes with a message",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_path": {"type": "string", "description": "Project directory"}, 
                "message": {"type": "string", "description": "Commit message"}
            },
            "required": ["project_path", "message"]
        }
    },
    {
        "name": "git_push",
        "description": "Push commits to remote repository",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_path": {"type": "string", "description": "Project directory"}
            },
            "required": ["project_path"]
        }
    },
    {
        "name": "list_files",
        "description": "List files and directories in a path",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Directory path"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "discover_projects",
        "description": "Show all available Git repositories in the workspace",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": []
        }
    }
]

# Load CNS context once at startup
CNS_CONTEXT = load_cns_context()

@client.event
async def on_ready():
    print(f'🤖 Discord Development Bot connected as {client.user}')
    print(f'📁 Watching repositories in: E:\\Repos & C:\\Repo')
    
    # Discover and show available projects
    all_projects = {**PROJECTS, **discover_repositories()}
    available_projects = [key for key, project in all_projects.items() 
                         if key != "auto-discover" and project["path"].exists()]
    print(f'🚀 Available projects: {", ".join(available_projects)}')

@client.event
async def on_message(message):
    # Ignore own messages
    if message.author == client.user:
        return
    
    # Only respond in designated channels or DMs
    allowed_channels = ['dev-assistance', 'copilot-chat', 'development', 'token-macbook-air', 'bot-testing']
    if (hasattr(message.channel, 'name') and message.channel.name not in allowed_channels 
        and not isinstance(message.channel, discord.DMChannel)):
        return
    
    try:
        # Show typing indicator
        async with message.channel.typing():
            # Detect project context from message
            current_project = None
            all_projects = {**PROJECTS, **discover_repositories()}
            
            for project_key in all_projects.keys():
                if project_key != "auto-discover" and project_key in message.content.lower():
                    current_project = project_key
                    break
            
            # Build context for Claude
            system_context = f"""You are a Discord development bot with full access to the user's codebase.

**Your Capabilities:**
- Read/write files across all repositories
- Execute git operations (status, diff, commit, push)
- Run safe terminal commands
- Access user's CNS (Central Neural System) knowledge base

**Available Projects:**
{chr(10).join([f"- **{key}**: {project['name']} at {project['path']}" 
               for key, project in all_projects.items() 
               if key != "auto-discover" and project['path'].exists()])}

**CNS Context (User's Personal Knowledge Base):**
{CNS_CONTEXT}

**Current Project Context:**
{load_project_context(current_project) if current_project else "No specific project detected. Use discover_projects tool to see all available projects."}

**Guidelines:**
1. Always confirm destructive operations (delete, overwrite) before executing
2. Use tools to gather information before making changes
3. Provide clear explanations of what you're doing
4. Create backups when modifying files
5. Follow the user's CNS principles and preferences
6. Be proactive - if you see issues, suggest improvements

Respond naturally and helpfully. The user expects you to take action, not just provide instructions."""

            # Call Claude API
            response = anthropic.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4000,
                system=system_context,
                messages=[{"role": "user", "content": message.content}],
                tools=TOOLS
            )
            
            # Process response and tool calls
            response_text = ""
            
            for content_block in response.content:
                if content_block.type == "text":
                    response_text += content_block.text
                elif content_block.type == "tool_use":
                    tool_name = content_block.name
                    tool_input = content_block.input
                    
                    # Execute tool
                    tool_result = execute_tool(tool_name, tool_input)
                    
                    # Add tool result to response
                    response_text += f"\n\n🔧 **Tool Used: {tool_name}**\n{tool_result}"
                    
                    # If this was a tool call, get Claude's interpretation
                    if tool_result and not tool_result.startswith("❌"):
                        follow_up = anthropic.messages.create(
                            model="claude-sonnet-4-6",
                            max_tokens=1000,
                            system="Interpret this tool result and provide a helpful summary or next steps.",
                            messages=[
                                {"role": "user", "content": f"Tool '{tool_name}' returned: {tool_result}"}
                            ]
                        )
                        if follow_up.content:
                            response_text += f"\n\n💡 **Analysis:** {follow_up.content[0].text}"
            
            # Split long messages
            if len(response_text) > 2000:
                chunks = [response_text[i:i+2000] for i in range(0, len(response_text), 2000)]
                for i, chunk in enumerate(chunks):
                    if i == 0:
                        await message.reply(chunk)
                    else:
                        await message.channel.send(chunk)
            else:
                await message.reply(response_text)
            
    except Exception as e:
        error_msg = f"❌ **Bot Error:** {str(e)}"
        print(f"Error processing message: {e}")
        await message.reply(error_msg)

if __name__ == "__main__":
    # Check for required environment variables
    if not os.getenv("DISCORD_BOT_TOKEN"):
        print("❌ DISCORD_BOT_TOKEN not found in environment variables")
        print("Please set up your .env file with:")
        print("DISCORD_BOT_TOKEN=your_token_here")
        print("ANTHROPIC_API_KEY=your_key_here")
        exit(1)
    
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("❌ ANTHROPIC_API_KEY not found in environment variables")
        print("Please set up your .env file with:")
        print("DISCORD_BOT_TOKEN=your_token_here")
        print("ANTHROPIC_API_KEY=your_key_here")
        exit(1)
    
    print("🚀 Starting Discord Development Bot...")
    print("📍 Configured for Windows environment")
    print("📁 Repository paths: E:\\Repos\\* and C:\\Repo\\*")
    print("⚡ Full codebase access enabled")
    print("🔧 Git operations enabled")
    print("🧠 CNS integration enabled")
    print("\nPress Ctrl+C to stop the bot.\n")
    
    try:
        client.run(os.getenv("DISCORD_BOT_TOKEN"))
    except KeyboardInterrupt:
        print("\n👋 Bot stopped by user")
    except Exception as e:
        print(f"❌ Bot crashed: {e}")
#!/usr/bin/env python3
"""
Discord Development Bot - Full Access Version

Provides file operations, git integration, and terminal execution.
Bot can read/write files, commit changes, and execute commands.
"""
import os
import discord
import subprocess
from anthropic import Anthropic
from pathlib import Path
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Discord setup
intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

# Claude setup
anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Project paths
PROJECTS = {
    "My-AI-Agent-Team": "/Users/christian/Repos/My-AI-Agent-Team",
    "f.insight.AI Advanced": "/Users/christian/Repos/f.insight.AI Advanced",
    "Memorias.AI": "/Users/christian/Repos/Memorias.AI",
    "get-good.ai": "/Users/christian/Repos/get-good.ai"
}

# Load CNS context
CNS_DIR = Path("~/.personal-cns/cns").expanduser()

def load_cns_context():
    """Load CNS brain, memory, reflexes for Claude context."""
    context = []
    
    brain_files = [
        CNS_DIR / "brain/identity.md",
        CNS_DIR / "brain/prime-principles.md",
        CNS_DIR / "brain/decision-framework.md"
    ]
    
    for file in brain_files:
        if file.exists():
            context.append(f"## {file.stem}\n{file.read_text()}")
    
    memory_files = [
        CNS_DIR / "memory/semantic/best-practices.md",
        CNS_DIR / "memory/procedural/workflow-patterns.md"
    ]
    
    for file in memory_files:
        if file.exists():
            context.append(f"## {file.stem}\n{file.read_text()}")
    
    return "\n\n---\n\n".join(context)

CNS_CONTEXT = load_cns_context()

# Tool implementations
def read_file(path: str) -> str:
    """Read a file from the project."""
    try:
        # Resolve project-relative paths
        if not path.startswith('/'):
            for project_name, project_path in PROJECTS.items():
                full_path = Path(project_path) / path
                if full_path.exists():
                    path = str(full_path)
                    break
        
        file_path = Path(path)
        if not file_path.exists():
            return f"❌ File not found: {path}"
        
        content = file_path.read_text()
        return f"✅ Read {path} ({len(content)} chars)\n\n{content}"
    except Exception as e:
        return f"❌ Error reading {path}: {str(e)}"

def write_file(path: str, content: str) -> str:
    """Write content to a file."""
    try:
        # Resolve project-relative paths
        if not path.startswith('/'):
            for project_name, project_path in PROJECTS.items():
                full_path = Path(project_path) / path
                if full_path.parent.exists():
                    path = str(full_path)
                    break
        
        file_path = Path(path)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(content)
        return f"✅ Wrote {len(content)} chars to {path}"
    except Exception as e:
        return f"❌ Error writing {path}: {str(e)}"

def list_files(path: str) -> str:
    """List files in a directory."""
    try:
        dir_path = Path(path)
        if not dir_path.exists():
            return f"❌ Directory not found: {path}"
        
        if dir_path.is_file():
            return f"❌ {path} is a file, not a directory"
        
        files = []
        for item in sorted(dir_path.iterdir()):
            if item.name.startswith('.'):
                continue
            size = item.stat().st_size if item.is_file() else 0
            type_marker = "/" if item.is_dir() else ""
            files.append(f"{item.name}{type_marker} ({size} bytes)" if item.is_file() else f"{item.name}/")
        
        return f"✅ Files in {path}:\n" + "\n".join(files[:50])  # Limit to 50 items
    except Exception as e:
        return f"❌ Error listing {path}: {str(e)}"

def run_command(command: str, cwd: str = None) -> str:
    """Execute a shell command."""
    try:
        # Security: Only allow safe commands
        dangerous_keywords = ['rm -rf', 'sudo', 'shutdown', 'reboot', 'dd']
        if any(keyword in command.lower() for keyword in dangerous_keywords):
            return f"❌ Command blocked for safety: {command}"
        
        if cwd and not Path(cwd).exists():
            return f"❌ Directory not found: {cwd}"
        
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        output = result.stdout + result.stderr
        status = "✅" if result.returncode == 0 else "❌"
        return f"{status} Command: {command}\nExit code: {result.returncode}\n\n{output[:2000]}"
    except subprocess.TimeoutExpired:
        return f"❌ Command timed out after 30s: {command}"
    except Exception as e:
        return f"❌ Error running command: {str(e)}"

def git_status(project: str) -> str:
    """Get git status for a project."""
    if project not in PROJECTS:
        return f"❌ Unknown project: {project}"
    
    return run_command("git status", cwd=PROJECTS[project])

def git_diff(project: str) -> str:
    """Get git diff for a project."""
    if project not in PROJECTS:
        return f"❌ Unknown project: {project}"
    
    return run_command("git diff", cwd=PROJECTS[project])

def git_commit(project: str, message: str) -> str:
    """Commit changes to a project."""
    if project not in PROJECTS:
        return f"❌ Unknown project: {project}"
    
    cwd = PROJECTS[project]
    # Stage all changes
    stage_result = run_command("git add .", cwd=cwd)
    if "❌" in stage_result:
        return stage_result
    
    # Commit
    return run_command(f'git commit -m "{message}"', cwd=cwd)

def git_push(project: str, branch: str = None) -> str:
    """Push changes to GitHub."""
    if project not in PROJECTS:
        return f"❌ Unknown project: {project}"
    
    cwd = PROJECTS[project]
    cmd = "git push" if not branch else f"git push origin {branch}"
    return run_command(cmd, cwd=cwd)

def create_branch(project: str, branch_name: str) -> str:
    """Create and checkout a new git branch."""
    if project not in PROJECTS:
        return f"❌ Unknown project: {project}"
    
    cwd = PROJECTS[project]
    return run_command(f"git checkout -b {branch_name}", cwd=cwd)

# Tool definitions for Claude
TOOLS = [
    {
        "name": "read_file",
        "description": "Read the contents of a file. Use project-relative paths (e.g., 'src/app/page.tsx') or absolute paths.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Path to the file (relative to project root or absolute)"
                }
            },
            "required": ["path"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file. Creates directories if needed. Use for creating new files or updating existing ones.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Path to the file (relative to project root or absolute)"
                },
                "content": {
                    "type": "string",
                    "description": "Content to write to the file"
                }
            },
            "required": ["path", "content"]
        }
    },
    {
        "name": "list_files",
        "description": "List files and directories in a path.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Directory path to list"
                }
            },
            "required": ["path"]
        }
    },
    {
        "name": "run_command",
        "description": "Execute a shell command. Use for npm install, python scripts, git commands, etc. Dangerous commands are blocked.",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {
                    "type": "string",
                    "description": "Shell command to execute"
                },
                "cwd": {
                    "type": "string",
                    "description": "Working directory (optional)"
                }
            },
            "required": ["command"]
        }
    },
    {
        "name": "git_status",
        "description": "Get git status for a project.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project": {
                    "type": "string",
                    "description": "Project name (My-AI-Agent-Team, f.insight.AI Advanced, Memorias.AI, get-good.ai)"
                }
            },
            "required": ["project"]
        }
    },
    {
        "name": "git_diff",
        "description": "See what changes have been made to a project.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project": {
                    "type": "string",
                    "description": "Project name"
                }
            },
            "required": ["project"]
        }
    },
    {
        "name": "create_branch",
        "description": "Create a new git branch and switch to it. Always create a branch before making changes.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project": {
                    "type": "string",
                    "description": "Project name"
                },
                "branch_name": {
                    "type": "string",
                    "description": "Name for the new branch (e.g., 'discord-bot/add-login-form')"
                }
            },
            "required": ["project", "branch_name"]
        }
    },
    {
        "name": "git_commit",
        "description": "Commit staged changes with a message. Use conventional commit format.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project": {
                    "type": "string",
                    "description": "Project name"
                },
                "message": {
                    "type": "string",
                    "description": "Commit message (use conventional commits format)"
                }
            },
            "required": ["project", "message"]
        }
    },
    {
        "name": "git_push",
        "description": "Push commits to GitHub.",
        "input_schema": {
            "type": "object",
            "properties": {
                "project": {
                    "type": "string",
                    "description": "Project name"
                },
                "branch": {
                    "type": "string",
                    "description": "Branch name (optional, defaults to current branch)"
                }
            },
            "required": ["project"]
        }
    }
]

# Tool execution dispatcher
def execute_tool(tool_name: str, tool_input: dict) -> str:
    """Execute a tool and return the result."""
    if tool_name == "read_file":
        return read_file(tool_input["path"])
    elif tool_name == "write_file":
        return write_file(tool_input["path"], tool_input["content"])
    elif tool_name == "list_files":
        return list_files(tool_input["path"])
    elif tool_name == "run_command":
        return run_command(tool_input["command"], tool_input.get("cwd"))
    elif tool_name == "git_status":
        return git_status(tool_input["project"])
    elif tool_name == "git_diff":
        return git_diff(tool_input["project"])
    elif tool_name == "create_branch":
        return create_branch(tool_input["project"], tool_input["branch_name"])
    elif tool_name == "git_commit":
        return git_commit(tool_input["project"], tool_input["message"])
    elif tool_name == "git_push":
        return git_push(tool_input["project"], tool_input.get("branch"))
    else:
        return f"❌ Unknown tool: {tool_name}"

@client.event
async def on_ready():
    print(f'✅ Bot connected as {client.user}')
    print(f'📱 Responding in: #token-macbook-air, DMs')
    print(f'📁 Projects: {", ".join(PROJECTS.keys())}')
    print(f'🛠️  Tools enabled: file ops, git, terminal')

@client.event
async def on_message(message):
    # Debug logging
    print(f"📨 Message received: '{message.content[:50]}' in channel: {message.channel.name if hasattr(message.channel, 'name') else 'DM'}")
    
    # Ignore own messages
    if message.author == client.user:
        print(f"  ⏭️  Ignoring own message")
        return
    
    # Only respond in token-macbook-air channel or DMs
    if message.channel.name not in ['token-macbook-air'] and not isinstance(message.channel, discord.DMChannel):
        print(f"  ⏭️  Wrong channel, ignoring")
        return
    
    print(f"  ✅ Processing message...")
    
    # Send "typing" indicator
    async with message.channel.typing():
        try:
            # Start with user message
            messages = [{"role": "user", "content": message.content}]
            
            # Tool use loop (Claude may need multiple tool calls)
            max_iterations = 10
            for iteration in range(max_iterations):
                response = anthropic.messages.create(
                    model="claude-sonnet-4-6",
                    max_tokens=4000,
                    tools=TOOLS,
                    system=f"""You are Christian's AI development assistant with full codebase access.

{CNS_CONTEXT}

You have these projects with full read/write access:
{json.dumps(PROJECTS, indent=2)}

IMPORTANT WORKFLOW:
1. Always create a new branch before making changes (use create_branch)
2. Read files before modifying them
3. Make changes carefully and test when possible
4. Commit with clear conventional commit messages
5. Inform Christian about what you did

SAFETY:
- Ask permission before destructive operations
- Always create branches for changes
- Verify changes with git diff before committing
- Never expose secrets or API keys

Be concise and actionable. Use tools to accomplish tasks.""",
                    messages=messages
                )
                
                # Check if we're done (no more tool calls)
                if response.stop_reason == "end_turn":
                    # Extract final text response
                    final_text = ""
                    for block in response.content:
                        if block.type == "text":
                            final_text += block.text
                    
                    # Send to Discord
                    if len(final_text) <= 2000:
                        await message.reply(final_text)
                    else:
                        chunks = [final_text[i:i+2000] for i in range(0, len(final_text), 2000)]
                        await message.reply(chunks[0])
                        for chunk in chunks[1:]:
                            await message.channel.send(chunk)
                    break
                
                # Execute tool calls
                if response.stop_reason == "tool_use":
                    # Add assistant response to messages
                    messages.append({"role": "assistant", "content": response.content})
                    
                    # Execute tools and collect results
                    tool_results = []
                    for block in response.content:
                        if block.type == "tool_use":
                            print(f"  🔧 Executing tool: {block.name}")
                            result = execute_tool(block.name, block.input)
                            print(f"  📊 Result: {result[:100]}...")
                            
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": result
                            })
                    
                    # Add tool results to messages
                    messages.append({"role": "user", "content": tool_results})
                else:
                    # Unexpected stop reason
                    await message.reply(f"⚠️ Unexpected response: {response.stop_reason}")
                    break
            
            if iteration == max_iterations - 1:
                await message.channel.send("⚠️ Max iterations reached. Task may be incomplete.")
                
        except Exception as e:
            await message.reply(f"❌ Error: {str(e)}")
            print(f"Error processing message: {e}")
            import traceback
            traceback.print_exc()

# Run bot
if __name__ == "__main__":
    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        print("❌ Error: DISCORD_BOT_TOKEN not set")
        exit(1)
    
    print("🚀 Starting Discord bot with full access...")
    client.run(token)

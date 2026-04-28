#!/usr/bin/env python3
"""
Discord Development Bot with Full Codebase Access

Like GitHub Copilot but via Discord:
- Full project directory access
- File read/write operations
- Git operations (commit, push)
- Agent orchestration
- Vercel/Railway deployments
"""
import os
import discord
import subprocess
from anthropic import Ant@client.event
async def on_message(message):
    # Ignore own messages
    if message.author == client.user:
        return
    
    # Only respond in designated channels or DMs
    if message.channel.name not in ['dev-assistance', 'copilot-chat', 'development', 'token-macbook-air'] and not isinstance(message.channel, discord.DMChannel):
        returnom pathlib import Path
import json
from typing import Optional, Dict, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Discord setup
intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

# Claude setup
anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Projects configuration
PROJECTS = {
    "finsight": {
        "name": "f.insight.AI Advanced",
        "path": Path("/Users/christian/Repos/f.insight.AI Advanced"),
        "type": "full-stack",
        "stack": "Next.js + FastAPI + PostgreSQL",
        "deployment": "vercel + railway"
    },
    "slow-hand": {
        "name": "Slow Hand Studio",
        "path": Path("/Users/christian/Repos/slow-hand-studio"),
        "type": "python-webapp",
        "stack": "Python + Flask",
        "deployment": "local"
    },
    "memorias": {
        "name": "Memorias.AI",
        "path": Path("/Users/christian/Repos/Memorias.AI"),
        "type": "nextjs",
        "stack": "Next.js + TypeScript",
        "deployment": "vercel"
    },
    "agent-team": {
        "name": "My AI Agent Team",
        "path": Path("/Users/christian/Repos/My-AI-Agent-Team"),
        "type": "nextjs-agents",
        "stack": "Next.js + TypeScript + Claude",
        "deployment": "vercel"
    }
}

# CNS context loading
CNS_DIR = Path("~/.personal-cns/cns").expanduser()

def load_cns_context() -> str:
    """Load CNS brain, memory, reflexes for Claude context."""
    context = []
    
    # Load brain
    brain_files = [
        CNS_DIR / "brain/identity.md",
        CNS_DIR / "brain/prime-principles.md",
        CNS_DIR / "brain/decision-framework.md"
    ]
    
    for file in brain_files:
        if file.exists():
            context.append(f"## {file.stem}\n{file.read_text()}")
    
    # Load memory
    memory_files = [
        CNS_DIR / "memory/semantic/best-practices.md",
        CNS_DIR / "memory/procedural/workflow-patterns.md"
    ]
    
    for file in memory_files:
        if file.exists():
            context.append(f"## {file.stem}\n{file.read_text()}")
    
    return "\n\n---\n\n".join(context)

def load_project_context(project_key: str) -> str:
    """Load project-specific context (README, recent changes, structure)."""
    project = PROJECTS.get(project_key)
    if not project or not project["path"].exists():
        return ""
    
    context = []
    project_path = project["path"]
    
    # Load README
    readme = project_path / "README.md"
    if readme.exists():
        context.append(f"## {project['name']} README\n{readme.read_text()[:2000]}")
    
    # Get recent git commits
    try:
        result = subprocess.run(
            ["git", "log", "-5", "--oneline"],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            context.append(f"## Recent Commits\n{result.stdout}")
    except:
        pass
    
    # Get git status
    try:
        result = subprocess.run(
            ["git", "status", "--short"],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        if result.returncode == 0 and result.stdout.strip():
            context.append(f"## Git Status\n{result.stdout}")
    except:
        pass
    
    # Project structure (top-level dirs)
    dirs = [d.name for d in project_path.iterdir() if d.is_dir() and not d.name.startswith(".")]
    context.append(f"## Project Structure\n{', '.join(sorted(dirs))}")
    
    return "\n\n".join(context)

def execute_tool(tool_name: str, tool_input: Dict) -> str:
    """Execute development tools: read_file, write_file, run_command, git_commit, etc."""
    
    if tool_name == "read_file":
        file_path = Path(tool_input["path"])
        if file_path.exists():
            return file_path.read_text()
        return f"Error: File not found: {file_path}"
    
    elif tool_name == "write_file":
        file_path = Path(tool_input["path"])
        content = tool_input["content"]
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(content)
        return f"✅ File written: {file_path}"
    
    elif tool_name == "run_command":
        command = tool_input["command"]
        cwd = tool_input.get("cwd", ".")
        try:
            result = subprocess.run(
                command,
                shell=True,
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=30
            )
            return f"Exit code: {result.returncode}\n\nOutput:\n{result.stdout}\n{result.stderr}"
        except subprocess.TimeoutExpired:
            return "Error: Command timed out after 30s"
        except Exception as e:
            return f"Error: {e}"
    
    elif tool_name == "git_status":
        project_path = tool_input["project_path"]
        result = subprocess.run(
            ["git", "status"],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        return result.stdout
    
    elif tool_name == "git_diff":
        project_path = tool_input["project_path"]
        result = subprocess.run(
            ["git", "diff"],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        return result.stdout[:2000]  # Limit output
    
    elif tool_name == "git_commit":
        project_path = tool_input["project_path"]
        message = tool_input["message"]
        
        # Stage all changes
        subprocess.run(["git", "add", "."], cwd=project_path)
        
        # Commit
        result = subprocess.run(
            ["git", "commit", "-m", message],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        
        return result.stdout
    
    elif tool_name == "git_push":
        project_path = tool_input["project_path"]
        result = subprocess.run(
            ["git", "push"],
            cwd=project_path,
            capture_output=True,
            text=True
        )
        return result.stdout
    
    elif tool_name == "list_files":
        dir_path = Path(tool_input["path"])
        if dir_path.exists():
            files = [f.name for f in dir_path.iterdir()]
            return "\n".join(sorted(files))
        return f"Error: Directory not found: {dir_path}"
    
    return f"Unknown tool: {tool_name}"

# Tool definitions for Claude
TOOLS = [
    {
        "name": "read_file",
        "description": "Read contents of a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"}
            },
            "required": ["path"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file",
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
        "description": "Execute a terminal command",
        "input_schema": {
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "Shell command"},
                "cwd": {"type": "string", "description": "Working directory"}
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
        "description": "Commit changes with a message",
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
        "description": "Push commits to remote",
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
        "description": "List files in a directory",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Directory path"}
            },
            "required": ["path"]
        }
    }
]

CNS_CONTEXT = load_cns_context()

@client.event
async def on_ready():
    print(f'✅ Development Bot connected as {client.user}')
    print(f'📁 Available projects: {", ".join(PROJECTS.keys())}')

@client.event
async def on_message(message):
    # Ignore own messages
    if message.author == client.user:
        return
    
    # Only respond in designated channels or DMs
    if message.channel.name not in ['dev-assistance', 'copilot-chat', 'development', 'token-macbook-air'] and not isinstance(message.channel, discord.DMChannel):
        return
    
    # Detect project context from message
    current_project = None
    for key, project in PROJECTS.items():
        if key in message.content.lower() or project["name"].lower() in message.content.lower():
            current_project = key
            break
    
    # Load project context if detected
    project_context = load_project_context(current_project) if current_project else ""
    
    # Send "typing" indicator
    async with message.channel.typing():
        # Call Claude API with tool use
        messages = [{"role": "user", "content": message.content}]
        
        system_prompt = f"""You are Christian's AI development assistant with full codebase access.

{CNS_CONTEXT}

{project_context if project_context else "No specific project context loaded. Ask user which project to work on."}

You have access to development tools:
- Read/write files in any project
- Execute terminal commands
- Git operations (status, diff, commit, push)
- Deploy to Vercel/Railway

Available projects:
{json.dumps(PROJECTS, indent=2, default=str)}

When making changes:
1. Always show user what you're about to change
2. Ask for confirmation before git commits/pushes
3. Run tests before committing if available
4. Follow conventional commit messages

Be concise and action-oriented."""
        
        # Tool use loop
        while True:
            response = anthropic.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=4000,
                system=system_prompt,
                messages=messages,
                tools=TOOLS
            )
            
            # Check if Claude wants to use tools
            if response.stop_reason == "tool_use":
                # Execute tools
                tool_results = []
                for content_block in response.content:
                    if content_block.type == "tool_use":
                        tool_result = execute_tool(content_block.name, content_block.input)
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": content_block.id,
                            "content": tool_result
                        })
                
                # Add assistant response and tool results to messages
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})
            else:
                # Final response - extract text and send
                reply = ""
                for content_block in response.content:
                    if hasattr(content_block, "text"):
                        reply += content_block.text
                
                # Send response (handle Discord's 2000 char limit)
                if len(reply) <= 2000:
                    await message.reply(reply)
                else:
                    # Split into chunks
                    chunks = [reply[i:i+2000] for i in range(0, len(reply), 2000)]
                    for chunk in chunks:
                        await message.channel.send(chunk)
                
                break

# Run bot
if __name__ == "__main__":
    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        print("❌ Error: DISCORD_BOT_TOKEN not set")
        exit(1)
    
    client.run(token)

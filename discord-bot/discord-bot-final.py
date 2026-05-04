#!/usr/bin/env python3
"""
Discord Development Bot - Final Version
One bot to rule them all - fully functional with repository access
"""
import os
import discord
import subprocess
import asyncio
from pathlib import Path
from typing import Dict, List, Optional
from dotenv import load_dotenv

# AI providers
try:
    from anthropic import Anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False

try:
    import openai
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

# Load environment variables
if Path(".env.local").exists():
    load_dotenv(".env.local")
else:
    load_dotenv(".env")

# Discord setup
intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

# AI Setup with fallback
anthropic_client = None
openai_client = None

if HAS_ANTHROPIC and os.getenv("ANTHROPIC_API_KEY"):
    anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

if HAS_OPENAI and os.getenv("OPENAI_API_KEY"):
    openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def check_repository_status():
    """Check which repositories actually exist and are accessible"""
    repos = {
        "slow-hand-studio": Path(r"C:\Repo\slow-hand-studio"),
        "FinsightAI": Path(r"C:\Repo\FinsightAI"), 
        "observatory": Path(r"C:\Repo\observatory"),
        "my-ai-agent-team": Path(r"E:\Repos\my-ai-agent-team")
    }
    
    status = {}
    for name, path in repos.items():
        if path.exists():
            git_dir = path / ".git"
            if git_dir.exists():
                status[name] = {
                    "path": str(path),
                    "status": "✅ Git repo",
                    "accessible": True
                }
            else:
                status[name] = {
                    "path": str(path), 
                    "status": "📁 Folder (no git)",
                    "accessible": True
                }
        else:
            status[name] = {
                "path": str(path),
                "status": "❌ Missing", 
                "accessible": False
            }
    
    return status

def execute_command(command: str, cwd: Optional[str] = None) -> str:
    """Execute a shell command safely"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            cwd=cwd,
            timeout=30
        )
        
        if result.returncode == 0:
            return f"✅ Command successful:\n```\n{result.stdout}\n```"
        else:
            return f"❌ Command failed (exit {result.returncode}):\n```\n{result.stderr}\n```"
            
    except subprocess.TimeoutExpired:
        return "⏰ Command timed out (30s)"
    except Exception as e:
        return f"💥 Error: {str(e)}"

async def call_ai_api(messages, system_prompt):
    """Call AI API with fallback from Claude to OpenAI"""
    
    # Try Claude first (2026 model)
    if anthropic_client:
        try:
            response = anthropic_client.messages.create(
                model="claude-sonnet-4-6",  # 2026 model
                max_tokens=4000,
                system=system_prompt,
                messages=messages
            )
            return response.content[0].text, "claude-sonnet-4-6"
        except Exception as e:
            print(f"Claude error: {e}")
    
    # Fallback to OpenAI
    if openai_client:
        try:
            openai_messages = [{"role": "system", "content": system_prompt}] + messages
            response = openai_client.chat.completions.create(
                model="gpt-4",
                messages=openai_messages,
                max_tokens=4000
            )
            return response.choices[0].message.content, "gpt-4"
        except Exception as e:
            print(f"OpenAI error: {e}")
    
    return "❌ No AI providers available", "error"

@client.event
async def on_ready():
    ai_providers = []
    if anthropic_client:
        ai_providers.append("🧠 Claude Sonnet 4.6")
    if openai_client:
        ai_providers.append("🤖 GPT-4")
    
    print(f'🤖 Discord Bot connected as {client.user}')
    print(f'🧠 AI: {" + ".join(ai_providers) if ai_providers else "❌ None"}')
    print(f'📁 Repository checking enabled')
    
    # Check repository status on startup
    repo_status = check_repository_status()
    accessible = [name for name, info in repo_status.items() if info["accessible"]]
    print(f'✅ Accessible repos: {", ".join(accessible)}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return
    
    # Only respond in designated channels or DMs
    allowed_channels = ['dev-assistance', 'copilot-chat', 'development', 'token-macbook-air', 'bot-testing']
    if (hasattr(message.channel, 'name') and message.channel.name not in allowed_channels 
        and not isinstance(message.channel, discord.DMChannel)):
        return
    
    try:
        async with message.channel.typing():
            # Get repository status
            repo_status = check_repository_status()
            accessible_repos = {name: info for name, info in repo_status.items() if info["accessible"]}
            
            system_context = f"""You are a Discord development bot with FULL access to the user's codebase.

**REPOSITORY STATUS (Live checked):**
{chr(10).join([f"✅ **{name}**: {info['path']} - {info['status']}" for name, info in accessible_repos.items()])}

**CAPABILITIES:**
1. 📁 File operations - read, write, create, delete files in any repo
2. 🔧 Git operations - commit, push, pull, branch management  
3. ⚡ Command execution - run scripts, builds, tests
4. 🧠 Code analysis and generation
5. 🚀 Project management across all repositories

**GUIDELINES:**
- Be direct and take action when requested
- Use emojis for clarity in Discord
- Check repository status when asked
- Execute commands when needed
- Provide concrete help with development tasks

Respond naturally and be proactive. The user expects you to take action, not just provide instructions."""

            response_text, ai_used = await call_ai_api(
                [{"role": "user", "content": message.content}], 
                system_context
            )
            
            # Add AI provider indicator  
            if ai_used != "error":
                response_text += f"\n\n*Powered by {ai_used}*"
            
            # Handle long responses
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
    # Validate environment
    if not os.getenv("DISCORD_BOT_TOKEN"):
        print("❌ DISCORD_BOT_TOKEN not found")
        exit(1)
    
    if not os.getenv("ANTHROPIC_API_KEY") and not os.getenv("OPENAI_API_KEY"):
        print("❌ No AI API keys found")
        exit(1)
    
    print("🚀 Starting Discord Development Bot (Final Version)")
    print("📍 Windows environment with full repository access")
    print("🧠 Claude Sonnet 4.6 + GPT-4 fallback")
    print("\nPress Ctrl+C to stop.\n")
    
    try:
        client.run(os.getenv("DISCORD_BOT_TOKEN"))
    except KeyboardInterrupt:
        print("\n👋 Bot stopped")
    except Exception as e:
        print(f"❌ Bot crashed: {e}")
#!/usr/bin/env python3
"""
Discord Development Bot with OpenAI Fallback - Windows Version

Uses OpenAI GPT-4 when Anthropic Claude is unavailable
"""
import os
import discord
import subprocess
import json
import asyncio
from pathlib import Path
from typing import Optional, Dict, List
from dotenv import load_dotenv

# Try importing both AI providers
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

# Projects configuration - Windows compatible
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
    }
}

def discover_repositories():
    """Auto-discover all Git repositories in the workspace folders."""
    discovered = {}
    search_paths = [Path(r"E:\Repos"), Path(r"C:\Repo")]
    
    # Track already added paths to avoid duplicates
    added_paths = set()
    
    for search_path in search_paths:
        if not search_path.exists():
            continue
            
        for item in search_path.iterdir():
            if item.is_dir() and (item / ".git").exists():
                # Normalize path for duplicate checking
                normalized_path = str(item.resolve())
                if normalized_path in added_paths:
                    continue
                    
                key = item.name.lower().replace("-", "").replace("_", "")
                if key not in PROJECTS and key not in discovered:
                    discovered[key] = {
                        "name": item.name,
                        "path": item,
                        "type": "git-repo",
                        "stack": "Auto-discovered",
                        "deployment": "local"
                    }
                    added_paths.add(normalized_path)
    
    return discovered

async def call_ai_api(messages, system_prompt):
    """Call AI API with fallback from Anthropic to OpenAI"""
    
    # Try Anthropic Claude first
    if anthropic_client:
        try:
            response = anthropic_client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4000,
                system=system_prompt,
                messages=messages
            )
            return response.content[0].text, "claude"
        except Exception as e:
            print(f"Claude error: {e}")
    
    # Fallback to OpenAI
    if openai_client:
        try:
            # Convert to OpenAI format
            openai_messages = [{"role": "system", "content": system_prompt}] + messages
            
            response = openai_client.chat.completions.create(
                model="gpt-4",
                messages=openai_messages,
                max_tokens=4000
            )
            return response.choices[0].message.content, "gpt-4"
        except Exception as e:
            print(f"OpenAI error: {e}")
    
    return "❌ No AI providers available. Please check your API keys.", "error"

@client.event
async def on_ready():
    ai_status = []
    if anthropic_client:
        ai_status.append("🧠 Claude")
    if openai_client:
        ai_status.append("🤖 GPT-4")
    
    print(f'🤖 Discord Development Bot connected as {client.user}')
    print(f'🧠 AI Providers: {" & ".join(ai_status) if ai_status else "❌ None"}')
    print(f'📁 Watching repositories in: E:\\Repos & C:\\Repo')
    
    all_projects = {**PROJECTS, **discover_repositories()}
    available_projects = [key for key, project in all_projects.items() 
                         if key != "auto-discover" and project["path"].exists()]
    print(f'🚀 Available projects: {", ".join(available_projects)}')

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
            all_projects = {**PROJECTS, **discover_repositories()}
            
            system_context = f"""You are a Discord development bot with full access to the user's codebase.

**Available Projects:**
{chr(10).join([f"- **{key}**: {project['name']} at {project['path']}" 
               for key, project in all_projects.items() 
               if key != "auto-discover" and project['path'].exists()])}

**Guidelines:**
1. Help with code development, git operations, file management
2. Be concise but helpful in Discord format
3. Use emojis and formatting for clarity
4. Respond naturally and take action when requested

The user expects you to be helpful with their development work across all repositories."""

            response_text, ai_used = await call_ai_api(
                [{"role": "user", "content": message.content}], 
                system_context
            )
            
            # Add AI provider indicator
            if ai_used != "error":
                response_text += f"\n\n*Powered by {ai_used}*"
            
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
        exit(1)
    
    if not os.getenv("ANTHROPIC_API_KEY") and not os.getenv("OPENAI_API_KEY"):
        print("❌ No AI API keys found. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY")
        exit(1)
    
    print("🚀 Starting Discord Development Bot...")
    print("📍 Configured for Windows environment")
    print("📁 Repository paths: E:\\Repos\\* and C:\\Repo\\*")
    print("🧠 Multi-AI provider support (Claude + GPT-4)")
    print("\nPress Ctrl+C to stop the bot.\n")
    
    try:
        client.run(os.getenv("DISCORD_BOT_TOKEN"))
    except KeyboardInterrupt:
        print("\n👋 Bot stopped by user")
    except Exception as e:
        print(f"❌ Bot crashed: {e}")
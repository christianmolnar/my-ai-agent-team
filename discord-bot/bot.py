#!/usr/bin/env python3
"""
Discord Development Bot - Simple Version

Responds in #token-macbook-air channel with Claude API and CNS context.
"""
import os
import discord
from anthropic import Anthropic
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Discord setup
intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

# Claude setup
anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Load CNS context
CNS_DIR = Path("~/.personal-cns/cns").expanduser()

def load_cns_context():
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

CNS_CONTEXT = load_cns_context()

@client.event
async def on_ready():
    print(f'✅ Bot connected as {client.user}')
    print(f'📱 Responding in: #token-macbook-air, DMs')
    print(f'📁 Projects: f.insight.AI, slow-hand-studio, Memorias.AI, My-AI-Agent-Team')

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
            # Call Claude API
            response = anthropic.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4000,
                system=f"""You are Christian's AI development assistant with access to his CNS (Central Neural System) knowledge base.

{CNS_CONTEXT}

You have access to these projects:
- f.insight.AI Advanced: /Users/christian/Repos/f.insight.AI Advanced (Next.js + FastAPI + PostgreSQL)
- slow-hand-studio: /Users/christian/Repos/slow-hand-studio (Python guitar learning webapp)
- Memorias.AI: /Users/christian/Repos/Memorias.AI (Next.js + TypeScript)
- My-AI-Agent-Team: /Users/christian/Repos/My-AI-Agent-Team (Next.js + TypeScript + Claude agents)

Provide development assistance based on the context above. Be concise and actionable.""",
                messages=[
                    {"role": "user", "content": message.content}
                ]
            )
            
            # Extract reply text
            reply = response.content[0].text
            
            # Discord has 2000 char limit per message
            if len(reply) <= 2000:
                await message.reply(reply)
            else:
                # Split into chunks
                chunks = [reply[i:i+2000] for i in range(0, len(reply), 2000)]
                for chunk in chunks:
                    await message.channel.send(chunk)
                    
        except Exception as e:
            await message.reply(f"❌ Error: {str(e)}")
            print(f"Error processing message: {e}")

# Run bot
if __name__ == "__main__":
    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        print("❌ Error: DISCORD_BOT_TOKEN not set")
        exit(1)
    
    print("🚀 Starting Discord bot...")
    client.run(token)

#!/usr/bin/env python3
"""
Discord Development Bot - Final Version
One bot to rule them all - fully functional with repository access.
"""
import os
import discord
import subprocess
import asyncio
from pathlib import Path
from typing import Dict, List, Optional
from collections import defaultdict
from dotenv import load_dotenv

SAFE_COMMAND_PREFIXES = (
    "git status",
    "git diff",
    "git log",
    "git branch",
    "git switch",
    "git checkout",
    "git fetch",
    "git pull",
    "git add",
    "git commit",
    "git push",
    "npm install",
    "npm run",
    "npm test",
    "pytest",
    "python -m pytest",
    "pip install",
    "vercel",
    "npx vercel",
    "railway",
)

BLOCKED_COMMAND_SNIPPETS = (
    "rm -rf",
    "del /f",
    "format ",
    "shutdown",
    "reboot",
    "mkfs",
    "diskpart",
    "git reset --hard",
    "git clean -fd",
    ":(){:|:&};:",
)

PENDING_COMMANDS: Dict[int, Dict[str, str]] = {}
ACTIVE_REPO_BY_CONTEXT: Dict[int, str] = {}
CONVERSATION_MEMORY: Dict[int, List[Dict[str, str]]] = defaultdict(list)
MAX_DISCORD_MESSAGE = 1900
MAX_MEMORY_MESSAGES = 12
AI_REQUEST_TIMEOUT_SECONDS = 90

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


def check_repository_status() -> Dict[str, Dict[str, object]]:
    """Check which repositories actually exist and are accessible."""
    repos = {
        "slow-hand-studio": Path(r"C:\Repo\slow-hand-studio"),
        "FinsightAI": Path(r"C:\Repo\FinsightAI"),
        "observatory": Path(r"C:\Repo\observatory"),
        "my-ai-agent-team": Path(r"E:\Repos\my-ai-agent-team"),
    }

    status: Dict[str, Dict[str, object]] = {}
    for name, path in repos.items():
        if path.exists():
            git_dir = path / ".git"
            if git_dir.exists():
                status[name] = {
                    "path": str(path),
                    "status": "✅ Git repo",
                    "accessible": True,
                }
            else:
                status[name] = {
                    "path": str(path),
                    "status": "📁 Folder (no git)",
                    "accessible": True,
                }
        else:
            status[name] = {
                "path": str(path),
                "status": "❌ Missing",
                "accessible": False,
            }

    return status


def normalize_repo_key(repo_key: str) -> str:
    """Normalize user-provided repository keys for matching."""
    return repo_key.strip().lower().replace("_", "-")


def get_context_key(message) -> int:
    """Use channel context for servers and user context for DMs."""
    if isinstance(message.channel, discord.DMChannel):
        return message.author.id
    return message.channel.id


def get_known_repo_names() -> List[str]:
    """Return available repository names."""
    status = check_repository_status()
    return [name for name, info in status.items() if info["accessible"]]


def find_repo_in_text(text: str) -> Optional[str]:
    """Find a known repository mentioned in text."""
    normalized_text = text.lower().replace("_", "-")
    for repo_name in get_known_repo_names():
        if normalize_repo_key(repo_name) in normalized_text:
            return repo_name
    return None


def set_active_repo(context_key: int, repo_key: str) -> Optional[str]:
    """Set active repo for this conversation context."""
    status = check_repository_status()
    normalized = normalize_repo_key(repo_key)

    for key, info in status.items():
        if normalize_repo_key(key) == normalized and info["accessible"]:
            ACTIVE_REPO_BY_CONTEXT[context_key] = key
            return key

    return None


def get_active_repo(context_key: int) -> Optional[str]:
    """Get active repo for this conversation context."""
    return ACTIVE_REPO_BY_CONTEXT.get(context_key)


def append_memory(context_key: int, role: str, content: str) -> None:
    """Append memory with a bounded number of messages."""
    bucket = CONVERSATION_MEMORY[context_key]
    bucket.append({"role": role, "content": content})
    if len(bucket) > MAX_MEMORY_MESSAGES:
        del bucket[: len(bucket) - MAX_MEMORY_MESSAGES]


def get_memory(context_key: int) -> List[Dict[str, str]]:
    """Get memory for this context."""
    return CONVERSATION_MEMORY.get(context_key, [])


def clear_memory(context_key: int) -> None:
    """Clear memory for this context."""
    CONVERSATION_MEMORY.pop(context_key, None)


def resolve_repo_path(repo_key: str) -> Optional[Path]:
    """Resolve a repository key to an accessible path."""
    status = check_repository_status()
    normalized = normalize_repo_key(repo_key)

    for key, info in status.items():
        if normalize_repo_key(key) == normalized and info["accessible"]:
            return Path(info["path"])

    return None


def format_repo_status() -> str:
    """Render accessible repository status for Discord output."""
    status = check_repository_status()
    lines = []

    for name, info in status.items():
        lines.append(f"- {name}: {info['status']} ({info['path']})")

    return "\n".join(lines)


def is_command_safe(command: str) -> tuple[bool, str]:
    """Validate command against allowlist and denylist."""
    normalized = command.strip().lower()

    for blocked in BLOCKED_COMMAND_SNIPPETS:
        if blocked in normalized:
            return False, f"Blocked command pattern detected: {blocked}"

    if not normalized.startswith(SAFE_COMMAND_PREFIXES):
        return False, "Command is outside the safe allowlist"

    return True, "ok"


def parse_run_command(content: str) -> tuple[Optional[str], Optional[str], bool]:
    """Parse !run syntax.

    Supports:
    - !run <repo> :: <command>
    - !run :: <command>   (uses active repo)
    """
    remainder = content[len("!run "):].strip()
    if "::" not in remainder:
        return None, None, False

    if remainder.startswith("::"):
        command = remainder[2:].strip()
        if not command:
            return None, None, False
        return None, command, True

    repo_key, command = remainder.split("::", 1)
    repo_key = repo_key.strip()
    command = command.strip()
    if not repo_key or not command:
        return None, None, False

    return repo_key, command, False


def clip_text(text: str, max_len: int = MAX_DISCORD_MESSAGE) -> str:
    """Clip long output for Discord limits."""
    if len(text) <= max_len:
        return text
    return text[:max_len] + "\n... (output truncated)"


def execute_command(command: str, cwd: Optional[str] = None) -> str:
    """Execute a shell command safely."""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            cwd=cwd,
            timeout=180,
        )

        stdout = (result.stdout or "").strip()
        stderr = (result.stderr or "").strip()

        if result.returncode == 0:
            if stdout:
                return f"✅ Command successful:\n```\n{clip_text(stdout)}\n```"
            return "✅ Command successful (no output)."

        combined = stderr or stdout or "No output captured."
        return f"❌ Command failed (exit {result.returncode}):\n```\n{clip_text(combined)}\n```"

    except subprocess.TimeoutExpired:
        return "⏰ Command timed out (180s)"
    except Exception as e:
        return f"💥 Error: {str(e)}"


async def try_handle_control_command(message) -> bool:
    """Handle bot control commands before AI chat flow."""
    content = message.content.strip()
    user_id = message.author.id
    context_key = get_context_key(message)

    if content == "!help":
        await message.reply(
            "🤖 Bot command mode:\n"
            "- !repos\n"
            "- !use <repo>\n"
            "- !context\n"
            "- !clear\n"
            "- !run <repo> :: <command>\n"
            "- !run :: <command>   (uses active repo)\n"
            "- !confirm\n"
            "- !cancel\n\n"
            "Code examples:\n"
            "!use FinsightAI\n"
            "!run :: git status\n"
            "!run observatory :: npm run build\n"
            "!run my-ai-agent-team :: pytest\n\n"
            "Deploy examples:\n"
            "!run FinsightAI :: vercel --prod\n"
            "!run FinsightAI :: railway up\n\n"
            "Every !run needs !confirm before execution."
        )
        return True

    if content == "!repos":
        await message.reply("📁 Repository status:\n" + format_repo_status())
        return True

    if content.startswith("!use "):
        repo_key = content[len("!use "):].strip()
        if not repo_key:
            await message.reply("❌ Usage: !use <repo>")
            return True

        selected = set_active_repo(context_key, repo_key)
        if not selected:
            await message.reply(f"❌ Repo not found or not accessible: {repo_key}")
            return True

        await message.reply(f"✅ Active repo set to: {selected}")
        return True

    if content == "!context":
        active_repo = get_active_repo(context_key) or "(none)"
        memory_size = len(get_memory(context_key))
        await message.reply(
            f"🧭 Context\n- active repo: {active_repo}\n- remembered messages: {memory_size}/{MAX_MEMORY_MESSAGES}"
        )
        return True

    if content == "!clear":
        clear_memory(context_key)
        ACTIVE_REPO_BY_CONTEXT.pop(context_key, None)
        await message.reply("🧹 Context cleared for this conversation.")
        return True

    if content.startswith("!run "):
        repo_key, command, use_active_repo = parse_run_command(content)
        if not command:
            await message.reply("❌ Invalid format. Use: !run <repo> :: <command> or !run :: <command>")
            return True

        if use_active_repo:
            repo_key = get_active_repo(context_key)
            if not repo_key:
                await message.reply("❌ No active repo set. Use !use <repo> first, or specify repo in !run.")
                return True

        repo_path = resolve_repo_path(repo_key)
        if repo_path is None:
            await message.reply(f"❌ Repo not found or not accessible: {repo_key}")
            return True

        safe, reason = is_command_safe(command)
        if not safe:
            await message.reply(f"🚫 Command rejected: {reason}")
            return True

        PENDING_COMMANDS[user_id] = {
            "repo_key": repo_key,
            "cwd": str(repo_path),
            "command": command,
        }

        set_active_repo(context_key, repo_key)

        await message.reply(
            f"⚠️ Ready to run command in {repo_key}:\n"
            f"```\n{command}\n```\n"
            "Reply with !confirm to execute or !cancel to discard."
        )
        return True

    if content == "!cancel":
        if user_id in PENDING_COMMANDS:
            del PENDING_COMMANDS[user_id]
            await message.reply("🛑 Pending command canceled.")
        else:
            await message.reply("ℹ️ No pending command to cancel.")
        return True

    if content == "!confirm":
        pending = PENDING_COMMANDS.get(user_id)
        if not pending:
            await message.reply("ℹ️ No pending command. Use !run first.")
            return True

        command = pending["command"]
        cwd = pending["cwd"]
        repo_key = pending["repo_key"]

        del PENDING_COMMANDS[user_id]
        set_active_repo(context_key, repo_key)

        result = execute_command(command, cwd=cwd)
        await message.reply(f"⚙️ Executed in {repo_key}:\n{result}")
        return True

    return False


async def call_ai_api(messages, system_prompt):
    """Call AI API with fallback from Claude to OpenAI."""
    # Try Claude first (2026 model)
    if anthropic_client:
        try:
            response = anthropic_client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=4000,
                system=system_prompt,
                messages=messages,
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
                max_tokens=4000,
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

    print(f"🤖 Discord Bot connected as {client.user}")
    print(f"🧠 AI: {' + '.join(ai_providers) if ai_providers else '❌ None'}")
    print("📁 Repository checking enabled")

    # Check repository status on startup
    repo_status = check_repository_status()
    accessible = [name for name, info in repo_status.items() if info["accessible"]]
    print(f"✅ Accessible repos: {', '.join(accessible)}")


@client.event
async def on_message(message):
    if message.author == client.user:
        return

    # Only respond in designated channels or DMs
    allowed_channels = [
        "dev-assistance",
        "copilot-chat",
        "development",
        "token-macbook-air",
        "bot-testing",
    ]
    if (
        hasattr(message.channel, "name")
        and message.channel.name not in allowed_channels
        and not isinstance(message.channel, discord.DMChannel)
    ):
        return

    if await try_handle_control_command(message):
        return

    context_key = get_context_key(message)
    mentioned_repo = find_repo_in_text(message.content)
    if mentioned_repo:
        set_active_repo(context_key, mentioned_repo)

    try:
        async with message.channel.typing():
            repo_status = check_repository_status()
            accessible_repos = {name: info for name, info in repo_status.items() if info["accessible"]}
            active_repo = get_active_repo(context_key)
            memory_messages = get_memory(context_key)

            repo_hint = "None"
            if active_repo and active_repo in accessible_repos:
                repo_hint = f"{active_repo} ({accessible_repos[active_repo]['path']})"
            elif active_repo:
                repo_hint = active_repo

            system_context = f"""You are a Discord development bot with FULL access to the user's codebase.

**REPOSITORY STATUS (Live checked):**
{chr(10).join([f"✅ **{name}**: {info['path']} - {info['status']}" for name, info in accessible_repos.items()])}

**ACTIVE REPO FOR THIS CONVERSATION:**
{repo_hint}

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
- If the user says "this repo" or follows up, assume the active repo unless they change it
- When execution is requested, ask the user to use !run and !confirm command flow
- Provide concrete help with development tasks

Respond naturally and be proactive. The user expects continuity across messages."""

            messages = memory_messages + [{"role": "user", "content": message.content}]
            response_text, ai_used = await asyncio.wait_for(
                call_ai_api(messages, system_context),
                timeout=AI_REQUEST_TIMEOUT_SECONDS,
            )

            append_memory(context_key, "user", message.content)
            append_memory(context_key, "assistant", response_text)

            if ai_used != "error":
                response_text += f"\n\n*Powered by {ai_used}*"

            if len(response_text) > 2000:
                chunks = [response_text[i : i + 2000] for i in range(0, len(response_text), 2000)]
                for i, chunk in enumerate(chunks):
                    if i == 0:
                        await message.reply(chunk)
                    else:
                        await message.channel.send(chunk)
            else:
                await message.reply(response_text)

    except asyncio.TimeoutError:
        await message.reply(
            "⏰ AI request timed out. Please try again, or run !context and !use <repo> to tighten context."
        )
    except Exception as e:
        error_msg = f"❌ **Bot Error:** {str(e)}"
        print(f"Error processing message: {e}")
        await message.reply(error_msg)


if __name__ == "__main__":
    if not os.getenv("DISCORD_BOT_TOKEN"):
        print("❌ DISCORD_BOT_TOKEN not found")
        raise SystemExit(1)

    if not os.getenv("ANTHROPIC_API_KEY") and not os.getenv("OPENAI_API_KEY"):
        print("❌ No AI API keys found")
        raise SystemExit(1)

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

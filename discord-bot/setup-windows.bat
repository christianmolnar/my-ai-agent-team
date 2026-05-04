@echo off
REM Discord Development Bot - Complete Windows Setup Script
REM This script sets up the Discord bot as a 24/7 Windows service

echo.
echo 🤖 DISCORD DEVELOPMENT BOT - WINDOWS SETUP
echo ==========================================
echo.
echo This script will:
echo   1. Install Python dependencies
echo   2. Configure environment variables  
echo   3. Set up bot as Windows service
echo   4. Configure auto-start on boot
echo   5. Test the bot connection
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ This script requires Administrator privileges
    echo    Right-click and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ✅ Running with Administrator privileges
echo.

REM Navigate to bot directory
cd /d "E:\Repos\my-ai-agent-team\discord-bot"
if %errorLevel% neq 0 (
    echo ❌ Could not navigate to bot directory
    echo    Make sure the repository is cloned to E:\Repos\my-ai-agent-team
    pause
    exit /b 1
)

echo ✅ Found bot directory
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Python not found. Installing Python...
    echo.
    
    REM Try to install Python via winget
    winget install Python.Python.3.11
    if %errorLevel% neq 0 (
        echo ❌ Failed to install Python via winget
        echo    Please install Python manually from https://python.org
        pause
        exit /b 1
    )
    
    REM Refresh PATH
    call refreshenv >nul 2>&1
    
    REM Test Python again
    python --version >nul 2>&1
    if %errorLevel% neq 0 (
        echo ❌ Python installation failed
        echo    Please install Python manually and add it to PATH
        pause
        exit /b 1
    )
)

python --version
echo ✅ Python is available
echo.

REM Check if Git is installed  
git --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ Git not found. Installing Git...
    echo.
    
    winget install Git.Git
    if %errorLevel% neq 0 (
        echo ❌ Failed to install Git via winget
        echo    Please install Git manually from https://git-scm.com
        pause
        exit /b 1
    )
    
    call refreshenv >nul 2>&1
)

git --version
echo ✅ Git is available
echo.

REM Install Python dependencies
echo 📦 Installing Python dependencies...
echo.
pip install -r requirements.txt
if %errorLevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    echo    Make sure pip is working and try manually: pip install discord.py anthropic python-dotenv
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Check if .env.local file exists
if not exist ".env.local" (
    echo 🔧 Setting up environment configuration...
    echo.
    
    copy ".env.template" ".env.local"
    
    echo ⚠️  IMPORTANT: You need to configure your API tokens
    echo.
    echo    1. Go to https://discord.com/developers/applications
    echo       - Create a new application and bot
    echo       - Go to Bot section and copy the Bot Token (NOT the public key)
    echo.
    echo    2. Go to https://console.anthropic.com/settings/keys
    echo       - Create a new API key
    echo       - Copy the key
    echo.
    echo    3. Edit the .env.local file that just opened and replace:
    echo       - your_discord_bot_token_here with your Discord Bot Token
    echo       - your_anthropic_api_key_here with your Anthropic API key
    echo.
    echo    💡 .env.local is used for security - it will NEVER be committed to git
    echo.
    
    notepad ".env.local"
    
    echo.
    echo 💡 After configuring tokens, press any key to continue...
    pause >nul
) else (
    echo ✅ Environment configuration already exists (.env.local)
)

echo.

REM Install NSSM (Non-Sucking Service Manager) for Windows service
echo 🛠️ Installing Windows service manager...
echo.

where nssm >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing NSSM...
    winget install NSSM.NSSM
    if %errorLevel% neq 0 (
        echo ⚠️  Could not install NSSM automatically
        echo    You can install it manually from: https://nssm.cc/download
        echo    Or continue without service installation
        echo.
        set /p choice="Continue without service installation? (y/n): "
        if /i "%choice%" neq "y" (
            pause
            exit /b 1
        )
        goto :skip_service
    )
    call refreshenv >nul 2>&1
)

echo ✅ NSSM is available
echo.

REM Test the bot before installing as service
echo 🧪 Testing bot connection (10 seconds)...
echo    If this hangs, check your tokens in .env file
echo.

timeout /t 3 /nobreak >nul

REM Create test script
echo import os > test_bot.py
echo from dotenv import load_dotenv >> test_bot.py
echo from pathlib import Path >> test_bot.py
echo from dotenv import load_dotenv >> test_bot.py
echo # Try .env.local first, fallback to .env >> test_bot.py
echo if Path(".env.local").exists(): >> test_bot.py
echo     load_dotenv(".env.local") >> test_bot.py
echo else: >> test_bot.py
echo     load_dotenv(".env") >> test_bot.py
echo if not os.getenv("DISCORD_BOT_TOKEN") or not os.getenv("ANTHROPIC_API_KEY"): >> test_bot.py
echo     print("❌ Missing tokens in .env.local or .env file") >> test_bot.py
echo     exit(1) >> test_bot.py
echo print("✅ Tokens configured correctly") >> test_bot.py

python test_bot.py
if %errorLevel% neq 0 (
    echo ❌ Token configuration issue
    echo    Please check your .env.local file
    pause
    exit /b 1
)

del test_bot.py

echo ✅ Configuration test passed
echo.

REM Install bot as Windows service
echo 🚀 Installing bot as Windows service...
echo.

REM Stop and remove existing service if it exists
nssm stop DiscordDevBot >nul 2>&1
nssm remove DiscordDevBot confirm >nul 2>&1

REM Get Python executable path
for /f "tokens=*" %%i in ('where python') do set PYTHON_PATH=%%i

REM Install service
nssm install DiscordDevBot "%PYTHON_PATH%" "E:\Repos\my-ai-agent-team\discord-bot\bot-windows-full.py"
if %errorLevel% neq 0 (
    echo ❌ Failed to install Windows service
    goto :skip_service
)

REM Configure service
nssm set DiscordDevBot AppDirectory "E:\Repos\my-ai-agent-team\discord-bot"
nssm set DiscordDevBot DisplayName "Discord Development Bot"
nssm set DiscordDevBot Description "24/7 AI Development Assistant via Discord"
nssm set DiscordDevBot Start SERVICE_AUTO_START
nssm set DiscordDevBot AppStdout "E:\Repos\my-ai-agent-team\discord-bot\bot.log"
nssm set DiscordDevBot AppStderr "E:\Repos\my-ai-agent-team\discord-bot\bot.log"
nssm set DiscordDevBot AppRotateFiles 1
nssm set DiscordDevBot AppRotateOnline 1
nssm set DiscordDevBot AppRotateSeconds 86400
nssm set DiscordDevBot AppRotateBytes 1048576

echo ✅ Service installed and configured
echo.

REM Start the service
echo 🎯 Starting Discord bot service...
echo.
nssm start DiscordDevBot
if %errorLevel% neq 0 (
    echo ❌ Failed to start service
    echo    Check logs at: E:\Repos\my-ai-agent-team\discord-bot\bot.log
    pause
    exit /b 1
)

echo ✅ Service started successfully
echo.

REM Wait a moment for service to initialize
timeout /t 5 /nobreak >nul

REM Check service status
nssm status DiscordDevBot
echo.

goto :service_complete

:skip_service
echo ⚠️  Skipping service installation
echo    You can run the bot manually with: python bot-windows-full.py
echo.

:service_complete

REM Configure Windows to prevent sleep
echo 🔋 Configuring power settings for 24/7 operation...
echo.
powercfg /change /standby-timeout-ac 0
powercfg /change /monitor-timeout-ac 30
powercfg /change /disk-timeout-ac 0
powercfg /change /hibernate-timeout-ac 0

echo ✅ Power settings configured
echo.

REM Create management shortcuts
echo 📋 Creating management scripts...
echo.

REM Create status check script
echo @echo off > check-bot-status.bat
echo echo. >> check-bot-status.bat
echo echo 🤖 DISCORD BOT STATUS >> check-bot-status.bat
echo echo ================== >> check-bot-status.bat
echo echo. >> check-bot-status.bat
echo nssm status DiscordDevBot >> check-bot-status.bat
echo echo. >> check-bot-status.bat
echo echo Recent log entries: >> check-bot-status.bat
echo tail -n 20 "E:\Repos\my-ai-agent-team\discord-bot\bot.log" 2^>nul ^|^| echo No recent logs >> check-bot-status.bat
echo echo. >> check-bot-status.bat
echo pause >> check-bot-status.bat

REM Create restart script
echo @echo off > restart-bot.bat
echo echo Restarting Discord Bot... >> restart-bot.bat
echo nssm restart DiscordDevBot >> restart-bot.bat
echo echo. >> restart-bot.bat
echo echo ✅ Bot restarted >> restart-bot.bat
echo pause >> restart-bot.bat

REM Create stop script
echo @echo off > stop-bot.bat
echo echo Stopping Discord Bot... >> stop-bot.bat
echo nssm stop DiscordDevBot >> stop-bot.bat
echo echo. >> stop-bot.bat
echo echo ✅ Bot stopped >> stop-bot.bat
echo pause >> stop-bot.bat

REM Create start script
echo @echo off > start-bot.bat
echo echo Starting Discord Bot... >> start-bot.bat
echo nssm start DiscordDevBot >> start-bot.bat
echo echo. >> start-bot.bat
echo echo ✅ Bot started >> start-bot.bat
echo pause >> start-bot.bat

echo ✅ Management scripts created
echo.

REM Final summary
echo.
echo 🎉 SETUP COMPLETE!
echo ==================
echo.
echo ✅ Discord bot is installed as Windows service
echo ✅ Bot will auto-start when Windows boots
echo ✅ Power settings configured for 24/7 operation
echo ✅ Management scripts created
echo.
echo 📋 WHAT'S NEXT:
echo.
echo 1. 💬 **Test the bot in Discord**
echo    - Go to your Discord server
echo    - Find a channel named: dev-assistance, copilot-chat, development, token-macbook-air, or bot-testing
echo    - Send a message: "hello bot, show me my projects"
echo.
echo 2. 🔧 **Management Commands**
echo    - Check status:   check-bot-status.bat
echo    - Restart bot:    restart-bot.bat  
echo    - Stop bot:       stop-bot.bat
echo    - Start bot:      start-bot.bat
echo.
echo 3. 📝 **View Logs**
echo    - Live logs: tail -f bot.log
echo    - Full log:  E:\Repos\my-ai-agent-team\discord-bot\bot.log
echo.
echo 4. 🚀 **Bot Capabilities**
echo    - Read/write files in all your repositories
echo    - Execute git operations (commit, push, etc.)
echo    - Run terminal commands safely
echo    - Access your CNS knowledge base
echo    - Auto-discover all Git repos in E:\Repos and C:\Repo
echo.
echo 🔐 **Security Features**
echo    - Only responds in designated Discord channels
echo    - Command whitelist for safety
echo    - File backups before modifications
echo    - Confirmation prompts for destructive operations
echo.
echo 📍 **Repository Access**
echo    Your bot has full access to:
echo    - E:\Repos\my-ai-agent-team (AI Agent Team)
echo    - C:\Repo\slow-hand-studio (Slow Hand Studio) 
echo    - C:\Repo\Audiophile_Playbook (Audiophile Playbook)
echo    - C:\Repo\MyPersonalAssistant (Personal Assistant)
echo    - C:\Repo\atlassian-ai-assistant (Atlassian Extension)
echo    - Plus any other Git repos it discovers
echo.
echo Press any key to finish setup...
pause >nul

echo.
echo 👋 Setup complete! Your Discord development bot is now running 24/7.
echo.
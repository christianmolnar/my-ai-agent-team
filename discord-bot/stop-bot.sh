#!/bin/bash
# Stop Discord bot

BOT_DIR="/Users/christian/Repos/slow-hand-studio/discord-bot"
PID_FILE="$BOT_DIR/bot.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "Stopping bot (PID: $PID)..."
        kill "$PID"
        rm "$PID_FILE"
        echo "✅ Bot stopped"
    else
        echo "⚠️  Bot not running (PID $PID not found)"
        rm "$PID_FILE"
    fi
else
    echo "⚠️  No PID file found. Checking for running bot processes..."
    pkill -f "discord-bot/bot.py" && echo "✅ Bot stopped" || echo "No bot process found"
fi

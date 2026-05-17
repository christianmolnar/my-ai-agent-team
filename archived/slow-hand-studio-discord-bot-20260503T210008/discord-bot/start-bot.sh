#!/bin/bash
# Start Discord bot in background with logging

BOT_DIR="/Users/christian/Repos/slow-hand-studio/discord-bot"
LOG_FILE="$BOT_DIR/bot.log"
PID_FILE="$BOT_DIR/bot.pid"

cd "$BOT_DIR"

# Kill existing bot if running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "Stopping existing bot (PID: $OLD_PID)..."
        kill "$OLD_PID"
        sleep 2
    fi
    rm "$PID_FILE"
fi

# Start bot in background
echo "Starting Discord bot..."
nohup python3 bot.py >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

echo "✅ Bot started with PID: $(cat $PID_FILE)"
echo "📝 Logs: tail -f $LOG_FILE"

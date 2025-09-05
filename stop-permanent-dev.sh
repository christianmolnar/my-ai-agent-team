#!/bin/bash

# AI Agent Team - Stop Permanent Development Services
echo "🛑 Stopping AI Agent Team permanent development services..."

# Stop PM2 process
echo "⏹️ Stopping Next.js app..."
pm2 stop ai-agent-team
pm2 delete ai-agent-team

echo ""
echo "✅ All services stopped!"
echo "💡 To start again, run: ./start-permanent-dev.sh"
echo "🌐 Or use: ./dev-manager.sh start"

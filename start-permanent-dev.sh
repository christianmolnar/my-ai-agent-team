#!/bin/bash

# AI Agent Team - Permanent Local Development Startup Script
echo "🚀 Starting AI Agent Team in permanent development mode..."

# Navigate to project directory
cd /Users/christian/Repos/My-AI-Agent-Team

# Stop any existing PM2 processes
echo "🛑 Stopping existing processes..."
pm2 stop ai-agent-team 2>/dev/null || true
pm2 delete ai-agent-team 2>/dev/null || true

# Start the Next.js app with PM2
echo "⚡ Starting Next.js app with PM2..."
pm2 start ecosystem.config.js

# Show status
echo ""
echo "✅ AI Agent Team is now running permanently!"
echo "📍 Access your app at: http://localhost:30000"
echo "🔑 API Status page: http://localhost:30000/api-status"
echo "📊 PM2 dashboard: pm2 monit"
echo "📝 View logs: pm2 logs ai-agent-team"
echo ""
echo "🎯 Your app will automatically restart if it crashes"
echo "🔄 Service will start automatically with PM2 if configured"
echo ""
echo "💡 Quick commands:"
echo "   ./dev-manager.sh open        - Open app in browser"
echo "   ./dev-manager.sh api-status  - Open API status page"
echo "   ./dev-manager.sh status      - Check status"

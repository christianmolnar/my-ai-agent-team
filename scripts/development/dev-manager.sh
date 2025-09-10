#!/bin/bash

# AI Agent Team - Development Environment Manager
echo "🎯 AI Agent Team Development Environment Manager"
echo "=============================================="

case "$1" in
    start)
        echo "🚀 Starting permanent development environment..."
        ./start-permanent-dev.sh
        ;;
    stop)
        echo "🛑 Stopping development environment..."
        ./stop-permanent-dev.sh
        ;;
    restart)
        echo "🔄 Restarting development environment..."
        ./stop-permanent-dev.sh
        sleep 2
        ./start-permanent-dev.sh
        ;;
    status)
        echo "📊 Current Status:"
        echo ""
        echo "PM2 Processes:"
        pm2 list
        echo ""
        echo "🌐 App URL: http://localhost:30000"
        echo "🌐 API Status: http://localhost:30000/api-status"
        if lsof -i :30000 > /dev/null 2>&1; then
            echo "✅ App is running and accessible"
        else
            echo "❌ App is not responding on port 30000"
        fi
        ;;
    logs)
        echo "📝 Showing application logs..."
        pm2 logs ai-agent-team
        ;;
    monitor)
        echo "📊 Opening PM2 monitor..."
        pm2 monit
        ;;
    open)
        echo "🌐 Opening AI Agent Team in browser..."
        open http://localhost:30000
        ;;
    api-status)
        echo "🔑 Opening API Status page..."
        open http://localhost:30000/api-status
        ;;
    install-autostart)
        echo "⚙️ Installing auto-start on boot..."
        cp /Users/christian/Repos/My-AI-Agent-Team/com.christian.ai-agent-team.plist ~/Library/LaunchAgents/
        launchctl load ~/Library/LaunchAgents/com.christian.ai-agent-team.plist
        echo "✅ Auto-start installed! The app will start automatically on boot."
        ;;
    remove-autostart)
        echo "🗑️ Removing auto-start..."
        launchctl unload ~/Library/LaunchAgents/com.christian.ai-agent-team.plist 2>/dev/null || true
        rm -f ~/Library/LaunchAgents/com.christian.ai-agent-team.plist
        echo "✅ Auto-start removed."
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|monitor|open|api-status|install-autostart|remove-autostart}"
        echo ""
        echo "Commands:"
        echo "  start              - Start the development environment"
        echo "  stop               - Stop the development environment"  
        echo "  restart            - Restart the development environment"
        echo "  status             - Show current status"
        echo "  logs               - Show application logs"
        echo "  monitor            - Open PM2 monitoring dashboard"
        echo "  open               - Open app in browser"
        echo "  api-status         - Open API status page in browser"
        echo "  install-autostart  - Auto-start on system boot"
        echo "  remove-autostart   - Remove auto-start"
        echo ""
        echo "🌐 Quick access: http://localhost:30000"
        exit 1
        ;;
esac

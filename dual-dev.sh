#!/bin/bash

# AI Agent Team - Dual Branch Development Manager
# Manages stable (main) and development branches on different ports

PROJECT_DIR="/Users/christian/Repos/My-AI-Agent-Team"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[DUAL-DEV]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start stable version (main branch, port 30000)
start_stable() {
    print_status "Starting stable version (main branch on port 30000)..."
    
    cd "$PROJECT_DIR"
    
    # Check if port 30000 is already in use
    if check_port 30000; then
        print_warning "Port 30000 is already in use. Stopping existing process..."
        pkill -f "PORT=30000"
        sleep 2
    fi
    
    # Switch to main branch
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        print_status "Switching to main branch..."
        git stash push -m "Auto-stash before switching to main"
        git checkout main
        git pull origin main
    fi
    
    # Install dependencies
    npm install
    
    # Start stable version in background
    print_status "Starting stable server..."
    PORT=30000 npm run dev > logs/stable.log 2>&1 &
    echo $! > .stable.pid
    
    sleep 3
    if check_port 30000; then
        print_success "Stable version started on http://localhost:30000"
        print_status "Logs: tail -f logs/stable.log"
    else
        print_error "Failed to start stable version"
    fi
}

# Function to start development version (development branch, port 40000)
start_development() {
    print_status "Starting development version (development branch on port 40000)..."
    
    cd "$PROJECT_DIR"
    
    # Check if port 40000 is already in use
    if check_port 40000; then
        print_warning "Port 40000 is already in use. Stopping existing process..."
        pkill -f "PORT=40000"
        sleep 2
    fi
    
    # Check if development branch exists, create if not
    if ! git show-ref --verify --quiet refs/heads/development; then
        print_status "Development branch doesn't exist. Creating it..."
        git checkout -b development
        git push -u origin development
    else
        current_branch=$(git branch --show-current)
        if [ "$current_branch" != "development" ]; then
            print_status "Switching to development branch..."
            git stash push -m "Auto-stash before switching to development"
            git checkout development
            git pull origin development
        fi
    fi
    
    # Install dependencies
    npm install
    
    # Start development version in background
    print_status "Starting development server..."
    PORT=40000 npm run dev > logs/development.log 2>&1 &
    echo $! > .development.pid
    
    sleep 3
    if check_port 40000; then
        print_success "Development version started on http://localhost:40000"
        print_status "Logs: tail -f logs/development.log"
    else
        print_error "Failed to start development version"
    fi
}

# Function to stop processes
stop_stable() {
    print_status "Stopping stable version..."
    if [ -f .stable.pid ]; then
        kill $(cat .stable.pid) 2>/dev/null
        rm .stable.pid
    fi
    pkill -f "PORT=30000" 2>/dev/null
    print_success "Stable version stopped"
}

stop_development() {
    print_status "Stopping development version..."
    if [ -f .development.pid ]; then
        kill $(cat .development.pid) 2>/dev/null
        rm .development.pid
    fi
    pkill -f "PORT=40000" 2>/dev/null
    print_success "Development version stopped"
}

# Function to show status
show_status() {
    echo "🎯 Dual Development Environment Status"
    echo "======================================"
    echo
    
    # Check stable version
    if check_port 30000; then
        print_success "Stable (main):    ✅ Running on http://localhost:30000"
    else
        print_warning "Stable (main):    ❌ Not running"
    fi
    
    # Check development version
    if check_port 40000; then
        print_success "Development:      ✅ Running on http://localhost:40000"
    else
        print_warning "Development:      ❌ Not running"
    fi
    
    echo
    print_status "Current git branch: $(git branch --show-current)"
    
    # Show git status if there are changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Uncommitted changes detected:"
        git status --porcelain
    fi
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Main script logic
echo "🎯 AI Agent Team - Dual Branch Development Manager"
echo "================================================="

case "$1" in
    "start-stable")
        start_stable
        ;;
    "start-dev")
        start_development
        ;;
    "start-both")
        print_status "Starting both environments..."
        start_stable
        sleep 3
        start_development
        echo
        show_status
        ;;
    "stop-stable")
        stop_stable
        ;;
    "stop-dev")
        stop_development
        ;;
    "stop-all")
        stop_stable
        stop_development
        print_success "All development servers stopped"
        ;;
    "status")
        show_status
        ;;
    "switch-stable")
        print_status "Switching to stable environment..."
        git checkout main
        print_success "Switched to main branch"
        print_status "Stable app: http://localhost:30000"
        ;;
    "switch-dev")
        print_status "Switching to development environment..."
        git checkout development 2>/dev/null || {
            print_status "Creating development branch..."
            git checkout -b development
            git push -u origin development
        }
        print_success "Switched to development branch"
        print_status "Development app: http://localhost:40000"
        ;;
    "restart-stable")
        stop_stable
        sleep 2
        start_stable
        ;;
    "restart-dev")
        stop_development
        sleep 2
        start_development
        ;;
    "logs-stable")
        print_status "Showing stable logs..."
        tail -f logs/stable.log
        ;;
    "logs-dev")
        print_status "Showing development logs..."
        tail -f logs/development.log
        ;;
    "create-dev-branch")
        print_status "Creating development branch from current state..."
        git checkout -b development
        git push -u origin development
        print_success "Development branch created and pushed to remote"
        ;;
    *)
        echo "Usage: $0 {command}"
        echo
        echo "🚀 Starting Services:"
        echo "  start-stable      - Start stable version (main branch) on port 30000"
        echo "  start-dev         - Start development version (dev branch) on port 40000"
        echo "  start-both        - Start both versions simultaneously"
        echo
        echo "🛑 Stopping Services:"
        echo "  stop-stable       - Stop stable version"
        echo "  stop-dev          - Stop development version"
        echo "  stop-all          - Stop both versions"
        echo
        echo "🔄 Management:"
        echo "  restart-stable    - Restart stable version"
        echo "  restart-dev       - Restart development version"
        echo "  status            - Show status of both environments"
        echo
        echo "📝 Logs:"
        echo "  logs-stable       - Show stable version logs"
        echo "  logs-dev          - Show development version logs"
        echo
        echo "🌿 Git Branch Management:"
        echo "  switch-stable     - Switch git to main branch"
        echo "  switch-dev        - Switch git to development branch"
        echo "  create-dev-branch - Create development branch from current state"
        echo
        echo "🎯 Quick Access:"
        echo "  Stable:      http://localhost:30000"
        echo "  Development: http://localhost:40000"
        echo
        exit 1
        ;;
esac

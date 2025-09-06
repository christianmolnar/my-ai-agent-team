# 🔄 Dual Branch Development Workflow

## Overview
This workflow allows you to run two versions of your AI Agent Team simultaneously:
- **Stable Version**: Main branch on `http://localhost:30000`
- **Development Version**: Development branch on `http://localhost:40000`

## Initial Setup

### 1. Create Development Branch
```bash
# From main branch, create development branch
./dual-dev.sh create-dev-branch
```

### 2. Start Both Environments
```bash
# Start both stable and development versions
./dual-dev.sh start-both
```

## Daily Development Workflow

### 🚀 **Starting Your Day**
```bash
# Check status
./dual-dev.sh status

# Start both if needed
./dual-dev.sh start-both
```

### 💻 **During Development**
```bash
# Work on development branch
./dual-dev.sh switch-dev

# Make your changes, test on http://localhost:40000
# Stable version remains running on http://localhost:30000

# View development logs
./dual-dev.sh logs-dev
```

### 🧪 **Testing Changes**
```bash
# Development: http://localhost:40000 (your changes)
# Stable:      http://localhost:30000 (known good version)

# Compare behavior between versions
# Test new features on development port
```

### ✅ **When Ready to Promote**
```bash
# Switch to development branch
./dual-dev.sh switch-dev

# Commit your changes
git add .
git commit -m "Add feature: XYZ"
git push origin development

# Switch to main branch
./dual-dev.sh switch-stable

# Merge development into main
git merge development
git push origin main

# Restart stable version with new changes
./dual-dev.sh restart-stable
```

## Common Commands

### Service Management
```bash
./dual-dev.sh start-stable     # Start stable only
./dual-dev.sh start-dev        # Start development only
./dual-dev.sh start-both       # Start both
./dual-dev.sh stop-all         # Stop everything
./dual-dev.sh status           # Check what's running
```

### Development Workflow
```bash
./dual-dev.sh switch-dev       # Switch to development branch
./dual-dev.sh switch-stable    # Switch to main branch
./dual-dev.sh logs-dev         # View development logs
./dual-dev.sh restart-dev      # Restart development server
```

## Port Reference
- **Port 30000**: Stable version (main branch)
- **Port 40000**: Development version (development branch)

## Benefits

### ✅ **Stability**
- Always have a working version running
- Can demo stable features while developing new ones
- Quick rollback if development breaks

### ✅ **Testing**
- Compare new features against stable baseline
- Test integrations between stable and new features
- Validate performance improvements

### ✅ **Continuous Development**
- No downtime during development
- Can work on multiple features in parallel
- Safe experimentation environment

## Emergency Commands

### 🚨 **If Development Breaks**
```bash
# Stop broken development version
./dual-dev.sh stop-dev

# Switch back to stable
./dual-dev.sh switch-stable

# Reset development branch to main
git checkout development
git reset --hard main
git push -f origin development

# Restart development
./dual-dev.sh start-dev
```

### 🚨 **If Ports Conflict**
```bash
# Kill all Next.js processes
pkill -f "next dev"

# Restart clean
./dual-dev.sh start-both
```

## Branch Protection Rules

### Main Branch (Stable)
- Only merge tested, working code
- Always deployable
- Protected from direct pushes in production

### Development Branch
- Experimental features
- Work in progress
- Can be reset/rebased as needed

## Tips

### 🎯 **Best Practices**
- Commit frequently to development branch
- Test on development port before merging
- Keep main branch always working
- Use descriptive commit messages

### 🔧 **Troubleshooting**
- Check logs with `./dual-dev.sh logs-dev` or `./dual-dev.sh logs-stable`
- Use `./dual-dev.sh status` to see what's running
- Browser cache can cause confusion - use different browsers or incognito

### 📝 **Development Notes**
- API changes require restart of the respective server
- Frontend changes hot-reload automatically
- Database/environment changes may need both servers restarted

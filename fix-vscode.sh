#!/bin/bash

echo "🔧 VS Code Recovery Script"
echo "=========================="

# Clear TypeScript caches
echo "1. Clearing TypeScript cache..."
rm -f tsconfig.tsbuildinfo
rm -rf .next/cache

# Clear VS Code workspace settings that might reference old files
echo "2. Clearing VS Code temp files..."
find .vscode -name "*.log" -delete 2>/dev/null || true

# Check for any remaining old file references
echo "3. Checking for old file references..."
if grep -r "BackEndDeveloperAgent\.ts" . --exclude-dir=node_modules --exclude-dir=.git --exclude="fix-vscode.sh" 2>/dev/null; then
    echo "❌ Found old file references - these need to be updated"
else
    echo "✅ No old file references found"
fi

# Verify renamed files exist
echo "4. Verifying renamed files..."
RENAMED_FILES=(
    "agents/back-end-developer-agent.ts"
    "agents/communications-agent.ts" 
    "agents/data-scientist-agent.ts"
    "agents/front-end-developer-agent.ts"
    "agents/master-orchestrator-agent.ts"
    "agents/project-coordinator-agent.ts"
    "agents/researcher-agent.ts"
)

for file in "${RENAMED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Quick TypeScript check
echo "5. Running TypeScript check..."
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    echo "✅ TypeScript compilation passes"
else
    echo "❌ TypeScript compilation failed"
    echo "Running with details..."
    npx tsc --noEmit --skipLibCheck
fi

echo ""
echo "🎯 RECOMMENDED ACTIONS:"
echo "1. Close VS Code completely (⌘+Q)"
echo "2. Wait 5 seconds"
echo "3. Reopen VS Code"
echo "4. Open the renamed file: agents/back-end-developer-agent.ts"
echo "5. Run TypeScript: Restart TS Server (⌘+⇧+P)"

#!/bin/bash

# AI Agent Team - Environment Validation Script
# Validates your existing .env.local configuration

set -e

echo "🚀 AI Agent Team Environment Validation"
echo "======================================"

# Check if .env.local file exists (the file actually being used)
ENV_LOCAL_FILE=".env.local"

if [ ! -f "$ENV_LOCAL_FILE" ]; then
    echo "❌ No .env.local file found. This file is required for the AI Agent Team."
    echo ""
    echo "🔧 Please create .env.local with your API keys"
    echo "📖 See SETUP-API-KEYS.md for detailed instructions"
    exit 1
else
    echo "✅ Found existing .env.local file"
fi

# Check Node.js version
echo ""
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "   Node.js version: $NODE_VERSION"

# Check if dependencies are installed
echo ""
echo "🔍 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Test API key configuration
echo ""
echo "🧪 Testing API key configuration..."
npx tsx config/test-api-config.ts

echo ""
echo "🎯 Validation Summary:"
echo "====================="
echo "✅ Environment file: $ENV_LOCAL_FILE (✅ CORRECT FILE)"
echo "✅ Dependencies: Installed"
echo "✅ Configuration: Check output above"
echo ""
echo "📖 To add Reviewer Agent API keys:"
echo "   1. Edit .env.local"
echo "   2. Uncomment the REVIEWER_* lines at the bottom"
echo "   3. Add your Anthropic/OpenAI keys"
echo "   4. Run: npm run test:config"
echo ""
echo "🚀 System ready for AI Agent Team!"

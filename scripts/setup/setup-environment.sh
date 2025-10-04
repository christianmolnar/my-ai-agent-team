#!/bin/bash

# AI Agent Team - Environment Setup Script
# This script helps configure API keys and validate the environment

set -e

echo "🚀 AI Agent Team Environment Setup"
echo "=================================="

# Check if .env.local or .env file exists
ENV_FILE=".env"
ENV_LOCAL_FILE=".env.local"
ENV_EXAMPLE=".env.example"

# Determine which environment file to use
if [ -f "$ENV_LOCAL_FILE" ]; then
    echo "✅ Found existing .env.local file with agent-specific API keys"
    ENV_FILE="$ENV_LOCAL_FILE"
elif [ -f "$ENV_FILE" ]; then
    echo "✅ Found existing .env file"
else
    echo "⚠️  No environment file found. Creating from template..."
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "✅ Created $ENV_FILE from template"
    echo ""
    echo "🔑 IMPORTANT: Please edit .env and add your API keys:"
    echo "   - OPENAI_API_KEY (required)"
    echo "   - ANTHROPIC_API_KEY (required)"
    echo "   - Other keys as needed"
    echo ""
    echo "📖 See SETUP-API-KEYS.md for detailed instructions"
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
echo "🎯 Setup Summary:"
echo "=================="
echo "✅ Environment file: $ENV_FILE"
echo "✅ Dependencies: Installed"
echo "✅ Configuration: Check output above"
echo ""
echo "📖 Next steps:"
echo "   1. Edit .env with your API keys"
echo "   2. Run: npm run test:config"
echo "   3. Run: npm run dev"
echo ""
echo "🚀 Ready to proceed with AI Agent Team!"

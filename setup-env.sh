#!/bin/bash

# =============================================================================
# AI Agent Team - Environment Setup Script
# =============================================================================
# This script helps you set up your environment variables for the AI Agent Team

echo "🤖 AI Agent Team - Environment Setup"
echo "=================================="
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists!"
    echo "   Do you want to:"
    echo "   1. Backup existing and create new"
    echo "   2. Keep existing (abort setup)"
    echo ""
    read -p "Enter your choice (1 or 2): " choice
    
    if [ "$choice" = "1" ]; then
        echo "📁 Backing up existing .env.local to .env.local.backup..."
        cp .env.local .env.local.backup
        echo "✅ Backup created"
    else
        echo "🛑 Setup aborted - keeping existing .env.local"
        exit 0
    fi
fi

# Copy template to .env.local
echo "📋 Copying .env.local.template to .env.local..."
cp .env.local.template .env.local

echo ""
echo "✅ Environment file created!"
echo ""
echo "🔑 Next Steps - Add Your API Keys:"
echo "================================="
echo ""
echo "Required for current functionality:"
echo "1. OpenAI API Key (absolutely required)"
echo "   - Get from: https://platform.openai.com/api-keys"
echo "   - Used by: All current agents (ResearcherAgent, FactChecker, VinylResearcher)"
echo ""
echo "2. Google Fact Check API Key (for fact checking)"
echo "   - Get from: https://developers.google.com/fact-check/tools/api"
echo "   - Used by: FactCheckerIntegration"
echo ""
echo "3. SerpAPI Key (for search functionality)"
echo "   - Get from: https://serpapi.com/dashboard"
echo "   - Used by: ResearcherAgent, VinylResearcherAgent"
echo ""
echo "Optional for Phase 4 (CNS Development Team):"
echo "4. Anthropic API Key - https://console.anthropic.com/"
echo "5. Google AI API Key - https://makersuite.google.com/app/apikey"
echo "6. Meta Llama API Key - Various providers (Together AI, Replicate, etc.)"
echo ""
echo "📝 Edit .env.local with your actual API keys:"
echo "   nano .env.local    (or use your preferred editor)"
echo ""
echo "🚀 After adding your keys, restart the development server:"
echo "   npm run dev"
echo ""
echo "🧪 Test your agents at: http://localhost:3000"
echo ""
echo "📚 For more information, see the .env.local.template file comments"

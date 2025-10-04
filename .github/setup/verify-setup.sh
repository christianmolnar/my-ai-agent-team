#!/bin/bash

# 🔍 AI Agent Team - Complete Setup Verification Script
# Comprehensive verification of all system components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 AI Agent Team - Complete Setup Verification${NC}"
echo -e "${BLUE}==============================================${NC}"
echo ""

# Check if running from correct directory
if [ ! -f ".github/copilot-instructions.md" ]; then
    echo -e "${RED}❌ Error: Run this script from the repository root directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Repository structure: OK${NC}"

# Check dependencies
echo ""
echo -e "${BLUE}📦 Checking dependencies...${NC}"
if command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo -e "${GREEN}✅ Node.js and npm: OK${NC}"
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ Dependencies installed: OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Dependencies not installed - run: npm install${NC}"
    fi
else
    echo -e "${RED}❌ Node.js or npm not found${NC}"
fi

# Check environment
echo ""
echo -e "${BLUE}🔧 Checking environment...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists: OK${NC}"
    if grep -q "ANTHROPIC_API_KEY=your_claude_api_key_here\|ANTHROPIC_API_KEY=$" .env.local; then
        echo -e "${YELLOW}⚠️  Claude API key not configured (Personal Assistant won't work)${NC}"
    else
        echo -e "${GREEN}✅ Claude API key configured: OK${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.local not found - copy from .env.example${NC}"
fi

# Check CNS structure
echo ""
echo -e "${BLUE}🧠 Checking GitHub Copilot CNS structure...${NC}"
if [ -d ".github/copilot-cns/brain" ] && [ -d ".github/copilot-cns/memory" ] && [ -d ".github/copilot-cns/reflexes" ]; then
    echo -e "${GREEN}✅ CNS directories: OK${NC}"
    
    # Check for learning frameworks
    if [ -f ".github/copilot-cns/brain/orchestration-learning-framework.md" ]; then
        echo -e "${GREEN}✅ Orchestration learning framework: OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Orchestration learning framework missing${NC}"
    fi
    
    if [ -f ".github/copilot-cns/brain/validation-learning-framework.md" ]; then
        echo -e "${GREEN}✅ Validation learning framework: OK${NC}"
    else
        echo -e "${YELLOW}⚠️  Validation learning framework missing${NC}"
    fi
else
    echo -e "${RED}❌ CNS directories missing${NC}"
fi

# Check agents
echo ""
echo -e "${BLUE}🤖 Checking agent system...${NC}"
if [ -d "agents" ]; then
    agent_count=$(find agents -name "*.ts" -type f | wc -l)
    echo -e "${GREEN}✅ Found $agent_count agent files: OK${NC}"
    
    if [ -f "agents/personal-assistant.ts" ]; then
        echo -e "${GREEN}✅ Personal Assistant agent: OK${NC}"
    else
        echo -e "${RED}❌ Personal Assistant agent missing${NC}"
    fi
else
    echo -e "${RED}❌ Agents directory missing${NC}"
fi

# Check build
echo ""
echo -e "${BLUE}🏗️ Checking build process...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful: OK${NC}"
else
    echo -e "${RED}❌ Build failed - check for TypeScript errors${NC}"
fi

echo ""
echo -e "${BLUE}📋 Setup verification complete!${NC}"

# AI Agent Team - Universal Multi-Model System

🚀 **Complete Universal AI Model Access System with centralized configuration where every agent can access every AI model**

## 🎯 Project Status

**Phase 1: ✅ COMPLETE** - Bare bones foundation established  
**Phase 2: ✅ COMPLETE** - Agent file transfer completed  
**Phase 3: ✅ COMPLETE** - Major cleanup (47,729 lines removed!)  
**Phase 4: ✅ COMPLETE** - Universal AI Model Access System implemented

## 🔑 Universal AI Model Access

### Every Agent → Every Model
- **15+ AI models** from 6 major providers accessible to all agents
- **Intelligent routing** based on task requirements
- **Automatic fallback** strategies for reliability
- **Cost optimization** through smart model selection

### Supported Providers & Models
- **OpenAI**: GPT-4, GPT-3.5, Embeddings, Whisper, TTS, DALL-E
- **Anthropic**: Claude-3 (Opus, Sonnet, Haiku)
- **Google AI**: Gemini Pro, Gemini Vision
- **Meta**: Llama-2, Code Llama (via Together AI)
- **Specialized**: Stability AI, Cohere, Perplexity

## � Quick Start

### 1. Environment Configuration

```bash
# Run the automated setup script
./setup-env.sh

# Or manually copy the template
cp .env.local.template .env.local
# Then edit .env.local with your actual API keys
```

### 2. API Key Tiers

**Minimum (Basic Functionality):**
- **OPENAI_API_KEY** - Core functionality for all agents

**Recommended (Full Capabilities):**
- **ANTHROPIC_API_KEY** - Advanced reasoning and analysis
- **GOOGLE_AI_API_KEY** - Multimodal tasks and vision
- **SERPAPI_KEY** - Search functionality

**Optional (Specialized Tasks):**
- **TOGETHER_AI_API_KEY** - Open-source Llama models
- **STABILITY_AI_API_KEY** - Advanced image generation
- **COHERE_API_KEY** - Specialized embeddings
- **PERPLEXITY_API_KEY** - Real-time research

### 3. Start Development

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

## 🤖 Current Agents

### Active Agents (3)
1. **Vinyl Researcher** - Music database research with intelligent model selection
2. **Image Generator** - AI-powered image creation using multiple providers  
3. **Fact Checker** - Real-time verification with multi-model fallback

### Universal Access
**All agents can now access any AI model through the centralized system!**

## 🎯 Universal AI Features

### Intelligent Model Selection
```typescript
// Automatic best-model selection
const response = await universalAI.query({
  prompt: "Analyze this complex problem",
  taskRequirements: {
    type: 'reasoning',
    complexity: 'complex',
    budget: 'medium',
    speed: 'quality'
  }
});
// Automatically selects: anthropic-claude3-opus
```

### Task-Optimized Routing
- **Reasoning** → Claude-3 Opus (advanced analysis)
- **Code Generation** → Code Llama 34B (specialized coding)
- **Image Creation** → DALL-E 3 or Stability AI
- **Search** → Perplexity (real-time research)
- **Chat** → GPT-3.5 Turbo (cost-effective)

### Fallback Strategies
```typescript
// Automatic fallback if primary model fails
Primary: anthropic-claude3-opus
↓ (if unavailable)
Fallback 1: openai-gpt4
↓ (if unavailable)  
Fallback 2: google-gemini-pro
```

## 📊 System Status

### Configuration Dashboard
Visit `/api-status` to view:
- **Model availability** across all providers
- **Capability coverage** (chat, reasoning, code, image, etc.)
- **Cost tier distribution** and optimization
- **Real-time API testing** with detailed results

### Usage Patterns
- **Performance Strategy** - Prioritizes highest-capability models
- **Cost Strategy** - Optimizes for lower-cost options  
- **Balanced Strategy** - Balances cost, performance, and capabilities

## 🏗️ Architecture

### Central Model Registry
```typescript
// Single source of truth for all AI models
CENTRAL_AI_REGISTRY['openai-gpt4'] = {
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  capabilities: ['chat', 'reasoning', 'code'],
  costTier: 'high',
  maxTokens: 32768
  // ... full configuration
}
```

### Universal Client
```typescript
import { universalAI, chat, reason, generateCode } from './lib/universal-ai-client';

// Simple usage
const response = await chat("Explain quantum computing");

// Advanced usage with specific model
const result = await universalAI.query({
  model: 'anthropic-claude3-opus',
  prompt: "Complex analysis needed"
});
```

## 🏗️ Infrastructure

### Core Technologies
- **Framework**: Next.js 15.3.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build**: Static generation optimized
- **Deployment**: Vercel-ready

### Project Structure
```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Foundation status page
│   ├── globals.css        # Global styles
│   └── api/               # API routes (prepared)
├── components/            # React components
├── lib/                   # Shared utilities
├── types/                 # TypeScript definitions
├── database/              # Database schema
├── framework/             # Shared framework
├── shared/                # Area templates
└── AI-Agent-Team-Document-Library/  # Migration plans
```

## 📋 Migration Plan

This repository is the result of a surgical migration from a bloated codebase to create a clean, focused AI Agent Team foundation.

### Completed Phases
- **Phase 1**: ✅ Bare bones foundation (18,670 lines removed!)

### Upcoming Phases
- **Phase 2**: Agent file transfer from private repository
- **Phase 3**: Clean up and optimization
- **Phase 4**: Framework integration (CNS)
- **Phase 5**: 18-agent hierarchy implementation

## 🎯 Target Agent Architecture

### Management Tier
1. **Master Orchestrator** - Strategic oversight
2. **Project Coordinator** - Detailed planning

### Specialized Functions
3. **Communications Agent** - Writing & documentation
4. **Researcher Agent** - Research & fact-checking
5. **Image Generator Agent** - Visual content creation

*[Full 18-agent roster in documentation]*

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Deployment
- **Vercel**: Optimized for zero-config deployment
- **Build**: Static generation for maximum performance
- **Environment**: Template included (.env.local.template)

## 📚 Documentation

- **Migration Plan**: `AI-Agent-Team-Document-Library/AGENT-TEAM-MIGRATION-PLAN.md`
- **Agent Structure**: `AI-Agent-Team-Document-Library/AGENT-TEAM-STRUCTURE-DEFINITION.md`
- **Framework Docs**: `framework/docs/`

## 🎨 Current Status

Visit the live foundation at: **[Deployment URL will be here]**

The current page shows:
- ✅ Infrastructure status
- 🔄 Test functionality
- 📊 Migration progress

---

**Next**: Phase 2 agent implementation begins! 🚀

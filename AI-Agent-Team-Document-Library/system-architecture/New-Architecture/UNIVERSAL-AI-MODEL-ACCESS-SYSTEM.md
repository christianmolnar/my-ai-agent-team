# Universal AI Model Access System

## 🎯 Overview

The AI Agent Team now features a **Universal AI Model Access System** where every agent can access every AI model through a centralized configuration hub. This provides maximum flexibility, intelligent model selection, and robust fallback strategies.

## 🏗️ Architecture

### Central Model Registry
- **Single source of truth** for all AI models and providers
- **Unified interface** for accessing any model from any agent
- **Intelligent routing** based on task requirements
- **Automatic fallback** strategies for reliability

### Multi-Provider Support
- **OpenAI**: GPT-4, GPT-3.5, Embeddings, Whisper, TTS, DALL-E
- **Anthropic**: Claude-3 (Opus, Sonnet, Haiku)
- **Google AI**: Gemini Pro, Gemini Vision
- **Meta**: Llama-2, Code Llama (via Together AI)
- **Specialized**: Stability AI, Cohere, Perplexity

## 🔧 Implementation

### 1. Central Configuration (`agents/ai_config.ts`)
```typescript
import { CENTRAL_AI_REGISTRY, selectOptimalModel } from './agents/ai_config';

// Every model with full metadata
const config = CENTRAL_AI_REGISTRY['openai-gpt4'];
// Returns: { provider, apiKey, endpoint, models, capabilities, costTier, etc. }

// Intelligent model selection
const selection = selectOptimalModel({
  type: 'reasoning',
  complexity: 'complex',
  budget: 'medium',
  speed: 'quality'
});
// Returns: { primary: 'anthropic-claude3-opus', fallback: ['openai-gpt4', ...] }
```

### 2. Universal AI Client (`lib/universal-ai-client.ts`)
```typescript
import { universalAI, chat, reason, generateCode } from './lib/universal-ai-client';

// Simple usage
const response = await chat("Explain quantum computing");

// Advanced usage with specific requirements
const result = await universalAI.query({
  prompt: "Analyze this data",
  taskRequirements: {
    type: 'reasoning',
    complexity: 'complex',
    budget: 'high',
    speed: 'quality'
  },
  enableFallback: true,
  maxRetries: 3
});
```

### 3. Agent Integration
Any agent can now access any model:

```typescript
// In any agent file
import { universalAI } from '../lib/universal-ai-client';

// Let the system choose the best model
const analysis = await universalAI.query({
  prompt: userInput,
  taskRequirements: { type: 'analysis', complexity: 'medium' }
});

// Or specify a model directly
const result = await universalAI.query({
  prompt: userInput,
  model: 'anthropic-claude3-opus'
});
```

## 🔑 Environment Configuration

### Complete API Key Setup
```bash
# Core Models (Required)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key

# Meta Models
TOGETHER_AI_API_KEY=your-together-ai-key
REPLICATE_API_KEY=your-replicate-key
HUGGINGFACE_API_KEY=your-huggingface-key

# Specialized Services
STABILITY_AI_API_KEY=your-stability-key
COHERE_API_KEY=your-cohere-key
PERPLEXITY_API_KEY=your-perplexity-key

# Search & Data
SERPAPI_KEY=your-serpapi-key
TAVILY_API_KEY=your-tavily-key
GOOGLE_FACT_CHECK_API_KEY=your-google-factcheck-key

# Configuration
MODEL_SELECTION_STRATEGY=balanced  # options: performance, cost, balanced
DEFAULT_FALLBACK_MODEL=gpt-3.5-turbo
DEBUG_AGENTS=false
```

### Quick Setup
```bash
./setup-env.sh  # Interactive setup script
```

## 🎯 Intelligent Model Selection

### Selection Strategies
- **Performance**: Prioritizes highest-capability models
- **Cost**: Optimizes for lower-cost options
- **Balanced**: Balances cost, performance, and capabilities

### Task-Based Routing
```typescript
// Automatically selects best model for each task type
const tasks = {
  reasoning: 'anthropic-claude3-opus',     // Complex analysis
  code: 'meta-codellama-34b',              // Code generation
  chat: 'openai-gpt35',                    // General conversation
  image: 'openai-dalle',                   // Image generation
  search: 'perplexity-search',             // Real-time research
  embeddings: 'openai-embeddings'          // Similarity/search
};
```

### Agent-Specific Preferences
```typescript
export const AGENT_MODEL_PREFERENCES = {
  researcher: {
    search: { primary: 'perplexity-search', fallback: ['openai-gpt4'] },
    analysis: { primary: 'anthropic-claude3-sonnet', fallback: ['openai-gpt4'] }
  },
  productManager: {
    strategy: { primary: 'anthropic-claude3-opus', fallback: ['openai-gpt4'] }
  },
  fullStackDeveloper: {
    coding: { primary: 'meta-codellama-34b', fallback: ['openai-gpt4'] }
  }
};
```

## 🔄 Fallback System

### Automatic Fallbacks
1. **Primary model fails** → Try first fallback
2. **First fallback fails** → Try second fallback
3. **All fallbacks fail** → Return error with details

### Fallback Logic
- **API key missing** → Skip to next available model
- **Rate limit hit** → Try different provider
- **Model unavailable** → Use capability-matched alternative

## 📊 Status & Monitoring

### API Status Dashboard
Visit `/api-status` to see:
- **Model availability** by provider
- **Capability coverage** (chat, reasoning, code, etc.)
- **Cost tier distribution**
- **Real-time testing** of API connections

### Programmatic Status
```typescript
import { getAvailableModelsSummary, isModelAvailable } from './agents/ai_config';

const summary = getAvailableModelsSummary();
// Returns: { total: 15, available: 8, by_capability: {...} }

const canUseGPT4 = isModelAvailable('openai-gpt4');
// Returns: boolean
```

## 🚀 Migration Guide

### From Legacy System
```typescript
// OLD: Direct API calls
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [...] })
});

// NEW: Universal client
const response = await universalAI.query({
  messages: [...],
  taskRequirements: { type: 'chat', complexity: 'medium' }
});
```

### Existing Agents
1. **Import universal client**: `import { universalAI } from '../lib/universal-ai-client'`
2. **Replace direct API calls** with `universalAI.query()`
3. **Define task requirements** for intelligent selection
4. **Enable fallback strategies** for reliability

## 🎯 Benefits

### For Developers
- **Single interface** to access all AI models
- **Automatic optimization** based on task requirements
- **Built-in fallback** strategies for reliability
- **Cost optimization** through intelligent routing

### For Agents
- **Access to specialized models** for specific tasks
- **Automatic failover** if primary model unavailable
- **Task-optimized selection** without manual configuration
- **Consistent interface** across all AI providers

### For Users
- **Better performance** through optimal model selection
- **Higher reliability** through fallback systems
- **Cost efficiency** through intelligent routing
- **Future-proof** system that scales with new models

## 🔮 Future Enhancements

### Phase 4 Capabilities
- **CNS Development Team** with specialized model assignments
- **Dynamic load balancing** across providers
- **Usage analytics** and cost tracking
- **Custom model fine-tuning** integration

### Planned Integrations
- **Azure OpenAI** for enterprise deployments
- **AWS Bedrock** for additional model access
- **Local models** for privacy-sensitive tasks
- **Custom endpoints** for self-hosted models

---

**Status**: ✅ Universal AI Model Access System **OPERATIONAL**  
**Next**: Ready for agent implementation and CNS development team deployment

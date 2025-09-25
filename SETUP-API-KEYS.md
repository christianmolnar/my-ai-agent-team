# API Keys Setup Guide

This guide helps you configure API keys for the AI Agent Team system.

## Required API Keys

### 🔑 OpenAI API Key (REQUIRED)
- **Purpose**: GPT models for most agents
- **Get it**: https://platform.openai.com/api-keys
- **Pricing**: Pay-per-use (typically $0.002-0.06 per 1K tokens)
- **Models**: GPT-4, GPT-4-turbo, GPT-3.5-turbo

### 🔑 Anthropic API Key (REQUIRED)  
- **Purpose**: Claude models for alternative validation and high-quality responses
- **Get it**: https://console.anthropic.com/
- **Pricing**: Pay-per-use (typically $0.015-0.075 per 1K tokens)
- **Models**: Claude-3-Opus, Claude-3-Sonnet, Claude-3-Haiku

## Optional API Keys

### 🔑 Google AI API Key (Optional)
- **Purpose**: Gemini models for additional provider diversity
- **Get it**: https://makersuite.google.com/app/apikey
- **Pricing**: Free tier available, then pay-per-use
- **Models**: Gemini-Pro, Gemini-Pro-Vision

### 🔑 Groq API Key (Optional)
- **Purpose**: Ultra-fast inference for time-sensitive tasks
- **Get it**: https://console.groq.com/keys
- **Pricing**: Free tier with generous limits
- **Models**: Llama-2, Mixtral, Gemma

### 🔑 Additional Services (Optional)
- **Replicate**: AI model hosting - https://replicate.com/account/api-tokens
- **ElevenLabs**: Voice synthesis - https://elevenlabs.io/app/settings/api-keys
- **Stability AI**: Image generation - https://platform.stability.ai/account/keys
- **DeepL**: Translation - https://www.deepl.com/pro-api
- **Serper**: Search API - https://serper.dev/api-key
- **Browserless**: Web automation - https://www.browserless.io/

## Setup Instructions

### Option 1: Automatic Setup (Recommended)
```bash
npm run setup
```
This will:
- Create `.env.example` with all available keys
- Copy to `.env` if it doesn't exist
- Test your configuration
- Show next steps

### Option 2: Manual Setup

1. **Create .env file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file**:
   ```bash
   # Required API Keys
   OPENAI_API_KEY=sk-your-openai-key-here
   ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
   
   # Optional API Keys
   GOOGLE_AI_API_KEY=your-google-key-here
   GROQ_API_KEY=your-groq-key-here
   # ... etc
   ```

3. **Test configuration**:
   ```bash
   npm run test:config
   ```

## Verification

Run these tests to verify your setup:

```bash
# Test API configuration
npm run test:config

# Test all systems  
npm run test:all

# Individual tests
npm run test:cns
npm run test:registry
npm run test:orchestrator
```

## Expected Output

✅ **With proper API keys**:
```
🔑 API Key Configuration Test
✅ openai: CONFIGURED (required)
✅ anthropic: CONFIGURED (required)
⚠️ google: MISSING (optional)
🚀 All required API keys configured!
```

❌ **Without API keys**:
```
❌ openai: MISSING (required)
❌ anthropic: MISSING (required)
🔧 Please configure missing API keys
```

## Troubleshooting

### "No API keys configured for agent"
- Check `.env` file exists in project root
- Verify API keys are properly formatted
- Ensure no extra spaces or quotes around keys

### "Invalid API key" errors
- Verify keys are active and have sufficient credits
- Check key hasn't expired
- Test key directly with provider's API

### "Permission denied" errors
- Check API key has necessary permissions
- Verify billing is set up for pay-per-use services
- Some keys may need organization access

## Security Notes

- ⚠️ **Never commit .env to git** (already in .gitignore)
- 🔐 Store API keys securely
- 💰 Monitor usage to avoid unexpected charges
- 🔄 Rotate keys periodically for security

## Cost Management

### Recommended Starting Configuration:
1. **OpenAI**: GPT-3.5-turbo for most tasks ($0.002/1K tokens)
2. **Anthropic**: Claude-3-Haiku for reviews ($0.0008/1K tokens)
3. **Groq**: Free tier for fast tasks

### Cost Optimization Tips:
- Start with required keys only
- Use Groq for fast, simple tasks (free tier)
- Use Claude-3-Haiku for reviews (cheaper than GPT-4)
- Monitor usage through provider dashboards

## Next Steps

Once configured:
1. Run `npm run test:all` to verify everything works
2. Start development: `npm run dev`
3. Test agent execution through the web interface
4. Monitor costs and adjust provider preferences

## Support

If you encounter issues:
1. Check this guide first
2. Run `npm run test:config` for diagnostics
3. Check provider documentation for key format
4. Verify billing and account status with providers

### 🔧 **Need API Keys For Claude Integration**

To fully utilize the Claude integration, add Anthropic API keys for these agents:

**High Priority (Core Functionality):**
```bash
PERSONAL_ASSISTANT_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Medium Priority (Development Team):**
```bash
DEVOPS_ENGINEER_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
QA_ENGINEER_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here  
PROJECT_COORDINATOR_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**Low Priority (Specialized Functions):**
```bash
MUSIC_COACH_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
RESEARCHER_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
CONTENT_CREATOR_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
VINYL_RESEARCHER_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**🎵 Music-Specific API Keys (Configuration Required):**
```bash
# 🔑 REQUIRED: Hugging Face for AI piano transcription
MUSIC_COACH_HUGGINGFACE_API_KEY=hf_your-huggingface-token-here

# Optional: Enhanced piano transcription services
# MUSIC_COACH_KLANGIO_API_KEY=     # $99/month - professional transcription
# MUSIC_COACH_LATOUCHE_API_KEY=    # €0.15-1.00/song - cost-effective option

# Free services (no API key required):
# - UberChord API (guitar chords)
# - Songsterr API (guitar tabs) 
# - Basic piano transcription
```

## 🚀 **Quick Start**

### Step 1: Add Personal Assistant Key
```bash
# Edit /Users/christian/Repos/My-AI-Agent-Team/.env.local
PERSONAL_ASSISTANT_ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

### Step 2: Test the Integration
```bash
cd /Users/christian/Repos/My-AI-Agent-Team
npm run verify-claude
```

### Step 3: Start Using Agents
```typescript
// Example: Using Personal Assistant Agent
const agent = new PersonalAssistantAgent();
const response = await agent.handleTask({
  type: 'conversation',
  payload: {
    message: 'Help me plan my next development project',
    context: {}
  }
});
```

## 💡 **Cost Management Tips**

### For Development:
- **Start Small**: Add 1-2 API keys initially
- **Monitor Usage**: Track costs in Anthropic Console
- **Set Limits**: Configure usage limits in your Anthropic account
- **Test Efficiently**: Use our verification script to test without API calls

### Estimated Monthly Costs (Development):
- **Personal Assistant**: ~$10-20/month (light usage)
- **Master Orchestrator**: ~$15-25/month (planning tasks)
- **Music Coach**: ~$0-5/month (Hugging Face free tier + light usage)
- **Full Development Team**: ~$50-100/month (all agents active)

**🎵 Music Coach Savings:**
- Piano Transcription: **FREE** (vs. Klangio $99/month)
- Guitar Tabs: **FREE** (vs. Ultimate Guitar Pro $4/month)  
- Sheet Music: **FREE** (vs. Musicnotes $10-30/song)
- **Total Music Savings**: ~$150+/month

## 🔒 **Security Best Practices**

### ✅ **Current Security (Good)**
- API keys in `.env.local` (not committed to git)
- Development-only usage
- No production deployment risk

### 🚫 **Never Do This**
- Don't commit `.env.local` to git
- Don't deploy to Vercel with API keys in environment
- Don't share API keys in code or documentation

### 🔮 **Future Production Options** (When Ready)
1. **Vercel Environment Variables** (secure but complex)
2. **Personal Assistant Bridge** (route through private repo)
3. **Serverless Functions** (API proxy approach)
4. **Self-hosted** (full control, more complexity)

## 🎯 **Next Actions**

1. **Immediate**: Add `PERSONAL_ASSISTANT_ANTHROPIC_API_KEY` to test core functionality
2. **This Week**: Add `MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY` for orchestration
3. **Try Music Coach**: Test piano transcription and guitar tab features (already ready!)
4. **Next Week**: Add development team keys as needed
5. **Future**: Consider production architecture when ready to deploy

## 🎵 **Music Coach Quick Test**

Your Music Coach is ready to use immediately:

```bash
# Test piano transcription
curl -X POST http://localhost:30000/api/transcribe-piano \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl": "https://www.youtube.com/watch?v=4Tr0otuiQuU"}'

# Test guitar tab search  
curl -X GET "http://localhost:30000/api/guitar-tabs-real?action=search&query=wonderwall&limit=5"
```

**Or visit the web interfaces:**
- 🎹 Piano: http://localhost:30000/piano-transcription
- 🎸 Guitar: http://localhost:30000/guitar-tabs

---

**Bottom Line**: Your instinct to keep this as dev-only is perfect. Focus on building amazing agent capabilities without deployment complexity!

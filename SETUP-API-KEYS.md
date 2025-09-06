# 🔑 API Keys Setup Guide - Development Only

## 🎯 **Decision: Development Project Only**

✅ **Correct Choice**: Keeping this as a development-only project for now is the right approach for:
- **Security**: No risk of accidentally exposing API keys in production
- **Simplicity**: Focus on development without deployment complexity  
- **Cost Control**: Predictable development usage
- **Flexibility**: Easy experimentation and iteration

## 🛠 **Current Setup Status**

### ✅ **Already Configured** 
Your `.env.local` already has these working API keys:
- `COMMUNICATIONS_ANTHROPIC_API_KEY` ✅ (Ready for Claude integration)
- `FULL_STACK_DEVELOPER_ANTHROPIC_API_KEY` ✅ (Ready for Claude integration)
- `MUSIC_COACH_HUGGINGFACE_API_KEY` ✅ (Ready for AI piano transcription)
- Several OpenAI keys for other agents
- Google AI, SerpAPI, Discogs tokens

### 🎵 **Music Coach Enhanced Features**
Your Music Coach agent now has advanced capabilities:
- **Piano Transcription**: YouTube videos → Sheet music (FREE basic, AI-enhanced with HF token)
- **Guitar Tab Search**: 500,000+ tabs from Songsterr (FREE, no API key needed)
- **Multiple Formats**: Guitar Pro, MIDI, ASCII, ABC notation

**Access URLs:**
- Piano Transcription: http://localhost:30000/piano-transcription
- Guitar Tabs: http://localhost:30000/guitar-tabs ✅ (Updated - now works with Ultimate Guitar)
- **Ultimate Guitar API**: http://localhost:30000/api/ultimate-guitar

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

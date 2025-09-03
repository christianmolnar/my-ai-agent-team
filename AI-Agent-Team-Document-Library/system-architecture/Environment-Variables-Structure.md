# Environment Variables Structure

A comprehensive guide for organizing and structuring environment variables for the AI Agent Team system. This document complements the [API Key Procurement Guide](API-Key-Procurement-Guide.md) by showing how to properly organize the API keys once obtained.

## Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Agent-Based Organization](#agent-based-organization)
4. [Security Best Practices](#security-best-practices)
5. [Environment Variable Naming](#environment-variable-naming)
6. [Configuration Templates](#configuration-templates)

---

## Overview

The AI Agent Team uses a structured approach to environment variable management, organizing API keys and configuration by agent rather than by provider. This structure supports:

- **Agent Isolation**: Each agent has its own set of environment variables
- **Provider Flexibility**: Multiple API keys per agent for different AI providers
- **Development Environments**: Clear separation between development, staging, and production
- **Security**: Proper isolation and documentation of sensitive data

---

## File Structure

### Primary Configuration File
```
.env.local                    # Main environment variables (gitignored)
```

### Backup and Template Files
```
.env.example                  # Template with placeholder values
.env.production.example       # Production template
.env.development.example      # Development template
```

### Documentation Files
```
/AI-Agent-Team-Document-Library/system-architecture/
├── API-Key-Procurement-Guide.md           # How to obtain API keys
├── Environment-Variables-Structure.md     # This file - how to organize them
└── AGENT-TEAM-STRUCTURE-DEFINITION.md    # Agent definitions
```

---

## Agent-Based Organization

### Structure Pattern
Each agent section follows this consistent pattern:

```bash
# =============================================================================
# [AGENT NUMBER]. [AGENT NAME]
# Function: [Brief description of agent capabilities]
# API Keys Required:
# =============================================================================
[AGENT_NAME]_[PROVIDER]_API_KEY=your_api_key_here
[AGENT_NAME]_[PROVIDER]_API_KEY=your_api_key_here
# [AGENT_NAME]_[PROVIDER]_API_KEY=  # Optional/future keys commented out
```

### Complete Agent List (19 Official Agents)

1. **Master Orchestrator Agent**
2. **Project Coordinator Agent**
3. **Communications Agent**
4. **Researcher Agent**
5. **Image and Video Generator Agent**
6. **PersonalAssistantBridge Agent**
7. **Product Manager Agent**
8. **Data Scientist Agent**
9. **Development Design Documentation Creator Agent**
10. **Experience Designer Agent**
11. **Full Stack Developer Agent**
12. **Back End Software Developer Agent**
13. **Front End Software Developer Agent**
14. **Test Expert Agent**
15. **Monitoring Expert Agent**
16. **Availability and Reliability Expert Agent**
17. **Performance Expert Agent**
18. **Security Expert Agent**
19. **Privacy Guardian Agent**

---

## Security Best Practices

### File Security
- ✅ `.env.local` is included in `.gitignore`
- ✅ Never commit actual API keys to version control
- ✅ Use separate keys for development and production
- ✅ Regularly rotate API keys

### Key Management
- Store backup copies securely (password manager, encrypted storage)
- Use different keys for different environments when possible
- Monitor API key usage through provider dashboards
- Set up billing alerts to detect unusual usage

### Access Control
- Limit file permissions: `chmod 600 .env.local`
- Don't share environment files via insecure channels
- Use deployment secrets for production environments
- Implement key rotation schedules

---

## Environment Variable Naming

### Naming Convention
```
[AGENT_NAME]_[PROVIDER]_[KEY_TYPE]_[DESCRIPTOR]
```

### Examples
```bash
# Standard API Keys
COMMUNICATIONS_OPENAI_API_KEY=sk-proj-...
RESEARCHER_ANTHROPIC_API_KEY=sk-ant-...

# Specialized Keys
RESEARCHER_SERPAPI_KEY=...
RESEARCHER_DISCOGS_TOKEN=...

# Service-Specific Keys
PROJECT_COORDINATOR_NOTION_API_KEY=...
PROJECT_COORDINATOR_SLACK_API_KEY=...
```

### Provider Abbreviations
- `OPENAI` - OpenAI GPT models
- `ANTHROPIC` - Claude models
- `GOOGLE_AI` - Google AI models
- `PERPLEXITY` - Perplexity AI
- `STABILITY` - Stability AI (image generation)
- `TOGETHER` - Together AI
- `COHERE` - Cohere models

---

## Configuration Templates

### Development Template (.env.example)
```bash
# =============================================================================
# AI AGENT TEAM ENVIRONMENT VARIABLES - DEVELOPMENT TEMPLATE
# =============================================================================
# Copy this file to .env.local and fill in your actual API keys
# See API-Key-Procurement-Guide.md for instructions on obtaining keys

# =============================================================================
# 3. COMMUNICATIONS AGENT
# =============================================================================
COMMUNICATIONS_OPENAI_API_KEY=your_openai_key_here
COMMUNICATIONS_ANTHROPIC_API_KEY=your_anthropic_key_here
# COMMUNICATIONS_GOOGLE_AI_API_KEY=
# COMMUNICATIONS_RESEND_API_KEY=

# =============================================================================
# 4. RESEARCHER AGENT
# =============================================================================
RESEARCHER_OPENAI_API_KEY=your_openai_key_here
RESEARCHER_GOOGLE_AI_API_KEY=your_google_ai_key_here
# RESEARCHER_ANTHROPIC_API_KEY=
# RESEARCHER_PERPLEXITY_API_KEY=
SERPAPI_KEY=your_serpapi_key_here
DISCOGS_TOKEN=your_discogs_token_here

# ... [Continue for all 19 agents]
```

### Production Template
```bash
# =============================================================================
# AI AGENT TEAM ENVIRONMENT VARIABLES - PRODUCTION
# =============================================================================
# Production keys should be different from development keys
# Use environment secrets management in deployment platforms

# [Same structure as development, but with production-grade keys]
```

---

## Integration with API Status System

The environment variables integrate with the API Status management system:

### API Status Page
- Located at `/app/api-status/page.tsx`
- Reads environment variables to check API key availability
- Provides interface for viewing and managing API key status
- Validates key format and basic connectivity

### Configuration Reading
```typescript
// Environment variables are accessed via process.env
const openaiKey = process.env.COMMUNICATIONS_OPENAI_API_KEY;
const anthropicKey = process.env.COMMUNICATIONS_ANTHROPIC_API_KEY;
```

---

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Check that `.env.local` exists and is properly formatted
   - Verify variable names match exactly (case-sensitive)
   - Ensure no extra spaces around the `=` sign

2. **API Key Format Issues**
   - OpenAI keys start with `sk-proj-` or `sk-`
   - Anthropic keys start with `sk-ant-api03-`
   - Google AI keys are typically shorter alphanumeric strings

3. **Permission Issues**
   - Verify file permissions: `ls -la .env.local`
   - Check that the file is readable by the application

### Validation Commands
```bash
# Check if environment file exists
ls -la .env.local

# Verify environment variables are loaded (in development)
node -e "require('dotenv').config({path: '.env.local'}); console.log(Object.keys(process.env).filter(k => k.includes('API_KEY')).length + ' API keys loaded');"
```

---

## Related Documentation

- [API Key Procurement Guide](API-Key-Procurement-Guide.md) - How to obtain API keys
- [AGENT-TEAM-STRUCTURE-DEFINITION.md](AGENT-TEAM-STRUCTURE-DEFINITION.md) - Complete agent definitions
- [UNIVERSAL-AI-MODEL-ACCESS-SYSTEM.md](UNIVERSAL-AI-MODEL-ACCESS-SYSTEM.md) - AI model integration architecture

---

*Last Updated: September 3, 2025*  
*For questions or updates, refer to the AI Agent Team documentation library*

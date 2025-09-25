# AI Model Selection Guide for Agent Team

*Last Updated: September 13, 2025*

## **🚨 CRITICAL UPDATE: Claude 4 Models Now Available**

Based on official Anthropic documentation (September 2025):

### **✅ Current Claude 4 Models (RECOMMENDED)**

| Model | Status | Best Use Cases | API Name |
|-------|--------|---------------|----------|
| **Claude Opus 4.1** | ✅ **FLAGSHIP** | Most capable model, superior reasoning, complex coordination | `claude-opus-4-1-20250805` |
| **Claude Opus 4** | ✅ **STABLE** | Previous flagship, very high intelligence and capability | `claude-opus-4-20250514` |
| **Claude Sonnet 4** | ✅ **HIGH-PERFORMANCE** | Balanced performance, fast, excellent for development | `claude-sonnet-4-20250514` |
| **Claude Sonnet 3.7** | ✅ **CURRENT** | High-performance with extended thinking (toggleable) | `claude-3-7-sonnet-20250219` |
| **Claude Haiku 3.5** | ✅ **FAST** | Quick and accurate, near-instant responsiveness | `claude-3-5-haiku-20241022` |

### **📋 Official Deprecation Status**

From Anthropic's official documentation:
- ❌ **Claude-3.5-Sonnet** is **DEPRECATED** 
- ❌ **Claude-3-Opus** is **DEPRECATED**
- ❌ **Claude-3-Haiku** is still available but superseded by 3.5
- ❌ **Claude-2.x and Claude-Instant** deprecated (March 2024)

## **Model Selection by Agent Type**

### **🏛️ Management & Coordination Agents**
**Recommended: Claude Opus 4.1 (`claude-opus-4-1-20250805`)**
- **Use for:** Master Orchestrator, Project Coordinator
- **Why:** Highest level of intelligence, superior strategic reasoning, complex planning
- **Cost:** $15/MTok input, $75/MTok output (highest but worth it for critical decisions)

### **👨‍💻 Software Development Agents**
**Recommended: Claude Sonnet 4 (`claude-sonnet-4-20250514`)**
- **Use for:** Full-Stack Developer, Front-End Developer, Back-End Developer
- **Why:** High intelligence, balanced performance, excellent for coding
- **Cost:** $3/MTok input, $15/MTok output (moderate, excellent value)
- **Context:** 200K tokens standard, 1M beta available

### **⚖️ Quality & Review Agents**
**Recommended: Claude Sonnet 4 (`claude-sonnet-4-20250514`)**
- **Use for:** Reviewer Agent, QA Engineer, Test Expert
- **Why:** High intelligence, thorough evaluation, latest reasoning capabilities
- **Cost:** $3/MTok input, $15/MTok output

### **🎨 Creative & Content Agents**
**Recommended: Claude Sonnet 4 (`claude-sonnet-4-20250514`)**
- **Use for:** Communications Agent, Experience Designer, Content Creator
- **Why:** High intelligence, creative capabilities, nuanced communication
- **Cost:** $3/MTok input, $15/MTok output

### **🔍 Research & Analysis Agents**
**Recommended: Claude Sonnet 4 (`claude-sonnet-4-20250514`)**
- **Use for:** Researcher Agent, Data Scientist, Security Expert
- **Why:** Extended thinking capability, latest reasoning, 1M context beta, newest training data
- **Cost:** $3/MTok input, $15/MTok output
- **Special:** Extended thinking + 1M context beta for comprehensive research

### **🏃‍♂️ Fast/Simple Task Agents**
**Recommended: Claude Haiku 3.5 (`claude-3-5-haiku-20241022`)**
- **Use for:** Simple coordination tasks, basic operations, high-volume processing
- **Why:** Fastest response, most cost-effective, near-instant responsiveness
- **Cost:** $0.80/MTok input, $4/MTok output (most economical)

## **Cost Optimization Strategy**

### **Premium Tasks (Use Opus 4.1) - $15/$75 per MTok**
- Strategic planning and coordination
- Complex multi-agent orchestration  
- Critical business decisions
- Most complex reasoning tasks

### **Development Tasks (Use Sonnet 4) - $3/$15 per MTok**
- Software development and coding
- Quality reviews and analysis
- Creative content generation
- Standard coordination

### **Research Tasks (Use Sonnet 3.7) - $3/$15 per MTok**
- Deep research and investigation
- Complex analysis with extended thinking
- Data science and security analysis

### **Simple Tasks (Use Haiku 3.5) - $0.80/$4 per MTok**
- Basic task coordination
- Simple data processing
- High-volume operations
- Development testing

## **Performance Characteristics**

| Model | Speed | Quality | Cost | Context | Output | Best For |
|-------|-------|---------|------|---------|--------|----------|
| **Opus 4.1** | Moderate | Highest | Highest | 200K | 32K | Strategy, complex reasoning |
| **Opus 4** | Moderate | Very High | High | 200K | 32K | Management, coordination |
| **Sonnet 4** | Fast | High | Moderate | 200K/1M | 64K | Development, analysis |
| **Sonnet 3.7** | Fast | High | Moderate | 200K | 64K | Research, extended thinking |
| **Haiku 3.5** | Fastest | Good | Lowest | 200K | 8K | Simple tasks, testing |

## **Migration from Deprecated Models**

### **URGENT: Update Required**
- ❌ **Claude-3-Opus** → ✅ **Claude Opus 4.1** (management tasks)
- ❌ **Claude-3.5-Sonnet** → ✅ **Claude Sonnet 4** (development tasks)
- ❌ **Claude-3-Haiku** → ✅ **Claude Haiku 3.5** (simple tasks)

### **API Name Changes:**
```bash
# OLD (deprecated)
"claude-3-opus-20240229"     → "claude-opus-4-1-20250805"
"claude-3-5-sonnet-20241022" → "claude-sonnet-4-20250514"  
"claude-3-haiku-20240307"    → "claude-3-5-haiku-20241022"
```

## **Provider Integration Notes**

### **Why "AgentClaudeClients.ts"?**
This file specifically handles Anthropic Claude integrations because:
- **Claude 4-specific configuration** (temperature, tokens, timeouts)
- **Agent-specific optimizations** for Claude 4 models
- **Extended thinking toggles** for Sonnet 3.7
- **Context window management** (200K standard, 1M beta)
- **Other providers** are handled in `UniversalAIClient`

### **Multi-Provider Architecture:**
```
AgentClaudeClients.ts → Claude 4 configurations
UniversalAIClient.ts → OpenAI, Google, Groq, etc.
APIKeyManager → Manages all provider keys
```

## **Updated Agent Assignments**

### **Strategic Tier (Claude Opus 4.1)**
- Master Orchestrator
- Project Coordinator (complex projects)

### **Development Tier (Claude Sonnet 4)**
- Full-Stack Developer
- Front-End Developer  
- Back-End Developer
- DevOps Engineer
- QA Engineer

### **Research Tier (Claude Sonnet 4)**
- Researcher Agent
- Data Scientist
- Security Expert

### **Quality Assurance (Claude Sonnet 4)**
- Reviewer Agent
- Test Expert

### **Creative Functions (Claude Sonnet 4)**
- Communications Agent
- Experience Designer
- Content Creator

### **Personal Assistance (Claude Sonnet 4)**
- Personal Assistant
- Music Coach

### **Fast Operations (Claude Haiku 3.5)**
- Simple coordination
- High-volume processing
- Development testing

## **Special Claude 4 Features**

### **Extended Thinking (Opus 4.1, Opus 4, Sonnet 4, Sonnet 3.7)**
- Toggleable extended reasoning mode
- Better for complex problem-solving
- Use for strategic planning and analysis

### **Priority Tier (All except Haiku 3)**
- Faster response times
- Higher rate limits
- Better availability

### **1M Context Window Beta (Sonnet 4)**
- Use header: `context-1m-2025-08-07`
- Long context pricing applies >200K tokens
- Perfect for large codebase analysis

### **128K Output Beta (Sonnet 3.7)**
- Use header: `output-128k-2025-02-19`
- Increased output token length
- Better for comprehensive documentation

## **Monitoring & Updates**

### **Stay Updated:**
1. Monitor [Anthropic's Documentation](https://docs.anthropic.com/)
2. Check for new Claude 4 model releases
3. Review cost/performance metrics monthly
4. Test new features in beta

### **Key Metrics to Track:**
- Response quality by Claude 4 model
- Cost per agent interaction
- Extended thinking usage
- Context window utilization

## **Quick Reference**

```bash
# UPDATED: Claude 4 models (September 2025)
STRATEGIC_TIER="claude-opus-4-1-20250805"      # Most capable
MANAGEMENT_TIER="claude-opus-4-20250514"       # High capability  
DEVELOPMENT_TIER="claude-sonnet-4-20250514"    # Balanced performance
RESEARCH_TIER="claude-sonnet-4-20250514"     # Extended thinking
FAST_TIER="claude-3-5-haiku-20241022"         # Quick operations

# DEPRECATED - DO NOT USE
DEPRECATED_OPUS="claude-3-opus-20240229"       # Use Opus 4.1 instead
DEPRECATED_SONNET="claude-3-5-sonnet-20241022" # Use Sonnet 4 instead
```

---

*This guide reflects the latest Claude 4 model availability as of September 2025. All deprecated models should be upgraded immediately.*

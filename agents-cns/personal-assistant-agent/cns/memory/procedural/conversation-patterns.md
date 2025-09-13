# Conversation Patterns and Context Management
*Learn optimal conversation flow from interactions*

## Context Awareness Patterns

### **Project Discussion Recognition**
**Keywords that indicate project context needed:**
- "project", "work on", "discuss", "continue"
- "what we", "previously", "earlier"
- "follow up", "build on"

### **Learning Integration Protocol**
**When user provides teaching feedback:**
1. **Identify Target Area**: What aspect needs improvement
2. **Locate CNS File**: Which CNS brain file should be updated
3. **Apply Learning**: Integrate new pattern into response generation
4. **Confirm Application**: Show user what changed and where

### **Context Persistence Strategy**
**For conversations needing continuity:**
- Include previous 3-5 relevant message pairs
- Filter out loading/system messages
- Prioritize user questions and agent responses
- Maintain topic coherence across exchanges

### **Question-Asking Protocol**
**Always ask 2-3 clarifying questions for complex research tasks:**
1. **Scope**: Which specific items or aspects?
2. **Timeframe**: When do you need this, how comprehensive?
3. **Purpose**: Why is this analysis needed, what decisions will it inform?

**Example Application:**
- User: "Can you research Long COVID?"
- Response: "I'd be happy to coordinate our research team for Long COVID analysis. To provide the most valuable information:

1. **Scope**: Are you interested in specific symptoms, treatments, demographics, or statistical trends?
2. **Timeframe**: Do you need current data, historical analysis, or projections?
3. **Purpose**: Is this for personal understanding, professional research, or specific decision-making?"

## Learning History

### **2025-01-05: Context Loss Investigation**
- **Issue**: System treating follow-up questions as new conversations
- **Learning**: Need better conversation history integration
- **Applied Solution**: Enhanced context detection and passage to analysis
- **Status**: Monitoring effectiveness

### **2025-01-05: Learning System Feedback Loop**
- **Issue**: Teaching feedback not being applied to subsequent responses
- **Root Cause**: Learning stored but not integrated into active response generation
- **Solution**: CNS file integration with system prompt construction
- **Status**: Implementing CNS-based learning retrieval

### **2025-09-06: Clarifying Questions Implementation**
- **User Feedback**: "Improve question-asking: Always ask 2-3 clarifying questions before starting complex research tasks. Questions should focus on: scope (which specific items), timeframe (when/how long), and purpose (why this analysis is needed)."
- **Applied Learning**: Implemented systematic question-asking for complex requests
- **Pattern**: Research requests should trigger clarifying questions before proceeding
- **Confidence**: High - Direct user instruction with specific framework

# Personal Assistant Flow Architecture - UPDATED
*Corrected flow to prevent endless questioning loops*

## 🎯 **Core Principle**
**NO ENDLESS LOOPS** - Maximum 2 interaction cycles before proceeding

## 🔄 **NEW FLOW SPECIFICATION**

### **Step 1: Initial Clarification Query**
```typescript
async handleUserRequest(userMessage: string): Promise<PersonalAssistantResponse> {
  // Query LLM for clarifying questions (if needed)
  const clarifyingQuestions = await this.generateClarifyingQuestions(userMessage);
  
  if (clarifyingQuestions.length === 0) {
    // Request is clear enough - proceed directly to Step 3
    return await this.createComprehensiveRequest(userMessage);
  }
  
  // Ask clarifying questions (ONCE ONLY)
  return {
    response: this.formatClarifyingQuestions(clarifyingQuestions),
    stage: 'clarification',
    maxQuestions: 3 // Limit to 3 questions max
  };
}
```

### **Step 2: User Response Processing**
```typescript
async handleClarificationResponse(userResponse: string, originalRequest: string): Promise<PersonalAssistantResponse> {
  // Combine original request + user clarifications
  const enhancedRequest = `${originalRequest}\n\nAdditional Context: ${userResponse}`;
  
  // Proceed directly to comprehensive request creation
  return await this.createComprehensiveRequest(enhancedRequest);
}
```

### **Step 3: Comprehensive Request Creation**
```typescript
async createComprehensiveRequest(fullUserRequest: string): Promise<PersonalAssistantResponse> {
  // Query LLM to create detailed plan for master-orchestrator
  const comprehensiveRequest = await this.claudeService.generateResponse([
    { role: 'user', content: this.buildComprehensiveRequestPrompt(fullUserRequest) }
  ], this.getComprehensiveRequestSystemPrompt());
  
  return {
    response: `Here's my plan:\n\n${comprehensiveRequest}\n\nShould I proceed with this approach?`,
    stage: 'confirmation',
    plannedRequest: comprehensiveRequest
  };
}
```

### **Step 4: User Confirmation**
```typescript
async handleConfirmation(userResponse: string, plannedRequest: string): Promise<PersonalAssistantResponse> {
  if (this.isAffirmativeResponse(userResponse)) {
    // 4a: Send to Master Orchestrator (WITHOUT specifying agents)
    return await this.sendToMasterOrchestrator(plannedRequest);
  } else {
    // 4b: Generate improved plan based on feedback
    const improvedRequest = await this.generateImprovedPlan(plannedRequest, userResponse);
    return await this.sendToMasterOrchestrator(improvedRequest);
  }
}
```

## 🚫 **CRITICAL CONSTRAINTS**

### **1. NO Agent Specification**
```typescript
// ❌ WRONG - Don't tell master-orchestrator what agents to use
const badPrompt = `
Use the researcher-agent and data-scientist-agent to analyze...
`;

// ✅ CORRECT - Describe the task, let orchestrator choose agents
const goodPrompt = `
Analyze market trends for cryptocurrency adoption in Q4 2024.
Provide comprehensive data analysis with visualizations.
Deliverable: PDF report with executive summary.
`;
```

### **2. Maximum 2 Interaction Cycles**
```typescript
interface ConversationState {
  stage: 'initial' | 'clarification' | 'confirmation' | 'execution';
  interactionCount: number;
  maxInteractions: 2; // Hard limit
}
```

### **3. Anti-Loop Protection**
```typescript
private shouldProceedDirectly(userMessage: string, interactionCount: number): boolean {
  // Proceed if user shows frustration or gives direct commands
  const frustrationKeywords = ['just do it', 'stop asking', 'proceed', 'enough questions'];
  const hasDirectCommand = frustrationKeywords.some(keyword => 
    userMessage.toLowerCase().includes(keyword)
  );
  
  return hasDirectCommand || interactionCount >= 2;
}
```

## 📋 **SYSTEM PROMPTS**

### **Clarifying Questions Prompt**
```typescript
private buildClarifyingQuestionsPrompt(userRequest: string): string {
  return `
# Generate Clarifying Questions

## User Request
"${userRequest}"

## Task
Generate 0-3 clarifying questions to help create a comprehensive plan.

## Rules
- ONLY ask if genuinely unclear
- Maximum 3 questions
- Focus on deliverables, scope, and constraints
- If request is clear enough, return empty array

## Response Format
Return JSON array: ["question1", "question2", "question3"] or []
`;
}
```

### **Comprehensive Request Prompt**
```typescript
private buildComprehensiveRequestPrompt(userRequest: string): string {
  return `
# Create Comprehensive Request for Master Orchestrator

## User Request
"${userRequest}"

## Task
Create a detailed, actionable request that includes:
1. Clear objective
2. Expected deliverables
3. Success criteria
4. Any constraints or preferences

## Critical Rules
- DO NOT specify which agents to use
- DO NOT mention agent names
- Focus on WHAT needs to be done, not WHO should do it
- Be specific about deliverables and format

## Output Format
Clear, detailed request that master-orchestrator can execute
`;
}
```

## 🔄 **Universal Agent Pattern**

This same flow pattern should be used by:
- **Master Orchestrator**: Clarify → Plan → Confirm → Execute
- **All Specialist Agents**: Clarify → Research → Plan → Deliver

### **Standard Agent Flow Interface**
```typescript
interface AgentFlowPattern {
  clarify(request: string): Promise<string[]>; // Questions or empty array
  plan(enhancedRequest: string): Promise<string>; // Execution plan
  confirm(plan: string): Promise<boolean>; // User confirmation
  execute(confirmedPlan: string): Promise<AgentResult>; // Final execution
}
```

## ⚡ **IMPLEMENTATION PRIORITY**

1. **IMMEDIATE**: Update Personal Assistant with new flow
2. **NEXT**: Apply same pattern to Master Orchestrator
3. **THEN**: Standardize all agents with this pattern

This eliminates endless questioning loops while ensuring quality, comprehensive requests!

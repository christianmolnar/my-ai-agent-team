# Self-Contained Public Agent Architecture
*Unified CNS-based agent team operating entirely within the public repository*

## 🎯 **Architecture Vision**

This new architecture eliminates the complex bridge pattern and private repository dependencies, creating a fully self-contained agent team that can collaborate effectively within the public repository using integrated CNS (Central Nervous System) components.

### **Core Design Principles**
- **Self-Contained Operation**: All agents operate within public repository with local CNS
- **Real Collaboration**: Agents can communicate and build context through shared CNS memory
- **Conversation Continuity**: Session context persists and builds across agent interactions
- **Capability-Driven**: Agents work based on their actual capabilities, not generic templates
- **Learning Integration**: Agents learn and improve from interaction patterns and successes

---

## 🏗️ **Architecture Overview**

### **Repository Structure**
```
/My-AI-Agent-Team/
├── agents/                               ← JavaScript agent implementations (kebab-case)
│   ├── researcher-agent.js
│   ├── communications-agent.js
│   ├── master-orchestrator-agent.js
│   └── [other agents].js
├── agents-cns/                          ← CNS for each agent (NEW)
│   ├── agent-registry.json              ← Agent capabilities and status
│   ├── researcher-agent/                ← Matches JS file name exactly
│   │   ├── cns/
│   │   │   ├── brain/                    ← Identity, capabilities, cognitive framework
│   │   │   ├── memory/                   ← Learning data, conversation history
│   │   │   ├── reflexes/                 ← Automatic responses, patterns
│   │   │   └── integration/              ← Connection protocols
│   │   ├── incoming/                     ← Tasks and data from other agents
│   │   ├── outgoing/                     ← Completed work for other agents
│   │   └── working/                      ← Active session processing
│   └── [other agent CNS folders]
├── app/agents/                           ← Next.js agent UI pages (kebab-case routes)
│   ├── researcher-agent/
│   ├── communications-agent/
│   └── [other agent pages]/
├── lib/                                  ← Shared libraries (updated for local CNS)
└── data/
    ├── interaction-logs/                 ← Session and interaction tracking
    └── shared-context/                   ← Cross-agent session context (NEW)
```

### **Naming Convention Standard**
- **Files**: `researcher-agent.js` (kebab-case)
- **Folders**: `researcher-agent/` (kebab-case)
- **Class Names**: `ResearcherAgent` (PascalCase)
- **Registry IDs**: `researcher-agent` (kebab-case)
- **Routes**: `/agents/researcher-agent` (kebab-case)

---

## 🧠 **Core Components**

### **1. Agent CNS Integration**

Each agent's JavaScript implementation connects to its local CNS structure:

**Brain Components:**
- `capabilities.md` - What the agent can actually do
- `cognitive-framework.json` - Decision-making patterns
- `performance-metrics.md` - Success/failure tracking

**Memory Components:**
- `conversation-history/` - Context from previous interactions
- `learning-patterns/` - Successful interaction patterns
- `collaboration-history/` - Previous work with other agents

**Working Components:**
- `current-session/` - Active conversation context
- `active-tasks/` - Work in progress
- `agent-coordination/` - Communication with other agents

### **2. Context Sharing System**

**Session Context Flow:**
1. **Session Initialization**: Create shared context file in `data/shared-context/session-{id}/`
2. **Agent Context Updates**: Each agent updates session context with their contributions
3. **Inter-Agent Context**: Agents read previous agent outputs and conversation history
4. **Context Persistence**: Session context maintained throughout entire conversation

**Context Structure:**
```json
{
  "sessionId": "session_123",
  "userId": "christian",
  "conversationHistory": [
    {
      "timestamp": "2025-09-12T23:28:00Z",
      "speaker": "user",
      "message": "Can you help me research Long COVID?",
      "context": "Personal health concern for son"
    },
    {
      "timestamp": "2025-09-12T23:28:15Z", 
      "speaker": "researcher-agent",
      "task": "Research Long COVID treatment centers",
      "output": "Found 8 specialized treatment centers...",
      "contextContribution": "Treatment center database with contact info"
    }
  ],
  "activeAgents": ["researcher-agent", "communications-agent"],
  "sharedArtifacts": {
    "research-data": "path/to/research/output",
    "contact-tables": "path/to/formatted/tables"
  },
  "conversationIntent": "Help find Long COVID treatment for son",
  "nextActions": ["Format contact table", "Provide regional recommendations"]
}
```

### **3. Enhanced Orchestration**

**Orchestrator Responsibilities:**
- Read conversation context from previous interactions
- Route tasks to appropriate agents based on capabilities and context
- Ensure agents receive full conversation history
- Coordinate context sharing between agents
- Track progress toward conversation goals

**Agent Coordination:**
- Agents can read from each other's `outgoing/` folders
- Shared session context enables building on previous work
- Real-time collaboration through CNS memory system

---

## 🔄 **Conversation Flow Example**

### User Request: "Create a table with contact info for Long COVID centers"

**Step 1: Context Initialization**
- Orchestrator reads previous conversation history
- Identifies that user previously asked about Long COVID
- Understands context: "Table with contact info" refers to treatment centers discussed earlier

**Step 2: Agent Coordination**
- Orchestrator assigns specific, contextual task to researcher-agent: "Extract contact information from Long COVID treatment centers you researched earlier and format as table"
- Researcher reads conversation history from CNS memory
- Researcher accesses previous research outputs from their `memory/` folder

**Step 3: Collaborative Work**
- Researcher creates contact table based on previous research
- Outputs structured data to `outgoing/deliverables/`
- Updates session context with table creation details

**Step 4: Handoff & Refinement**
- Communications-agent reads researcher's output
- Formats table according to user preferences from conversation history
- Provides final deliverable with proper context

**Result**: User receives specific table with Long COVID treatment center contacts, not generic methodology templates.

---

## 🎯 **Key Architectural Benefits**

### **1. Real Collaboration**
- Agents can see and build upon each other's work
- Context flows naturally between agents in a session
- No more isolated, template responses

### **2. Conversation Continuity**
- Each interaction builds on previous ones
- Agents remember what was discussed before
- Context accumulates throughout the conversation

### **3. Capability-Driven Operation**
- Agents work based on their actual capabilities
- No generic "research methodology" templates
- Specific, targeted responses to user needs

### **4. Simplified Architecture**
- Eliminates complex bridge pattern
- Removes private repository dependencies
- All components in one location for easier management

### **5. Learning Integration**
- Successful patterns stored in agent memory
- Agents improve based on interaction history
- Performance metrics track and optimize collaboration

---

## 🔧 **Technical Implementation Notes**

### **CNS Path Integration**
- Update `lib/learning-processor.js` to use `agents-cns/` paths
- Modify agent constructors to load from local CNS folders
- Implement context reading/writing utilities

### **Session Management**
- Create session context manager for shared state
- Implement inter-agent communication protocols
- Add conversation history persistence

### **Agent Enhancement**
- Connect each agent to their CNS brain/capabilities
- Enable memory reading for conversation context
- Implement collaborative output sharing

This architecture creates a foundation for truly collaborative, context-aware agents that can work together effectively to solve complex user problems.

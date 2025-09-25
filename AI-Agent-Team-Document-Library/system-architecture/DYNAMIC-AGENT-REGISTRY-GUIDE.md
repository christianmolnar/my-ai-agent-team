# Dynamic Agent Registry Guide
**Created:** September 12, 2025  
**Status:** ✅ **ACTIVE** - Dynamic System Operational

## 🎯 **Overview**

The AI Agent Team now uses a **fully dynamic agent registry** that automatically discovers and loads agents at runtime. This makes the system truly extensible - new agents can be added without modifying any registry code.

## 🏗️ **System Architecture**

### **Dynamic Discovery Process**
1. **JSON Configuration**: Agents are defined in `agents-cns/agent-registry.json`
2. **File System Scanning**: Registry maps agent IDs to actual TypeScript files
3. **Lazy Loading**: Agents are dynamically imported only when requested
4. **Automatic Registration**: Newly defined agents are immediately available

### **Key Components**
- **AgentRegistry Class**: `/agents/agent-registry.ts` - Dynamic loader
- **Agent Configuration**: `/agents-cns/agent-registry.json` - Agent definitions
- **Agent Files**: `/agents/*.ts` - Individual agent implementations
- **CNS Structure**: `/agents-cns/{agent-folder}/` - Agent brain folders

## ✅ **Current Status (21 Active Agents)**

```
✅ researcher-agent               → /agents/researcher.ts
✅ communications-agent           → /agents/communications.ts  
✅ data-scientist                 → /agents/data-scientist.ts
✅ front-end-developer            → /agents/front-end-developer.ts
✅ back-end-developer             → /agents/back-end-developer.ts
✅ full-stack-developer           → /agents/full-stack-developer.ts
✅ project-coordinator            → /agents/project-coordinator.ts
✅ image-video-generator          → /agents/image-generator.ts
✅ music-coach                    → /agents/music-coach.ts
✅ availability-reliability-expert → /agents/availability-reliability-expert.ts
✅ security-expert                → /agents/security-expert.ts
✅ privacy-guardian               → /agents/privacy-guardian.ts
✅ performance-expert             → /agents/performance-expert.ts
✅ monitoring-expert              → /agents/monitoring-expert.ts
✅ experience-designer            → /agents/experience-designer.ts
✅ dev-design-doc-creator         → /agents/dev-design-doc-creator.ts
✅ product-manager                → /agents/product-manager.ts
✅ test-expert                    → /agents/test-expert.ts
✅ vinyl-researcher-agent         → /agents/vinyl-researcher.ts
✅ master-orchestrator            → /agents/master-orchestrator.ts
✅ personal-assistant-agent       → /agents/personal-assistant.ts
```

## 🚀 **How to Add a New Agent**

### **Step 1: Create Agent Implementation**
Create your agent file in `/agents/` directory:

```typescript
// /agents/new-specialist-agent.ts
import { Agent, AgentTask, AgentTaskResult } from './agent';

export class NewSpecialistAgent extends Agent {
  constructor() {
    super('new-specialist', 'New Specialist Agent');
  }

  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    // Your agent implementation here
    return {
      success: true,
      result: "Task completed by New Specialist Agent",
      data: {}
    };
  }
}
```

### **Step 2: Add Agent Definition to JSON**
Add your agent to `/agents-cns/agent-registry.json`:

```json
{
  "agents": [
    // ...existing agents...
    {
      "id": "new-specialist",
      "name": "New Specialist Agent",
      "type": "NewSpecialistAgent",
      "status": "active",
      "capabilities": ["Specialized Task", "Custom Functionality"],
      "folder": "new-specialist"
    }
  ],
  "totalAgents": 22,
  "lastUpdated": "2025-09-12T21:00:00Z",
  "version": "1.0.1"
}
```

### **Step 3: Add Filename Mapping**
Update the filename mapping in `/agents/agent-registry.ts`:

```typescript
private getAgentFileName(agentId: string): string {
  const fileNameMap: { [key: string]: string } = {
    // ...existing mappings...
    'new-specialist': 'new-specialist-agent',
    // Add your mapping here
  };
  return fileNameMap[agentId] || agentId;
}
```

### **Step 4: Create CNS Brain Folder**
Create the agent's CNS structure:

```bash
mkdir -p /agents-cns/new-specialist/
touch /agents-cns/new-specialist/capabilities.md
touch /agents-cns/new-specialist/cognitive-framework.json
mkdir -p /agents-cns/new-specialist/brain/
mkdir -p /agents-cns/new-specialist/memory/
mkdir -p /agents-cns/new-specialist/working/
```

### **Step 5: Test Dynamic Loading**
Your agent is now automatically available! Test it:

```bash
curl http://localhost:3001/api/enhanced-orchestration
# Should show your agent in the availableAgents count
```

## 🔧 **Agent Registry API**

### **Static Methods**
```typescript
// Get a specific agent instance
const agent = await AgentRegistry.getAgentInstance('agent-id');

// Get all available agents
const agents = await AgentRegistry.getAvailableAgents();

// Get agent display name
const name = AgentRegistry.getAgentDisplayName('agent-id');
```

### **Instance Methods**
```typescript
const registry = AgentRegistry.getInstance();

// Get agent definition from JSON
const definition = registry.getAgentDefinition('agent-id');

// Get available agent IDs
const ids = await registry.getAvailableAgentIds();
```

## 🎯 **Naming Conventions**

### **File Naming**
- Agent files: `kebab-case.ts` (e.g., `data-scientist.ts`)
- Class names: `PascalCase` (e.g., `DataScientistAgent`)
- Agent IDs: `kebab-case` (e.g., `data-scientist`)

### **ID to Filename Mapping**
```
Agent ID: "front-end-developer"     → File: "front-end-developer.ts"
Agent ID: "communications-agent"    → File: "communications.ts"
Agent ID: "image-video-generator"   → File: "image-generator.ts"
```

## ⚡ **System Benefits**

### **Extensibility**
- ✅ No registry code changes needed for new agents
- ✅ JSON-driven configuration
- ✅ Automatic discovery and loading

### **Performance**
- ✅ Lazy loading - agents loaded on demand
- ✅ Cached instances - no repeated loading
- ✅ Graceful error handling for broken agents

### **Maintainability**
- ✅ Clear separation of concerns
- ✅ Centralized agent definitions
- ✅ Easy to debug and monitor

## 🚨 **Troubleshooting**

### **Agent Not Loading**
1. Check filename mapping in `getAgentFileName()`
2. Verify class name matches `type` in JSON
3. Ensure agent file exports the correct class
4. Check console for dynamic loading messages

### **Module Import Errors**
1. Verify TypeScript compilation
2. Check for circular dependencies
3. Ensure proper export syntax
4. Validate file paths are correct

### **Agent Not Available**
1. Check `status: "active"` in JSON
2. Verify agent ID matches exactly
3. Ensure JSON is valid and parseable
4. Check CNS folder structure exists

## 📊 **Monitoring**

The system logs dynamic loading activity:
```
🤖 AgentRegistry initialized with 21 agent definitions available for dynamic loading
✅ Dynamically loaded agent: Research Specialist Agent (researcher-agent)
✅ Dynamically loaded agent: Communications Agent (communications-agent)
...
```

Monitor the console output to verify agents are loading correctly.

## 🔄 **Future Enhancements**

The dynamic registry is ready for:
- **Phase 1.4**: CNS integration for capability loading
- **Hot reloading**: Agent updates without restart
- **Plugin system**: External agent modules
- **Health monitoring**: Agent status tracking
- **Version management**: Agent compatibility checks

---

**The system is now fully dynamic and extensible! Adding new agents is as simple as creating the file and updating the JSON configuration.** 🚀

# Quick Reference: Adding New Agents
**Dynamic Agent Registry** - September 12, 2025

## 🚀 **5-Step Agent Addition Process**

### **1. Create Agent File**
```typescript
// /agents/my-new-agent.ts
import { Agent, AgentTask, AgentTaskResult } from './agent';

export class MyNewAgent extends Agent {
  constructor() {
    super('my-new-agent-id', 'My New Agent Display Name');
  }

  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    return {
      success: true,
      result: "Task completed",
      data: {}
    };
  }
}
```

### **2. Update JSON Config**
```json
// /agents-cns/agent-registry.json
{
  "id": "my-new-agent-id",
  "name": "My New Agent Display Name", 
  "type": "MyNewAgent",
  "status": "active",
  "capabilities": ["Task Type 1", "Task Type 2"],
  "folder": "my-new-agent"
}
```

### **3. Add Filename Mapping**
```typescript
// /agents/agent-registry.ts - getAgentFileName() method
'my-new-agent-id': 'my-new-agent',
```

### **4. Create CNS Structure**
```bash
mkdir -p /agents-cns/my-new-agent/{brain,memory,working}
touch /agents-cns/my-new-agent/capabilities.md
touch /agents-cns/my-new-agent/cognitive-framework.json
```

### **5. Test**
```bash
curl http://localhost:3001/api/enhanced-orchestration
# Check availableAgents count increased
```

## 📋 **Required Information**

| Field | Example | Purpose |
|-------|---------|---------|
| **Agent ID** | `"data-scientist"` | Unique identifier (kebab-case) |
| **Display Name** | `"Data Scientist Agent"` | Human-readable name |
| **Class Name** | `"DataScientistAgent"` | TypeScript class (PascalCase) |
| **Filename** | `"data-scientist.ts"` | File in /agents/ (kebab-case) |
| **Capabilities** | `["Analysis", "Modeling"]` | What the agent can do |
| **CNS Folder** | `"data-scientist"` | Brain structure folder |

## ⚡ **Testing Commands**

```bash
# Check agent count
curl -s http://localhost:3001/api/enhanced-orchestration | jq '.data.availableAgents'

# Test specific agent
curl -X POST http://localhost:3001/api/enhanced-orchestration \
  -H "Content-Type: application/json" \
  -d '{"userRequest": "Test my new agent", "taskType": "test"}'

# View registry logs
npm run dev  # Watch console for loading messages
```

## 🚨 **Common Issues**

| Problem | Solution |
|---------|----------|
| Agent not found | Check filename mapping |
| Import errors | Verify class name matches `type` in JSON |
| Not loading | Ensure `status: "active"` |
| Wrong count | Update `totalAgents` in JSON |

## 📁 **File Locations**

```
/agents/
├── my-new-agent.ts          ← Your agent implementation
└── agent-registry.ts        ← Update getAgentFileName()

/agents-cns/
├── agent-registry.json      ← Add agent definition
└── my-new-agent/           ← CNS brain folder
    ├── capabilities.md
    ├── cognitive-framework.json
    ├── brain/
    ├── memory/
    └── working/
```

---
**🎯 That's it! Your agent is now dynamically available system-wide.**

---
applyTo: "agents/**/*.{ts,js}"
---

# Agent Development Instructions

## Agent Development Standards

When working with agent files:

1. **CNS Integration Requirements**:
   - Always implement proper CNS data management
   - Update agent state in `/data/agent-states/[agent-name]/`
   - Maintain session context in `/data/agent-states/shared/`
   - Log learning events to `/data/learning/learning-history.jsonl`

2. **Agent Coordination**:
   - Read session context before major operations
   - Update agent registry when becoming active
   - Follow handoff protocols for agent delegation
   - Respect other agents' work and current tasks

## Code Standards

### TypeScript Implementation
- Use proper interface definitions for agent communication
- Implement error handling with CNS integration
- Include learning capability hooks
- Generate actual working code, not pseudo-code

### Agent State Management
```typescript
// Always check agent state before operations:
const agentState = await readAgentState(this.id);
const sessionContext = await getSessionContext();

// Update state after significant operations:
await updateAgentState(this.id, {
  lastActivity: new Date().toISOString(),
  currentTask: taskDescription
});
```

## Personal Assistant Integration

When working on Personal Assistant agent:

1. **User Interface Layer**: Handle user interactions and conversation flow
2. **Orchestration**: Delegate complex tasks to appropriate specialists
3. **Response Compilation**: Aggregate and format responses from multiple agents
4. **Learning Integration**: Update CNS with successful interaction patterns

## Agent Communication Protocols

- Use standardized message formats for inter-agent communication
- Include request context and response expectations
- Handle timeouts and error conditions gracefully
- Update session context with delegation status

## Testing Integration

- Include unit tests for agent functionality
- Test CNS data operations and state management
- Verify agent coordination and delegation
- Test error handling and recovery scenarios

## Quality Standards

- Implement proper logging and debugging support
- Include performance monitoring and optimization
- Follow security best practices for API integration
- Document agent capabilities and limitations
- Generate deliverables in appropriate `/deliverables/` subdirectories

---
*Always integrate with CNS architecture and follow agent coordination protocols*

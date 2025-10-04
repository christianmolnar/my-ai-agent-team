---
applyTo: "tests/**/*.{js,ts,test.js,test.ts,spec.js,spec.ts}"
---

# Test Development Instructions

## Test Organization Standards

When creating or working with tests:

1. **Location Requirement**: ALL tests must be placed in `/tests/` directory
2. **Organization Structure**:
   ```
   /tests/
   ├── unit/           ← Individual component/function tests
   ├── integration/    ← Cross-component interaction tests
   ├── agents/         ← Agent-specific behavioral tests
   ├── e2e/           ← End-to-end workflow tests
   ├── performance/    ← Performance and load tests
   └── fixtures/       ← Test data and mock files
   ```

3. **File Naming**: 
   - Unit tests: `ComponentName.test.ts`
   - Integration: `feature-integration.test.ts`
   - Agent tests: `agent-name.agent.test.ts`

## Test Standards

### TypeScript Tests (.test.ts)
- Use Jest framework with proper type definitions
- Include setup/teardown for agent state management
- Test CNS integration and learning system interaction
- Mock external API calls (Claude, file system)

### JavaScript Tests (.test.js)
- Follow ES6+ standards
- Include proper error handling
- Use async/await for agent interactions
- Verify both success and failure scenarios

## Personal Assistant Testing

When testing Personal Assistant functionality:

1. **Agent State Testing**: Verify CNS data operations
2. **Orchestration Testing**: Test delegation to other agents
3. **User Interaction Testing**: Test conversation handling
4. **Integration Testing**: Test with actual Claude API (in dedicated integration tests)

## CNS Integration

- Test CNS memory updates and retrieval
- Verify agent coordination protocols
- Test learning system integration
- Include session context management testing

## Quality Standards

- Include both positive and negative test cases
- Test error handling and recovery
- Verify deliverable generation in `/deliverables/`
- Test agent state persistence and restoration
- Include performance benchmarks where appropriate

---
*Always place tests in /tests/ directory with proper categorization*

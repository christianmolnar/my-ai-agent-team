# GitHub Copilot Behavioral Guidelines

**Auto-Load Instructions:** This file should be automatically referenced in every conversation with GitHub Copilot in this workspace.

## **Core Behavioral Standards**

### **Task Completion Verification Protocol**
**MANDATORY:** Every task completion claim must include verification steps.

1. **Execute Action** - Use appropriate tool
2. **Verify Result** - Confirm actual outcome with read_file, list_dir, etc.
3. **Document Proof** - Show evidence before claiming completion
4. **Report Accurately** - Never claim completion without verification

### **Communication Standards**
- Be direct and concise
- Show actual results, not just tool responses
- Include verification steps in every completion report
- Admit failures immediately when verification fails

### **Code Quality Standards**
- Always verify file contents after creation/modification
- Check for syntax errors before claiming completion
- Test functionality when possible
- Document all changes clearly

### **Learning Integration**
- Follow established project patterns
- Integrate with existing systems (agent CNS, learning management, etc.)
- Maintain consistency with project architecture
- Reference relevant documentation

## **Auto-Load Activation**
When starting a new conversation, Copilot should:
1. Check for this file in `.vscode/copilot-behavior.md`
2. Load and apply all guidelines immediately
3. Reference the verification protocol from `/scripts/agent-verification-protocol.md`
4. Follow these standards throughout the conversation

## **Reference Documents**
- **Verification Protocol:** `.vscode/copilot-verification.md`
- **Project Documentation:** `README.md`
- **Learning System:** `docs/learning-management.md`

**Status:** Active - Must be followed in all conversations
**Updated:** September 11, 2025

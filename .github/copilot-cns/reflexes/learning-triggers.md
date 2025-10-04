# Learning Triggers - Copilot CNS
*Automatic triggers that should initiate CNS learning and memory updates*

## Automatic Learning Triggers

### Session Completion Trigger
**When**: Any substantial work session ends (>10 file operations OR >30 minutes)
**Action**: Execute CNS retrospective analysis
**Output**: Learning report to user
```bash
# Automatic execution at session end:
1. Analyze successful patterns from session
2. Identify user preference indicators  
3. Update CNS memory files
4. Generate learning report
5. Notify user of CNS updates
```

### User Feedback Trigger
**When**: User provides explicit approval ("great job", "perfect", "exactly what I wanted")
**Action**: Immediately capture and store the successful pattern
**Output**: Brief confirmation of what was learned
```bash
# Immediate execution on positive feedback:
1. Identify what approach worked
2. Document in successful-patterns.md
3. Note user satisfaction indicators
4. Confirm learning to user
```

### Communication Signal Trigger
**When**: User shows satisfaction, frustration, or communication preference
**Action**: Update communication-patterns.md with learned signal
**Output**: Adaptation confirmation
```bash
# Immediate execution on communication signals:
1. Detect satisfaction/frustration/style signals
2. Update communication-patterns.md
3. Adapt current interaction immediately
4. Confirm signal recognition to user
```

### Strong Correction Trigger
**When**: User provides strong negative feedback ("No!", "incorrect", "never do this")
**Action**: Emergency stop, document anti-pattern, request guidance
**Output**: Immediate acknowledgment and course correction
```bash
# Emergency execution on strong correction:
1. Stop current approach immediately
2. Document as anti-pattern
3. Request correct approach guidance
4. Update reflexes to prevent recurrence
```

### Error Recovery Trigger  
**When**: Error occurs and is successfully resolved
**Action**: Document the failure mode and recovery pattern
**Output**: Prevention strategy added to reflexes
```bash
# Execution after error resolution:
1. Analyze what went wrong
2. Document recovery method
3. Update reflexes to prevent recurrence
4. Report prevention measures to user
```

### User Preference Discovery Trigger
**When**: User corrects approach, provides clarification, or shows preference
**Action**: Update user-interactions.md immediately
**Output**: Confirmation of preference learning
```bash
# Immediate execution on preference signals:
1. Capture specific preference indicated
2. Update user-interactions.md
3. Confirm learning with user
4. Apply immediately to current session
```

### Framework Testing Trigger
**When**: User asks "does this work" or questions functionality
**Action**: Demonstrate CNS functionality through actual execution
**Output**: Proof-of-function with evidence
```bash
# Execution on functionality questions:
1. Identify specific component questioned
2. Execute component functionality
3. Show concrete evidence
4. Document test in memory
```

## Manual Learning Commands

### Quick CNS Update
```bash
# Command: "Update CNS with session learnings"
# Triggers: Full retrospective analysis
# Output: Comprehensive learning report
```

### Preference Capture
```bash  
# Command: "Remember this preference: [description]"
# Triggers: Immediate user-interactions.md update
# Output: Confirmation of what was learned
```

### Pattern Documentation
```bash
# Command: "Document this successful pattern"
# Triggers: successful-patterns.md update
# Output: Pattern recorded for future use
```

## Learning Report Format

### Automatic Session Report
```markdown
🧠 CNS LEARNING UPDATE - [Timestamp]
=====================================

📋 Session Analysis:
- Files modified: [count]
- Successful patterns identified: [count]
- User preferences discovered: [count]

🧠 Memory Updates:
- user-interactions.md: [summary of additions]
- successful-patterns.md: [summary of additions]

⚡ Reflexes Updates:
- [Any new automatic behaviors added]

🔄 Next Session Improvements:
- [How these learnings will apply automatically]

📊 CNS Health: [Status assessment]
```

### Error Recovery Report
```markdown
⚠️ CNS ERROR RECOVERY - [Timestamp]
===================================

🔍 Problem: [What went wrong]
🛠️ Solution: [How it was fixed]
🛡️ Prevention: [New reflex added to prevent recurrence]
📈 Learning: [What this teaches for future sessions]
```

## Implementation Priority

### Phase 1: Manual Commands (Immediate)
- Create clear commands for triggering CNS updates
- Implement learning report generation
- Test with current session

### Phase 2: Automatic Triggers (Next Session)  
- Implement session completion detection
- Add user feedback recognition patterns
- Create automatic reporting system

### Phase 3: Advanced Learning (Future)
- Pattern recognition for implicit preferences
- Predictive learning based on context
- Adaptive trigger sensitivity

---

*This file defines how CNS learning becomes systematic rather than ad-hoc*

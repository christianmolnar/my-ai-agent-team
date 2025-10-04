# Verification Protocols - Copilot Reflexes
*Automatic verification behaviors that should always trigger*

## Mandatory Verification Reflexes

### File Creation Reflex
```bash
# After creating any file
ls -la "[filepath]"         # Verify existence and permissions
cat "[filepath]"             # Verify content is correct
```

### File Modification Reflex
```bash
# After modifying any file
grep -n "[key-change]" "[filepath]"  # Verify change was applied
cat "[filepath]" | tail -10          # Check recent changes
```

### JSON File Reflex
```bash
# After modifying any JSON file
cat "[jsonfile]" | python -m json.tool  # Verify valid JSON syntax
```

### Script Execution Reflex
```bash
# Before claiming script success
echo "Verification command for script outcome"
# Always verify the intended result occurred
```

### Framework Testing Reflex
**Learned**: When user asks if framework "actually works", demonstrate functionality through real application
```bash
# Automatic response pattern:
1. Identify the specific framework component to test
2. Execute the component's intended function
3. Show concrete evidence of the function working
4. Document the test in CNS memory for future reference
```
**Trigger**: Questions about framework functionality, learning system effectiveness, or "does this work"

## Safety Reflexes

### Path Safety
- Always use absolute paths in automation
- Never use relative paths that could be ambiguous
- Verify target directory exists before operations

### Backup Reflex
```bash
# Before modifying important files
cp "[original]" "[original].backup"
```

### Permission Check Reflex
```bash
# Before file operations
ls -la "[target-directory]"  # Ensure write permissions
```

## Quality Reflexes

### Content Quality Check
- Verify generated content is complete, not partial
- Check that examples actually work
- Ensure documentation matches implementation

### CNS Update Reflex
- After significant task completion, update appropriate memory files
- Record new patterns that could help future tasks
- Note user preferences that emerged during interaction

---
*These reflexes should become automatic and always trigger*

# Development Workflow Standards

## File Creation and Editing Standards

### Issue Identified: create_file Tool Bug
- The `create_file` tool consistently creates 0-byte files despite reporting success
- This causes "blank file" issues and content loss
- **Status**: Permanently avoid using `create_file` tool

### Mandatory File Operations Workflow

#### 1. File Creation
**ALWAYS use `run_in_terminal` with heredoc:**
```bash
cat > filename.md << 'EOF'
# File content here
More content...

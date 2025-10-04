---
applyTo: "scripts/**/*.{sh,js,ts,py,mjs}"
---

# Script Development Instructions

## Script Organization Standards

When creating or working with scripts:

1. **Location Requirement**: ALL scripts must be placed in `/scripts/` directory
2. **Categorization**: Organize by purpose:
   ```
   /scripts/
   ├── setup/           ← Installation and environment setup
   ├── deployment/      ← Build and deployment automation  
   ├── validation/      ← Testing and verification scripts
   ├── fs/             ← File system operations
   ├── features/       ← Feature-specific scripts
   └── utilities/      ← General utility scripts
   ```

3. **File Naming**: Use kebab-case: `setup-environment.sh`, `validate-agents.js`
4. **Permissions**: Make shell scripts executable: `chmod +x script.sh`

## Script Standards

### Shell Scripts (.sh)
- Include shebang: `#!/bin/bash`
- Add description comment block
- Use absolute paths when possible
- Include error handling: `set -e`
- Verify operations with confirmation output

### Node.js Scripts (.js, .ts, .mjs)
- Include proper TypeScript types where applicable
- Use environment variable validation
- Include error handling and logging
- Follow project's ESLint configuration

## CNS Integration

- Update script location in CNS memory after creation
- Reference existing script patterns in `/scripts/` directory
- Never place scripts in repository root
- Consider script dependencies and categorization

## Personal Assistant Integration

Scripts related to Personal Assistant functionality should:
- Be documented for user understanding
- Include verification steps
- Place outputs in appropriate `/deliverables/` subdirectories
- Update relevant documentation in `/docs/`

---
*Always place scripts in /scripts/ directory with proper categorization*

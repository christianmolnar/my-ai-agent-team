---
applyTo: "docs/**/*.md,**/*.md"
---

# Documentation Standards

## Documentation Organization

When creating or updating documentation:

1. **Location Guidelines**:
   ```
   /docs/                          ← Technical implementation docs
   ├── features/                   ← Feature documentation
   ├── implementation/             ← Implementation guides
   ├── setup/                      ← Setup and configuration
   └── api/                        ← API documentation
   
   /AI-Agent-Team-Document-Library/ ← Comprehensive architecture docs
   ├── system-architecture/        ← Core system design
   ├── design-specifications/      ← UI/UX specifications
   ├── Test-Strategy/             ← Testing strategies
   └── Github-Copilot-Evolution-Strategy/ ← CNS documentation
   ```

2. **File Organization**:
   - Status updates and completion docs → `/docs/`
   - Architecture and design docs → `/AI-Agent-Team-Document-Library/`
   - User guides and setup → `/docs/` or `.github/`

## Documentation Standards

### Markdown Guidelines
- Use consistent heading hierarchy (# ## ### ####)
- Include metadata headers where appropriate
- Use emoji indicators for status (✅ ❌ 🚧 ⚠️)
- Include code blocks with language specification

### Content Requirements
- **Status Documents**: Clear completion indicators and next steps
- **Implementation Guides**: Step-by-step instructions with verification
- **Architecture Docs**: Diagrams, data flow, and integration points
- **User Documentation**: Clear examples and troubleshooting

## Personal Assistant Documentation

When documenting Personal Assistant features:

1. **User-Facing Docs**: How to interact with and use the system
2. **Developer Docs**: Implementation details and integration guides
3. **API Documentation**: Request/response formats and examples
4. **Testing Docs**: How to test and verify functionality

## CNS Integration

- Document CNS data structures and flow
- Include agent coordination protocols
- Document learning system integration
- Reference deliverable outputs and organization

## Quality Standards

- Include practical examples and code snippets
- Provide verification steps for implementations
- Link to related documentation and resources
- Keep status documents updated with current implementation state
- Use clear, actionable language

---
*Organize documentation by purpose and maintain consistency with project structure*

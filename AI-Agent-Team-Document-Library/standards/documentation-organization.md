# 📚 Documentation Organization Guide

This repository uses a **dual documentation structure** designed for different audiences and purposes.

## 🎯 **Quick Reference**

- **`/docs/`** → **Implementation & Operations** (for developers/users)
- **`/AI-Agent-Team-Document-Library/`** → **Strategy & Architecture** (for planning/design)

## 📁 **Directory Purposes**

### **`/docs/` - Implementation Documentation**
**Audience**: Developers, users, operators  
**Purpose**: How to build, use, and maintain the system  
**Content**: Step-by-step guides, feature docs, setup instructions

```
/docs/
├── implementation/     ← How to implement features
├── features/          ← Feature-specific user guides  
├── setup/             ← Installation and configuration
├── status/            ← Current project status and completion reports
└── AI-MODEL-SELECTION-GUIDE.md  ← Practical model selection
```

**Examples**:
- "How to add a new agent"
- "Personal Assistant user guide"
- "API integration tutorial"
- "Deployment instructions"

### **`/AI-Agent-Team-Document-Library/` - Strategic Documentation**
**Audience**: System architects, designers, researchers  
**Purpose**: Why the system works this way, design decisions, strategy  
**Content**: Architecture diagrams, design rationale, strategic plans

```
/AI-Agent-Team-Document-Library/
├── system-architecture/        ← Technical architecture and CNS design
├── design-specifications/      ← UI/UX and system design specs
├── Github-Copilot-Evolution-Strategy/  ← CNS strategy and evolution
├── Test-Strategy/             ← Testing philosophy and approaches
├── standards/                 ← Coding and design standards
├── migration-plans/           ← System evolution planning
└── Dev Design Documents/      ← Design decision documentation
```

**Examples**:
- "CNS Architecture Overview" 
- "Agent Communication Protocol Design"
- "GitHub Copilot Evolution Strategy"
- "System Integration Philosophy"

## 🎯 **Usage Guidelines**

### **When to Use `/docs/`**
✅ **Implementation tutorials**  
✅ **User guides and how-tos**  
✅ **Setup and configuration instructions**  
✅ **Feature documentation**  
✅ **API references**  
✅ **Troubleshooting guides**  
✅ **Project status reports**

### **When to Use `/AI-Agent-Team-Document-Library/`**
✅ **System architecture diagrams**  
✅ **Design decision rationale**  
✅ **Strategic planning documents**  
✅ **Research and experimentation reports**  
✅ **Long-term evolution strategies**  
✅ **Technical specifications**  
✅ **Design standards and guidelines**

## 🔄 **Content Flow**

```
Strategy & Design → Implementation → Operations

AI-Agent-Team-Document-Library/ → /docs/ → Running System
         ↑                              ↓
    Design Decisions                User Experience
    Architecture                    How-to Guides
    Strategic Plans                 Status Reports
```

## 📝 **Document Lifecycle**

1. **Research & Strategy** → `AI-Agent-Team-Document-Library/`
2. **Implementation Planning** → `AI-Agent-Team-Document-Library/Dev Design Documents/`
3. **Implementation Guides** → `/docs/implementation/`
4. **User Documentation** → `/docs/features/`
5. **Status Tracking** → `/docs/status/`

## 🎯 **Practical Examples**

### **CNS (Central Nervous System) Documentation**

**Strategic** (`/AI-Agent-Team-Document-Library/`):
- `Github-Copilot-Evolution-Strategy/CNS-ARCHITECTURE-ACTUAL.md` - Why CNS exists, design philosophy
- `system-architecture/CNS-LEARNING-FRAMEWORK.md` - How agents learn and evolve

**Implementation** (`/docs/`):
- `implementation/github-copilot-setup.md` - How to set up CNS
- `features/copilot-personalization.md` - How to use personalization features

### **Agent System Documentation**

**Strategic** (`/AI-Agent-Team-Document-Library/`):
- `system-architecture/AGENT-COORDINATION-PROTOCOL.md` - How agents communicate
- `design-specifications/AGENT-ROLE-DEFINITIONS.md` - Agent role design

**Implementation** (`/docs/`):
- `implementation/adding-new-agents.md` - How to create a new agent
- `features/personal-assistant-guide.md` - How to use the Personal Assistant

## 🔧 **Maintenance Guidelines**

### **Keep `/docs/` Current**
- Update when features change
- Verify setup instructions work
- Maintain accurate status reports
- Keep implementation guides in sync with code

### **Keep `/AI-Agent-Team-Document-Library/` Strategic**
- Focus on design rationale
- Document architectural decisions
- Maintain long-term vision documents
- Archive outdated strategic plans

## 🎉 **Benefits of This Structure**

✅ **Clear Separation**: Strategy vs Implementation  
✅ **Audience-Specific**: Architects vs Users  
✅ **Maintainable**: Different update cycles  
✅ **Discoverable**: Clear naming and organization  
✅ **Scalable**: Supports growth without confusion

---

**Remember**: When in doubt, ask "Is this about WHY or HOW?" 
- **WHY** → `AI-Agent-Team-Document-Library/`  
- **HOW** → `/docs/`

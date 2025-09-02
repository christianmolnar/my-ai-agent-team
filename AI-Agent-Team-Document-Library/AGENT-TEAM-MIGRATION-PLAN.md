# AI Agent Team Surgical Migration Plan
*Strategic extraction of AI Agent infrastructure from MyPersonalAssistant*

## 🎯 **Migration Objective**

**Primary Goal:** MOVE all essential AI Agent Team files to their new location and get the site back up and running as barebones as possible first, to ensure we have a working framework before implementing agent restructuring.

**Secondary Goal:** Extract the core AI Agent Team infrastructure from the bloated MyPersonalAssistant repository into a clean, focused `/Users/christian/Repos/My-AI-Agent-Team` repository while leaving behind all deployment bloat, interview materials, and non-essential components.

**UI Preservation:** The Experience (UI) design WILL NOT BE CHANGED. All pages will be moved with no UI changes to maintain working functionality.

## 📋 **Complete Inventory Analysis**

### 🏗️ **CATEGORY 1: MOVING OVER (Essential Agent Infrastructure)**

#### **Core Agent Files (Transfer As-Is Initially)**
```
ai-personal-team/agents/
├── Agent.ts                         ← Base agent interface
├── AgentRegistry.ts                 ← Central agent management
├── CommunicationsAgent.ts           ← Communications automation
├── ResearcherAgent.ts               ← Research automation
├── ImageGeneratorAgent.ts           ← Image generation
├── VinylResearcherAgent.ts          ← Specialized research (transfer now, consolidate later)
├── story_writer.ts                  ← Content creation (transfer now, integrate later)
├── tts.ts                          ← Text-to-speech (transfer as-is)
├── whisper_transcribe.ts           ← Speech-to-text (transfer as-is)
├── FactCheckerIntegration.ts       ← Fact checking (transfer now, consolidate later)
└── RSSFeedIntegration.ts           ← RSS processing (transfer as-is)

Note: All agent files transferred as-is initially to maintain functionality
Agent restructuring will happen in Phase 5 after site is stable
```

#### **Application Framework (Complete Transfer)**
```
ai-personal-team/app/                ← Complete Next.js application (NO UI changes)
├── favicon.ico
├── layout.tsx                       ← Preserve existing layouts
├── page.tsx                         ← Preserve existing pages
├── globals.css                      ← Preserve all styling
├── api/                            ← All API endpoints as-is
├── components/                     ← All React components as-is
├── [all existing pages]            ← Transfer ALL pages unchanged
└── [all subdirectories]            ← Complete directory structure
```

#### **Core Infrastructure (As-Is Transfer)**
```
ai-personal-team/lib/               ← All shared utilities (unchanged)
ai-personal-team/types/             ← All TypeScript definitions (unchanged)
ai-personal-team/hooks/             ← All React hooks (unchanged)
ai-personal-team/services/          ← All service layer (unchanged)
ai-personal-team/components/        ← All UI components (unchanged)
ai-personal-team/public/            ← All static assets (unchanged)
```

#### **Database Schema**
```
ai-personal-team/database/
├── schema.sql                      ← Core database structure
├── create_supabase_tables.sql      ← Table creation
└── [essential migration scripts]
```

#### **Configuration Files (Essential for Working Site)**
```
ai-personal-team/
├── package.json                    ← Dependencies (clean install)
├── package-lock.json               ← Lock file for exact dependencies
├── next.config.js                  ← Next.js configuration
├── tsconfig.json                   ← TypeScript configuration
├── tailwind.config.js              ← Styling configuration (preserve UI)
├── postcss.config.js               ← PostCSS configuration (if exists)
├── .env.local.template             ← Environment template (NOT actual .env)
├── .gitignore                      ← Git exclusions
├── .eslintrc.json                  ← ESLint configuration (if exists)
└── jest.config.js                  ← Testing configuration (if keeping tests)
```

#### **Essential Documentation**
```
ai-personal-team/docs/              ← Agent documentation
framework/docs/                     ← Framework documentation (CNS plan, etc.)
framework/templates/                ← Reusable templates
```

#### **Shared Framework Components**
```
framework/tools/Workspace-MCP/      ← MCP server implementation
shared/areas/                       ← Area templates
shared/who/                         ← People/team templates
```

---

### 🗑️ **CATEGORY 2: LEFT BEHIND (Bloat & Non-Essential)**

#### **Deployment Infrastructure (1.2GB+ of bloat)**
```
❌ ai-personal-team/node_modules/           ← 641MB dependencies (rebuild clean)
❌ node_modules/                            ← 185MB root dependencies  
❌ .next/                                   ← Build artifacts
❌ ai-personal-team/.next/                  ← Build artifacts
❌ tsconfig.tsbuildinfo                     ← Compiler cache
```

#### **Kubernetes & Container Orchestration**
```
❌ k8s-manifests/                           ← Kubernetes deployment files
❌ ai-personal-team/k8s/                    ← K8s configs
❌ docker/                                  ← Docker configurations
❌ Dockerfile                               ← Container definitions
❌ deployment-archive.yaml                   ← Archive deployment configs
❌ current-scenario-engine.yaml             ← Scenario engine configs
❌ scenario-engine-v*.py                    ← Multiple scenario versions
❌ scenario-engine-v*.yaml                  ← Scenario deployment configs
❌ configmap-step*.yaml                     ← ConfigMap definitions
```

#### **Monitoring & Metrics (Interview Demo Material)**
```
❌ All *-dashboard.json files               ← Grafana dashboards
❌ *-metrics*.* files                       ← Prometheus metrics
❌ scenario-control-dashboard.html          ← Control interfaces  
❌ robot-fleet-* files                      ← Robot fleet monitoring
❌ tenant-drill-down-dashboard.json         ← Multi-tenant dashboards
❌ mission-control-* files                  ← Mission control interfaces
❌ enhanced-mission-control-dashboard.json  ← Enhanced dashboards
❌ fixed-dashboard-metrics.json             ← Fixed dashboard configs
❌ dual_region_*.py                         ← Dual region implementations
❌ fix_*.py                                 ← Fix scripts
❌ serve-dashboard.py                       ← Dashboard servers
❌ start-dashboard.sh                       ← Dashboard startup scripts
❌ stop-dashboard.sh                        ← Dashboard shutdown scripts
❌ import_dashboard.sh                      ← Dashboard import scripts
```

#### **Interview & Demo Materials**
```
❌ interview/                               ← Interview preparation
❌ SYSTEM_ARCHITECTURE*.docx               ← Architecture documents
❌ SYSTEM_ARCHITECTURE.md                  ← Architecture markdown
❌ SCENARIO-CONTROL-README.md              ← Scenario documentation
❌ MEMORIAS_AI_BACKLOG.md                  ← Backlog items
❌ KUBERNETES_DEPLOY.md                    ← Deployment documentation
❌ MEMORIAS_AI_SETUP_GUIDE.md              ← Setup guides
❌ CORRECT_MEMORIAS_AI_SETUP_GUIDE.md      ← Corrected guides
❌ START-HERE.md                           ← Getting started docs
```

#### **Testing & Development Artifacts**
```
❌ test-*.js                               ← Test scripts
❌ test-*.ts                               ← TypeScript tests
❌ ai-personal-team/tests/                 ← Test suites
❌ jest.config.js                          ← Jest configuration
❌ jest.setup.js                           ← Jest setup
```

#### **Archive & Legacy Materials**
```
❌ backups/                                ← 411MB archive directory (not needed)
❌ memorias-ai-backup/                     ← Memorias archive (not needed)
❌ agents/MemoriasAI/                      ← Duplicate agent folder (not needed)
❌ agents/ResearcherAgent/                 ← Duplicate agent folder (not needed)
```

#### **Logs & Temporary Files**
```
❌ *.log                                   ← All log files
❌ metrics_proxy.log                       ← Metrics logs
❌ dual_region_server.log                  ← Server logs
❌ grafana-port-forward.log                ← Port forwarding logs
❌ prometheus-port-forward.log             ← Prometheus logs
```

#### **Environment & Configuration Bloat**
```
❌ .env                                    ← Actual environment (security)
❌ .env.local                              ← Local environment (security)
❌ .env.example                            ← Example files (keep template)
❌ cookies.txt                             ← Browser cookies
❌ vercel.json                             ← Vercel deployment
❌ .vercel/                                ← Vercel artifacts
```

#### **Development Tool Configs**
```
❌ ai-personal-team/.vscode/               ← VS Code settings (workspace-specific)
❌ .vscode/                                ← Root VS Code settings
❌ postcss.config.js                       ← PostCSS config (if unused)
❌ prisma/                                 ← Prisma ORM (if unused)
```

---

## 🚀 **Migration Strategy**

### **Phase 1: Barebones Site Transfer (Priority: Get It Working)**
1. **Initialize clean Git repository** in `/Users/christian/Repos/My-AI-Agent-Team`
2. **Transfer complete Next.js application** from `ai-personal-team/` 
   - Copy entire `app/` directory (all pages, layouts, components)
   - Copy `lib/`, `types/`, `hooks/`, `services/`, `components/`
   - Copy all configuration files (`package.json`, `next.config.js`, `tsconfig.json`, etc.)
3. **Preserve all existing UI/UX** - NO design changes
4. **Fresh npm install** and verify site runs locally
5. **Test all existing functionality** to ensure nothing breaks

### **Phase 2: Agent File Transfer (Maintain Current Structure)**
1. **Copy entire `agents/` directory** as-is - no restructuring yet
2. **Copy database schema** and essential migrations  
3. **Transfer all API endpoints** and existing functionality
4. **Verify all current agents work** in new location

### **Phase 3: Clean Up and Optimize**
1. **Remove development bloat** (node_modules, build artifacts, logs)
2. **Update .gitignore** to prevent bloat accumulation
3. **Set up proper VS Code exclusions** for performance
4. **Clean dependency installation** (no interview/demo packages)

### **Phase 4: Framework Integration**
1. **Move shared framework** components from `framework/`
2. **Transfer area and template** structures from `shared/`
3. **Integrate CNS documentation** and setup plans

### **Phase 5: Agent Restructuring (Future)**
1. **After site is stable**, implement agent hierarchy changes
2. **Consolidate functions** (VinylResearcher → ResearcherAgent, etc.)
3. **Add new specialized agents** per the structure definition
4. **Implement agent collaboration framework**

### **Phase 6: Private Integration Planning**
1. **Document connection strategy** to `my-personal-assistant-private`
2. **Map data flow** between public agents and private operations
3. **Design secure integration** points

---

## 🎯 **Target Agent Roster**

### **Core Management Agents**

#### **1. Master Orchestrator**
- **Directs all agent activities**
- **Receives instructions from human**
- **ALWAYS analyzes whether EACH AGENT does or does not have a role in a particular project**
- **Creates comprehensive plan of action**, including what each involved agent's role will be in completing the plan, what success looks like
- **Strategic oversight and decision-making authority**
- **Cross-project learning and optimization**
- **Resource allocation and priority management**

#### **2. Project Coordinator** 
*Reports to Master Orchestrator, takes overall plan and:*
- **Goes to the right level of depth and granularity**, putting a detailed project plan together
- **Outlines more detailed agent interactions**, including input and output deliverables from and to each agent
- **Keeps a log of all activities** that will be provided at the conclusion of EVERY PROJECT
- **Creates a phase strategy** with milestones and dependencies
- **Creates a communication strategy** to keep the human informed at every step
- **Risk management and mitigation planning**
- **Quality assurance coordination across all agents**
- **Timeline management and progress tracking**

### **Specialized Function Agents**

#### **3. Communications Agent**
- **Email writing** (all types: professional, personal, marketing, etc.)
- **Every type of document writing**: Word research papers, plans, stories, reports, proposals
- **Meeting notes and minutes documentation**
- **Presentation creation and content development**
- **Social media content creation**
- **Marketing copy and promotional materials**
- **Technical documentation writing**
- **Grant and proposal writing**
- **Content editing and proofreading**

#### **4. Researcher Agent** 
*Includes VinylResearcherAgent as a capability, includes Fact Checker as a capability*
- **General research automation** across all domains
- **Vinyl and music research capabilities** (specialized function)
- **Fact checking and verification** (integrated capability)
- **Market research and competitive analysis**
- **Academic and scientific research**
- **Legal and regulatory research**
- **Historical and archival research**
- **Real-time data gathering and analysis**

#### **5. Image and Video Generator Agent**
- **Static image generation** for all purposes
- **Video content creation and editing**
- **Graphic design and visual assets**
- **Animation and motion graphics**
- **Visual storytelling and presentation media**
- **Brand asset creation**

#### **6. PersonalAssistantBridge**
*Bridge to private operations*
- **Secure API interfaces** to private repository
- **Data flow coordination** between public agents and private data
- **Privacy-preserving data access**
- **Authentication and authorization management**

### **Software Development Team Agents**

#### **7. Product Manager**
- **Business Requirement Identification** and validation
- **Specification Document Writing** and maintenance
- **Stakeholder communication and alignment**
- **Feature prioritization and roadmap planning**
- **User story creation and acceptance criteria**
- **Market analysis and competitive positioning**
- **Product lifecycle management**

#### **8. Data Scientist**
- **Data researcher** and analysis expert
- **Gathers data that justifies** whether a project should or should not be undertaken
- **Works with other agents** to help them outline the reasons why a project should or should not be undertaken
- **Provides at least one primary deliverable**: a data driven, measurable set of metrics and results for what success looks like for the project
- **Predictive modeling and analytics**
- **A/B testing design and analysis**
- **Performance metrics definition and tracking**
- **Data visualization and reporting**

#### **9. Development Design Documentation Creator**
- **Specializes in creation of dev design documents**
- **Technical architecture documentation**
- **API specification writing**
- **System design documentation**
- **Database schema documentation**
- **Integration and workflow documentation**

#### **10. Experience Designer (UI Designer)**
- **User interface design and prototyping**
- **User experience research and testing**
- **Design system creation and maintenance**
- **Accessibility and usability optimization**
- **Wireframing and mockup creation**

#### **11. Back End Software Developer**
- **Server-side application development**
- **Database design and optimization**
- **API development and integration**
- **Infrastructure and deployment automation**
- **Performance optimization and scaling**

#### **12. Front End Software Developer**
- **Client-side application development**
- **User interface implementation**
- **Browser compatibility and optimization**
- **Progressive web app development**
- **Mobile responsive design implementation**

#### **13. Test Expert**
- **Test strategy and planning**
- **Automated testing framework development**
- **Quality assurance and validation**
- **Performance and load testing**
- **User acceptance testing coordination**

#### **14. Monitoring Expert**
- **System monitoring and alerting setup**
- **Performance metrics and dashboards**
- **Log analysis and troubleshooting**
- **Capacity planning and resource monitoring**

#### **15. Availability and Reliability Expert**
- **High availability architecture design**
- **Disaster recovery planning**
- **Failover and redundancy implementation**
- **Service level agreement (SLA) management**
- **Incident response planning**

#### **16. Performance Expert**
- **Performance optimization and tuning**
- **Bottleneck identification and resolution**
- **Scalability planning and implementation**
- **Resource utilization optimization**

#### **17. Security Expert**
- **Software security vulnerability assessment**
- **Security architecture and implementation**
- **Penetration testing and security audits**
- **Compliance and regulatory security requirements**
- **Threat modeling and risk assessment**

#### **18. Privacy Guardian**
- **Data privacy and protection expert**
- **GDPR, CCPA, and privacy regulation compliance**
- **Data classification and handling policies**
- **Privacy impact assessments**
- **Data anonymization and pseudonymization**

---

### **Agent Collaboration Framework**

#### **Review and Feedback Process**
- **The Orchestrator and Project Coordinator** will ensure each agent submits their work product to all applicable agents for review, at least for one cycle, but until all comments by other agents are addressed
- **Agents, after having taken feedback from agents and discussed pros and cons of all feedback** are empowered to make the final decision once all feedback has been given
- **We do not want a situation where agents get into endless loops** but we also do not want agent input to be taken lightly by other agents

#### **Code Review Requirements**
- **Code Reviews must be performed by ALL technical agents**: from back end and front end software developers to all the test, monitoring, availability, performance, security, and privacy specialists
- **Multi-stage review process** ensuring comprehensive coverage
- **Feedback integration and conflict resolution**

---

### **Legacy Agents Being Consolidated**
- **VinylResearcherAgent** → Function within ResearcherAgent
- **story_writer** → Function within CommunicationsAgent  
- **FactCheckerIntegration** → Function within ResearcherAgent
- **FInsightAI** → Moved to separate repository
- **MemoriasAI** → Moved to separate repository

---

## 📊 **Size Reduction Estimate**

**Before Migration:** ~1.7GB (68,063 files)
**After Migration:** ~50-100MB (est. 500-1,000 files)
**Reduction:** ~95% size reduction, ~98% file count reduction

**Performance Impact:**
- GitHub Copilot CPU usage: Expected to drop from 100%+ to normal levels
- VS Code responsiveness: Significant improvement
- Build times: Faster clean builds
- Development experience: Much more responsive

---

## ⚠️ **Migration Safeguards**

1. **Incremental migration** with testing at each phase
2. **Git branching strategy** for rollback capability
3. **Documentation** of all moved components
4. **Verification testing** of agent functionality after each phase

---

## 🔄 **Private Integration Strategy** (Phase 5)

The connection to `/Users/christian/Repos/my-personal-assistant-private` will be designed as:

1. **API Bridge Pattern** - Clean API interfaces between public agents and private data
2. **Configuration-Based** - Environment variables and config files for connection
3. **Secure Data Flow** - No private data in public repository
4. **Modular Integration** - Each agent connects independently to private services

This ensures the public agent team remains clean and focused while maintaining access to private operational data through secure, well-defined interfaces.

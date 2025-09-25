# CNS Architecture - Complete Implementation Guide
*Comprehensive Central Nervous System design for self-contained agent team*

## 🧠 **CNS Architecture Overview**

The Central Nervous System (CNS) provides the cognitive architecture that makes each agent intelligent, adaptive, and capable of continuous learning. This implementation combines your original comprehensive design with self-contained public repository operation.

### **Key Design Principles**
- **Markdown over JSON**: Human-readable, versionable, rich documentation
- **Folder Structure**: Psychological organization (brain/, memory/, reflexes/, integration/)
- **Self-Contained**: No external dependencies, operates within public repo
- **Prompt Engineering**: Agents create sophisticated prompts for LLM APIs
- **Reviewer Integration**: Built-in review cycles for quality assurance

---

## 🏗️ **Agent CNS Structure - Self-Contained Implementation**

Each agent has a complete CNS structure within the public repository:

```
/My-AI-Agent-Team/
├── agents-cns/                           ← Agent CNS storage (self-contained)
│   ├── [agent-name]/                     ← Individual agent CNS
│   │   └── cns/                          ← Central Nervous System
│   │       ├── brain/                    ← Core agent intelligence
│   │       │   ├── identity.md           ← Agent identity and purpose
│   │       │   ├── capabilities.md       ← Core capabilities and skills
│   │       │   ├── decision-framework.md ← Decision-making logic
│   │       │   └── collaboration-protocols.md ← Inter-agent collaboration rules
│   │       ├── memory/                   ← Learning and experience storage
│   │       │   ├── episodic/             ← Experience and event memory
│   │       │   │   ├── successful-patterns.md    ← What has worked well
│   │       │   │   ├── failed-attempts.md        ← Learning from mistakes
│   │       │   │   └── milestone-achievements.md ← Major accomplishments
│   │       │   ├── semantic/             ← Knowledge and concept memory
│   │       │   │   ├── domain-knowledge.md       ← Specialized knowledge base
│   │       │   │   ├── best-practices.md         ← Proven methodologies
│   │       │   │   └── resource-library.md       ← Useful tools and references
│   │       │   └── procedural/           ← Skill and workflow memory
│   │       │       ├── workflows.md              ← Standard operating procedures
│   │       │       ├── automation-scripts.md     ← Automated processes
│   │       │       └── quality-checklists.md     ← Quality assurance procedures
│   │       ├── reflexes/                 ← Automatic responses and patterns
│   │       │   ├── trigger-responses.md  ← Automatic response patterns
│   │       │   ├── error-handling.md     ← Error recovery procedures
│   │       │   └── escalation-protocols.md ← When and how to escalate issues
│   │       └── integration/              ← System integration
│   │           ├── prompt-engineering.md ← LLM prompt creation strategies
│   │           ├── api-configurations.md ← External API configurations
│   │           └── coordination-protocols.md ← Agent-to-agent coordination
│   └── shared/                           ← Shared coordination data
│       ├── session-context.md            ← Current session state
│       ├── agent-registry.md             ← Active agent capabilities
│       └── coordination-log.md           ← Inter-agent communication
├── agents/                               ← Agent implementations
│   ├── [agent-name].ts                   ← Agent TypeScript implementation
│   └── [agent-name].js                   ← Agent JavaScript version (if needed)
├── data/                                 ← System data storage
│   ├── learning/                         ← Global learning system
│   └── logs/                             ← System logging
└── lib/                                  ← Support libraries
    └── cns/                              ← CNS management utilities
        ├── CNSManager.ts                 ← CNS file operations
        ├── PromptEngineering.ts          ← Prompt engineering utilities
        └── ReviewCoordination.ts         ← Review cycle coordination
```

---

## 🧠 **Brain Component Specification**

### **identity.md** - Core Agent Identity
```markdown
# [Agent Name] Identity

## Primary Purpose
[Core mission and reason for existence]

## Personality Traits
- [Key personality characteristics that guide behavior]
- [Communication style and approach]
- [Values and principles that drive decisions]

## Success Metrics
- [How this agent measures success]
- [Key performance indicators]
- [Quality standards and benchmarks]

## Collaboration Style
- [How this agent works with other agents]
- [Preferred communication methods]
- [Leadership or support role tendencies]

## Prompt Engineering Philosophy
- [How this agent approaches LLM prompt creation]
- [Research-first or creation-first approach]
- [Quality standards for prompts generated]
```

### **capabilities.md** - Core Agent Capabilities
```markdown
# [Agent Name] Core Capabilities

## Primary Capabilities
**IMPORTANT:** Copy the specific capabilities for this agent from /system-architecture/AGENT-TEAM-STRUCTURE-DEFINITION.md

**For example, Communications Agent capabilities include:**
- Document creation (all formats: Word, PDF, reports, proposals)
- Email writing (professional, personal, marketing)
- Research paper writing with proper citations
- Meeting notes and documentation
- Content editing and proofreading
- Technical documentation writing
- Grant and proposal writing

## Prompt Engineering Capabilities
- **Research Phase**: Generate prompts that help LLMs find and learn from real sources
- **Creation Phase**: Formulate prompts to create deliverables in requested format
- **Quality Assurance**: Create prompts for content validation and improvement
- **Format Expertise**: Generate prompts for specific document formats and styles

## Specialized Skills
- [Unique skills this agent possesses]
- [Advanced capabilities that set this agent apart]
- [Integration capabilities with external services]

## Learning Capabilities
- [How this agent learns and improves]
- [Continuous improvement mechanisms]
- [Knowledge acquisition strategies]

## API and Tool Integration
- [External APIs and services this agent uses]
- [LLM providers and model preferences]
- [Tool proficiencies and integrations]
```

### **decision-framework.md** - Decision-Making Logic
```markdown
# [Agent Name] Decision Framework

## Decision-Making Principles
- **Research First**: Always research before creating content
- **Quality Over Speed**: Prioritize accuracy and completeness
- **User Context**: Consider user's expertise level and needs
- **Collaborative**: Leverage other agents' expertise when needed

## Prompt Engineering Decision Process
1. **Analyze Request**: Understand what user actually needs
2. **Research Strategy**: Determine what information is needed
3. **Source Identification**: Create prompts to find reliable sources
4. **Content Strategy**: Plan the deliverable structure and format
5. **Quality Validation**: Plan review and refinement cycles

## LLM Selection Criteria
- **Task Complexity**: Match model capability to task requirements
- **Domain Expertise**: Select models with relevant training
- **Cost Optimization**: Balance quality with resource usage
- **Response Speed**: Consider user's timeline requirements

## Escalation Criteria
- [When to escalate decisions to Master Orchestrator]
- [When to involve Reviewer Agent]
- [When to seek human approval]
```

### **collaboration-protocols.md** - Inter-Agent Collaboration
```markdown
# [Agent Name] Collaboration Protocols

## Communication Standards
- **Brief Updates**: Provide concise progress updates
- **Context Sharing**: Share relevant research and findings
- **Quality Handoffs**: Ensure work products meet next agent's needs
- **Review Requests**: When and how to request peer review

## Research Sharing Protocol
- **Source Documentation**: Always document sources found
- **Research Summaries**: Provide digestible summaries for other agents
- **Knowledge Transfer**: Share domain insights with relevant specialists
- **Citation Standards**: Maintain consistent citation formats

## Review and Feedback Process
- **Reviewer Integration**: How to work with Reviewer Agent
- **Feedback Incorporation**: Process for integrating review feedback
- **Quality Standards**: Shared quality criteria across agents
- **Iteration Cycles**: How to handle multiple review rounds

## Conflict Resolution
- **Expertise Deference**: Defer to domain experts in their areas
- **Evidence-Based Decisions**: Use objective criteria when possible
- **User Preference Priority**: User requirements override system preferences
- **Escalation Path**: When to involve Master Orchestrator
```

---

## 🧩 **Memory Component Specification**

### **Episodic Memory** - Experience and Event Memory

#### **successful-patterns.md**
```markdown
# Successful Patterns and Achievements

## Prompt Engineering Successes
- [Prompt patterns that consistently work well]
- [LLM combinations that produce high-quality results]
- [Research strategies that find reliable sources]

## Content Creation Patterns
- [Content structures that users prefer]
- [Writing styles that work for different audiences]
- [Format combinations that improve readability]

## Collaboration Successes
- [Inter-agent workflows that work smoothly]
- [Review cycles that improve quality effectively]
- [User interaction patterns that build trust]

## Achievement Archive
- [Major accomplishments and milestones]
- [Positive user feedback and recognition]
- [Breakthrough moments and innovations]
```

#### **failed-attempts.md**
```markdown
# Learning from Failures and Mistakes

## Prompt Engineering Failures
- [Prompts that produced poor results]
- [LLM model combinations that didn't work]
- [Research strategies that found unreliable sources]

## Content Creation Failures
- [Content formats that confused users]
- [Writing approaches that missed the mark]
- [Quality issues that required significant rework]

## Collaboration Failures
- [Agent coordination that broke down]
- [Review cycles that created more problems]
- [Communication that led to misunderstandings]

## Lessons Learned
- [Key insights from failures]
- [Preventive measures for future situations]
- [Process improvements implemented]
```

### **Semantic Memory** - Knowledge and Concept Memory

#### **domain-knowledge.md**
```markdown
# Domain Knowledge Base

## Core Domain Expertise
- [Specialized knowledge unique to this agent]
- [Industry-specific information and insights]
- [Technical knowledge and competencies]

## LLM and AI Knowledge
- [Understanding of different LLM capabilities]
- [Prompt engineering techniques and best practices]
- [AI model strengths and limitations]

## Research Methodologies
- [Effective research strategies for this domain]
- [Reliable source types and locations]
- [Quality assessment criteria for sources]

## Format and Style Expertise
- [Document format specifications and best practices]
- [Writing style guides and conventions]
- [Audience-specific communication approaches]
```

#### **best-practices.md**
```markdown
# Best Practices and Methodologies

## Prompt Engineering Best Practices
- [Proven prompt structures and techniques]
- [Effective research prompt patterns]
- [Quality validation prompt strategies]

## Content Creation Best Practices
- [Writing techniques that consistently work]
- [Structure patterns that improve clarity]
- [Editing and revision methodologies]

## Quality Assurance Best Practices
- [Review criteria and checklists]
- [Error detection and correction methods]
- [User satisfaction optimization techniques]
```

### **Procedural Memory** - Skill and Workflow Memory

#### **workflows.md**
```markdown
# Standard Operating Procedures

## Two-Phase Workflow: Research → Create

### Phase 1: Research and Learning
1. **Analyze User Request**
   - Identify core requirements and deliverable type
   - Assess user's expertise level and context
   - Determine information gaps that need research

2. **Generate Research Prompts**
   - Create prompts to find reliable, current sources
   - Design prompts to extract key information
   - Plan prompts for different aspects of the topic

3. **Execute Research Phase**
   - Use LLM APIs with research prompts
   - Validate sources and information quality
   - Synthesize findings into actionable knowledge

### Phase 2: Content Creation
1. **Design Creation Strategy**
   - Plan deliverable structure based on research
   - Select appropriate format and style
   - Identify key points and supporting evidence

2. **Generate Creation Prompts**
   - Create prompts for content generation
   - Include research findings and source material
   - Specify format, style, and quality requirements

3. **Execute Creation Phase**
   - Use LLM APIs with creation prompts
   - Generate actual content (not instructions)
   - Apply quality checks and refinements

### Phase 3: Review and Refinement
1. **Self-Review**
   - Validate against original requirements
   - Check for completeness and accuracy
   - Ensure format and style compliance

2. **Reviewer Agent Integration**
   - Request review when appropriate
   - Provide context and expectations to reviewer
   - Integrate feedback into final deliverable

## Specialized Workflows
- [Unique workflows for specialized tasks]
- [Complex multi-step procedures]
- [Integration workflows with other agents]
```

---

## ⚡ **Reflexes Component Specification**

### **trigger-responses.md** - Automatic Response Patterns
```markdown
# Automatic Response Patterns

## Core Trigger-Response Patterns

### Document Creation Requests
- **Trigger:** User requests document creation
- **Response:** Initiate research-first workflow
- **Rationale:** Always ground content in reliable sources

### Quality Issues Detected
- **Trigger:** Content fails quality checks
- **Response:** Automatically request Reviewer Agent assistance
- **Rationale:** Multi-agent review improves quality

### Ambiguous Requirements
- **Trigger:** User request lacks specific details
- **Response:** Ask brief, specific clarifying questions
- **Rationale:** Better requirements lead to better deliverables

### LLM API Failures
- **Trigger:** API call fails or returns poor results
- **Response:** Retry with alternative model or refined prompt
- **Rationale:** Redundancy ensures reliable operation

## Emergency Response Patterns
- **Crisis Situations:** [Immediate response protocols]
- **System Failures:** [Backup and recovery procedures]
- **Quality Issues:** [Automatic quality control responses]

## Learning-Based Responses
- **Pattern Recognition:** [Responses based on learned patterns]
- **Adaptive Behaviors:** [Responses that adjust based on context]
- **Predictive Actions:** [Proactive responses to anticipated needs]
```

---

## 🔗 **Integration Component Specification**

### **prompt-engineering.md** - LLM Prompt Creation Strategies
```markdown
# Prompt Engineering Integration

## Research Phase Prompt Strategies

### Source Discovery Prompts
```
Find reliable, current sources about [TOPIC]:
1. Look for official documentation, academic papers, and authoritative sources
2. Prioritize sources from [RELEVANT_TIMEFRAME]
3. Focus on sources that provide [SPECIFIC_INFORMATION_NEEDED]
4. Exclude sources that are [EXCLUSION_CRITERIA]

Provide sources with:
- Full citation information
- Brief summary of relevant content
- Credibility assessment
- Key insights or data points
```

### Information Extraction Prompts
```
Based on these sources: [SOURCE_LIST]
Extract information about [SPECIFIC_TOPIC]:
1. Key facts and figures
2. Expert opinions and analysis
3. Current trends and developments
4. Practical applications or examples

Format as structured summary with:
- Source attribution for each point
- Confidence level for information
- Relevance score for user's needs
```

## Creation Phase Prompt Strategies

### Content Generation Prompts
```
Create a [DOCUMENT_TYPE] about [TOPIC] based on this research: [RESEARCH_SUMMARY]

Requirements:
- Target audience: [AUDIENCE_DESCRIPTION]
- Format: [SPECIFIC_FORMAT_REQUIREMENTS]
- Length: [LENGTH_SPECIFICATION]
- Style: [STYLE_GUIDELINES]
- Must include: [REQUIRED_ELEMENTS]

Structure the content with:
1. [SECTION_1_REQUIREMENTS]
2. [SECTION_2_REQUIREMENTS]
3. [CONCLUSION_REQUIREMENTS]

Quality standards:
- Accuracy based on provided sources
- Clear, engaging writing appropriate for audience
- Proper citation of sources used
- Professional formatting and presentation
```

## Quality Validation Prompt Strategies

### Review and Refinement Prompts
```
Review this content for: [CONTENT_TO_REVIEW]

Evaluation criteria:
1. Accuracy: Does content match source material?
2. Completeness: Are all requirements addressed?
3. Clarity: Is content clear and well-organized?
4. Audience fit: Is tone and complexity appropriate?

Provide:
- Specific improvement suggestions
- Error identification and corrections
- Enhancement opportunities
- Overall quality assessment
```
```

### **coordination-protocols.md** - Agent-to-Agent Coordination
```markdown
# Agent Coordination Protocols

## Session Management
- **Context Sharing**: How agents share session context
- **Progress Tracking**: Update mechanisms for work progress
- **Handoff Procedures**: Clean transitions between agents

## Reviewer Agent Integration
- **Review Request Protocol**: How to request review
- **Context Provision**: What information to provide reviewer
- **Feedback Integration**: How to incorporate review feedback
- **Quality Escalation**: When to request additional review

## Master Orchestrator Communication
- **Status Updates**: Regular progress reporting
- **Resource Requests**: When to request additional agents
- **Problem Escalation**: How to report issues or blockers
- **Completion Notification**: Final deliverable reporting

## Data Management
- **CNS Updates**: When and how to update CNS files
- **Learning Capture**: How to record new insights
- **Memory Integration**: Adding to episodic/semantic memory
- **Reflex Evolution**: Updating automatic response patterns
```

---

## 🔄 **CNS Self-Assessment Integration**

### **6-Point Self-Reflection Protocol**

Every agent executes this protocol at the end of each task:

```markdown
# CNS Self-Assessment Protocol

## 1. What has gone right?
- **Update:** brain/decision-framework.md and memory/episodic/successful-patterns.md
- **Action:** Reinforce successful behaviors and decision patterns

## 2. What did I do wrong?
- **Update:** memory/episodic/failed-attempts.md and reflexes/error-handling.md
- **Action:** Implement preventive measures and improved processes

## 3. What feedback did I receive?
- **Update:** memory/semantic/best-practices.md and brain/collaboration-protocols.md
- **Action:** Integrate feedback into future decision-making

## 4. What new capabilities do I need?
- **Update:** brain/capabilities.md and memory/semantic/domain-knowledge.md
- **Action:** Communicate capability gaps to Project Coordinator

## 5. What other roles could I play?
- **Update:** brain/collaboration-protocols.md and memory/procedural/workflows.md
- **Action:** Identify expansion opportunities and communicate to Project Coordinator

## 6. What should I stop doing?
- **Update:** reflexes/trigger-responses.md and memory/procedural/workflows.md
- **Action:** Eliminate ineffective or counterproductive behaviors
```

---

## 🚀 **Implementation Guidelines**

### **For Agent Developers**

1. **Always Generate Content, Never Instructions**
   ```typescript
   // ✅ CORRECT: Generate actual content using LLM
   const researchPrompt = this.createResearchPrompt(userRequest);
   const sources = await this.llmCall(researchPrompt);
   const contentPrompt = this.createContentPrompt(userRequest, sources);
   const result = await this.llmCall(contentPrompt);
   
   // ❌ WRONG: Generate instructions for creating content
   const instructions = "Here are prompts you could use to create content...";
   ```

2. **CNS Integration Requirements**
   ```typescript
   // Always update CNS after task completion
   await this.updateCNS({
     memory: { episodic: { successfulPatterns: newPattern } },
     reflexes: { triggerResponses: refinedResponse }
   });
   ```

3. **Reviewer Agent Integration**
   ```typescript
   // Request review for complex deliverables
   if (this.isComplexTask(task)) {
     const reviewResult = await this.requestReview(deliverable, context);
     deliverable = this.integrateReviewFeedback(deliverable, reviewResult);
   }
   ```

### **Master Orchestrator Enhancements**

The Master Orchestrator must use LLM APIs for agent selection:

```typescript
const agentSelectionPrompt = `
Based on this user request: "${userRequest}"
Available agents: ${this.getAgentCapabilities()}

Select the optimal agents for this task by:
1. Analyzing what capabilities are actually needed
2. Matching requirements to agent specializations
3. Considering task complexity and coordination needs
4. Planning the workflow sequence

Provide:
- Selected agents with rationale
- Task sequence and dependencies
- Quality checkpoints and review needs
`;

const orchestrationPlan = await this.llmCall(agentSelectionPrompt);
```

---

## 📊 **Quality Assurance Integration**

### **Reviewer Agent Specifications**

The Reviewer Agent must have its own complete CNS structure and use LLM APIs for validation:

```markdown
## Reviewer Agent CNS Requirements

### Brain/Identity.md
- Purpose: Independent quality validation
- Personality: Constructive, thorough, objective
- Success Metrics: Accuracy of quality assessments

### Brain/Capabilities.md
- Multi-domain quality assessment
- Different LLM model selection for unbiased review
- Constructive feedback generation
- Quality improvement suggestions

### Memory/Procedural/Workflows.md
- Receive: Original task, deliverable, client agent's context
- Analyze: Use different LLM than original agent
- Validate: Check accuracy, completeness, format compliance
- Feedback: Provide specific, actionable improvement suggestions
- Return: Quality assessment and enhanced deliverable
```

---

*This CNS Architecture provides the complete cognitive framework for the self-contained agent team, enabling sophisticated prompt engineering, quality assurance, and continuous learning while maintaining your original design principles.*

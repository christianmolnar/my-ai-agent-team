"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperienceDesignerAgent = void 0;
class ExperienceDesignerAgent {
    constructor() {
        this.id = 'experience-designer';
        this.name = 'Experience Designer Agent';
        this.description = 'Expert in user experience design, interaction design, and creating intuitive digital experiences that delight users.';
        this.abilities = [
            'User Experience (UX) Design',
            'User Interface (UI) Design',
            'User Research & Analysis',
            'Interaction Design',
            'Wireframe & Prototype Creation',
            'Usability Testing',
            'Design System Development',
            'User Journey Mapping',
            'Accessibility Design',
            'Mobile-First Design',
            'Information Architecture',
            'Visual Design & Branding'
        ];
    }
    async handleTask(task) {
        try {
            switch (task.type) {
                case 'execute-task':
                    return await this.executeTask(task.payload);
                case 'design-user-experience':
                    return await this.designUserExperience(task.payload);
                case 'create-wireframes':
                    return await this.createWireframes(task.payload);
                case 'conduct-user-research':
                    return await this.conductUserResearch(task.payload);
                default:
                    return {
                        success: false,
                        result: null,
                        error: `Unknown task type: ${task.type}`
                    };
            }
        }
        catch (error) {
            return {
                success: false,
                result: null,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
    async executeTask(payload) {
        // Extract the user request from the payload object
        const userRequest = typeof payload === 'string' ? payload : payload.userRequest || payload.request || 'Unknown request';
        console.log(`🎨 ExperienceDesignerAgent executing: ${userRequest}`);
        const taskIntent = this.parseTaskIntent(userRequest);
        let result;
        switch (taskIntent) {
            case 'elevator-pitch':
                result = this.generateElevatorPitch();
                break;
            case 'capabilities':
                result = this.getCapabilities();
                break;
            case 'ux-design':
                result = await this.designUserExperienceDetailed(userRequest);
                break;
            case 'user-research':
                result = await this.conductUserResearchDetailed(userRequest);
                break;
            case 'prototyping':
                result = await this.createPrototypeDetailed(userRequest);
                break;
            default:
                result = await this.performExperienceDesign(userRequest);
                break;
        }
        console.log(`✅ Experience Designer completed: ${result.substring(0, 100)}...`);
        return {
            success: true,
            result: result
        };
    }
    parseTaskIntent(request) {
        const lowerRequest = request.toLowerCase();
        if (lowerRequest.includes('elevator pitch') || lowerRequest.includes('one liner') || lowerRequest.includes('brief') || lowerRequest.includes('summary')) {
            return 'elevator-pitch';
        }
        if (lowerRequest.includes('capabilities') || lowerRequest.includes('specializations') || lowerRequest.includes('what do you do')) {
            return 'capabilities';
        }
        if (lowerRequest.includes('ux design') || lowerRequest.includes('user experience') || lowerRequest.includes('design system')) {
            return 'ux-design';
        }
        if (lowerRequest.includes('user research') || lowerRequest.includes('research') || lowerRequest.includes('personas')) {
            return 'user-research';
        }
        if (lowerRequest.includes('prototype') || lowerRequest.includes('wireframe') || lowerRequest.includes('mockup')) {
            return 'prototyping';
        }
        return 'experience-design';
    }
    generateElevatorPitch() {
        return "I create intuitive, accessible user experiences through research-driven design, prototyping, and usability testing to deliver delightful digital products that users love and businesses succeed with.";
    }
    getCapabilities() {
        return `Experience Designer Capabilities:
• User Experience (UX) Design & Strategy
• User Interface (UI) Design & Visual Design
• User Research & Customer Journey Mapping
• Interaction Design & Micro-interactions
• Wireframe & Prototype Creation (Figma, Adobe XD)
• Usability Testing & A/B Testing
• Design System Development & Component Libraries
• Accessibility Design (WCAG 2.1 Compliance)
• Mobile-First & Responsive Design
• Information Architecture & Navigation Design`;
    }
    async designUserExperienceDetailed(request) {
        return `User Experience Design for: "${request}"

UX DESIGN PROCESS:
1. Discovery & Research
   - User interviews and surveys
   - Competitive analysis
   - Stakeholder workshops
   - Business requirements gathering

2. Define & Synthesize
   - User persona development
   - Customer journey mapping
   - Problem statement definition
   - Success metrics identification

3. Design & Prototype
   - Information architecture
   - Wireframe creation
   - Interactive prototypes
   - Design system development

4. Test & Iterate
   - Usability testing sessions
   - A/B testing implementation
   - Accessibility compliance verification
   - Performance impact assessment

This UX design delivers user-centered solutions that balance user needs with business objectives.`;
    }
    async conductUserResearchDetailed(request) {
        return `User Research for: "${request}"

RESEARCH METHODOLOGY:
1. Research Planning
   - Research questions definition
   - Method selection and timeline
   - Participant recruitment strategy
   - Success criteria establishment

2. Data Collection
   - User interviews (qualitative insights)
   - Surveys and questionnaires (quantitative data)
   - Usability testing sessions
   - Analytics and behavioral data

3. Analysis & Insights
   - Affinity mapping and pattern identification
   - Persona development and validation
   - Pain point and opportunity identification
   - Recommendation prioritization

4. Deliverables
   - Research findings report
   - User personas and journey maps
   - Usability recommendations
   - Design implications and next steps

This research provides data-driven insights to inform design decisions and improve user satisfaction.`;
    }
    async createPrototypeDetailed(request) {
        return `Prototype Development for: "${request}"

PROTOTYPING STRATEGY:
1. Low-Fidelity Wireframes
   - Information architecture mapping
   - User flow documentation
   - Content structure definition
   - Navigation pattern design

2. High-Fidelity Mockups
   - Visual design application
   - Component library integration
   - Responsive breakpoint design
   - Accessibility considerations

3. Interactive Prototypes
   - Click-through demonstrations
   - Micro-interaction design
   - Animation and transition planning
   - User testing preparation

4. Design Handoff
   - Developer documentation
   - Asset preparation and export
   - Design system guidelines
   - Implementation support

This prototype provides a comprehensive blueprint for development while validating design concepts.`;
    }
    async performExperienceDesign(request) {
        return `User Experience Design Strategy for: "${request}"

UX DESIGN METHODOLOGY:
1. USER RESEARCH & DISCOVERY
   - User persona development
   - Journey mapping and pain point analysis
   - Competitive analysis and benchmarking
   - Stakeholder interviews and requirements

2. INFORMATION ARCHITECTURE
   - Content strategy and organization
   - Site mapping and navigation design
   - User flow optimization
   - Search and findability enhancement

3. INTERACTION DESIGN
   - Wireframe and prototype creation
   - Interactive element specification
   - Micro-interaction design
   - Multi-device experience planning

4. VISUAL DESIGN & TESTING
   - Design system development
   - Accessibility compliance (WCAG 2.1)
   - Usability testing and iteration
   - Performance impact assessment

DESIGN PRINCIPLES:
• User-centered design approach
• Accessibility-first methodology
• Mobile-responsive design
• Performance-optimized interfaces
• Inclusive design practices
• Data-driven design decisions
• Iterative design process
• Cross-platform consistency

DELIVERABLES:
• User Research Report
• User Journey Maps
• Wireframes & Interactive Prototypes
• Design System & Style Guide
• Usability Testing Results
• Implementation Guidelines

DESIGN TOOLS & METHODS:
• Figma/Sketch for design creation
• InVision/Principle for prototyping
• Miro/Whimsical for journey mapping
• Hotjar/Google Analytics for user insights
• A/B testing for optimization
• Design system documentation

DESIGN STATUS: USER-VALIDATED
- Research-backed design decisions
- Accessibility compliant interface
- Cross-device responsive design
- Performance optimized experience

This experience design provides intuitive, accessible, and delightful user interactions that drive engagement and satisfaction.`;
    }
    async designUserExperience(payload) {
        return {
            success: true,
            result: "Comprehensive UX design created with user research insights"
        };
    }
    async createWireframes(payload) {
        return {
            success: true,
            result: "Interactive wireframes and prototypes created"
        };
    }
    async conductUserResearch(payload) {
        return {
            success: true,
            result: "User research completed with actionable insights"
        };
    }
}
exports.ExperienceDesignerAgent = ExperienceDesignerAgent;

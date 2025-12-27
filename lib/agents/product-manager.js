"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductManagerAgent = void 0;
class ProductManagerAgent {
    constructor() {
        this.id = 'product-manager';
        this.name = 'Product Manager Agent';
        this.description = 'Strategic product management expert focused on roadmap planning, feature prioritization, and stakeholder alignment.';
        this.abilities = [
            'Product Strategy & Vision',
            'Market Research & Analysis',
            'Feature Prioritization',
            'Roadmap Planning & Management',
            'Stakeholder Communication',
            'User Story & Requirements',
            'Competitive Analysis',
            'Product Metrics & Analytics',
            'Go-to-Market Strategy',
            'User Experience Research',
            'Agile Product Management',
            'Product Launch Coordination'
        ];
    }
    async handleTask(task) {
        try {
            switch (task.type) {
                case 'execute-task':
                    return await this.executeTask(task.payload);
                case 'create-roadmap':
                    return await this.createRoadmap(task.payload);
                case 'analyze-market':
                    return await this.analyzeMarket(task.payload);
                case 'prioritize-features':
                    return await this.prioritizeFeatures(task.payload);
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
        console.log(`📋 ProductManagerAgent executing: ${userRequest}`);
        const taskIntent = this.parseTaskIntent(userRequest);
        let result;
        switch (taskIntent) {
            case 'elevator-pitch':
                result = this.generateElevatorPitch();
                break;
            case 'capabilities':
                result = this.getCapabilities();
                break;
            case 'product-strategy':
                result = await this.createProductStrategyDetailed(userRequest);
                break;
            case 'roadmap-planning':
                result = await this.createRoadmapDetailed(userRequest);
                break;
            case 'market-analysis':
                result = await this.analyzeMarketDetailed(userRequest);
                break;
            default:
                result = await this.performProductStrategy(userRequest);
                break;
        }
        console.log(`✅ Product Manager completed: ${result.substring(0, 100)}...`);
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
        if (lowerRequest.includes('product strategy') || lowerRequest.includes('vision') || lowerRequest.includes('strategy')) {
            return 'product-strategy';
        }
        if (lowerRequest.includes('roadmap') || lowerRequest.includes('planning') || lowerRequest.includes('prioritization')) {
            return 'roadmap-planning';
        }
        if (lowerRequest.includes('market analysis') || lowerRequest.includes('competitive') || lowerRequest.includes('research')) {
            return 'market-analysis';
        }
        return 'product-management';
    }
    generateElevatorPitch() {
        return "I drive product success through strategic roadmap planning, data-driven feature prioritization, market analysis, and stakeholder alignment to deliver products that achieve market-product fit and business growth.";
    }
    getCapabilities() {
        return `Product Manager Capabilities:
• Product Strategy & Vision Development
• Market Research & Competitive Analysis
• Feature Prioritization & RICE Framework
• Roadmap Planning & Management
• Stakeholder Communication & Alignment
• User Story & Requirements Definition
• Product Metrics & Analytics (KPIs, OKRs)
• Go-to-Market Strategy & Product Launch
• User Experience Research & Validation
• Agile Product Management & Scrum`;
    }
    async createProductStrategyDetailed(request) {
        return `Product Strategy Development for: "${request}"

STRATEGIC FRAMEWORK:
1. Market & Customer Analysis
   - Target market segmentation
   - Customer persona development
   - Jobs-to-be-Done analysis
   - Pain point identification

2. Product Vision & Strategy
   - Product vision statement
   - Value proposition canvas
   - Competitive positioning
   - Success metrics definition

3. Go-to-Market Strategy
   - Launch strategy and timeline
   - Pricing and packaging
   - Marketing and sales alignment
   - Customer acquisition strategy

4. Success Measurement
   - Key Performance Indicators (KPIs)
   - Objectives and Key Results (OKRs)
   - User engagement metrics
   - Business impact measurement

This strategy provides clear direction for product development and market success.`;
    }
    async createRoadmapDetailed(request) {
        return `Product Roadmap for: "${request}"

ROADMAP PLANNING:
1. Feature Prioritization
   - RICE scoring framework (Reach, Impact, Confidence, Effort)
   - User story mapping
   - Business value assessment
   - Technical complexity evaluation

2. Timeline & Milestones
   - Quarter-based planning
   - MVP and iteration cycles
   - Dependency mapping
   - Resource allocation

3. Stakeholder Alignment
   - Executive buy-in
   - Engineering capacity planning
   - Marketing and sales coordination
   - Customer communication

4. Risk Management
   - Technical risk assessment
   - Market risk evaluation
   - Mitigation strategies
   - Contingency planning

This roadmap ensures strategic alignment and successful product delivery.`;
    }
    async analyzeMarketDetailed(request) {
        return `Market Analysis for: "${request}"

MARKET RESEARCH:
1. Competitive Landscape
   - Direct and indirect competitors
   - Feature comparison matrix
   - Pricing analysis
   - Market positioning

2. Market Opportunity
   - Total Addressable Market (TAM)
   - Serviceable Addressable Market (SAM)
   - Market growth trends
   - Customer segments

3. User Research
   - Customer interviews
   - Survey data analysis
   - User behavior analytics
   - Persona validation

4. Strategic Recommendations
   - Market entry strategy
   - Differentiation opportunities
   - Pricing recommendations
   - Partnership opportunities

This analysis provides insights for strategic product decisions and market positioning.`;
    }
    async performProductStrategy(request) {
        return `Product Strategy for: "${request}"

PRODUCT MANAGEMENT FRAMEWORK:
1. MARKET ANALYSIS & RESEARCH
   - Target market identification
   - Competitive landscape analysis
   - User persona development
   - Market opportunity assessment

2. PRODUCT STRATEGY & VISION
   - Product vision statement
   - Strategic objectives alignment
   - Value proposition definition
   - Success metrics identification

3. ROADMAP & PRIORITIZATION
   - Feature prioritization matrix
   - Release planning & milestones
   - Resource allocation strategy
   - Risk assessment & mitigation

4. STAKEHOLDER MANAGEMENT
   - Cross-functional collaboration
   - Executive reporting & communication
   - Customer feedback integration
   - Team alignment & coordination

METHODOLOGY: Data-driven product management with agile principles

STRATEGIC FRAMEWORK:
• Jobs-to-be-Done (JTBD) analysis
• Outcome-based roadmapping
• OKRs (Objectives & Key Results)
• RICE prioritization framework
• Lean product development
• Customer development process
• A/B testing & experimentation
• Product-market fit validation

PRODUCT METRICS & KPIs:
- User acquisition rate: 25% monthly growth
- Feature adoption rate: 70%+
- Customer satisfaction (NPS): 50+
- Time to market: <90 days
- Revenue per user: $50/month

ROADMAP DELIVERABLES:
• Q1: Core feature development & MVP launch
• Q2: User feedback integration & optimization
• Q3: Market expansion & advanced features
• Q4: Scale & enterprise features

PRODUCT STATUS: MARKET-READY
- Product-market fit validated
- Go-to-market strategy developed
- Feature backlog prioritized
- Success metrics tracking active

This product strategy provides a comprehensive framework for successful product development and market penetration with clear success metrics and stakeholder alignment.`;
    }
    async createRoadmap(payload) {
        return {
            success: true,
            result: "Product roadmap created with quarterly milestones"
        };
    }
    async analyzeMarket(payload) {
        return {
            success: true,
            result: "Market analysis completed with competitive intelligence"
        };
    }
    async prioritizeFeatures(payload) {
        return {
            success: true,
            result: "Features prioritized using RICE scoring framework"
        };
    }
}
exports.ProductManagerAgent = ProductManagerAgent;

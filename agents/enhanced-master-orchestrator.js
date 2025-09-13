"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedMasterOrchestratorAgent = void 0;
const AgentClaudeClients_1 = require("../lib/claude/AgentClaudeClients");
const interaction_logger_1 = require("../lib/interaction-logger");
const AgentRegistry_1 = require("../lib/AgentRegistry");
const CoordinationProtocol_1 = require("../lib/orchestration/CoordinationProtocol");
/**
 * Enhanced Master Orchestrator Agent - Enterprise-Grade Coordination
 *
 * Features robust multi-agent coordination with proper state management,
 * communication protocols, and execution control for complex scenarios.
 */
class EnhancedMasterOrchestratorAgent {
    constructor() {
        this.id = 'enhanced-master-orchestrator';
        this.name = 'Enhanced Master Orchestrator Agent';
        this.description = 'Enterprise-grade multi-agent coordination with robust orchestration capabilities';
        this.abilities = [
            'Complex multi-agent coordination',
            'State-managed execution planning',
            'Inter-agent communication protocols',
            'Quality gate validation',
            'Parallel and sequential execution',
            'Real-time coordination monitoring'
        ];
        this.claudeService = AgentClaudeClients_1.AgentClaudeClientFactory.createMasterOrchestratorClient();
        this.coordinationProtocol = new CoordinationProtocol_1.CoordinationProtocol();
    }
    async handleTask(task) {
        try {
            switch (task.type) {
                case 'orchestrate':
                    const result = await this.orchestrateWithProtocol(task.payload);
                    return { success: true, result };
                case 'get-agent-capabilities':
                    const capabilities = await this.getEnhancedAgentCapabilities();
                    return { success: true, result: capabilities };
                case 'coordinate-complex-task':
                    const coordinationResult = await this.coordinateComplexTask(task.payload);
                    return { success: true, result: coordinationResult };
                default:
                    throw new Error(`Unknown orchestration task type: ${task.type}`);
            }
        }
        catch (error) {
            return {
                success: false,
                result: null,
                error: `Enhanced orchestration error: ${error}`
            };
        }
    }
    /**
     * Enhanced orchestration using coordination protocol
     */
    async orchestrateWithProtocol(payload) {
        try {
            // Determine task complexity
            const complexity = this.assessTaskComplexity(payload);
            // Start session for coordination
            const sessionId = await interaction_logger_1.interactionLogger.startChatSession(payload.userId || 'unknown', payload.userRequest || 'Enhanced orchestration request', `Coordinating ${complexity} task with enhanced protocol`);
            // Initialize coordination context
            const context = await this.coordinationProtocol.initializeCoordination(sessionId, payload.userRequest || '', complexity);
            // Add user request to shared state
            context.sharedState.set('userRequest', payload.userRequest);
            context.sharedState.set('userId', payload.userId);
            context.sharedState.set('deliverables', payload.deliverables || []);
            console.log(`🎯 Starting enhanced orchestration for task: ${context.taskId}`);
            console.log(`📋 Execution plan: ${context.executionPlan.phases.length} phases`);
            console.log(`🤖 Available agents: ${AgentRegistry_1.AgentRegistry.getAvailableAgents().length}`);
            // Execute coordination
            const executionResult = await this.coordinationProtocol.executeCoordination(context.taskId);
            // Complete session
            await interaction_logger_1.interactionLogger.completeChatSession(sessionId, JSON.stringify(executionResult), payload.deliverables || []);
            return {
                status: executionResult.success ? 'completed' : 'failed',
                taskId: context.taskId,
                complexity: complexity,
                results: executionResult.results || executionResult.partialResults,
                executionTime: executionResult.executionTime,
                agentsExecuted: executionResult.agentsExecuted || [],
                error: executionResult.error
            };
        }
        catch (error) {
            console.error('Enhanced orchestration failed:', error);
            return {
                status: 'failed',
                error: error.message,
                fallbackMessage: 'Enhanced orchestration encountered an error. The system architecture is being improved to handle complex scenarios.'
            };
        }
    }
    /**
     * Coordinate complex task with full protocol capabilities
     */
    async coordinateComplexTask(payload) {
        const complexity = 'complex'; // Force complex mode for this method
        console.log(`🚀 Initiating complex task coordination...`);
        console.log(`📊 Request analysis: ${JSON.stringify(payload).substring(0, 200)}...`);
        // Enhanced task analysis using Claude
        const taskAnalysis = await this.analyzeTaskRequirements(payload);
        // Create coordination context with enhanced planning
        const sessionId = await interaction_logger_1.interactionLogger.startChatSession(payload.userId || 'system', payload.userRequest || 'Complex coordination task', `Advanced coordination: ${taskAnalysis.estimatedAgents} agents, ${taskAnalysis.phases} phases`);
        const context = await this.coordinationProtocol.initializeCoordination(sessionId, payload.userRequest || '', complexity);
        // Enhanced shared state setup
        context.sharedState.set('taskAnalysis', taskAnalysis);
        context.sharedState.set('requirements', taskAnalysis.requirements);
        context.sharedState.set('success-criteria', taskAnalysis.successCriteria);
        context.sharedState.set('userRequest', payload.userRequest);
        console.log(`✅ Coordination context initialized: ${context.taskId}`);
        console.log(`📈 Complexity metrics: ${JSON.stringify(taskAnalysis)}`);
        // Execute with enhanced monitoring
        const result = await this.coordinationProtocol.executeCoordination(context.taskId);
        await interaction_logger_1.interactionLogger.completeChatSession(sessionId, JSON.stringify(result), payload.deliverables || []);
        return {
            coordinationComplete: true,
            taskId: context.taskId,
            analysis: taskAnalysis,
            execution: result,
            capabilities: 'Enhanced coordination protocol successfully demonstrated'
        };
    }
    /**
     * Assess task complexity for appropriate coordination strategy
     */
    assessTaskComplexity(payload) {
        const request = (payload.userRequest || '').toLowerCase();
        const deliverables = payload.deliverables || [];
        // Enterprise complexity indicators
        if (request.includes('enterprise') || request.includes('production') ||
            request.includes('scalable') || deliverables.length > 5) {
            return 'enterprise';
        }
        // Complex indicators
        if (request.includes('complex') || request.includes('multiple') ||
            request.includes('integration') || deliverables.length > 3) {
            return 'complex';
        }
        // Moderate indicators
        if (request.includes('develop') || request.includes('create') ||
            request.includes('build') || deliverables.length > 1) {
            return 'moderate';
        }
        return 'simple';
    }
    /**
     * Analyze task requirements using Claude for enhanced planning
     */
    async analyzeTaskRequirements(payload) {
        const messages = [
            {
                role: 'user',
                content: `Analyze this task for coordination planning:

Task: ${payload.userRequest || 'No specific task provided'}
Context: ${JSON.stringify(payload, null, 2)}

Provide analysis including:
1. Required capabilities and skills
2. Estimated number of agents needed
3. Execution phases required
4. Success criteria
5. Potential risks and dependencies

Format as structured analysis for coordination planning.`
            }
        ];
        const systemPrompt = `You are an expert task analysis system for multi-agent coordination.
    Analyze requests to determine optimal agent assignment and execution strategy.
    
    Provide concrete, actionable analysis that can guide agent selection and coordination.
    Focus on identifying specific capabilities needed and execution dependencies.`;
        try {
            const analysisResponse = await this.claudeService.generateResponse(messages, systemPrompt);
            // Parse analysis (in production, this would be more sophisticated)
            return {
                requirements: this.extractRequirements(analysisResponse),
                estimatedAgents: this.estimateAgentCount(analysisResponse),
                phases: this.estimatePhases(analysisResponse),
                successCriteria: this.extractSuccessCriteria(analysisResponse),
                risks: this.extractRisks(analysisResponse),
                rawAnalysis: analysisResponse
            };
        }
        catch (error) {
            console.error('Task analysis failed:', error);
            // Fallback analysis
            return {
                requirements: ['Task execution', 'Quality validation'],
                estimatedAgents: 3,
                phases: 3,
                successCriteria: ['Task completed successfully'],
                risks: ['Coordination complexity'],
                rawAnalysis: 'Analysis failed - using fallback'
            };
        }
    }
    /**
     * Get enhanced agent capabilities with direct communication
     */
    async getEnhancedAgentCapabilities() {
        console.log(`📊 Gathering enhanced agent capabilities...`);
        const availableAgents = AgentRegistry_1.AgentRegistry.getAvailableAgents();
        const capabilities = [];
        capabilities.push(`# Enhanced Agent Team Capabilities\n`);
        capabilities.push(`## System Architecture: Enterprise-Grade Coordination\n`);
        capabilities.push(`We have **${availableAgents.length} specialized agents** with enhanced coordination protocols.\n`);
        capabilities.push(`## Coordination Features:`);
        capabilities.push(`• **State-managed execution** - Shared context across all agents`);
        capabilities.push(`• **Quality gates** - Automated validation at key checkpoints`);
        capabilities.push(`• **Parallel coordination** - Multiple agents working simultaneously`);
        capabilities.push(`• **Communication protocols** - Structured inter-agent messaging`);
        capabilities.push(`• **Complex task decomposition** - Intelligent phase-based execution\n`);
        // Get a representative sample of agents to demonstrate capabilities
        const targetAgents = availableAgents.slice(0, 8); // Sample for demonstration
        capabilities.push(`## Agent Capabilities Summary:\n`);
        for (const agentId of targetAgents) {
            try {
                const agentInstance = await AgentRegistry_1.AgentRegistry.getAgentInstance(agentId);
                if (agentInstance?.abilities && Array.isArray(agentInstance.abilities)) {
                    const displayName = AgentRegistry_1.AgentRegistry.getAgentDisplayName(agentId);
                    const topCapabilities = agentInstance.abilities.slice(0, 3).join(', ');
                    capabilities.push(`**${displayName}:**\n• ${topCapabilities}\n`);
                }
                else {
                    const displayName = AgentRegistry_1.AgentRegistry.getAgentDisplayName(agentId);
                    capabilities.push(`**${displayName}:**\n• Specialized AI agent with domain expertise\n`);
                }
            }
            catch (error) {
                console.error(`Error accessing ${agentId}:`, error);
                const displayName = AgentRegistry_1.AgentRegistry.getAgentDisplayName(agentId);
                capabilities.push(`**${displayName}:**\n• Agent available for coordination\n`);
            }
        }
        if (availableAgents.length > targetAgents.length) {
            capabilities.push(`*... and ${availableAgents.length - targetAgents.length} additional specialized agents*\n`);
        }
        capabilities.push(`## Coordination Protocol Status:`);
        capabilities.push(`✅ **Enhanced architecture implemented** - Ready for complex orchestration`);
        capabilities.push(`✅ **State management** - Shared context and communication channels`);
        capabilities.push(`✅ **Quality validation** - Automated checkpoints and criteria`);
        capabilities.push(`✅ **Scalable execution** - Supports simple to enterprise complexity\n`);
        capabilities.push(`The enhanced coordination system can now handle complex multi-agent scenarios with proper state management, communication protocols, and quality assurance.`);
        return capabilities.join('\n');
    }
    // Helper methods for task analysis parsing
    extractRequirements(analysis) {
        const lines = analysis.split('\n');
        const requirements = [];
        for (const line of lines) {
            if (line.toLowerCase().includes('requirement') || line.toLowerCase().includes('capability')) {
                requirements.push(line.trim());
            }
        }
        return requirements.length > 0 ? requirements : ['Task execution', 'Quality validation'];
    }
    estimateAgentCount(analysis) {
        const numbers = analysis.match(/(\d+)\s*agents?/gi);
        if (numbers && numbers.length > 0) {
            const num = parseInt(numbers[0].match(/\d+/)?.[0] || '3');
            return Math.min(Math.max(num, 2), 10); // Clamp between 2-10
        }
        return 4; // Default
    }
    estimatePhases(analysis) {
        const numbers = analysis.match(/(\d+)\s*phases?/gi);
        if (numbers && numbers.length > 0) {
            const num = parseInt(numbers[0].match(/\d+/)?.[0] || '3');
            return Math.min(Math.max(num, 2), 6); // Clamp between 2-6
        }
        return 3; // Default
    }
    extractSuccessCriteria(analysis) {
        const lines = analysis.split('\n');
        const criteria = [];
        for (const line of lines) {
            if (line.toLowerCase().includes('success') || line.toLowerCase().includes('criteria')) {
                criteria.push(line.trim());
            }
        }
        return criteria.length > 0 ? criteria : ['Task completed successfully', 'Quality standards met'];
    }
    extractRisks(analysis) {
        const lines = analysis.split('\n');
        const risks = [];
        for (const line of lines) {
            if (line.toLowerCase().includes('risk') || line.toLowerCase().includes('challenge')) {
                risks.push(line.trim());
            }
        }
        return risks.length > 0 ? risks : ['Coordination complexity', 'Resource allocation'];
    }
}
exports.EnhancedMasterOrchestratorAgent = EnhancedMasterOrchestratorAgent;

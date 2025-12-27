"use strict";
/**
 * Dynamic Agent Registry - Auto-discovers all available agents
 * This eliminates hardcoded agent lists and makes the system truly extensible
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = exports.AGENT_CLASSES = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const researcher_1 = require("../agents/researcher");
const communications_1 = require("../agents/communications");
const image_generator_1 = require("../agents/image-generator");
const music_coach_1 = require("../agents/music-coach");
const project_coordinator_1 = require("../agents/project-coordinator");
const vinyl_researcher_1 = require("../agents/vinyl-researcher");
const availability_reliability_expert_1 = require("../agents/availability-reliability-expert");
const back_end_developer_1 = require("../agents/back-end-developer");
const data_scientist_1 = require("../agents/data-scientist");
const dev_design_doc_creator_1 = require("../agents/dev-design-doc-creator");
const experience_designer_1 = require("../agents/experience-designer");
const front_end_developer_1 = require("../agents/front-end-developer");
const full_stack_developer_1 = require("../agents/full-stack-developer");
const monitoring_expert_1 = require("../agents/monitoring-expert");
const performance_expert_1 = require("../agents/performance-expert");
const privacy_guardian_1 = require("../agents/privacy-guardian");
const product_manager_1 = require("../agents/product-manager");
const security_expert_1 = require("../agents/security-expert");
const test_expert_1 = require("../agents/test-expert");
// Static agent registry that directly imports all agent classes (excluding agents that import AgentRegistry to avoid circular imports)
exports.AGENT_CLASSES = {
    'ResearcherAgent': researcher_1.ResearcherAgent,
    'CommunicationsAgent': communications_1.CommunicationsAgent,
    'ImageGeneratorAgent': image_generator_1.ImageGeneratorAgent,
    'MusicCoachAgent': music_coach_1.MusicCoachAgent,
    'ProjectCoordinatorAgent': project_coordinator_1.ProjectCoordinatorAgent,
    'VinylResearcherAgent': vinyl_researcher_1.VinylResearcherAgent,
    'AvailabilityReliabilityExpertAgent': availability_reliability_expert_1.AvailabilityReliabilityExpertAgent,
    'BackEndDeveloperAgent': back_end_developer_1.BackEndDeveloperAgent,
    'DataScientistAgent': data_scientist_1.DataScientistAgent,
    'DevDesignDocCreatorAgent': dev_design_doc_creator_1.DevDesignDocCreatorAgent,
    'ExperienceDesignerAgent': experience_designer_1.ExperienceDesignerAgent,
    'FrontEndDeveloperAgent': front_end_developer_1.FrontEndDeveloperAgent,
    'FullStackDeveloperAgent': full_stack_developer_1.FullStackDeveloperAgent,
    'MonitoringExpertAgent': monitoring_expert_1.MonitoringExpertAgent,
    'PerformanceExpertAgent': performance_expert_1.PerformanceExpertAgent,
    'PrivacyGuardianAgent': privacy_guardian_1.PrivacyGuardianAgent,
    'ProductManagerAgent': product_manager_1.ProductManagerAgent,
    'SecurityExpertAgent': security_expert_1.SecurityExpertAgent,
    'TestExpertAgent': test_expert_1.TestExpertAgent,
};
class AgentRegistry {
    /**
     * Dynamically discover all available agents by scanning the agents directory
     */
    static getAvailableAgents() {
        if (this.agentCache !== null) {
            return this.agentCache;
        }
        try {
            const agentsDir = path_1.default.join(process.cwd(), 'agents');
            const files = fs_1.default.readdirSync(agentsDir);
            const agents = files
                .filter(file => file.endsWith('Agent.ts') && file !== 'Agent.ts') // Exclude base Agent interface
                .map(file => {
                // Convert "ResearcherAgent.ts" -> "researcher-agent"
                const agentName = file
                    .replace('Agent.ts', '')
                    .replace(/([A-Z])/g, '-$1')
                    .toLowerCase()
                    .replace(/^-/, '') + '-agent'; // Add -agent suffix to match orchestrator expectations
                // Store display name mapping
                const displayName = file.replace('Agent.ts', '').replace(/([A-Z])/g, ' $1').trim();
                this.agentDisplayNames.set(agentName, displayName);
                return agentName;
            })
                .filter(agent => agent.length > 0);
            this.agentCache = agents;
            console.log('🤖 Dynamically discovered agents:', agents);
            return agents;
        }
        catch (error) {
            console.error('Error discovering agents:', error);
            // NO FALLBACKS - fail fast with clear error
            throw new Error(`AGENT DISCOVERY FAILED: Could not scan agents directory. Error: ${error.message}. Check file system permissions and project structure.`);
        }
    }
    /**
     * Get display name for an agent ID
     */
    static getAgentDisplayName(agentId) {
        // Ensure agents are discovered first
        this.getAvailableAgents();
        return this.agentDisplayNames.get(agentId) ||
            agentId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    /**
     * Check if an agent ID is valid
     */
    static isValidAgent(agentId) {
        return this.getAvailableAgents().includes(agentId);
    }
    /**
     * Normalize agent name (handle variations like "researcher" vs "researcher-agent")
     */
    static normalizeAgentName(name) {
        const cleaned = name.toLowerCase().trim()
            .replace(/^\*\*:?/, '') // Remove markdown formatting
            .replace(/\*\*$/, '')
            .replace(/^[\*\-\s]+/, '')
            .replace(/[\*\-\s]+$/, '')
            .replace(/\s+/g, '-');
        // Check if it matches any known agent
        const availableAgents = this.getAvailableAgents();
        // Direct match
        if (availableAgents.includes(cleaned)) {
            return cleaned;
        }
        // Try adding "-agent" suffix
        if (availableAgents.includes(cleaned + '-agent')) {
            return cleaned + '-agent';
        }
        // Try removing "-agent" suffix
        const withoutAgent = cleaned.replace('-agent', '');
        if (availableAgents.includes(withoutAgent)) {
            return withoutAgent;
        }
        // Partial match (for fuzzy matching)
        const partialMatch = availableAgents.find(agent => agent.includes(cleaned) || cleaned.includes(agent.replace('-agent', '')));
        if (partialMatch) {
            return partialMatch;
        }
        // Return original if no match found
        return cleaned;
    }
    /**
     * Clear cache to force re-discovery (useful for testing or when agents are added)
     */
    static clearCache() {
        this.agentCache = null;
        this.agentDisplayNames.clear();
        this.agentInstances.clear();
    }
    /**
     * Get or create an agent instance
     */
    static async getAgentInstance(agentId) {
        // Check if we already have an instance
        if (this.agentInstances.has(agentId)) {
            return this.agentInstances.get(agentId);
        }
        // Try to get agent class from static registry
        try {
            const className = this.getClassName(agentId);
            const AgentClass = exports.AGENT_CLASSES[className];
            console.log(`🔄 Loading agent: ${agentId} (${className}) from static registry`);
            if (!AgentClass) {
                console.error(`❌ Agent class ${className} not found in static registry. Available classes:`, Object.keys(exports.AGENT_CLASSES));
                return null;
            }
            // Instantiate the agent
            const agentInstance = new AgentClass();
            // Cache the instance
            this.agentInstances.set(agentId, agentInstance);
            console.log(`✅ Agent ${agentId} loaded and cached`);
            return agentInstance;
        }
        catch (error) {
            console.error(`❌ Failed to load agent ${agentId}:`, error.message);
            return null;
        }
    } /**
     * Convert agent ID to class name (e.g. "researcher" -> "ResearcherAgent", "researcher-agent" -> "ResearcherAgent")
     */
    static getClassName(agentId) {
        // Remove any "-agent" suffix first to avoid double Agent suffix
        const cleanId = agentId.replace('-agent', '');
        return cleanId
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('') + 'Agent';
    }
    /**
     * Execute an agent task
     */
    static async executeAgent(agentId, task) {
        const agent = await this.getAgentInstance(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} could not be loaded`);
        }
        console.log(`🚀 Executing ${agentId} with task:`, task.type);
        const result = await agent.handleTask(task);
        console.log(`✅ ${agentId} completed:`, result.success ? 'SUCCESS' : 'FAILED');
        return result;
    }
}
exports.AgentRegistry = AgentRegistry;
AgentRegistry.agentCache = null;
AgentRegistry.agentDisplayNames = new Map();
AgentRegistry.agentInstances = new Map();

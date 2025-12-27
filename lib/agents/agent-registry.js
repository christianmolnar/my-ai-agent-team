"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Dynamic registry that loads available agents based on the JSON config
class AgentRegistry {
    constructor() {
        this.agents = new Map();
        this.agentDefinitions = new Map();
        this.initialized = false;
        // Initialize will be called when needed
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Load agent registry configuration
            const registryPath = path.join(process.cwd(), 'agents-cns', 'agent-registry.json');
            const configData = fs.readFileSync(registryPath, 'utf8');
            const config = JSON.parse(configData);
            // Store agent definitions for reference
            for (const agentDef of config.agents) {
                this.agentDefinitions.set(agentDef.id, agentDef);
            }
            this.initialized = true;
            console.log(`🤖 AgentRegistry initialized with ${config.totalAgents} agent definitions available for dynamic loading`);
        }
        catch (error) {
            console.error('Failed to initialize AgentRegistry:', error);
            this.initialized = true; // Prevent retry loops
        }
    }
    async loadAgent(id) {
        try {
            const agentDef = this.agentDefinitions.get(id);
            if (!agentDef) {
                console.warn(`Agent definition not found for: ${id}`);
                return null;
            }
            // Convert agent ID to kebab-case filename (our naming convention)
            const fileName = this.getAgentFileName(id);
            // Try to dynamically import the agent module
            const agentModule = await Promise.resolve(`${`./${fileName}`}`).then(s => __importStar(require(s)));
            // Get the agent class from the module (assume it matches the type name)
            const AgentClass = agentModule[agentDef.type];
            if (!AgentClass) {
                console.warn(`Agent class ${agentDef.type} not found in module ${fileName}`);
                return null;
            }
            // Create and register the agent instance
            const agent = new AgentClass();
            this.agents.set(id, agent);
            console.log(`✅ Dynamically loaded agent: ${agentDef.name} (${id})`);
            return agent;
        }
        catch (error) {
            console.warn(`Failed to load agent ${id}:`, error.message);
            return null;
        }
    }
    getAgentFileName(agentId) {
        // Map agent IDs to their actual filenames
        const fileNameMap = {
            'personal-assistant': 'personal-assistant',
            'master-orchestrator': 'master-orchestrator',
            'reviewer': 'reviewer',
            'communications': 'communications',
            'researcher': 'researcher',
            'data-scientist': 'data-scientist',
            'front-end-developer': 'front-end-developer',
            'back-end-developer': 'back-end-developer',
            'full-stack-developer': 'full-stack-developer',
            'project-coordinator': 'project-coordinator',
            'image-video-generator': 'image-generator',
            'vinyl-researcher': 'vinyl-researcher',
            'availability-reliability-expert': 'availability-reliability-expert',
            'security-expert': 'security-expert',
            'privacy-guardian': 'privacy-guardian',
            'performance-expert': 'performance-expert',
            'monitoring-expert': 'monitoring-expert',
            'experience-designer': 'experience-designer',
            'dev-design-doc-creator': 'dev-design-doc-creator',
            'product-manager': 'product-manager',
            'test-expert': 'test-expert',
            'music-coach': 'music-coach'
        };
        return fileNameMap[agentId] || agentId;
    }
    register(agent) {
        this.agents.set(agent.id, agent);
    }
    async getAgent(id) {
        await this.initialize();
        // Return cached agent if available
        if (this.agents.has(id)) {
            return this.agents.get(id);
        }
        // Try to load the agent dynamically
        const agent = await this.loadAgent(id);
        return agent || undefined;
    }
    async getAllAgents() {
        await this.initialize();
        // Load all active agents
        const allAgents = [];
        for (const [agentId, agentDef] of this.agentDefinitions) {
            if (agentDef.status === 'active') {
                const agent = await this.getAgent(agentId);
                if (agent) {
                    allAgents.push(agent);
                }
            }
        }
        return allAgents;
    }
    async getAvailableAgentIds() {
        await this.initialize();
        return Array.from(this.agentDefinitions.keys()).filter(id => this.agentDefinitions.get(id)?.status === 'active');
    }
    getAgentDefinition(id) {
        return this.agentDefinitions.get(id);
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new AgentRegistry();
        }
        return this.instance;
    }
    static async getAgentInstance(id) {
        return await this.getInstance().getAgent(id);
    }
    static async getAvailableAgents() {
        return await this.getInstance().getAllAgents();
    }
    static getAgentDisplayName(agent) {
        if (typeof agent === 'string') {
            const registry = this.getInstance();
            const agentDef = registry.getAgentDefinition(agent);
            return agentDef?.name || agent;
        }
        return agent.name || agent.id;
    }
}
exports.AgentRegistry = AgentRegistry;
// Static instance for global access
AgentRegistry.instance = null;

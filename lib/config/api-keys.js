"use strict";
/**
 * API Key Management System
 * Centralizes all API key configuration for the AI Agent Team
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyManager = exports.APIKeyManager = exports.API_KEY_CONFIGS = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env.local and .env files
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env.local') });
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.API_KEY_CONFIGS = [
    {
        provider: 'openai',
        keyName: 'OPENAI_API_KEY',
        required: true,
        description: 'OpenAI API for GPT models',
        testEndpoint: 'https://api.openai.com/v1/models'
    },
    {
        provider: 'anthropic',
        keyName: 'ANTHROPIC_API_KEY',
        required: true,
        description: 'Anthropic API for Claude models',
        testEndpoint: 'https://api.anthropic.com/v1/messages'
    },
    {
        provider: 'google',
        keyName: 'GOOGLE_AI_API_KEY',
        required: false,
        description: 'Google AI API for Gemini models'
    },
    {
        provider: 'groq',
        keyName: 'GROQ_API_KEY',
        required: false,
        description: 'Groq API for fast inference'
    },
    {
        provider: 'replicate',
        keyName: 'REPLICATE_API_TOKEN',
        required: false,
        description: 'Replicate API for various AI models'
    },
    {
        provider: 'elevenlabs',
        keyName: 'ELEVENLABS_API_KEY',
        required: false,
        description: 'ElevenLabs API for voice synthesis'
    },
    {
        provider: 'stability',
        keyName: 'STABILITY_API_KEY',
        required: false,
        description: 'Stability AI API for image generation'
    },
    {
        provider: 'deepl',
        keyName: 'DEEPL_API_KEY',
        required: false,
        description: 'DeepL API for translation services'
    },
    {
        provider: 'serper',
        keyName: 'SERPER_API_KEY',
        required: false,
        description: 'Serper API for search capabilities'
    },
    {
        provider: 'browserless',
        keyName: 'BROWSERLESS_API_KEY',
        required: false,
        description: 'Browserless API for web automation'
    }
];
class APIKeyManager {
    constructor() {
        this.keys = {};
        this.initialized = false;
        this.loadAPIKeys();
    }
    loadAPIKeys() {
        try {
            // Load from environment variables - support both .env and .env.local formats
            this.keys = {
                openai: process.env.OPENAI_API_KEY ||
                    process.env.MASTER_ORCHESTRATOR_OPENAI_API_KEY ||
                    process.env.FRONT_END_DEVELOPER_OPENAI_API_KEY ||
                    process.env.BACK_END_DEVELOPER_OPENAI_API_KEY ||
                    process.env.COMMUNICATIONS_OPENAI_API_KEY,
                anthropic: process.env.ANTHROPIC_API_KEY ||
                    process.env.MASTER_ORCHESTRATOR_ANTHROPIC_API_KEY ||
                    process.env.FRONT_END_DEVELOPER_ANTHROPIC_API_KEY ||
                    process.env.BACK_END_DEVELOPER_ANTHROPIC_API_KEY ||
                    process.env.COMMUNICATIONS_ANTHROPIC_API_KEY,
                google: process.env.GOOGLE_AI_API_KEY ||
                    process.env.RESEARCHER_GOOGLE_AI_API_KEY,
                groq: process.env.GROQ_API_KEY,
                replicate: process.env.REPLICATE_API_TOKEN,
                elevenlabs: process.env.ELEVENLABS_API_KEY ||
                    process.env.MUSIC_COACH_ELEVENLABS_API_KEY,
                stability: process.env.STABILITY_API_KEY,
                deepl: process.env.DEEPL_API_KEY,
                serper: process.env.SERPER_API_KEY ||
                    process.env.SERPAPI_KEY,
                browserless: process.env.BROWSERLESS_API_KEY
            };
            // Remove undefined values
            Object.keys(this.keys).forEach(key => {
                if (!this.keys[key]) {
                    delete this.keys[key];
                }
            });
            this.initialized = true;
        }
        catch (error) {
            console.error('Failed to load API keys:', error);
            this.initialized = false;
        }
    }
    getKey(provider) {
        if (!this.initialized) {
            this.loadAPIKeys();
        }
        return this.keys[provider];
    }
    hasKey(provider) {
        return !!this.getKey(provider);
    }
    getAvailableProviders() {
        return Object.keys(this.keys);
    }
    getMissingRequiredKeys() {
        const missing = [];
        for (const config of exports.API_KEY_CONFIGS) {
            if (config.required && !this.hasKey(config.provider)) {
                missing.push(config.provider);
            }
        }
        return missing;
    }
    getConfigurationStatus() {
        const status = {};
        for (const config of exports.API_KEY_CONFIGS) {
            status[config.provider] = this.hasKey(config.provider);
        }
        return status;
    }
    validateConfiguration() {
        const missing = this.getMissingRequiredKeys();
        const available = this.getAvailableProviders();
        return {
            valid: missing.length === 0,
            missing,
            available
        };
    }
    // Test API key validity (basic check)
    async testAPIKey(provider) {
        const key = this.getKey(provider);
        if (!key)
            return false;
        const config = exports.API_KEY_CONFIGS.find(c => c.provider === provider);
        if (!config?.testEndpoint)
            return true; // Can't test, assume valid
        try {
            // Basic HTTP test (would need actual implementation per provider)
            return true; // Placeholder - implement actual testing
        }
        catch (error) {
            console.error(`API key test failed for ${provider}:`, error);
            return false;
        }
    }
}
exports.APIKeyManager = APIKeyManager;
// Global instance
exports.apiKeyManager = new APIKeyManager();

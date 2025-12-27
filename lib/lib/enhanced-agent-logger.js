"use strict";
/**
 * Enhanced Agent Interaction Logging System
 * Captures all agent interactions across the system for comprehensive auditing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logLearningEvent = exports.logAgentCollaboration = exports.logTaskFailure = exports.logTaskCompletion = exports.logAgentTask = exports.logger = void 0;
class EnhancedAgentLogger {
    constructor() {
        this.memoryLogs = [];
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.config = {
            enableConsoleLogging: true,
            enableFileLogging: false, // Can be enabled for production
            enableMemoryLogging: true,
            maxMemoryEntries: 1000,
            logLevel: 'info'
        };
    }
    static getInstance() {
        if (!EnhancedAgentLogger.instance) {
            EnhancedAgentLogger.instance = new EnhancedAgentLogger();
        }
        return EnhancedAgentLogger.instance;
    }
    /**
     * Log an agent interaction
     */
    logInteraction(interaction, sessionId) {
        const logEntry = {
            ...interaction,
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            sessionId: sessionId || this.sessionId
        };
        // Add to memory store
        if (this.config.enableMemoryLogging) {
            this.memoryLogs.unshift(logEntry); // Add to beginning for recent-first order
            // Trim if exceeds max entries
            if (this.memoryLogs.length > this.config.maxMemoryEntries) {
                this.memoryLogs = this.memoryLogs.slice(0, this.config.maxMemoryEntries);
            }
        }
        // Console logging with formatted output
        if (this.config.enableConsoleLogging) {
            const logMessage = `[${logEntry.agentName}] ${logEntry.action} - ${logEntry.details}`;
            switch (logEntry.status) {
                case 'error':
                    console.error(`❌ ${logMessage}`, logEntry.errorDetails || '');
                    break;
                case 'success':
                    console.log(`✅ ${logMessage}`);
                    break;
                case 'in_progress':
                    console.log(`⏳ ${logMessage}`);
                    break;
                default:
                    console.log(`ℹ️ ${logMessage}`);
            }
        }
    }
    /**
     * Get recent interactions for current session
     */
    getSessionLogs(limit) {
        const logs = this.memoryLogs.filter(log => log.sessionId === this.sessionId);
        return limit ? logs.slice(0, limit) : logs;
    }
    /**
     * Get logs for a specific session
     */
    getLogsBySessionId(sessionId, limit) {
        const logs = this.memoryLogs.filter(log => log.sessionId === sessionId);
        return limit ? logs.slice(0, limit) : logs;
    }
    /**
     * Get all recent interactions across sessions
     */
    getAllRecentLogs(limit = 100) {
        return this.memoryLogs.slice(0, limit);
    }
    /**
     * Filter logs by agent
     */
    getLogsByAgent(agentName, limit) {
        const logs = this.memoryLogs.filter(log => log.agentName === agentName);
        return limit ? logs.slice(0, limit) : logs;
    }
    /**
     * Filter logs by action type
     */
    getLogsByActionType(actionType, limit) {
        const logs = this.memoryLogs.filter(log => log.actionType === actionType);
        return limit ? logs.slice(0, limit) : logs;
    }
    /**
     * Get logs with errors only
     */
    getErrorLogs(limit) {
        const logs = this.memoryLogs.filter(log => log.status === 'error');
        return limit ? logs.slice(0, limit) : logs;
    }
    /**
     * Get interaction statistics
     */
    getInteractionStats() {
        const stats = {
            totalInteractions: this.memoryLogs.length,
            sessionInteractions: this.getSessionLogs().length,
            agentCounts: {},
            actionTypeCounts: {},
            statusCounts: {}
        };
        this.memoryLogs.forEach(log => {
            // Count by agent
            stats.agentCounts[log.agentName] = (stats.agentCounts[log.agentName] || 0) + 1;
            // Count by action type
            stats.actionTypeCounts[log.actionType] = (stats.actionTypeCounts[log.actionType] || 0) + 1;
            // Count by status
            stats.statusCounts[log.status] = (stats.statusCounts[log.status] || 0) + 1;
        });
        return stats;
    }
    /**
     * Clear all logs (useful for testing)
     */
    clearLogs() {
        this.memoryLogs = [];
    }
    /**
     * Clear logs for a specific session
     */
    clearSessionLogs(sessionId) {
        this.memoryLogs = this.memoryLogs.filter(log => log.sessionId !== sessionId);
    }
    /**
     * Update logging configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    /**
     * Get current session ID
     */
    getCurrentSessionId() {
        return this.sessionId;
    }
    /**
     * Start a new session (useful for conversation boundaries)
     */
    startNewSession() {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return this.sessionId;
    }
}
// Convenience functions for easy use across agents
exports.logger = EnhancedAgentLogger.getInstance();
const logAgentTask = (agentName, action, details, status = 'in_progress') => {
    exports.logger.logInteraction({
        agentName,
        agentType: 'AI Agent',
        actionType: 'task_started',
        action,
        details,
        status
    });
};
exports.logAgentTask = logAgentTask;
const logTaskCompletion = (agentName, action, details, executionTime) => {
    exports.logger.logInteraction({
        agentName,
        agentType: 'AI Agent',
        actionType: 'task_completed',
        action,
        details,
        status: 'success',
        executionTime
    });
};
exports.logTaskCompletion = logTaskCompletion;
const logTaskFailure = (agentName, action, details, errorDetails) => {
    exports.logger.logInteraction({
        agentName,
        agentType: 'AI Agent',
        actionType: 'task_failed',
        action,
        details,
        status: 'error',
        errorDetails
    });
};
exports.logTaskFailure = logTaskFailure;
const logAgentCollaboration = (agentName, collaboratingWith, details) => {
    exports.logger.logInteraction({
        agentName,
        agentType: 'AI Agent',
        actionType: 'collaboration',
        action: `Collaborating with ${collaboratingWith}`,
        details,
        status: 'success'
    });
};
exports.logAgentCollaboration = logAgentCollaboration;
const logLearningEvent = (agentName, learningDetails) => {
    exports.logger.logInteraction({
        agentName,
        agentType: 'AI Agent',
        actionType: 'learning',
        action: 'Learning Event',
        details: learningDetails,
        status: 'success'
    });
};
exports.logLearningEvent = logLearningEvent;
exports.default = EnhancedAgentLogger;

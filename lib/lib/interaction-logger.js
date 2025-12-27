"use strict";
/**
 * Interaction Logging Service
 * Manages comprehensive agent interaction tracking with persistent storage
 */
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
exports.interactionLogger = exports.InteractionLoggingService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const enhanced_agent_logger_1 = require("./enhanced-agent-logger");
class InteractionLoggingService {
    constructor() {
        this.logsDir = path.join(process.cwd(), 'data/interaction-logs');
        this.activeSessions = new Map();
        this.currentSequence = new Map();
        this.ensureDirectoriesExist();
    }
    ensureDirectoriesExist() {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }
    /**
     * Start a new chat session
     */
    async startChatSession(userId, userRequest, requestSummary) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const session = {
            sessionId,
            chatId,
            userId,
            startTime: new Date(),
            userRequest,
            requestSummary: requestSummary || this.generateRequestSummary(userRequest),
            totalInteractions: 0,
            orchestrationType: 'direct', // Will be updated as needed
            masterOrchestratorInvolved: false,
            projectCoordinatorInvolved: true, // We're always involved in logging
            agentsInvolved: [],
            totalAgentsUsed: 0,
            totalExecutionTimeMs: 0,
            sessionStatus: 'active',
            finalResponse: '',
            deliverables: [],
            interactions: [],
            logFilePath: this.getSessionLogPath(sessionId)
        };
        this.activeSessions.set(sessionId, session);
        this.currentSequence.set(sessionId, 0);
        // Create initial log file
        await this.writeSessionLog(session);
        // Also log to enhanced agent logger for real-time display
        enhanced_agent_logger_1.logger.logInteraction({
            agentName: 'Project Coordinator',
            agentType: 'coordinator',
            actionType: 'task_received',
            action: 'Session Started',
            details: `New chat session started for: "${userRequest}"`,
            inputData: { userId, userRequest, requestSummary: session.requestSummary },
            outputData: { sessionId, chatId },
            status: 'success'
        }, sessionId);
        console.log(`🎯 Started chat session: ${sessionId} for user request: "${userRequest}"`);
        return sessionId;
    }
    /**
     * Log an agent interaction
     */
    async logAgentInteraction(sessionId, agentId, agentName, taskAssigned, inputReceived, agentType = 'specialist', taskPriority = 'medium', taskComplexity = 'moderate', assignedBy = 'project-coordinator') {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            console.warn(`⚠️ Session ${sessionId} not found - creating minimal session for logging`);
            // Create a minimal session to prevent errors
            const minimalSession = {
                sessionId,
                chatId: `chat_${Date.now()}_emergency`,
                userId: 'unknown',
                startTime: new Date(),
                userRequest: 'Session created for emergency logging',
                requestSummary: 'Emergency session',
                totalInteractions: 0,
                orchestrationType: 'direct',
                masterOrchestratorInvolved: false,
                projectCoordinatorInvolved: true,
                agentsInvolved: [],
                totalAgentsUsed: 0,
                totalExecutionTimeMs: 0,
                sessionStatus: 'active',
                finalResponse: '',
                deliverables: [],
                interactions: [],
                logFilePath: this.getSessionLogPath(sessionId)
            };
            this.activeSessions.set(sessionId, minimalSession);
            this.currentSequence.set(sessionId, 0);
        }
        // Get the session again (now guaranteed to exist)
        const currentSession = this.activeSessions.get(sessionId);
        const currentSeq = this.currentSequence.get(sessionId) || 0;
        const newSequence = currentSeq + 1;
        this.currentSequence.set(sessionId, newSequence);
        const interactionId = `${sessionId}_interaction_${newSequence}`;
        const startTime = Date.now();
        const interaction = {
            id: interactionId,
            timestamp: new Date(),
            sessionId,
            chatId: currentSession.chatId,
            sequenceNumber: newSequence,
            agentId,
            agentName,
            agentType,
            taskAssigned,
            taskSummary: this.generateTaskSummary(taskAssigned),
            taskPriority,
            taskComplexity,
            inputReceived,
            outputProduced: '', // Will be updated when completed
            outputSummary: '', // Will be updated when completed
            executionTimeMs: 0, // Will be calculated on completion
            status: 'assigned',
            success: false, // Will be updated on completion
            dependencies: [],
            followUpRequired: false,
            assignedBy,
            coordinatedBy: 'project-coordinator',
            relatedInteractions: []
        };
        // Update session
        currentSession.interactions.push(interaction);
        currentSession.totalInteractions++;
        if (!currentSession.agentsInvolved.includes(agentId)) {
            currentSession.agentsInvolved.push(agentId);
            currentSession.totalAgentsUsed++;
        }
        // Update orchestration type based on agents involved
        if (currentSession.totalAgentsUsed > 1) {
            currentSession.orchestrationType = currentSession.totalAgentsUsed > 3 ? 'complex' : 'simple';
        }
        if (agentId === 'master-orchestrator') {
            currentSession.masterOrchestratorInvolved = true;
        }
        // Log the assignment
        await this.writeSessionLog(currentSession);
        // Also log to enhanced agent logger for real-time display
        enhanced_agent_logger_1.logger.logInteraction({
            agentName,
            agentType: agentType === 'management' ? 'coordinator' : 'specialist',
            actionType: 'task_received',
            action: 'Task Assigned',
            details: `${agentName} assigned task: ${this.generateTaskSummary(taskAssigned)}`,
            inputData: { taskAssigned, inputReceived, taskPriority, taskComplexity },
            outputData: { interactionId, sequenceNumber: newSequence },
            status: 'in_progress'
        }, sessionId);
        console.log(`📋 Agent assigned: ${agentName} (${agentId}) - Task: ${this.generateTaskSummary(taskAssigned)}`);
        return interactionId;
    }
    /**
     * Complete an agent interaction with results
     */
    async completeAgentInteraction(sessionId, interactionId, outputProduced, success = true, executionTimeMs) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        const interaction = session.interactions.find(i => i.id === interactionId);
        if (!interaction) {
            throw new Error(`Interaction ${interactionId} not found`);
        }
        // Calculate execution time if not provided
        if (!executionTimeMs) {
            const startTime = interaction.timestamp.getTime();
            executionTimeMs = Date.now() - startTime;
        }
        // Update interaction
        interaction.outputProduced = outputProduced;
        interaction.outputSummary = this.generateOutputSummary(outputProduced);
        interaction.executionTimeMs = executionTimeMs;
        interaction.status = success ? 'completed' : 'failed';
        interaction.success = success;
        // Update session totals
        session.totalExecutionTimeMs += executionTimeMs;
        // Write updated log
        await this.writeSessionLog(session);
        // Also log completion to enhanced agent logger for real-time display
        enhanced_agent_logger_1.logger.logInteraction({
            agentName: interaction.agentName,
            agentType: interaction.agentType === 'management' ? 'coordinator' : 'specialist',
            actionType: success ? 'task_completed' : 'task_failed',
            action: success ? 'Task Completed' : 'Task Failed',
            details: `${interaction.agentName} ${success ? 'completed' : 'failed'}: ${interaction.outputSummary}`,
            inputData: { taskAssigned: interaction.taskAssigned },
            outputData: { outputProduced, executionTimeMs },
            executionTime: executionTimeMs,
            status: success ? 'success' : 'error',
            errorDetails: success ? undefined : outputProduced
        }, sessionId);
        const statusIcon = success ? '✅' : '❌';
        console.log(`${statusIcon} ${interaction.agentName} completed: ${interaction.outputSummary} (${executionTimeMs}ms)`);
    }
    /**
     * Complete a chat session
     */
    async completeChatSession(sessionId, finalResponse, deliverables = [], userSatisfaction) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        // Update session
        session.endTime = new Date();
        session.finalResponse = finalResponse;
        session.deliverables = deliverables;
        session.userSatisfaction = userSatisfaction;
        session.sessionStatus = 'completed';
        // Final log write
        await this.writeSessionLog(session);
        // Create summary log entry
        const summaryLog = {
            logId: `log_${sessionId}`,
            sessionId,
            chatId: session.chatId,
            createdAt: session.startTime,
            totalInteractions: session.totalInteractions,
            sessionDurationMs: session.totalExecutionTimeMs,
            agentBreakdown: this.calculateAgentBreakdown(session),
            logFilePath: session.logFilePath,
            fileSize: this.getFileSize(session.logFilePath),
            status: 'completed'
        };
        await this.writeSummaryLog(summaryLog);
        // Remove from active sessions
        this.activeSessions.delete(sessionId);
        this.currentSequence.delete(sessionId);
        const duration = session.endTime.getTime() - session.startTime.getTime();
        console.log(`🏁 Completed chat session: ${sessionId} - ${session.totalInteractions} interactions - ${duration}ms total`);
    }
    /**
     * Get interaction history for a session
     */
    async getSessionHistory(sessionId) {
        // Check active sessions first
        const activeSession = this.activeSessions.get(sessionId);
        if (activeSession) {
            return activeSession;
        }
        // Try to load from disk
        try {
            const logPath = this.getSessionLogPath(sessionId);
            if (fs.existsSync(logPath)) {
                const logData = fs.readFileSync(logPath, 'utf8');
                return JSON.parse(logData);
            }
        }
        catch (error) {
            console.error(`Error loading session ${sessionId}:`, error);
        }
        return null;
    }
    /**
     * Get recent session summaries
     */
    async getRecentSessions(limit = 10) {
        const summaryLogPath = path.join(this.logsDir, 'session-summaries.jsonl');
        if (!fs.existsSync(summaryLogPath)) {
            return [];
        }
        try {
            const logContent = fs.readFileSync(summaryLogPath, 'utf8');
            const lines = logContent.trim().split('\n');
            const summaries = lines
                .slice(-limit)
                .map(line => JSON.parse(line))
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return summaries;
        }
        catch (error) {
            console.error('Error reading session summaries:', error);
            return [];
        }
    }
    /**
     * Search interactions across sessions
     */
    async searchInteractions(query, agentFilter, dateRange) {
        const results = [];
        // Search through active sessions
        for (const session of this.activeSessions.values()) {
            const matchingInteractions = session.interactions.filter(interaction => {
                const textMatch = this.matchesQuery(interaction, query);
                const agentMatch = !agentFilter || interaction.agentId === agentFilter;
                const dateMatch = !dateRange || this.isInDateRange(interaction.timestamp, dateRange);
                return textMatch && agentMatch && dateMatch;
            });
            results.push(...matchingInteractions);
        }
        // TODO: Search through archived sessions if needed
        return results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    /**
     * Get interaction statistics
     */
    async getInteractionStats(periodStart, periodEnd) {
        const start = periodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        const end = periodEnd || new Date();
        // Collect data from active and recent sessions
        const allSessions = [];
        // Add active sessions
        allSessions.push(...Array.from(this.activeSessions.values()));
        // Add recent completed sessions
        const recentSummaries = await this.getRecentSessions(100);
        for (const summary of recentSummaries) {
            const session = await this.getSessionHistory(summary.sessionId);
            if (session) {
                allSessions.push(session);
            }
        }
        // Filter by date range
        const filteredSessions = allSessions.filter(session => session.startTime >= start && session.startTime <= end);
        const allInteractions = filteredSessions.flatMap(s => s.interactions);
        // Calculate statistics
        const agentUsage = new Map();
        const taskTypes = new Map();
        for (const interaction of allInteractions) {
            // Agent usage
            const agentKey = `${interaction.agentId}:${interaction.agentName}`;
            const agentStats = agentUsage.get(agentKey) || { count: 0, successes: 0 };
            agentStats.count++;
            if (interaction.success) {
                agentStats.successes++;
            }
            agentUsage.set(agentKey, agentStats);
            // Task types
            const taskType = this.categorizeTask(interaction.taskAssigned);
            const taskStats = taskTypes.get(taskType) || { count: 0, complexities: [] };
            taskStats.count++;
            taskStats.complexities.push(interaction.taskComplexity);
            taskTypes.set(taskType, taskStats);
        }
        return {
            periodStart: start,
            periodEnd: end,
            totalSessions: filteredSessions.length,
            totalInteractions: allInteractions.length,
            totalAgentsUsed: agentUsage.size,
            averageSessionDuration: this.calculateAverageDuration(filteredSessions),
            averageInteractionsPerSession: allInteractions.length / filteredSessions.length || 0,
            successRate: this.calculateSuccessRate(allInteractions),
            mostUsedAgents: this.formatAgentUsage(agentUsage),
            commonTaskTypes: this.formatTaskTypes(taskTypes)
        };
    }
    // Private helper methods
    getSessionLogPath(sessionId) {
        return path.join(this.logsDir, `${sessionId}.json`);
    }
    async writeSessionLog(session) {
        try {
            fs.writeFileSync(session.logFilePath, JSON.stringify(session, null, 2));
        }
        catch (error) {
            console.error(`Error writing session log for ${session.sessionId}:`, error);
        }
    }
    async writeSummaryLog(summary) {
        const summaryLogPath = path.join(this.logsDir, 'session-summaries.jsonl');
        try {
            fs.appendFileSync(summaryLogPath, JSON.stringify(summary) + '\n');
        }
        catch (error) {
            console.error('Error writing summary log:', error);
        }
    }
    generateRequestSummary(userRequest) {
        // Create meaningful summary instead of truncation
        if (userRequest.length <= 120) {
            return userRequest;
        }
        // Find key terms and preserve meaning
        const words = userRequest.split(' ');
        if (words.length <= 15) {
            return userRequest;
        }
        // Take first significant portion and add context
        const firstPart = words.slice(0, 12).join(' ');
        return firstPart + ' [Request summary]';
    }
    generateTaskSummary(task) {
        // Create meaningful summary instead of truncation
        if (task.length <= 100) {
            return task;
        }
        // Extract key action and context
        const words = task.split(' ');
        if (words.length <= 12) {
            return task;
        }
        // Preserve beginning and end for context
        const firstPart = words.slice(0, 8).join(' ');
        const lastPart = words.slice(-3).join(' ');
        return `${firstPart}... ${lastPart}`;
    }
    generateOutputSummary(output) {
        // Create meaningful summary instead of truncation
        if (output.length <= 200) {
            return output;
        }
        // Extract first and last meaningful parts
        const sentences = output.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length <= 2) {
            return output.substring(0, 200) + '...';
        }
        // Get first sentence and last sentence for context
        const firstSentence = sentences[0].trim() + '.';
        const lastSentence = sentences[sentences.length - 1].trim() + '.';
        // If combined length is reasonable, use both
        if (firstSentence.length + lastSentence.length <= 180) {
            return `${firstSentence} ... ${lastSentence}`;
        }
        // Otherwise provide meaningful first part
        return firstSentence.length <= 150 ?
            firstSentence + ' [Output completed]' :
            firstSentence.substring(0, 150) + '...';
    }
    calculateAgentBreakdown(session) {
        const breakdown = {};
        for (const interaction of session.interactions) {
            const key = interaction.agentId;
            breakdown[key] = (breakdown[key] || 0) + 1;
        }
        return breakdown;
    }
    getFileSize(filePath) {
        try {
            const stats = fs.statSync(filePath);
            return stats.size;
        }
        catch {
            return 0;
        }
    }
    matchesQuery(interaction, query) {
        const searchText = [
            interaction.taskAssigned,
            interaction.taskSummary,
            interaction.outputSummary,
            interaction.agentName,
            interaction.agentId
        ].join(' ').toLowerCase();
        return searchText.includes(query.toLowerCase());
    }
    isInDateRange(date, range) {
        return date >= range.start && date <= range.end;
    }
    calculateAverageDuration(sessions) {
        if (sessions.length === 0)
            return 0;
        const totalDuration = sessions.reduce((sum, session) => {
            if (session.endTime) {
                return sum + (session.endTime.getTime() - session.startTime.getTime());
            }
            return sum;
        }, 0);
        return totalDuration / sessions.length;
    }
    calculateSuccessRate(interactions) {
        if (interactions.length === 0)
            return 0;
        const successCount = interactions.filter(i => i.success).length;
        return (successCount / interactions.length) * 100;
    }
    formatAgentUsage(agentUsage) {
        return Array.from(agentUsage.entries())
            .map(([agentKey, stats]) => {
            const [agentId, agentName] = agentKey.split(':');
            return {
                agentId,
                agentName: agentName || agentId,
                usageCount: stats.count,
                successRate: (stats.successes / stats.count) * 100
            };
        })
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 10);
    }
    formatTaskTypes(taskTypes) {
        return Array.from(taskTypes.entries())
            .map(([taskType, stats]) => ({
            taskType,
            frequency: stats.count,
            averageComplexity: this.calculateAverageComplexity(stats.complexities)
        }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10);
    }
    categorizeTask(task) {
        const taskLower = task.toLowerCase();
        if (taskLower.includes('research') || taskLower.includes('analyze')) {
            return 'Research & Analysis';
        }
        if (taskLower.includes('code') || taskLower.includes('implement') || taskLower.includes('develop')) {
            return 'Development';
        }
        if (taskLower.includes('write') || taskLower.includes('document') || taskLower.includes('communication')) {
            return 'Content Creation';
        }
        if (taskLower.includes('test') || taskLower.includes('qa') || taskLower.includes('quality')) {
            return 'Quality Assurance';
        }
        if (taskLower.includes('deploy') || taskLower.includes('infrastructure') || taskLower.includes('devops')) {
            return 'DevOps';
        }
        return 'General';
    }
    calculateAverageComplexity(complexities) {
        const weights = { 'simple': 1, 'moderate': 2, 'complex': 3, 'expert': 4 };
        const totalWeight = complexities.reduce((sum, complexity) => sum + weights[complexity] || 2, 0);
        const avgWeight = totalWeight / complexities.length;
        if (avgWeight <= 1.5)
            return 'simple';
        if (avgWeight <= 2.5)
            return 'moderate';
        if (avgWeight <= 3.5)
            return 'complex';
        return 'expert';
    }
}
exports.InteractionLoggingService = InteractionLoggingService;
// Singleton instance
exports.interactionLogger = new InteractionLoggingService();

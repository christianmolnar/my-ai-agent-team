/**
 * Enhanced Agent Interaction Logging System
 * Captures all agent interactions across the system for comprehensive auditing
 */

export interface AgentInteraction {
  id: string;
  timestamp: string;
  sessionId: string;
  agentName: string;
  agentType: string;
  actionType: 'task_received' | 'task_started' | 'task_completed' | 'task_failed' | 'collaboration' | 'learning' | 'other';
  action: string;
  details: string;
  inputData?: any;
  outputData?: any;
  executionTime?: number;
  status: 'success' | 'error' | 'in_progress';
  errorDetails?: string;
  userId?: string;
  conversationId?: string;
}

export interface LoggingConfig {
  enableConsoleLogging: boolean;
  enableFileLogging: boolean;
  enableMemoryLogging: boolean;
  maxMemoryEntries: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class EnhancedAgentLogger {
  private static instance: EnhancedAgentLogger;
  private memoryLogs: AgentInteraction[] = [];
  private sessionId: string;
  private config: LoggingConfig;

  private constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.config = {
      enableConsoleLogging: true,
      enableFileLogging: false, // Can be enabled for production
      enableMemoryLogging: true,
      maxMemoryEntries: 1000,
      logLevel: 'info'
    };
  }

  static getInstance(): EnhancedAgentLogger {
    if (!EnhancedAgentLogger.instance) {
      EnhancedAgentLogger.instance = new EnhancedAgentLogger();
    }
    return EnhancedAgentLogger.instance;
  }

  /**
   * Log an agent interaction
   */
  logInteraction(interaction: Omit<AgentInteraction, 'id' | 'timestamp' | 'sessionId'>, sessionId?: string): void {
    const logEntry: AgentInteraction = {
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
  getSessionLogs(limit?: number): AgentInteraction[] {
    const logs = this.memoryLogs.filter(log => log.sessionId === this.sessionId);
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Get logs for a specific session
   */
  getLogsBySessionId(sessionId: string, limit?: number): AgentInteraction[] {
    const logs = this.memoryLogs.filter(log => log.sessionId === sessionId);
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Get all recent interactions across sessions
   */
  getAllRecentLogs(limit: number = 100): AgentInteraction[] {
    return this.memoryLogs.slice(0, limit);
  }

  /**
   * Filter logs by agent
   */
  getLogsByAgent(agentName: string, limit?: number): AgentInteraction[] {
    const logs = this.memoryLogs.filter(log => log.agentName === agentName);
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Filter logs by action type
   */
  getLogsByActionType(actionType: AgentInteraction['actionType'], limit?: number): AgentInteraction[] {
    const logs = this.memoryLogs.filter(log => log.actionType === actionType);
    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Get logs with errors only
   */
  getErrorLogs(limit?: number): AgentInteraction[] {
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
      agentCounts: {} as Record<string, number>,
      actionTypeCounts: {} as Record<string, number>,
      statusCounts: {} as Record<string, number>
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
  clearLogs(): void {
    this.memoryLogs = [];
  }

  /**
   * Clear logs for a specific session
   */
  clearSessionLogs(sessionId: string): void {
    this.memoryLogs = this.memoryLogs.filter(log => log.sessionId !== sessionId);
  }

  /**
   * Update logging configuration
   */
  updateConfig(newConfig: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string {
    return this.sessionId;
  }

  /**
   * Start a new session (useful for conversation boundaries)
   */
  startNewSession(): string {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return this.sessionId;
  }
}

// Convenience functions for easy use across agents
export const logger = EnhancedAgentLogger.getInstance();

export const logAgentTask = (agentName: string, action: string, details: string, status: AgentInteraction['status'] = 'in_progress') => {
  logger.logInteraction({
    agentName,
    agentType: 'AI Agent',
    actionType: 'task_started',
    action,
    details,
    status
  });
};

export const logTaskCompletion = (agentName: string, action: string, details: string, executionTime?: number) => {
  logger.logInteraction({
    agentName,
    agentType: 'AI Agent',
    actionType: 'task_completed',
    action,
    details,
    status: 'success',
    executionTime
  });
};

export const logTaskFailure = (agentName: string, action: string, details: string, errorDetails: string) => {
  logger.logInteraction({
    agentName,
    agentType: 'AI Agent',
    actionType: 'task_failed',
    action,
    details,
    status: 'error',
    errorDetails
  });
};

export const logAgentCollaboration = (agentName: string, collaboratingWith: string, details: string) => {
  logger.logInteraction({
    agentName,
    agentType: 'AI Agent',
    actionType: 'collaboration',
    action: `Collaborating with ${collaboratingWith}`,
    details,
    status: 'success'
  });
};

export const logLearningEvent = (agentName: string, learningDetails: string) => {
  logger.logInteraction({
    agentName,
    agentType: 'AI Agent',
    actionType: 'learning',
    action: 'Learning Event',
    details: learningDetails,
    status: 'success'
  });
};

export default EnhancedAgentLogger;

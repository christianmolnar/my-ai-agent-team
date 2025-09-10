/**
 * Interaction Logging Types
 * Comprehensive typing for agent interaction tracking and logging
 */

export interface AgentInteraction {
  id: string;
  timestamp: Date;
  sessionId: string;
  chatId: string;
  sequenceNumber: number;
  
  // Agent details
  agentId: string;
  agentName: string;
  agentType: 'management' | 'specialist' | 'support';
  
  // Task details
  taskAssigned: string;
  taskSummary: string;
  taskPriority: 'low' | 'medium' | 'high' | 'critical';
  taskComplexity: 'simple' | 'moderate' | 'complex' | 'expert';
  
  // Input/Output
  inputReceived: string;
  outputProduced: string;
  outputSummary: string;
  
  // Performance metrics
  executionTimeMs: number;
  status: 'assigned' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  success: boolean;
  
  // Context
  dependencies: string[];
  followUpRequired: boolean;
  qualityScore?: number;
  
  // Metadata
  assignedBy: string;
  coordinatedBy: 'project-coordinator';
  relatedInteractions: string[];
}

export interface ChatSession {
  sessionId: string;
  chatId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  
  // Session overview
  userRequest: string;
  requestSummary: string;
  totalInteractions: number;
  
  // Orchestration info
  orchestrationType: 'direct' | 'simple' | 'complex';
  masterOrchestratorInvolved: boolean;
  projectCoordinatorInvolved: boolean;
  
  // Agent involvement
  agentsInvolved: string[];
  totalAgentsUsed: number;
  
  // Performance
  totalExecutionTimeMs: number;
  sessionStatus: 'active' | 'completed' | 'failed' | 'cancelled';
  
  // Results
  finalResponse: string;
  deliverables: string[];
  userSatisfaction?: number;
  
  // Metadata
  interactions: AgentInteraction[];
  logFilePath: string;
}

export interface InteractionLog {
  logId: string;
  sessionId: string;
  chatId: string;
  createdAt: Date;
  
  // Summary data
  totalInteractions: number;
  sessionDurationMs: number;
  agentBreakdown: Record<string, number>;
  
  // File info
  logFilePath: string;
  fileSize: number;
  
  // Status
  status: 'active' | 'completed' | 'archived';
}

export interface InteractionSummary {
  // Time period
  periodStart: Date;
  periodEnd: Date;
  
  // Volume metrics  
  totalSessions: number;
  totalInteractions: number;
  totalAgentsUsed: number;
  
  // Performance metrics
  averageSessionDuration: number;
  averageInteractionsPerSession: number;
  successRate: number;
  
  // Agent utilization
  mostUsedAgents: Array<{
    agentId: string;
    agentName: string;
    usageCount: number;
    successRate: number;
  }>;
  
  // Popular task types
  commonTaskTypes: Array<{
    taskType: string;
    frequency: number;
    averageComplexity: string;
  }>;
}

export interface LogViewerConfig {
  // Display options
  showSequenceNumbers: boolean;
  showTimestamps: boolean;
  showExecutionTime: boolean;
  showTaskComplexity: boolean;
  
  // Filtering
  filterByAgent?: string;
  filterByStatus?: AgentInteraction['status'];
  filterByDateRange?: {
    start: Date;
    end: Date;
  };
  
  // Pagination
  pageSize: number;
  currentPage: number;
}

/**
 * Learning Tracking System Types
 * Database-ready schema for tracking behavior modifications and user feedback
 */

export interface LearningEvent {
  id: string;
  timestamp: Date;
  agentType: string;
  userId?: string;
  sessionId?: string;
  
  // Learning Details
  learningType: 'add_behavior' | 'modify_behavior' | 'remove_behavior' | 'enhance_capability';
  description: string;
  area: string;
  complexity: 'simple' | 'moderate' | 'complex';
  
  // Implementation Details
  filesModified: string[];
  changesApplied: LearningChange[];
  backupId?: string;
  
  // User Feedback and Status
  status: 'pending' | 'internalized' | 'forgotten' | 'reverted';
  userFeedback?: UserFeedback;
  
  // Metadata
  claudeAnalysis?: string;
  conflictsDetected?: string[];
  removalStrategy?: 'surgical' | 'deprecation' | 'conditional' | 'gradual';
}

export interface LearningChange {
  file: string;
  type: 'create' | 'modify' | 'delete';
  beforeContent?: string;
  afterContent: string;
  lineRange?: {
    start: number;
    end: number;
  };
}

export interface UserFeedback {
  action: 'internalize' | 'forget';
  timestamp: Date;
  rating?: 1 | 2 | 3 | 4 | 5;
  comments?: string;
  wasHelpful: boolean;
  improvementSuggestions?: string;
}

export interface LearningStats {
  totalLearnings: number;
  internalized: number;
  forgotten: number;
  pending: number;
  successRate: number;
  avgComplexity: number;
  topAreas: Array<{
    area: string;
    count: number;
    successRate: number;
  }>;
  recentTrends: {
    last7Days: number;
    last30Days: number;
    growthRate: number;
  };
}

export interface LearningHistoryEntry {
  id: string;
  timestamp: Date;
  description: string;
  status: LearningEvent['status'];
  filesModified: string[];
  userAction?: 'internalize' | 'forget';
  canRollback: boolean;
}

// Database-ready schema for future migration
export interface LearningTrackingSchema {
  learning_events: {
    id: string; // Primary key
    created_at: Date;
    updated_at: Date;
    agent_type: string;
    user_id?: string;
    session_id?: string;
    
    // Learning metadata  
    learning_type: string;
    description: string;
    area: string;
    complexity: string;
    
    // Implementation tracking
    files_modified: string[]; // JSON array
    changes_applied: string; // JSON serialized
    backup_id?: string;
    
    // Status and feedback
    status: string;
    user_feedback?: string; // JSON serialized
    
    // Analysis metadata
    claude_analysis?: string;
    conflicts_detected?: string[]; // JSON array
    removal_strategy?: string;
    
    // Indexes
    indexes: {
      agent_type_created_at: ['agent_type', 'created_at'];
      status_timestamp: ['status', 'created_at'];
      user_id_timestamp: ['user_id', 'created_at'];
      area_status: ['area', 'status'];
    };
  };
  
  learning_rollbacks: {
    id: string;
    learning_event_id: string; // Foreign key
    rollback_timestamp: Date;
    rollback_reason: string;
    files_restored: string[]; // JSON array
    success: boolean;
    error_message?: string;
  };
}

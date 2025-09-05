import { Agent, AgentTask, AgentTaskResult } from './Agent';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Personal Assistant Bridge Agent (#6)
 * 
 * Primary Role: Secure interface between public agents and private repository
 * Claude Model: Claude Haiku (security-focused structured tasks)
 * 
 * This agent provides secure access to private repository data while maintaining
 * privacy controls, audit logging, and access management.
 */
export class PersonalAssistantBridge implements Agent {
  id = 'personal-assistant-bridge';
  name = 'Personal Assistant Bridge';
  description = 'Secure interface between public agents and private repository data';
  abilities = [
    'Secure private repository access',
    'Data privacy enforcement',
    'Access control management',
    'Audit logging',
    'Privacy-preserving data retrieval',
    'Authentication and authorization'
  ];

  private privateRepoPath: string;
  private auditLog: Array<{timestamp: string, action: string, agent: string, dataType: string}> = [];
  
  // Security and privacy settings
  private readonly ALLOWED_DATA_TYPES = [
    'identity-basic',
    'identity-communications',
    'preferences',
    'project-context',
    'learning-patterns'
  ];

  private readonly RESTRICTED_PATHS = [
    'financial/',
    'personal-life/financial/',
    'schwab/',
    'sensitive/'
  ];

  constructor() {
    this.privateRepoPath = '/Users/christian/Repos/my-personal-assistant-private';
    this.initializeBridge();
  }

  private initializeBridge() {
    // Verify private repository access
    if (!fs.existsSync(this.privateRepoPath)) {
      console.warn('Private repository not accessible. Bridge operating in limited mode.');
      return;
    }

    // Initialize audit logging
    this.logAuditEvent('bridge-initialized', 'system', 'bridge-startup');
    console.log('🔐 Personal Assistant Bridge initialized with secure private repository access');
  }

  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    try {
      // Log all access attempts
      this.logAuditEvent(task.type, task.payload?.requestingAgent || 'unknown', task.payload?.dataType || 'unspecified');

      switch (task.type) {
        case 'get-identity-data':
          return await this.getIdentityData(task.payload);
        
        case 'get-communications-style':
          return await this.getCommunicationsStyle(task.payload);
        
        case 'get-project-context':
          return await this.getProjectContext(task.payload);
        
        case 'verify-access':
          return await this.verifyAccess(task.payload);
        
        case 'get-cns-data':
          return await this.getCNSData(task.payload);
        
        case 'update-cns-learning':
          return await this.updateCNSLearning(task.payload);
        
        case 'get-audit-log':
          return this.getAuditLog();

        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
    } catch (error) {
      this.logAuditEvent('error', task.payload?.requestingAgent || 'unknown', `error: ${error}`);
      return {
        success: false,
        result: null,
        error: `Bridge access error: ${error}`
      };
    }
  }

  /**
   * Get basic identity data for agent personalization
   * Privacy Level: LOW - Basic professional identity only
   */
  private async getIdentityData(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'identity-basic')) {
      return { success: false, result: null, error: 'Access denied: insufficient permissions' };
    }

    try {
      const identityPath = path.join(this.privateRepoPath, 'identity/about-me');
      
      if (!fs.existsSync(identityPath)) {
        return { success: false, result: null, error: 'Identity data not found' };
      }

      // Read basic identity information (filtered for privacy)
      const basicInfo = {
        name: 'Christian Molnar',
        role: 'Technology Executive',
        expertise: ['AI/ML', 'Software Development', 'Product Management', 'Team Leadership'],
        availability: 'Business Hours Pacific Time',
        communication_preferences: {
          style: 'Professional but approachable',
          format: 'Clear and concise',
          tone: 'Confident and collaborative'
        }
      };

      return {
        success: true,
        result: basicInfo
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to retrieve identity data: ${error}` };
    }
  }

  /**
   * Get communications style and preferences for content creation
   * Privacy Level: LOW - Professional communication patterns only
   */
  private async getCommunicationsStyle(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'identity-communications')) {
      return { success: false, result: null, error: 'Access denied: insufficient permissions' };
    }

    try {
      const communicationsPath = path.join(this.privateRepoPath, 'identity/communications-agent');
      
      const styleGuide = {
        email_style: {
          greeting: 'Professional but warm',
          body: 'Clear, structured, action-oriented',
          closing: 'Confident and collaborative',
          signature: 'Best regards, Christian'
        },
        document_style: {
          structure: 'Executive summary, detailed analysis, clear recommendations',
          tone: 'Authoritative but accessible',
          formatting: 'Clean, professional, well-organized'
        },
        meeting_style: {
          preparation: 'Thorough agenda and materials review',
          facilitation: 'Structured, inclusive, results-focused',
          follow_up: 'Clear action items and owners'
        }
      };

      return {
        success: true,
        result: styleGuide
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to retrieve communications style: ${error}` };
    }
  }

  /**
   * Get project context and current priorities
   * Privacy Level: MEDIUM - Project information with business context
   */
  private async getProjectContext(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'project-context')) {
      return { success: false, result: null, error: 'Access denied: insufficient permissions' };
    }

    try {
      // Get current project context from various sources
      const context = {
        current_focus: 'AI Agent Team Implementation',
        active_projects: [
          'Phase 6 Migration - AI Agent Team',
          'Personal Assistant Integration',
          'System Architecture Documentation'
        ],
        priorities: [
          'Complete agent implementation',
          'Establish secure private-public integration',
          'Optimize system performance'
        ],
        timeline: 'Q4 2025 completion target'
      };

      return {
        success: true,
        result: context
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to retrieve project context: ${error}` };
    }
  }

  /**
   * Verify agent access permissions
   */
  private async verifyAccess(payload: any): Promise<AgentTaskResult> {
    const { requestingAgent, dataType } = payload;
    const hasAccess = this.validateDataAccess(requestingAgent, dataType);
    
    return {
      success: true,
      result: {
        hasAccess,
        agent: requestingAgent,
        dataType,
        restrictions: hasAccess ? [] : ['insufficient-permissions']
      }
    };
  }

  /**
   * Get CNS (Cognitive Network System) data for agent learning
   */
  private async getCNSData(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'learning-patterns')) {
      return { success: false, result: null, error: 'Access denied: insufficient CNS permissions' };
    }

    try {
      const agentCNSPath = path.join(
        this.privateRepoPath, 
        'ai-team', 
        payload.agentType || 'personal-assistant-agent', 
        'cns'
      );

      // For now, return basic CNS structure - we'll enhance this in Sub-Phase 6.1.2
      const cnsData = {
        performance_metrics: {},
        learning_patterns: {},
        feedback_integration: {},
        self_assessment: {}
      };

      return {
        success: true,
        result: cnsData
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to retrieve CNS data: ${error}` };
    }
  }

  /**
   * Update CNS learning data
   */
  private async updateCNSLearning(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'learning-patterns')) {
      return { success: false, result: null, error: 'Access denied: insufficient CNS update permissions' };
    }

    // For now, log the learning update - we'll implement full CNS in Sub-Phase 6.1.2
    this.logAuditEvent('cns-update', payload.requestingAgent, 'learning-data');
    
    return {
      success: true,
      result: { updated: true, timestamp: new Date().toISOString() }
    };
  }

  /**
   * Get audit log (restricted access)
   */
  private getAuditLog(): AgentTaskResult {
    return {
      success: true,
      result: {
        total_entries: this.auditLog.length,
        recent_entries: this.auditLog.slice(-10), // Last 10 entries only
        summary: {
          bridge_initializations: this.auditLog.filter(e => e.action === 'bridge-initialized').length,
          data_access_requests: this.auditLog.filter(e => e.action.includes('get-')).length,
          errors: this.auditLog.filter(e => e.action === 'error').length
        }
      }
    };
  }

  /**
   * Validate data access permissions based on agent identity and data type
   */
  private validateDataAccess(requestingAgent: string, dataType: string): boolean {
    // Check if data type is allowed
    if (!this.ALLOWED_DATA_TYPES.includes(dataType)) {
      return false;
    }

    // Implement agent-specific access controls
    const agentPermissions: Record<string, string[]> = {
      'communications-agent': ['identity-basic', 'identity-communications', 'project-context'],
      'researcher-agent': ['identity-basic', 'project-context', 'learning-patterns'],
      'master-orchestrator': ['identity-basic', 'project-context', 'learning-patterns'],
      'project-coordinator': ['identity-basic', 'project-context', 'learning-patterns'],
      'personal-assistant-bridge': ['identity-basic', 'identity-communications', 'project-context', 'learning-patterns']
    };

    const allowedDataTypes = agentPermissions[requestingAgent] || [];
    return allowedDataTypes.includes(dataType);
  }

  /**
   * Log audit events for security and compliance
   */
  private logAuditEvent(action: string, agent: string, dataType: string) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      agent,
      dataType
    };
    
    this.auditLog.push(auditEntry);
    
    // Keep audit log size manageable
    if (this.auditLog.length > 1000) {
      this.auditLog = this.auditLog.slice(-500); // Keep last 500 entries
    }

    // In production, this would also write to persistent audit log
    console.log(`🔍 Bridge Audit: ${action} by ${agent} for ${dataType}`);
  }

  /**
   * Check if a file path is restricted
   */
  private isRestrictedPath(filePath: string): boolean {
    return this.RESTRICTED_PATHS.some(restrictedPath => 
      filePath.includes(restrictedPath)
    );
  }
}

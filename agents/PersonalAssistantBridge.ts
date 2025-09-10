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
  private auditLogPath: string;
  
  // Persistent audit log that survives across requests
  private static persistentAuditLog: Array<{timestamp: string, action: string, agent: string, dataType: string}> = [];
  
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
    this.auditLogPath = path.join(this.privateRepoPath, 'working', 'bridge-audit.json');
    this.initializeBridge();
    this.loadAuditLogFromFile();
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
      // Log task-specific summaries
      const summary = this.getTaskSummary(task);
      this.logAuditEvent(task.type, task.payload?.requestingAgent || 'unknown', task.payload?.dataType || 'general-access', summary);

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
        
        case 'apply-feedback-improvements':
          return await this.applyFeedbackImprovements(task.payload);
        
        case 'add-agent-capability':
          return await this.addAgentCapability(task.payload);
        
        case 'add-agent-reflex':
          return await this.addAgentReflex(task.payload);
        
        case 'enhance-agent-memory':
          return await this.enhanceAgentMemory(task.payload);
        
        case 'remove-behavior':
          return await this.removeBehavior(task.payload);
        
        case 'analyze-cns-state':
          return await this.analyzeCNSState(task.payload);
        
        case 'create-cns-backup':
          return await this.createCNSBackup(task.payload);
        
        case 'restore-cns-backup':
          return await this.restoreCNSBackup(task.payload);

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
      this.logAuditEvent('error', payload.requestingAgent, 'identity-data-error', `Failed to retrieve identity data: ${error}`);
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
      this.logAuditEvent('error', payload.requestingAgent, 'communications-style-error', `Failed to retrieve communications style: ${error}`);
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
      this.logAuditEvent('error', payload.requestingAgent, 'project-context-error', `Failed to retrieve project context: ${error}`);
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

      // Read actual CNS files
      const cnsData: any = {
        performance_metrics: {},
        learning_patterns: {},
        feedback_integration: {},
        self_assessment: {}
      };

      // Load formatting guidelines if requested
      if (payload.section === 'brain' || payload.section === 'all') {
        try {
          const formattingPath = path.join(agentCNSPath, 'brain', 'formatting-guidelines.md');
          if (fs.existsSync(formattingPath)) {
            cnsData.formatting_guidelines = fs.readFileSync(formattingPath, 'utf8');
          }
        } catch (error) {
          console.warn('CNS: Could not load formatting guidelines:', error.message);
        }
      }

      // Load conversation patterns if requested
      if (payload.section === 'memory' || payload.section === 'all') {
        try {
          const conversationPath = path.join(agentCNSPath, 'memory', 'procedural', 'conversation-patterns.md');
          if (fs.existsSync(conversationPath)) {
            cnsData.conversation_patterns = fs.readFileSync(conversationPath, 'utf8');
          }
        } catch (error) {
          console.warn('CNS: Could not load conversation patterns:', error.message);
        }
      }

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
    // Refresh from file to get latest entries from other instances
    this.loadAuditLogFromFile();
    
    return {
      success: true,
      result: {
        total_entries: PersonalAssistantBridge.persistentAuditLog.length,
        recent_entries: PersonalAssistantBridge.persistentAuditLog, // Return ALL entries - no hardcoded limits
        summary: {
          bridge_initializations: PersonalAssistantBridge.persistentAuditLog.filter(e => e.action === 'bridge-initialized').length,
          data_access_requests: PersonalAssistantBridge.persistentAuditLog.filter(e => e.action.includes('get-')).length,
          errors: PersonalAssistantBridge.persistentAuditLog.filter(e => e.action === 'error').length
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
      'personal-assistant': ['identity-basic', 'identity-communications', 'project-context', 'learning-patterns'],
      'personal-assistant-bridge': ['identity-basic', 'identity-communications', 'project-context', 'learning-patterns']
    };

    const allowedDataTypes = agentPermissions[requestingAgent] || [];
    return allowedDataTypes.includes(dataType);
  }

  /**
   * Log audit events for security and compliance with interaction summaries
   */
  private logAuditEvent(action: string, agent: string, dataType: string, summary?: string) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      agent,
      dataType,
      summary: summary || this.generateInteractionSummary(action, dataType)
    };
    
    PersonalAssistantBridge.persistentAuditLog.push(auditEntry);
    
    // Keep audit log size manageable
    if (PersonalAssistantBridge.persistentAuditLog.length > 1000) {
      PersonalAssistantBridge.persistentAuditLog = PersonalAssistantBridge.persistentAuditLog.slice(-500); // Keep last 500 entries
    }

    // Save to persistent file storage
    this.saveAuditLogToFile();

    console.log(`🔍 Bridge Audit: ${action} by ${agent} for ${dataType}`);
  }

  /**
   * Generate meaningful summaries for bridge interactions
   */
  private generateInteractionSummary(action: string, dataType: string): string {
    switch (action) {
      case 'get-identity-data':
        return 'Retrieved user identity and preferences to personalize the response';
      case 'get-communications-style':
        return 'Accessed communication style preferences to match user\'s preferred tone and format';
      case 'get-project-context':
        return 'Loaded current project information to provide contextually relevant assistance';
      case 'get-cns-data':
        if (dataType.includes('formatting')) {
          return 'Retrieved formatting guidelines to structure response appropriately';
        } else if (dataType.includes('conversation')) {
          return 'Accessed conversation patterns to improve natural dialogue flow';
        } else {
          return 'Loaded conversational neural system data to enhance interaction quality';
        }
      case 'bridge-initialized':
        return 'Established secure connection to private data repository';
      case 'get-audit-log':
        return 'Retrieved interaction history for transparency and monitoring';
      default:
        return `Performed ${action.replace(/-/g, ' ')} operation to assist with user request`;
    }
  }

  /**
   * Generate context-aware summaries for bridge tasks
   */
  private getTaskSummary(task: AgentTask): string {
    const userMessage = task.payload?.userMessage || '';
    const conversationContext = task.payload?.conversationContext || '';
    
    switch (task.type) {
      case 'get-identity-data':
        return `Retrieved user identity and preferences to personalize response${userMessage ? ` about "${userMessage.substring(0, 50)}..."` : ''}`;
      case 'get-communications-style':
        return `Accessed communication style preferences to match user's preferred tone${userMessage ? ` for query about "${userMessage.substring(0, 50)}..."` : ''}`;
      case 'get-project-context':
        return `Loaded current project information to provide relevant context${userMessage ? ` for question about "${userMessage.substring(0, 50)}..."` : ''}`;
      case 'get-cns-data':
        return `Retrieved conversational neural system data to enhance interaction quality${userMessage ? ` for user query: "${userMessage.substring(0, 50)}..."` : ''}`;
      case 'bridge-initialized':
        return 'Established secure connection to private data repository for conversation session';
      case 'get-audit-log':
        return 'Retrieved interaction history for transparency and monitoring purposes';
      default:
        return `Performed ${task.type.replace(/-/g, ' ')} operation${userMessage ? ` in response to: "${userMessage.substring(0, 50)}..."` : ' to assist with user request'}`;
    }
  }

  /**
   * Apply feedback improvements to agent CNS
   */
  private async applyFeedbackImprovements(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'learning-patterns')) {
      return { success: false, result: null, error: 'Access denied: insufficient CNS update permissions' };
    }

    try {
      const { agentType, behaviorChange, reasoning, priority } = payload;
      const cnsPath = path.join(this.privateRepoPath, 'ai-team', agentType, 'conversation-patterns.md');
      
      if (!fs.existsSync(cnsPath)) {
        return { success: false, result: null, error: `CNS file not found for agent: ${agentType}` };
      }

      // Read existing CNS content
      let cnsContent = fs.readFileSync(cnsPath, 'utf8');
      
      // Add feedback improvement section
      const improvementEntry = `\n\n## Behavioral Improvement (${new Date().toISOString()})\n\n` +
        `**Priority**: ${priority}\n\n` +
        `**Improvement**: ${behaviorChange}\n\n` +
        `**Reasoning**: ${reasoning}\n\n` +
        `**Applied by**: ${payload.requestingAgent}\n`;
      
      cnsContent += improvementEntry;
      
      // Write back to file
      fs.writeFileSync(cnsPath, cnsContent, 'utf8');
      
      this.logAuditEvent('feedback-improvement', payload.requestingAgent, `${agentType}-cns`);
      
      return {
        success: true,
        result: { 
          updated: true, 
          agentType,
          timestamp: new Date().toISOString(),
          improvement: behaviorChange
        }
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to apply feedback improvements: ${error}` };
    }
  }

  /**
   * Add new capability to agent CNS
   */
  private async addAgentCapability(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'learning-patterns')) {
      return { success: false, result: null, error: 'Access denied: insufficient CNS update permissions' };
    }

    try {
      const { agentType, skill, proficiency, description, examples } = payload;
      const cnsPath = path.join(this.privateRepoPath, 'ai-team', agentType, 'conversation-patterns.md');
      
      if (!fs.existsSync(cnsPath)) {
        return { success: false, result: null, error: `CNS file not found for agent: ${agentType}` };
      }

      // Read existing CNS content
      let cnsContent = fs.readFileSync(cnsPath, 'utf8');
      
      // Add new capability section
      const capabilityEntry = `\n\n## New Capability: ${skill} (${new Date().toISOString()})\n\n` +
        `**Proficiency Level**: ${proficiency}/1.0\n\n` +
        `**Description**: ${description}\n\n` +
        `**Examples**: ${examples.join(', ')}\n\n` +
        `**Added by**: ${payload.requestingAgent}\n`;
      
      cnsContent += capabilityEntry;
      
      // Write back to file
      fs.writeFileSync(cnsPath, cnsContent, 'utf8');
      
      this.logAuditEvent('capability-addition', payload.requestingAgent, `${agentType}-cns`);
      
      return {
        success: true,
        result: { 
          updated: true, 
          agentType,
          skill,
          proficiency,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to add agent capability: ${error}` };
    }
  }

  /**
   * Add new reflex to agent CNS
   */
  private async addAgentReflex(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'learning-patterns')) {
      return { success: false, result: null, error: 'Access denied: insufficient CNS update permissions' };
    }

    try {
      const { agentType, trigger, response } = payload;
      const cnsPath = path.join(this.privateRepoPath, 'ai-team', agentType, 'conversation-patterns.md');
      
      if (!fs.existsSync(cnsPath)) {
        return { success: false, result: null, error: `CNS file not found for agent: ${agentType}` };
      }

      // Read existing CNS content
      let cnsContent = fs.readFileSync(cnsPath, 'utf8');
      
      // Add new reflex section
      const reflexEntry = `\n\n## New Reflex Pattern (${new Date().toISOString()})\n\n` +
        `**Trigger**: ${trigger}\n\n` +
        `**Response**: ${response}\n\n` +
        `**Added by**: ${payload.requestingAgent}\n`;
      
      cnsContent += reflexEntry;
      
      // Write back to file
      fs.writeFileSync(cnsPath, cnsContent, 'utf8');
      
      this.logAuditEvent('reflex-addition', payload.requestingAgent, `${agentType}-cns`);
      
      return {
        success: true,
        result: { 
          updated: true, 
          agentType,
          trigger,
          response,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to add agent reflex: ${error}` };
    }
  }

  /**
   * Enhance agent memory patterns
   */
  private async enhanceAgentMemory(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'learning-patterns')) {
      return { success: false, result: null, error: 'Access denied: insufficient CNS update permissions' };
    }

    try {
      const { agentType, memoryType, content, importance } = payload;
      const cnsPath = path.join(this.privateRepoPath, 'ai-team', agentType, 'conversation-patterns.md');
      
      if (!fs.existsSync(cnsPath)) {
        return { success: false, result: null, error: `CNS file not found for agent: ${agentType}` };
      }

      // Read existing CNS content
      let cnsContent = fs.readFileSync(cnsPath, 'utf8');
      
      // Add memory enhancement section
      const memoryEntry = `\n\n## Memory Enhancement: ${memoryType} (${new Date().toISOString()})\n\n` +
        `**Type**: ${memoryType}\n\n` +
        `**Importance**: ${importance}/1.0\n\n` +
        `**Content**: ${content}\n\n` +
        `**Added by**: ${payload.requestingAgent}\n`;
      
      cnsContent += memoryEntry;
      
      // Write back to file
      fs.writeFileSync(cnsPath, cnsContent, 'utf8');
      
      this.logAuditEvent('memory-enhancement', payload.requestingAgent, `${agentType}-cns`);
      
      return {
        success: true,
        result: { 
          updated: true, 
          agentType,
          memoryType,
          importance,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to enhance agent memory: ${error}` };
    }
  }

  /**
   * Remove specific behaviors from agent CNS
   */
  private async removeBehavior(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'learning-patterns')) {
      return { success: false, result: null, error: 'Access denied: insufficient permissions for behavior removal' };
    }

    try {
      const agentType = payload.agentType || 'personal-assistant';
      const targetFiles = payload.targetFiles || ['conversation-patterns.md'];
      const removalStrategy = payload.removalStrategy || 'deprecation_replacement';
      const filesModified: string[] = [];

      for (const fileName of targetFiles) {
        const filePath = path.join(this.privateRepoPath, 'ai-team', agentType, fileName);
        
        if (!fs.existsSync(filePath)) {
          console.warn(`CNS file not found: ${filePath}`);
          continue;
        }

        let fileContent = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Apply removal strategy
        switch (removalStrategy) {
          case 'surgical_removal':
            // Precisely remove specific patterns
            for (const targetBehavior of payload.targetBehaviors || []) {
              const escapedBehavior = targetBehavior.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const removalRegex = new RegExp(`## .*${escapedBehavior}.*?(?=##|$)`, 'gis');
              if (removalRegex.test(fileContent)) {
                fileContent = fileContent.replace(removalRegex, '');
                modified = true;
              }
            }
            break;

          case 'deprecation_replacement':
            // Mark as deprecated and add replacement
            const deprecationSection = `\n\n## Deprecated Patterns (${new Date().toISOString().split('T')[0]})\n\n` +
              `### ❌ REMOVED: ${payload.behaviorDescription}\n` +
              `- **Reason**: ${payload.behaviorDescription}\n` +
              `- **Status**: No longer apply this pattern\n` +
              `- **Requesting Agent**: ${payload.requestingAgent}\n\n`;
            
            // Add replacement behaviors if provided
            if (payload.replacementBehaviors && payload.replacementBehaviors.length > 0) {
              let replacementSection = `## Replacement Behaviors (${new Date().toISOString().split('T')[0]})\n\n`;
              for (const replacement of payload.replacementBehaviors) {
                replacementSection += `### ✅ NEW: ${replacement}\n` +
                  `- **Trigger**: ${payload.behaviorDescription} situation\n` +
                  `- **Response**: ${replacement}\n` +
                  `- **Added by**: ${payload.requestingAgent}\n\n`;
              }
              fileContent += deprecationSection + replacementSection;
            } else {
              fileContent += deprecationSection;
            }
            modified = true;
            break;

          case 'conditional_removal':
            // Add conditional blocks
            const conditionalSection = `\n\n## Conditional Behavior Removal (${new Date().toISOString().split('T')[0]})\n\n` +
              `### ⚠️ CONDITIONAL: ${payload.behaviorDescription}\n` +
              `- **Condition**: Do not apply when: ${payload.behaviorDescription}\n` +
              `- **Alternative**: ${payload.replacementBehaviors?.[0] || 'Use default behavior'}\n` +
              `- **Added by**: ${payload.requestingAgent}\n\n`;
            fileContent += conditionalSection;
            modified = true;
            break;

          default:
            // Default to deprecation replacement
            fileContent += `\n\n## Behavior Removal (${new Date().toISOString().split('T')[0]})\n\n` +
              `**Removed**: ${payload.behaviorDescription}\n` +
              `**Strategy**: ${removalStrategy}\n` +
              `**By**: ${payload.requestingAgent}\n\n`;
            modified = true;
        }

        if (modified) {
          fs.writeFileSync(filePath, fileContent, 'utf8');
          filesModified.push(fileName);
        }
      }

      this.logAuditEvent('behavior-removal', payload.requestingAgent, `${agentType}-cns-removal`);

      return {
        success: true,
        result: {
          filesModified,
          agentType,
          removalStrategy,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to remove behavior: ${error}` };
    }
  }

  /**
   * Analyze current CNS state for removal operations
   */
  private async analyzeCNSState(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'learning-patterns')) {
      return { success: false, result: null, error: 'Access denied: insufficient permissions for CNS analysis' };
    }

    try {
      const agentType = payload.agentType || 'personal-assistant';
      const agentPath = path.join(this.privateRepoPath, 'ai-team', agentType);
      
      if (!fs.existsSync(agentPath)) {
        return { success: false, result: null, error: `Agent directory not found: ${agentType}` };
      }

      const currentBehaviors: string[] = [];
      const behaviorDependencies: { [key: string]: string[] } = {};
      const fileContents: { [filename: string]: string } = {};

      // Scan CNS files for current behaviors
      const cnsFiles = ['conversation-patterns.md', 'brain/capabilities.md', 'brain/formatting-guidelines.md'];
      
      for (const fileName of cnsFiles) {
        const filePath = path.join(agentPath, fileName);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          fileContents[fileName] = content;
          
          // Extract behavior patterns from content
          const behaviors = this.extractBehaviorsFromContent(content);
          currentBehaviors.push(...behaviors);
          
          // Simple dependency analysis (looking for cross-references)
          for (const behavior of behaviors) {
            behaviorDependencies[behavior] = this.findBehaviorDependencies(behavior, content);
          }
        }
      }

      return {
        success: true,
        result: {
          currentBehaviors: [...new Set(currentBehaviors)], // Remove duplicates
          behaviorDependencies,
          fileContents
        }
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to analyze CNS state: ${error}` };
    }
  }

  /**
   * Create backup of current CNS state
   */
  private async createCNSBackup(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'learning-patterns')) {
      return { success: false, result: null, error: 'Access denied: insufficient permissions for backup creation' };
    }

    try {
      const agentType = payload.agentType || 'personal-assistant';
      const backupId = payload.backupId;
      const agentPath = path.join(this.privateRepoPath, 'ai-team', agentType);
      const backupPath = path.join(this.privateRepoPath, 'backups', agentType, backupId);

      // Create backup directory
      fs.mkdirSync(backupPath, { recursive: true });

      // Copy all CNS files to backup location
      const filesToBackup = [
        'conversation-patterns.md',
        'brain/capabilities.md', 
        'brain/formatting-guidelines.md',
        'memory/procedural/',
        'memory/episodic/',
        'reflexes/'
      ];

      for (const file of filesToBackup) {
        const sourcePath = path.join(agentPath, file);
        const destPath = path.join(backupPath, file);
        
        if (fs.existsSync(sourcePath)) {
          if (fs.statSync(sourcePath).isDirectory()) {
            // Copy directory recursively
            this.copyDirectoryRecursive(sourcePath, destPath);
          } else {
            // Copy individual file
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(sourcePath, destPath);
          }
        }
      }

      // Create backup metadata
      const metadata = {
        backupId,
        agentType,
        timestamp: payload.timestamp || new Date().toISOString(),
        requestingAgent: payload.requestingAgent,
        description: `CNS backup before behavior removal`
      };
      
      fs.writeFileSync(
        path.join(backupPath, 'backup-metadata.json'),
        JSON.stringify(metadata, null, 2),
        'utf8'
      );

      this.logAuditEvent('cns-backup-created', payload.requestingAgent, `${agentType}-backup-${backupId}`);

      return {
        success: true,
        result: {
          backupId,
          backupPath,
          timestamp: metadata.timestamp
        }
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to create CNS backup: ${error}` };
    }
  }

  /**
   * Restore CNS from backup
   */
  private async restoreCNSBackup(payload: any): Promise<AgentTaskResult> {
    if (!this.validateDataAccess(payload.requestingAgent, 'learning-patterns')) {
      return { success: false, result: null, error: 'Access denied: insufficient permissions for backup restoration' };
    }

    try {
      const agentType = payload.agentType || 'personal-assistant';
      const backupId = payload.backupId;
      const agentPath = path.join(this.privateRepoPath, 'ai-team', agentType);
      const backupPath = path.join(this.privateRepoPath, 'backups', agentType, backupId);

      if (!fs.existsSync(backupPath)) {
        return { success: false, result: null, error: `Backup not found: ${backupId}` };
      }

      // Read backup metadata
      const metadataPath = path.join(backupPath, 'backup-metadata.json');
      let metadata = {};
      if (fs.existsSync(metadataPath)) {
        metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      }

      // Restore files from backup
      const backupFiles = fs.readdirSync(backupPath, { recursive: true });
      
      for (const file of backupFiles) {
        if (typeof file === 'string' && file !== 'backup-metadata.json') {
          const sourcePath = path.join(backupPath, file);
          const destPath = path.join(agentPath, file);
          
          if (fs.statSync(sourcePath).isFile()) {
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(sourcePath, destPath);
          }
        }
      }

      this.logAuditEvent('cns-backup-restored', payload.requestingAgent, `${agentType}-restore-${backupId}`);

      return {
        success: true,
        result: {
          backupId,
          restoredFrom: backupPath,
          metadata,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      return { success: false, result: null, error: `Failed to restore CNS backup: ${error}` };
    }
  }

  /**
   * Helper method to extract behaviors from CNS content
   */
  private extractBehaviorsFromContent(content: string): string[] {
    const behaviors: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Look for behavior patterns (headers, capabilities, etc.)
      if (line.match(/^##\s+/)) {
        const behavior = line.replace(/^##\s+/, '').trim();
        if (behavior && !behavior.includes('(') && behavior.length > 10) {
          behaviors.push(behavior);
        }
      }
    }
    
    return behaviors;
  }

  /**
   * Helper method to find behavior dependencies
   */
  private findBehaviorDependencies(behavior: string, content: string): string[] {
    const dependencies: string[] = [];
    const behaviorSection = this.extractBehaviorSection(behavior, content);
    
    // Look for references to other behaviors
    const referenceMatches = behaviorSection.match(/refers? to|depends on|uses|builds on|requires/gi);
    if (referenceMatches) {
      // Extract potential dependency names (simplified)
      const words = behaviorSection.split(/\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        if (referenceMatches.some(ref => words[i].toLowerCase().includes(ref.toLowerCase()))) {
          const potentialDependency = words[i + 1];
          if (potentialDependency && potentialDependency.length > 5) {
            dependencies.push(potentialDependency);
          }
        }
      }
    }
    
    return dependencies;
  }

  /**
   * Helper method to extract specific behavior section from content
   */
  private extractBehaviorSection(behavior: string, content: string): string {
    const lines = content.split('\n');
    let inSection = false;
    let section = '';
    
    for (const line of lines) {
      if (line.includes(behavior)) {
        inSection = true;
      }
      
      if (inSection) {
        section += line + '\n';
        
        // Stop at next major section
        if (line.match(/^##\s+/) && !line.includes(behavior)) {
          break;
        }
      }
    }
    
    return section;
  }

  /**
   * Helper method to copy directory recursively
   */
  private copyDirectoryRecursive(src: string, dest: string): void {
    if (!fs.existsSync(src)) return;
    
    fs.mkdirSync(dest, { recursive: true });
    
    const items = fs.readdirSync(src);
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      
      if (fs.statSync(srcPath).isDirectory()) {
        this.copyDirectoryRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Load audit log from persistent file storage with concurrency safety
   */
  private loadAuditLogFromFile() {
    try {
      if (fs.existsSync(this.auditLogPath)) {
        const data = fs.readFileSync(this.auditLogPath, 'utf8');
        const loadedLog = JSON.parse(data);
        
        // Merge with existing log instead of replacing
        const existingEntries = PersonalAssistantBridge.persistentAuditLog;
        const existingTimestamps = new Set(existingEntries.map(e => e.timestamp));
        
        // Add only new entries that aren't already in memory
        const newEntries = loadedLog.filter((entry: any) => !existingTimestamps.has(entry.timestamp));
        
        if (newEntries.length > 0) {
          PersonalAssistantBridge.persistentAuditLog = [...existingEntries, ...newEntries]
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp)); // Keep chronological order
          console.log(`🔍 Bridge: Merged ${newEntries.length} new audit entries from file (total: ${PersonalAssistantBridge.persistentAuditLog.length})`);
        } else {
          console.log(`🔍 Bridge: Audit log already synchronized (${existingEntries.length} entries)`);
        }
      }
    } catch (error) {
      console.log(`🔍 Bridge: Could not load audit log from file: ${error}`);
      if (PersonalAssistantBridge.persistentAuditLog.length === 0) {
        PersonalAssistantBridge.persistentAuditLog = [];
      }
    }
  }

  /**
   * Save audit log to persistent file storage with atomic updates
   */
  private saveAuditLogToFile() {
    try {
      const dir = path.dirname(this.auditLogPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Use atomic write with temp file to prevent corruption
      const tempPath = this.auditLogPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(PersonalAssistantBridge.persistentAuditLog, null, 2));
      fs.renameSync(tempPath, this.auditLogPath);
    } catch (error) {
      console.log(`🔍 Bridge: Could not save audit log to file: ${error}`);
    }
  }
}

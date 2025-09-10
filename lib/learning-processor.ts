const { promises: fs } = require('fs');
const { join } = require('path');

/**
 * Learning Processor - Materializes internalized learnings into CNS files
 * Processes claudeAnalysis data to create the specific files referenced
 */
class LearningProcessor {
  
  /**
   * Process all internalized learnings that haven't been materialized yet
   */
  static async processPendingLearnings(): Promise<{
    processed: number;
    created: string[];
    updated: string[];
    errors: string[];
  }> {
    const result = {
      processed: 0,
      created: [] as string[],
      updated: [] as string[],
      errors: [] as string[]
    };

    try {
      // Read learning history
      const learningHistoryPath = join(process.cwd(), 'data', 'learning', 'learning-history.jsonl');
      const learningContent = await fs.readFile(learningHistoryPath, 'utf8');
      const learningLines = learningContent.trim().split('\n');
      
      let learningUpdated = false;
      const updatedLines: string[] = [];

      for (const line of learningLines) {
        let learningEntry = JSON.parse(line);
        
        // Check if this is an internalized learning with claudeAnalysis but no files modified
        if (learningEntry.status === 'internalized' && 
            learningEntry.claudeAnalysis && 
            (!learningEntry.filesModified || learningEntry.filesModified.length === 0)) {
          
          console.log(`Processing internalized learning: ${learningEntry.id}`);
          
          try {
            // Process the claudeAnalysis
            const analysisData = JSON.parse(learningEntry.claudeAnalysis);
            const filesCreated = await this.materializeLearning(learningEntry, analysisData);
            
            // Update the learning entry
            learningEntry.filesModified = filesCreated;
            learningEntry.changesApplied = filesCreated.map(file => `Created CNS file: ${file}`);
            
            result.processed++;
            result.created.push(...filesCreated);
            learningUpdated = true;
            
            console.log(`✅ Materialized learning ${learningEntry.id}, created ${filesCreated.length} files`);
            
          } catch (error) {
            console.error(`❌ Failed to process learning ${learningEntry.id}:`, error);
            result.errors.push(`Learning ${learningEntry.id}: ${error.message}`);
          }
        }
        
        updatedLines.push(JSON.stringify(learningEntry));
      }

      // Write back updated learning history if any changes were made
      if (learningUpdated) {
        await fs.writeFile(learningHistoryPath, updatedLines.join('\n') + '\n');
        
        // Also update the formatted JSON version
        const formattedPath = join(process.cwd(), 'data', 'learning', 'learning-history-formatted.json');
        const formattedData = updatedLines.map(line => JSON.parse(line));
        await fs.writeFile(formattedPath, JSON.stringify(formattedData, null, 2));
        
        result.updated.push(learningHistoryPath, formattedPath);
      }

    } catch (error) {
      console.error('Error processing learning history:', error);
      result.errors.push(`Learning history processing: ${error.message}`);
    }

    return result;
  }

  /**
   * Materialize a specific learning into CNS files
   */
  private static async materializeLearning(learningEntry: any, analysisData: any): Promise<string[]> {
    const createdFiles: string[] = [];
    
    // Determine agent CNS path
    const agentType = learningEntry.agentType || 'personal-assistant';
    const agentName = this.getAgentFolderName(agentType);
    const cnsPath = join(process.cwd(), 'agents', agentName, 'CNS');
    
    // Ensure CNS directory structure exists
    await this.ensureCNSStructure(cnsPath);

    // Process cnsUpdates
    if (analysisData.cnsUpdates) {
      for (const update of analysisData.cnsUpdates) {
        const fileName = this.getCNSFileName(update.area);
        const filePath = join(cnsPath, 'brain', fileName);
        
        const content = this.generateCNSContent(update, analysisData, learningEntry);
        await fs.writeFile(filePath, content);
        createdFiles.push(`brain/${fileName}`);
      }
    }

    // Process removalInstructions.targetFiles (like trust_management.json)
    if (analysisData.removalInstructions?.targetFiles) {
      for (const targetFile of analysisData.removalInstructions.targetFiles) {
        if (targetFile.endsWith('.json')) {
          const filePath = join(cnsPath, 'brain', targetFile);
          const content = this.generateJSONContent(targetFile, analysisData, learningEntry);
          await fs.writeFile(filePath, JSON.stringify(content, null, 2));
          createdFiles.push(`brain/${targetFile}`);
        }
      }
    }

    // Process memoryEnhancements
    if (analysisData.memoryEnhancements) {
      for (const memory of analysisData.memoryEnhancements) {
        const memoryType = memory.type || 'procedural';
        const fileName = this.getMemoryFileName(memory.content);
        const filePath = join(cnsPath, 'memory', memoryType, fileName);
        
        // Ensure memory subdirectory exists
        await fs.mkdir(join(cnsPath, 'memory', memoryType), { recursive: true });
        
        const content = this.generateMemoryContent(memory, analysisData, learningEntry);
        await fs.writeFile(filePath, content);
        createdFiles.push(`memory/${memoryType}/${fileName}`);
      }
    }

    // Process reflexUpdates
    if (analysisData.reflexUpdates) {
      const reflexFile = join(cnsPath, 'reflexes', 'behavioral-responses.md');
      await fs.mkdir(join(cnsPath, 'reflexes'), { recursive: true });
      
      const content = this.generateReflexContent(analysisData.reflexUpdates, analysisData, learningEntry);
      await fs.writeFile(reflexFile, content);
      createdFiles.push('reflexes/behavioral-responses.md');
    }

    return createdFiles;
  }

  /**
   * Ensure CNS directory structure exists
   */
  private static async ensureCNSStructure(cnsPath: string): Promise<void> {
    const dirs = [
      join(cnsPath, 'brain'),
      join(cnsPath, 'memory', 'procedural'),
      join(cnsPath, 'memory', 'semantic'), 
      join(cnsPath, 'memory', 'episodic'),
      join(cnsPath, 'reflexes')
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Get agent folder name from agent type
   */
  private static getAgentFolderName(agentType: string): string {
    const mapping: { [key: string]: string } = {
      'personal-assistant': 'PersonalAssistantAgent',
      'master-orchestrator': 'MasterOrchestratorAgent',
      'communications-agent': 'CommunicationsAgent',
      'researcher-agent': 'ResearcherAgent'
    };
    return mapping[agentType] || 'PersonalAssistantAgent';
  }

  /**
   * Generate CNS file name from update area
   */
  private static getCNSFileName(area: string): string {
    const mapping: { [key: string]: string } = {
      'information-verification': 'fact-checking-protocols.md',
      'trust-management': 'trust-assessment.md', 
      'behavior-learning': 'learned-behaviors.md',
      'communication': 'communication-patterns.md'
    };
    return mapping[area] || `${area.replace(/[^a-zA-Z0-9]/g, '-')}.md`;
  }

  /**
   * Generate memory file name from content description
   */
  private static getMemoryFileName(content: string): string {
    const sanitized = content.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    return `${sanitized}.md`;
  }

  /**
   * Generate CNS content for brain files
   */
  private static generateCNSContent(update: any, analysisData: any, learningEntry: any): string {
    return `# ${update.area.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

**Learning Source**: ${learningEntry.description}  
**Date Applied**: ${new Date().toISOString()}  
**Priority**: ${update.priority}  
**Operation**: ${update.operation}

## Description
${update.description}

## Implementation Details
${analysisData.newCapabilities ? analysisData.newCapabilities.join('\n- ') : 'Enhanced behavioral patterns applied'}

## Trigger Conditions
${analysisData.reflexUpdates ? 
  analysisData.reflexUpdates.map((reflex: any) => `- ${reflex.trigger}: ${reflex.response}`).join('\n') : 
  '- Applied contextually based on situation assessment'}

## Learning Context
- **Area**: ${learningEntry.area}
- **Complexity**: ${learningEntry.complexity}
- **Agent Type**: ${learningEntry.agentType}
- **Learning ID**: ${learningEntry.id}

---
*This file was auto-generated from internalized learning data*
`;
  }

  /**
   * Generate JSON content for specific CNS files
   */
  private static generateJSONContent(fileName: string, analysisData: any, learningEntry: any): any {
    const baseContent = {
      createdFrom: learningEntry.id,
      timestamp: new Date().toISOString(),
      description: learningEntry.description,
      learningArea: learningEntry.area
    };

    switch (fileName) {
      case 'trust_management.json':
        return {
          ...baseContent,
          trustEvaluationCriteria: {
            sourceVerification: {
              required: true,
              methods: ['cross-reference', 'authority-check', 'consistency-analysis'],
              threshold: 0.8
            },
            informationAccuracy: {
              factChecking: true,
              patterns: analysisData.memoryEnhancements?.filter((m: any) => m.type === 'semantic') || [],
              flags: ['fabricated-information', 'inconsistent-data', 'unverifiable-claims']
            },
            responseStrategy: {
              onSuspiciousInformation: 'flag-for-verification',
              onConfirmedFabrication: 'politely-decline',
              replacementBehavior: analysisData.removalInstructions?.replacementBehavior || 'request-accurate-data'
            }
          },
          capabilities: analysisData.newCapabilities || []
        };

      case 'information_processing.json':
        return {
          ...baseContent,
          processingRules: {
            verificationRequired: true,
            sources: {
              biographical: {
                requireEvidence: true,
                crossReference: true,
                patterns: ['birth-death-dates', 'career-timeline', 'location-consistency']
              }
            },
            qualityChecks: {
              consistencyAnalysis: true,
              authorityValidation: true,
              temporalConsistency: true
            },
            responseGeneration: {
              onVerificationFailure: 'request-sources',
              onInconsistentData: 'flag-inconsistencies',
              confidenceThreshold: 0.7
            }
          },
          reflexes: analysisData.reflexUpdates || [],
          memoryPatterns: analysisData.memoryEnhancements || []
        };

      default:
        return {
          ...baseContent,
          content: analysisData,
          type: 'general-learning-data'
        };
    }
  }

  /**
   * Generate memory content for memory files
   */
  private static generateMemoryContent(memory: any, analysisData: any, learningEntry: any): string {
    return `# ${memory.content.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}

**Type**: ${memory.type}  
**Importance**: ${memory.importance}  
**Operation**: ${memory.operation}  
**Source**: ${learningEntry.description}  
**Applied**: ${new Date().toISOString()}

## Memory Content
${memory.content}

## Context
${analysisData.newCapabilities ? `### New Capabilities Enabled
${analysisData.newCapabilities.map((cap: string) => `- ${cap}`).join('\n')}` : ''}

### Learning Details
- **Learning ID**: ${learningEntry.id}
- **Agent Type**: ${learningEntry.agentType}
- **Complexity**: ${learningEntry.complexity}

---
*Auto-generated from internalized learning memory enhancement*
`;
  }

  /**
   * Generate reflex content for behavioral responses
   */
  private static generateReflexContent(reflexUpdates: any[], analysisData: any, learningEntry: any): string {
    return `# Behavioral Response Patterns

**Source**: ${learningEntry.description}  
**Applied**: ${new Date().toISOString()}  
**Learning ID**: ${learningEntry.id}

## Reflex Patterns

${reflexUpdates.map(reflex => `### ${reflex.trigger.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
- **Trigger**: ${reflex.trigger}
- **Response**: ${reflex.response}
- **Operation**: ${reflex.operation}
`).join('\n')}

## Context Integration
${analysisData.newCapabilities ? 
  `### Enhanced Capabilities\n${analysisData.newCapabilities.map((cap: string) => `- ${cap}`).join('\n')}\n` : ''}

### Removal Instructions
${analysisData.removalInstructions ? `
- **Target Behaviors**: ${JSON.stringify(analysisData.removalInstructions.targetBehaviors)}
- **Strategy**: ${analysisData.removalInstructions.removalStrategy}
- **Replacement**: ${analysisData.removalInstructions.replacementBehavior}
` : 'No specific removal instructions'}

---
*Auto-generated behavioral response patterns from learning system*
`;
  }
}

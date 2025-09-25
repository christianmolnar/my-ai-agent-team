import { promises as fs } from 'fs';
import { join } from 'path';

/**
 * CNS (Conversational Neural System) Manager
 * Handles reading, writing, and updating agent learning files
 */
export class CNSManager {
  private basePath: string;
  
  constructor(agentName: string) {
    this.basePath = join(process.cwd(), 'agents-cns', agentName, 'cns');
  }

  /**
   * Read all CNS files to get current learned behaviors, integration patterns, and reflexes
   */
  async getActiveLearnings(): Promise<string> {
    const learnings: string[] = [];
    
    try {
      // Read brain files
      const brainPath = join(this.basePath, 'brain');
      const brainFiles = await fs.readdir(brainPath);
      
      for (const file of brainFiles) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(join(brainPath, file), 'utf8');
          learnings.push(`## BRAIN: ${file.replace('.md', '').toUpperCase()}\n${content}\n`);
        }
      }
      
      // Read procedural memory
      const proceduralPath = join(this.basePath, 'memory', 'procedural');
      const proceduralFiles = await fs.readdir(proceduralPath);
      
      for (const file of proceduralFiles) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(join(proceduralPath, file), 'utf8');
          learnings.push(`## PROCEDURAL: ${file.replace('.md', '').toUpperCase()}\n${content}\n`);
        }
      }

      // Read integration frameworks
      const integrationPath = join(this.basePath, 'integration');
      try {
        const integrationFiles = await fs.readdir(integrationPath);
        
        for (const file of integrationFiles) {
          if (file.endsWith('.json')) {
            const content = await fs.readFile(join(integrationPath, file), 'utf8');
            const jsonData = JSON.parse(content);
            learnings.push(`## INTEGRATION: ${file.replace('.json', '').toUpperCase()}\n${JSON.stringify(jsonData, null, 2)}\n`);
          }
        }
      } catch (error) {
        // Integration folder may not exist for some agents
      }

      // Read reflex patterns
      const reflexesPath = join(this.basePath, 'reflexes');
      try {
        const reflexFiles = await fs.readdir(reflexesPath);
        
        for (const file of reflexFiles) {
          if (file.endsWith('.json')) {
            const content = await fs.readFile(join(reflexesPath, file), 'utf8');
            const jsonData = JSON.parse(content);
            learnings.push(`## REFLEXES: ${file.replace('.json', '').toUpperCase()}\n${JSON.stringify(jsonData, null, 2)}\n`);
          }
        }
      } catch (error) {
        // Reflexes folder may not exist for some agents
      }
      
    } catch (error) {
      console.warn('CNS: Could not read all learning files:', error.message);
    }
    
    return learnings.join('\n---\n\n');
  }

  /**
   * Process user feedback and determine which CNS files to update
   */
  async processLearningFeedback(feedback: string, context: any): Promise<CNSLearningResult> {
    const analysis = await this.analyzeFeedback(feedback, context);
    const updatedFiles: string[] = [];
    
    // Update appropriate CNS files based on analysis
    for (const update of analysis.updates) {
      try {
        await this.updateCNSFile(update.file, update.content, update.section);
        updatedFiles.push(update.file);
      } catch (error) {
        console.error(`Failed to update CNS file ${update.file}:`, error);
      }
    }

    return {
      success: true,
      updatedFiles,
      analysis: analysis.summary,
      changes: analysis.updates.map(u => u.description)
    };
  }

  /**
   * Analyze feedback to determine what needs to be learned
   */
  private async analyzeFeedback(feedback: string, context: any): Promise<CNSAnalysis> {
    // Simple rule-based analysis for now - could be enhanced with LLM analysis
    const updates: CNSUpdate[] = [];
    let summary = '';

    if (feedback.includes('format') || feedback.includes('bullet') || feedback.includes('paragraph')) {
      updates.push({
        file: 'brain/formatting-guidelines.md',
        section: 'Learning History',
        content: `### **${new Date().toISOString().split('T')[0]}: User Formatting Feedback**
- **Feedback**: "${feedback}"
- **Applied Learning**: Updated formatting guidelines based on user preference
- **Context**: ${JSON.stringify(context, null, 2)}
- **Confidence**: High - Direct user instruction`,
        description: 'Updated formatting guidelines based on user feedback'
      });
      summary = 'Formatting and response structure improvements';
    }

    if (feedback.includes('context') || feedback.includes('remember') || feedback.includes('conversation')) {
      updates.push({
        file: 'memory/procedural/conversation-patterns.md',
        section: 'Learning History',
        content: `### **${new Date().toISOString().split('T')[0]}: Context Management Feedback**
- **Feedback**: "${feedback}"
- **Applied Learning**: Enhanced conversation context handling
- **Context**: ${JSON.stringify(context, null, 2)}
- **Status**: Implementing improved context retention`,
        description: 'Enhanced conversation context and memory patterns'
      });
      summary = 'Conversation context and memory improvements';
    }

    return { updates, summary };
  }

  /**
   * Update a specific CNS file with new learning content
   */
  private async updateCNSFile(filePath: string, content: string, section: string): Promise<void> {
    const fullPath = join(this.basePath, filePath);
    
    try {
      let existingContent = '';
      try {
        existingContent = await fs.readFile(fullPath, 'utf8');
      } catch {
        // File doesn't exist, will create new
      }

      // Find the learning history section and append
      const sectionMarker = `## ${section}`;
      const sectionIndex = existingContent.indexOf(sectionMarker);
      
      let updatedContent: string;
      if (sectionIndex !== -1) {
        // Append to existing section
        const beforeSection = existingContent.substring(0, sectionIndex + sectionMarker.length);
        const afterSection = existingContent.substring(sectionIndex + sectionMarker.length);
        updatedContent = `${beforeSection}\n\n${content}${afterSection}`;
      } else {
        // Add new section
        updatedContent = `${existingContent}\n\n${sectionMarker}\n\n${content}`;
      }

      await fs.writeFile(fullPath, updatedContent, 'utf8');
    } catch (error) {
      throw new Error(`Failed to update CNS file ${filePath}: ${error.message}`);
    }
  }
}

// Types for CNS operations
export interface CNSLearningResult {
  success: boolean;
  updatedFiles: string[];
  analysis: string;
  changes: string[];
}

interface CNSAnalysis {
  updates: CNSUpdate[];
  summary: string;
}

interface CNSUpdate {
  file: string;
  section: string;
  content: string;
  description: string;
}

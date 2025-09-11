/**
 * Learning Processor for immediate materialization
 * Creates CNS files instantly when learning occurs
 */

import fs from 'fs';
import path from 'path';

export interface ClaudeAnalysis {
  cnsUpdates?: Array<{
    filePath: string;
    content: string;
    operation: 'create' | 'update' | 'append';
  }>;
  memoryEnhancements?: Array<{
    type: 'procedural' | 'semantic' | 'episodic';
    content: string;
    filePath?: string;
  }>;
  reflexUpdates?: Array<{
    trigger: string;
    response: string;
    priority: number;
  }>;
}

export class LearningProcessor {
  private static cnsRoot = path.join(process.cwd(), 'brain');
  private static memoryRoot = path.join(process.cwd(), 'memory');
  private static reflexRoot = path.join(process.cwd(), 'reflexes');

  /**
   * Materialize learning immediately by creating CNS files
   */
  public static async materializeLearning(learningId: string, claudeAnalysis: ClaudeAnalysis): Promise<string[]> {
    const createdFiles: string[] = [];

    try {
      // Ensure base directories exist
      this.ensureDirectoryExists(this.cnsRoot);
      this.ensureDirectoryExists(this.memoryRoot);
      this.ensureDirectoryExists(this.reflexRoot);

      // Process CNS updates
      if (claudeAnalysis.cnsUpdates) {
        for (const update of claudeAnalysis.cnsUpdates) {
          const fullPath = path.join(this.cnsRoot, update.filePath);
          this.ensureDirectoryExists(path.dirname(fullPath));
          
          let content = update.content;
          if (!content.startsWith('---')) {
            // Add frontmatter if missing
            content = `---\nlearningId: ${learningId}\ncreated: ${new Date().toISOString()}\n---\n\n${content}`;
          }
          
          switch (update.operation) {
            case 'create':
            case 'update':
              fs.writeFileSync(fullPath, content, 'utf8');
              break;
            case 'append':
              fs.appendFileSync(fullPath, `\n\n${content}`, 'utf8');
              break;
          }
          createdFiles.push(fullPath);
        }
      }

      // Process memory enhancements
      if (claudeAnalysis.memoryEnhancements) {
        for (const memory of claudeAnalysis.memoryEnhancements) {
          const memoryPath = memory.filePath || 
            path.join(this.memoryRoot, memory.type, `${learningId}-${Date.now()}.md`);
          const fullPath = path.join(this.memoryRoot, memoryPath);
          this.ensureDirectoryExists(path.dirname(fullPath));
          
          const content = `---\nlearningId: ${learningId}\ntype: ${memory.type}\ncreated: ${new Date().toISOString()}\n---\n\n${memory.content}`;
          fs.writeFileSync(fullPath, content, 'utf8');
          createdFiles.push(fullPath);
        }
      }

      // Process reflex updates
      if (claudeAnalysis.reflexUpdates) {
        const reflexPath = path.join(this.reflexRoot, 'behavioral-responses.md');
        let reflexContent = '';
        
        if (fs.existsSync(reflexPath)) {
          reflexContent = fs.readFileSync(reflexPath, 'utf8');
        } else {
          reflexContent = `---\nlearningId: ${learningId}\ncreated: ${new Date().toISOString()}\n---\n\n# Behavioral Responses\n\n`;
        }
        
        for (const reflex of claudeAnalysis.reflexUpdates) {
          reflexContent += `\n## ${reflex.trigger}\n\n${reflex.response}\n\n*Priority: ${reflex.priority}*\n\n`;
        }
        
        fs.writeFileSync(reflexPath, reflexContent, 'utf8');
        if (!createdFiles.includes(reflexPath)) {
          createdFiles.push(reflexPath);
        }
      }

      console.log(`✅ Materialized learning ${learningId} with ${createdFiles.length} files`);
      return createdFiles;

    } catch (error) {
      console.error(`❌ Failed to materialize learning ${learningId}:`, error);
      throw error;
    }
  }

  private static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Revert materialized learning by removing created files
   */
  public static async revertLearning(learningId: string, createdFiles: string[]): Promise<void> {
    for (const filePath of createdFiles) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ Removed file: ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Failed to remove file ${filePath}:`, error);
      }
    }
  }
}

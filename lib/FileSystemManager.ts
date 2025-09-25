import { promises as fs } from 'fs';
import path from 'path';

export interface FileSystemResult {
  success: boolean;
  filePath?: string;
  message: string;
  error?: string;
}

export class FileSystemManager {
  private outputDirectory: string;

  constructor(outputDirectory: string = './generated-code') {
    this.outputDirectory = path.resolve(outputDirectory);
  }

  /**
   * Save generated code to a file
   */
  async saveCode(
    filename: string, 
    content: string, 
    description?: string
  ): Promise<FileSystemResult> {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.outputDirectory, { recursive: true });
      
      // Sanitize filename
      const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fullPath = path.join(this.outputDirectory, sanitizedFilename);
      
      // Write file
      await fs.writeFile(fullPath, content, 'utf8');
      
      return {
        success: true,
        filePath: fullPath,
        message: `✅ Code saved successfully to: ${fullPath}${description ? `\n📄 Description: ${description}` : ''}`
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Extract and save HTML code from agent response
   */
  async extractAndSaveHtml(
    agentResponse: string, 
    projectName: string = 'webapp'
  ): Promise<FileSystemResult> {
    try {
      // Extract HTML code block
      const htmlMatch = agentResponse.match(/```html\s*([\s\S]*?)\s*```/);
      
      if (!htmlMatch) {
        return {
          success: false,
          message: '❌ No HTML code found in response'
        };
      }
      
      const htmlContent = htmlMatch[1].trim();
      const filename = `${projectName}.html`;
      
      return await this.saveCode(filename, htmlContent, 'Generated HTML web application');
    } catch (error) {
      return {
        success: false,
        message: `❌ Failed to extract and save HTML: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Save multiple files from agent responses
   */
  async saveMultipleFiles(files: Array<{
    filename: string;
    content: string;
    description?: string;
  }>): Promise<FileSystemResult[]> {
    const results: FileSystemResult[] = [];
    
    for (const file of files) {
      const result = await this.saveCode(file.filename, file.content, file.description);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Get the output directory path
   */
  getOutputDirectory(): string {
    return this.outputDirectory;
  }

  /**
   * List generated files
   */
  async listGeneratedFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.outputDirectory);
      return files.filter(file => !file.startsWith('.'));
    } catch (error) {
      return [];
    }
  }
}

// Export singleton instance
export const fileSystemManager = new FileSystemManager();

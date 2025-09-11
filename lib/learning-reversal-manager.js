/**
 * Learning Reversal Manager
 * Handles retrieval of file contents for learning reversal interface
 */

import fs from 'fs';
import path from 'path';

export class LearningReversalManager {
  constructor() {
    this.baseDir = process.cwd();
  }

  /**
   * Get file content for a specific learning's modified file
   */
  async getFileContent(learningId, filePath) {
    try {
      // Try multiple possible paths for the file
      const possiblePaths = [
        path.join(this.baseDir, filePath),
        path.join(this.baseDir, 'cns', filePath),
        path.join(this.baseDir, 'agents', 'PersonalAssistantAgent', 'CNS', filePath),
        path.join(this.baseDir, 'data', 'learning-backups', filePath),
        filePath,
        path.resolve(filePath)
      ];

      let fullPath = null;
      let stats = null;
      
      // Try each possible path until we find the file
      for (const testPath of possiblePaths) {
        try {
          if (fs.existsSync(testPath)) {
            stats = fs.statSync(testPath);
            fullPath = testPath;
            break;
          }
        } catch (error) {
          // Continue to next path
          continue;
        }
      }

      if (!fullPath || !stats) {
        console.warn(`File not found in any location: ${filePath}. Tried: ${possiblePaths.join(', ')}`);
        return {
          success: false,
          error: `File not found in any of the expected locations`,
          content: `File not found: ${filePath}\n\nSearched in:\n${possiblePaths.map(p => `- ${p}`).join('\n')}`,
          size: null,
          path: filePath
        };
      }

      const sizeInBytes = stats.size;
      const sizeFormatted = this.formatFileSize(sizeInBytes);

      // Read file content
      const content = fs.readFileSync(fullPath, 'utf8');

      return {
        success: true,
        content: content,
        size: sizeFormatted,
        path: filePath,
        resolvedPath: fullPath
      };

    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return {
        success: false,
        error: error.message,
        content: `Error loading file: ${filePath}\n\nError: ${error.message}`,
        size: null
      };
    }
  }

  /**
   * Get metadata for all files in a learning
   */
  async getFilesMetadata(learningId, filePaths) {
    const results = [];
    
    for (const filePath of filePaths) {
      const result = await this.getFileContent(learningId, filePath);
      results.push({
        path: filePath,
        success: result.success,
        size: result.size,
        error: result.error
      });
    }

    return results;
  }

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Check if file exists in the project
   */
  fileExists(filePath) {
    try {
      const fullPath = path.join(this.baseDir, filePath);
      return fs.existsSync(fullPath);
    } catch (error) {
      return false;
    }
  }
}

export default LearningReversalManager;
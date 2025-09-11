#!/usr/bin/env node

/**
 * Learning Reversal Script
 * Handles the reversal of learning changes by restoring original files
 * and updating learning status in the database
 */

const fs = require('fs').promises;
const path = require('path');

class LearningReversal {
    constructor() {
        this.backupPath = path.join(process.cwd(), 'data', 'learning-backups');
        this.logsPath = path.join(process.cwd(), 'logs');
    }

    /**
     * Reverse a specific learning by ID
     * @param {string} learningId - The ID of the learning to reverse
     * @param {string} reason - Reason for reversal
     */
    async reverseLearning(learningId, reason = 'Manual reversal') {
        try {
            console.log(`Starting reversal for learning: ${learningId}`);
            
            // Load learning data
            const learning = await this.loadLearningData(learningId);
            if (!learning) {
                throw new Error(`Learning ${learningId} not found`);
            }

            // Restore files from backup
            const restoredFiles = await this.restoreFiles(learning.files || []);
            
            // Update learning status
            await this.updateLearningStatus(learningId, 'reversed', reason);
            
            // Log the reversal
            await this.logReversal(learningId, reason, restoredFiles);
            
            console.log(`Successfully reversed learning ${learningId}`);
            return {
                success: true,
                learningId,
                restoredFiles,
                reason
            };
            
        } catch (error) {
            console.error(`Error reversing learning ${learningId}:`, error);
            throw error;
        }
    }

    /**
     * Load learning data from storage
     * @param {string} learningId 
     */
    async loadLearningData(learningId) {
        try {
            const learningsPath = path.join(process.cwd(), 'data', 'learnings.json');
            const data = await fs.readFile(learningsPath, 'utf8');
            const learnings = JSON.parse(data);
            return learnings.find(l => l.id === learningId);
        } catch (error) {
            console.warn('Could not load learnings data:', error.message);
            return null;
        }
    }

    /**
     * Restore files from backup
     * @param {Array} files - Array of file objects to restore
     */
    async restoreFiles(files) {
        const restoredFiles = [];
        
        for (const file of files) {
            try {
                const backupFilePath = path.join(this.backupPath, file.backupPath || file.path);
                const originalFilePath = file.path;
                
                // Check if backup exists
                const backupExists = await this.fileExists(backupFilePath);
                if (!backupExists) {
                    console.warn(`Backup not found for ${originalFilePath}`);
                    continue;
                }
                
                // Create directory if needed
                await this.ensureDirectory(path.dirname(originalFilePath));
                
                // Restore the file
                await fs.copyFile(backupFilePath, originalFilePath);
                restoredFiles.push(originalFilePath);
                
                console.log(`Restored: ${originalFilePath}`);
                
            } catch (error) {
                console.error(`Error restoring file ${file.path}:`, error);
            }
        }
        
        return restoredFiles;
    }

    /**
     * Update learning status in database
     * @param {string} learningId 
     * @param {string} status 
     * @param {string} reason 
     */
    async updateLearningStatus(learningId, status, reason) {
        try {
            const learningsPath = path.join(process.cwd(), 'data', 'learnings.json');
            const data = await fs.readFile(learningsPath, 'utf8');
            const learnings = JSON.parse(data);
            
            const learningIndex = learnings.findIndex(l => l.id === learningId);
            if (learningIndex !== -1) {
                learnings[learningIndex].status = status;
                learnings[learningIndex].reversalReason = reason;
                learnings[learningIndex].reversedAt = new Date().toISOString();
                
                await fs.writeFile(learningsPath, JSON.stringify(learnings, null, 2));
            }
        } catch (error) {
            console.error('Error updating learning status:', error);
        }
    }

    /**
     * Log the reversal operation
     * @param {string} learningId 
     * @param {string} reason 
     * @param {Array} restoredFiles 
     */
    async logReversal(learningId, reason, restoredFiles) {
        try {
            await this.ensureDirectory(this.logsPath);
            
            const logEntry = {
                timestamp: new Date().toISOString(),
                operation: 'learning_reversal',
                learningId,
                reason,
                restoredFiles,
                restoredCount: restoredFiles.length
            };
            
            const logPath = path.join(this.logsPath, 'learning-reversals.log');
            await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
            
        } catch (error) {
            console.error('Error logging reversal:', error);
        }
    }

    /**
     * Check if file exists
     * @param {string} filePath 
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Ensure directory exists
     * @param {string} dirPath 
     */
    async ensureDirectory(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    }

    /**
     * Get file content for display purposes
     * @param {string} filePath 
     */
    async getFileContent(filePath) {
        try {
            const fullPath = path.resolve(filePath);
            const content = await fs.readFile(fullPath, 'utf8');
            const stats = await fs.stat(fullPath);
            
            return {
                content,
                size: stats.size,
                lastModified: stats.mtime.toISOString(),
                exists: true
            };
        } catch (error) {
            return {
                content: null,
                error: error.message,
                exists: false
            };
        }
    }

    /**
     * List files in a learning
     * @param {string} learningId 
     */
    async getFilesMetadata(learningId) {
        try {
            const learning = await this.loadLearningData(learningId);
            if (!learning || !learning.files) {
                return [];
            }

            const filesWithMetadata = [];
            for (const file of learning.files) {
                const stats = await this.getFileContent(file.path);
                filesWithMetadata.push({
                    ...file,
                    exists: stats.exists,
                    size: stats.size,
                    lastModified: stats.lastModified,
                    error: stats.error
                });
            }

            return filesWithMetadata;
        } catch (error) {
            console.error('Error getting files metadata:', error);
            return [];
        }
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node learning-reversal.js <learningId> [reason]');
        process.exit(1);
    }
    
    const [learningId, reason] = args;
    const reversal = new LearningReversal();
    
    reversal.reverseLearning(learningId, reason)
        .then(result => {
            console.log('Reversal completed:', result);
            process.exit(0);
        })
        .catch(error => {
            console.error('Reversal failed:', error);
            process.exit(1);
        });
}

module.exports = LearningReversal;

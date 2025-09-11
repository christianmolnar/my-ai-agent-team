#!/usr/bin/env node

/**
 * Materialize Learnings Script
 * Handles the materialization of learning changes by creating CNS files
 * and managing the learning lifecycle
 */

const fs = require('fs').promises;
const path = require('path');

class LearningMaterializer {
    constructor() {
        this.dataPath = path.join(process.cwd(), 'data');
        this.backupPath = path.join(this.dataPath, 'learning-backups');
        this.logsPath = path.join(process.cwd(), 'logs');
        this.cnsPath = path.join(process.cwd(), 'cns');
    }

    /**
     * Materialize a learning by creating CNS files
     * @param {string} learningId - The ID of the learning to materialize
     * @param {Object} learningData - The learning data object
     */
    async materializeLearning(learningId, learningData) {
        try {
            console.log(`Materializing learning: ${learningId}`);
            
            // Ensure directories exist
            await this.ensureDirectories();
            
            // Create backup of existing files
            const backedUpFiles = await this.backupExistingFiles(learningData.files || []);
            
            // Create CNS files
            const createdFiles = await this.createCNSFiles(learningData);
            
            // Update learning status
            await this.updateLearningStatus(learningId, 'materialized', {
                backedUpFiles,
                createdFiles
            });
            
            // Log the materialization
            await this.logMaterialization(learningId, createdFiles, backedUpFiles);
            
            console.log(`Successfully materialized learning ${learningId}`);
            return {
                success: true,
                learningId,
                createdFiles,
                backedUpFiles
            };
            
        } catch (error) {
            console.error(`Error materializing learning ${learningId}:`, error);
            throw error;
        }
    }

    /**
     * Create CNS files based on learning data
     * @param {Object} learningData 
     */
    async createCNSFiles(learningData) {
        const createdFiles = [];
        
        if (!learningData.files || learningData.files.length === 0) {
            console.log('No files to create for this learning');
            return createdFiles;
        }

        for (const file of learningData.files) {
            try {
                const cnsFilePath = path.join(this.cnsPath, file.path);
                
                // Ensure directory exists
                await this.ensureDirectory(path.dirname(cnsFilePath));
                
                // Create the CNS file with content
                let content = '';
                if (file.content) {
                    content = file.content;
                } else if (file.changes) {
                    content = this.applyChanges(file.originalContent || '', file.changes);
                } else {
                    content = `// CNS file for ${file.path}\n// Learning: ${learningData.description || 'No description'}\n`;
                }
                
                await fs.writeFile(cnsFilePath, content, 'utf8');
                createdFiles.push({
                    path: cnsFilePath,
                    originalPath: file.path,
                    size: Buffer.byteLength(content, 'utf8')
                });
                
                console.log(`Created CNS file: ${cnsFilePath}`);
                
            } catch (error) {
                console.error(`Error creating CNS file for ${file.path}:`, error);
            }
        }
        
        return createdFiles;
    }

    /**
     * Apply changes to original content
     * @param {string} originalContent 
     * @param {Array} changes 
     */
    applyChanges(originalContent, changes) {
        let result = originalContent;
        
        // Sort changes by line number in reverse order to avoid offset issues
        const sortedChanges = [...changes].sort((a, b) => (b.line || 0) - (a.line || 0));
        
        for (const change of sortedChanges) {
            switch (change.type) {
                case 'add':
                    result = this.addLine(result, change.line || 0, change.content || '');
                    break;
                case 'remove':
                    result = this.removeLine(result, change.line || 0);
                    break;
                case 'replace':
                    result = this.replaceLine(result, change.line || 0, change.content || '');
                    break;
            }
        }
        
        return result;
    }

    /**
     * Add line to content
     * @param {string} content 
     * @param {number} lineNumber 
     * @param {string} newLine 
     */
    addLine(content, lineNumber, newLine) {
        const lines = content.split('\n');
        lines.splice(lineNumber, 0, newLine);
        return lines.join('\n');
    }

    /**
     * Remove line from content
     * @param {string} content 
     * @param {number} lineNumber 
     */
    removeLine(content, lineNumber) {
        const lines = content.split('\n');
        if (lineNumber < lines.length) {
            lines.splice(lineNumber, 1);
        }
        return lines.join('\n');
    }

    /**
     * Replace line in content
     * @param {string} content 
     * @param {number} lineNumber 
     * @param {string} newLine 
     */
    replaceLine(content, lineNumber, newLine) {
        const lines = content.split('\n');
        if (lineNumber < lines.length) {
            lines[lineNumber] = newLine;
        }
        return lines.join('\n');
    }

    /**
     * Backup existing files before materialization
     * @param {Array} files 
     */
    async backupExistingFiles(files) {
        const backedUpFiles = [];
        
        for (const file of files) {
            try {
                const originalPath = file.path;
                const exists = await this.fileExists(originalPath);
                
                if (exists) {
                    const backupFileName = `${path.basename(originalPath)}.${Date.now()}.backup`;
                    const backupFilePath = path.join(this.backupPath, backupFileName);
                    
                    await this.ensureDirectory(this.backupPath);
                    await fs.copyFile(originalPath, backupFilePath);
                    
                    backedUpFiles.push({
                        originalPath,
                        backupPath: backupFilePath,
                        timestamp: new Date().toISOString()
                    });
                    
                    console.log(`Backed up: ${originalPath} -> ${backupFilePath}`);
                }
                
            } catch (error) {
                console.error(`Error backing up file ${file.path}:`, error);
            }
        }
        
        return backedUpFiles;
    }

    /**
     * Update learning status in database
     * @param {string} learningId 
     * @param {string} status 
     * @param {Object} metadata 
     */
    async updateLearningStatus(learningId, status, metadata = {}) {
        try {
            const learningsPath = path.join(this.dataPath, 'learnings.json');
            let learnings = [];
            
            // Load existing learnings
            try {
                const data = await fs.readFile(learningsPath, 'utf8');
                learnings = JSON.parse(data);
            } catch (error) {
                console.log('Creating new learnings file');
            }
            
            const learningIndex = learnings.findIndex(l => l.id === learningId);
            if (learningIndex !== -1) {
                learnings[learningIndex].status = status;
                learnings[learningIndex].materializedAt = new Date().toISOString();
                learnings[learningIndex].metadata = metadata;
            } else {
                // Create new learning entry
                learnings.push({
                    id: learningId,
                    status,
                    materializedAt: new Date().toISOString(),
                    metadata
                });
            }
            
            await fs.writeFile(learningsPath, JSON.stringify(learnings, null, 2));
            
        } catch (error) {
            console.error('Error updating learning status:', error);
        }
    }

    /**
     * Log materialization operation
     * @param {string} learningId 
     * @param {Array} createdFiles 
     * @param {Array} backedUpFiles 
     */
    async logMaterialization(learningId, createdFiles, backedUpFiles) {
        try {
            await this.ensureDirectory(this.logsPath);
            
            const logEntry = {
                timestamp: new Date().toISOString(),
                operation: 'learning_materialization',
                learningId,
                createdFiles: createdFiles.map(f => f.path),
                backedUpFiles: backedUpFiles.map(f => f.originalPath),
                filesCreated: createdFiles.length,
                filesBackedUp: backedUpFiles.length
            };
            
            const logPath = path.join(this.logsPath, 'learning-materializations.log');
            await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n');
            
        } catch (error) {
            console.error('Error logging materialization:', error);
        }
    }

    /**
     * Ensure all required directories exist
     */
    async ensureDirectories() {
        await this.ensureDirectory(this.dataPath);
        await this.ensureDirectory(this.backupPath);
        await this.ensureDirectory(this.logsPath);
        await this.ensureDirectory(this.cnsPath);
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
     * Get file content and metadata
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
     * Process multiple learnings for materialization
     * @param {Array} learnings 
     */
    async materializeMultiple(learnings) {
        const results = [];
        
        for (const learning of learnings) {
            try {
                const result = await this.materializeLearning(learning.id, learning);
                results.push(result);
            } catch (error) {
                results.push({
                    success: false,
                    learningId: learning.id,
                    error: error.message
                });
            }
        }
        
        return results;
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node materialize-learnings.js <learningId|learningDataFile>');
        process.exit(1);
    }
    
    const [input] = args;
    const materializer = new LearningMaterializer();
    
    // Check if input is a file path
    if (input.endsWith('.json')) {
        // Load learning data from file
        fs.readFile(input, 'utf8')
            .then(data => {
                const learningData = JSON.parse(data);
                return materializer.materializeLearning(learningData.id || 'unknown', learningData);
            })
            .then(result => {
                console.log('Materialization completed:', result);
                process.exit(0);
            })
            .catch(error => {
                console.error('Materialization failed:', error);
                process.exit(1);
            });
    } else {
        // Treat as learning ID
        const learningData = {
            id: input,
            description: 'Manual materialization',
            files: []
        };
        
        materializer.materializeLearning(input, learningData)
            .then(result => {
                console.log('Materialization completed:', result);
                process.exit(0);
            })
            .catch(error => {
                console.error('Materialization failed:', error);
                process.exit(1);
            });
    }
}

module.exports = LearningMaterializer;

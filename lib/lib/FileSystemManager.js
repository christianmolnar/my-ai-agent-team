"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileSystemManager = exports.FileSystemManager = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
class FileSystemManager {
    constructor(outputDirectory = './generated-code') {
        this.outputDirectory = path_1.default.resolve(outputDirectory);
    }
    /**
     * Save generated code to a file
     */
    async saveCode(filename, content, description) {
        try {
            // Ensure output directory exists
            await fs_1.promises.mkdir(this.outputDirectory, { recursive: true });
            // Sanitize filename
            const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fullPath = path_1.default.join(this.outputDirectory, sanitizedFilename);
            // Write file
            await fs_1.promises.writeFile(fullPath, content, 'utf8');
            return {
                success: true,
                filePath: fullPath,
                message: `✅ Code saved successfully to: ${fullPath}${description ? `\n📄 Description: ${description}` : ''}`
            };
        }
        catch (error) {
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
    async extractAndSaveHtml(agentResponse, projectName = 'webapp') {
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
        }
        catch (error) {
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
    async saveMultipleFiles(files) {
        const results = [];
        for (const file of files) {
            const result = await this.saveCode(file.filename, file.content, file.description);
            results.push(result);
        }
        return results;
    }
    /**
     * Get the output directory path
     */
    getOutputDirectory() {
        return this.outputDirectory;
    }
    /**
     * List generated files
     */
    async listGeneratedFiles() {
        try {
            const files = await fs_1.promises.readdir(this.outputDirectory);
            return files.filter(file => !file.startsWith('.'));
        }
        catch (error) {
            return [];
        }
    }
}
exports.FileSystemManager = FileSystemManager;
// Export singleton instance
exports.fileSystemManager = new FileSystemManager();

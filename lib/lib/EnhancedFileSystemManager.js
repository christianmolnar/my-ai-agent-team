"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedFileSystemManager = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const docx_1 = require("docx");
class EnhancedFileSystemManager {
    constructor(baseDirectory = './deliverables', webBaseUrl = 'http://localhost:3000', keepMarkdownBackups = true) {
        this.baseDirectory = path_1.default.resolve(baseDirectory);
        this.webBaseUrl = webBaseUrl;
        this.keepMarkdownBackups = keepMarkdownBackups;
    }
    /**
     * Get organized directory path based on deliverable type
     */
    getDeliverableDirectory(type) {
        const typeDirectories = {
            'code': 'applications',
            'document': 'documents',
            'research': 'research-papers',
            'presentation': 'presentations',
            'other': 'misc'
        };
        return path_1.default.join(this.baseDirectory, typeDirectories[type] || 'misc');
    }
    /**
     * Generate a safe, descriptive filename
     */
    generateFilename(metadata) {
        // Create a clean, readable filename from the title
        const safeTitle = metadata.title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
            .slice(0, 30); // Keep it short
        // If title becomes empty after cleaning, use a default
        const cleanTitle = safeTitle || 'document';
        return `${cleanTitle}.${metadata.format}`;
    }
    /**
     * Save HTML/JavaScript applications
     */
    async saveApplication(title, htmlContent, description, agentId) {
        const metadata = {
            title,
            type: 'code',
            format: 'html',
            description,
            agentId,
            createdAt: new Date(),
            tags: ['application', 'html', 'interactive']
        };
        try {
            const directory = this.getDeliverableDirectory('code');
            await fs_1.promises.mkdir(directory, { recursive: true });
            const filename = this.generateFilename(metadata);
            const filePath = path_1.default.join(directory, filename);
            // Save HTML file
            await fs_1.promises.writeFile(filePath, htmlContent, 'utf8');
            // Save metadata
            await this.saveMetadata(filePath, metadata);
            const webPath = `${this.webBaseUrl}/deliverables/applications/${filename}`;
            return {
                success: true,
                filePath,
                webPath,
                message: `✅ **Application Created Successfully!**\n\n**📱 ${title}**\n${description ? `📄 ${description}\n` : ''}📂 Saved to: \`${filename}\`\n🌐 **[Open Application](${webPath})**\n🔗 Click the link above to run your application!`,
                metadata
            };
        }
        catch (error) {
            return {
                success: false,
                message: `❌ Failed to save application: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Save research papers as MS Word documents
     */
    async saveResearchPaper(title, content, description, agentId) {
        const metadata = {
            title,
            type: 'research',
            format: 'docx',
            description,
            agentId,
            createdAt: new Date(),
            tags: ['research', 'academic', 'paper']
        };
        try {
            const directory = this.getDeliverableDirectory('research');
            await fs_1.promises.mkdir(directory, { recursive: true });
            const filename = this.generateFilename(metadata);
            const filePath = path_1.default.join(directory, filename);
            // Create MS Word document from content
            const doc = await this.createWordDocument(title, content, metadata);
            const buffer = await docx_1.Packer.toBuffer(doc);
            // Save Word document
            await fs_1.promises.writeFile(filePath, buffer);
            // Conditionally save markdown backup
            let mdFilePath;
            let mdFilename;
            if (this.keepMarkdownBackups) {
                mdFilename = filename.replace('.docx', '.md');
                mdFilePath = path_1.default.join(directory, mdFilename);
                await fs_1.promises.writeFile(mdFilePath, content, 'utf8');
            }
            // Save metadata
            await this.saveMetadata(filePath, metadata);
            const webPath = `${this.webBaseUrl}/deliverables/research-papers/${filename}`;
            const fileSystemPath = `file://${filePath}`;
            const directoryPath = `file://${directory}`;
            return {
                success: true,
                filePath,
                webPath,
                message: `✅ **Research Paper Created Successfully!**\n\n**📊 ${title}**\n${description ? `📄 ${description}\n` : ''}📂 Saved to: \`${filename}\`\n📄 **Download:** ${webPath}${this.keepMarkdownBackups && mdFilename ? `\n📝 Markdown version: \`${mdFilename}\`` : ''}\n📁 **Access files:** ${directoryPath}\n\n� **Access your research paper via the Deliverables page**`,
                metadata
            };
        }
        catch (error) {
            return {
                success: false,
                message: `❌ Failed to save research paper: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Save general documents as MS Word
     */
    async saveDocument(title, content, description, agentId) {
        const metadata = {
            title,
            type: 'document',
            format: 'docx',
            description,
            agentId,
            createdAt: new Date(),
            tags: ['document', 'professional']
        };
        try {
            const directory = this.getDeliverableDirectory('document');
            await fs_1.promises.mkdir(directory, { recursive: true });
            const filename = this.generateFilename(metadata);
            const filePath = path_1.default.join(directory, filename);
            // Create MS Word document
            const doc = await this.createWordDocument(title, content, metadata);
            const buffer = await docx_1.Packer.toBuffer(doc);
            // Save Word document
            await fs_1.promises.writeFile(filePath, buffer);
            // Save metadata
            await this.saveMetadata(filePath, metadata);
            const webPath = `${this.webBaseUrl}/deliverables/documents/${filename}`;
            return {
                success: true,
                filePath,
                webPath,
                message: `✅ **Document Created Successfully!**\n\n**📄 ${title}**\n${description ? `📄 ${description}\n` : ''}📂 Saved to: \`${filename}\`\n📄 **[Download Document](${webPath})**\n🔗 Click the link above to download your document!`,
                metadata
            };
        }
        catch (error) {
            return {
                success: false,
                message: `❌ Failed to save document: ${error instanceof Error ? error.message : 'Unknown error'}`,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Create a formatted MS Word document from markdown-like content
     */
    async createWordDocument(title, content, metadata) {
        const children = [];
        // Add title
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: title,
                    bold: true,
                    size: 32,
                }),
            ],
            heading: docx_1.HeadingLevel.TITLE,
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 400 },
        }));
        // Add metadata
        if (metadata.description) {
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({
                        text: metadata.description,
                        italics: true,
                        size: 22,
                    }),
                ],
                alignment: docx_1.AlignmentType.CENTER,
                spacing: { after: 400 },
            }));
        }
        // Add creation info
        children.push(new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: `Created on ${metadata.createdAt.toLocaleDateString()}`,
                    size: 20,
                }),
                metadata.agentId ? new docx_1.TextRun({
                    text: ` by ${metadata.agentId}`,
                    size: 20,
                }) : new docx_1.TextRun({ text: '', size: 20 }),
            ],
            alignment: docx_1.AlignmentType.CENTER,
            spacing: { after: 600 },
        }));
        // Parse content and convert to Word paragraphs
        const lines = content.split('\n');
        let currentParagraph = [];
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === '') {
                // Empty line - end current paragraph
                if (currentParagraph.length > 0) {
                    children.push(this.createParagraphFromLines(currentParagraph));
                    currentParagraph = [];
                }
            }
            else if (trimmedLine.startsWith('# ')) {
                // Heading 1
                if (currentParagraph.length > 0) {
                    children.push(this.createParagraphFromLines(currentParagraph));
                    currentParagraph = [];
                }
                children.push(new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({
                            text: trimmedLine.substring(2),
                            bold: true,
                            size: 28,
                        }),
                    ],
                    heading: docx_1.HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                }));
            }
            else if (trimmedLine.startsWith('## ')) {
                // Heading 2
                if (currentParagraph.length > 0) {
                    children.push(this.createParagraphFromLines(currentParagraph));
                    currentParagraph = [];
                }
                children.push(new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({
                            text: trimmedLine.substring(3),
                            bold: true,
                            size: 24,
                        }),
                    ],
                    heading: docx_1.HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 200 },
                }));
            }
            else if (trimmedLine.startsWith('### ')) {
                // Heading 3
                if (currentParagraph.length > 0) {
                    children.push(this.createParagraphFromLines(currentParagraph));
                    currentParagraph = [];
                }
                children.push(new docx_1.Paragraph({
                    children: [
                        new docx_1.TextRun({
                            text: trimmedLine.substring(4),
                            bold: true,
                            size: 22,
                        }),
                    ],
                    heading: docx_1.HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 },
                }));
            }
            else {
                // Regular content
                currentParagraph.push(line);
            }
        }
        // Add any remaining content
        if (currentParagraph.length > 0) {
            children.push(this.createParagraphFromLines(currentParagraph));
        }
        return new docx_1.Document({
            sections: [
                {
                    properties: {},
                    children,
                },
            ],
        });
    }
    /**
     * Create a Word paragraph from text lines
     */
    createParagraphFromLines(lines) {
        // Check if this looks like song lyrics or poetry (has verse/chorus markers)
        const fullText = lines.join('\n');
        const isSongLyrics = /\*\*(Verse|Chorus|Bridge|Outro)\*\*/.test(fullText);
        if (isSongLyrics) {
            // For song lyrics, preserve line breaks and handle verse/chorus formatting
            const children = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('**') && line.endsWith('**')) {
                    // Verse/Chorus headers - make them bold and larger
                    if (children.length > 0) {
                        children.push(new docx_1.TextRun({ text: '\n', break: 1 }));
                    }
                    children.push(new docx_1.TextRun({
                        text: line.replace(/\*\*/g, ''),
                        bold: true,
                        size: 26,
                    }));
                    children.push(new docx_1.TextRun({ text: '\n', break: 1 }));
                }
                else if (line.length > 0) {
                    // Regular lyric lines
                    children.push(new docx_1.TextRun({
                        text: line,
                        size: 22,
                    }));
                    if (i < lines.length - 1) {
                        children.push(new docx_1.TextRun({ text: '\n', break: 1 }));
                    }
                }
            }
            return new docx_1.Paragraph({
                children,
                spacing: { after: 300 },
            });
        }
        else {
            // For regular text, join with spaces as before
            const text = lines.join(' ').trim();
            return new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({
                        text,
                        size: 22,
                    }),
                ],
                spacing: { after: 200 },
            });
        }
    }
    /**
     * Save metadata alongside the file
     */
    async saveMetadata(filePath, metadata) {
        const metadataPath = filePath + '.meta.json';
        await fs_1.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
    }
    /**
     * Extract HTML content and save as application
     */
    async extractAndSaveHtml(responseContent, projectName, agentId) {
        // Extract HTML from the response
        const htmlMatch = responseContent.match(/```html\n([\s\S]*?)\n```/);
        if (!htmlMatch) {
            // If no HTML block found, try to find HTML in the content
            const docTypeMatch = responseContent.match(/(<!DOCTYPE html>[\s\S]*?<\/html>)/);
            if (docTypeMatch) {
                return this.saveApplication(projectName, docTypeMatch[1], `Extracted HTML application for ${projectName}`, agentId);
            }
            else {
                return {
                    success: false,
                    message: `❌ No HTML content found in response for ${projectName}`,
                    error: 'No HTML content found'
                };
            }
        }
        return this.saveApplication(projectName, htmlMatch[1], `Extracted HTML application for ${projectName}`, agentId);
    }
    /**
     * Get delivery summary for user
     */
    async getDeliverySummary() {
        try {
            const summary = [];
            const categories = ['applications', 'documents', 'research-papers', 'presentations', 'misc'];
            for (const category of categories) {
                const categoryPath = path_1.default.join(this.baseDirectory, category);
                try {
                    const files = await fs_1.promises.readdir(categoryPath);
                    const deliverables = files.filter(f => !f.endsWith('.meta.json'));
                    if (deliverables.length > 0) {
                        summary.push(`📁 **${category}**: ${deliverables.length} items`);
                    }
                }
                catch {
                    // Directory doesn't exist or is empty
                }
            }
            return summary.length > 0
                ? `## 📋 Your Deliverables\n${summary.join('\n')}\n\n📂 All files saved to: \`${this.baseDirectory}\``
                : '📋 No deliverables created yet.';
        }
        catch (error) {
            return '❌ Unable to generate delivery summary.';
        }
    }
    /**
     * Configure whether to keep markdown backups alongside Word documents
     */
    setKeepMarkdownBackups(keep) {
        this.keepMarkdownBackups = keep;
    }
    /**
     * Clean up markdown files in a directory (useful for removing draft files)
     */
    async cleanupMarkdownFiles(directoryPath) {
        const cleaned = [];
        const errors = [];
        try {
            const files = await fs_1.promises.readdir(directoryPath);
            const markdownFiles = files.filter(file => file.endsWith('.md') &&
                files.some(docxFile => docxFile === file.replace('.md', '.docx')));
            for (const mdFile of markdownFiles) {
                try {
                    await fs_1.promises.unlink(path_1.default.join(directoryPath, mdFile));
                    cleaned.push(mdFile);
                }
                catch (error) {
                    errors.push(`Failed to delete ${mdFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        }
        catch (error) {
            errors.push(`Failed to read directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        return { cleaned, errors };
    }
}
exports.EnhancedFileSystemManager = EnhancedFileSystemManager;

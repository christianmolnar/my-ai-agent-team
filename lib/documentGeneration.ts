import { Pandoc, markdownToDocx, markdownToPdf, markdownToHtml } from 'auto-pandoc';

export interface DocumentGenerationOptions {
  format: 'docx' | 'pdf' | 'html';
  title?: string;
  author?: string;
  template?: string;
  includeToc?: boolean;
  styling?: {
    fontSize?: string;
    fontFamily?: string;
    margins?: string;
    css?: string[];
  };
}

export interface DocumentGenerationResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  buffer?: Buffer;
  error?: string;
  warnings?: string[];
}

export class DocumentGenerationService {
  private static readonly OUTPUT_DIR = '/tmp/ai-agent-docs';

  static async generateDocument(
    content: string,
    options: DocumentGenerationOptions
  ): Promise<DocumentGenerationResult> {
    try {
      // Ensure output directory exists
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(this.OUTPUT_DIR)) {
        fs.mkdirSync(this.OUTPUT_DIR, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `document-${timestamp}.${options.format}`;
      const filePath = path.join(this.OUTPUT_DIR, fileName);

      // Prepare pandoc options
      const pandocOptions: any = {
        from: 'markdown',
        to: options.format,
        standalone: true,
        output: filePath
      };

      // Add metadata if provided
      if (options.title || options.author) {
        pandocOptions.metadata = {};
        if (options.title) pandocOptions.metadata.title = options.title;
        if (options.author) pandocOptions.metadata.author = options.author;
      }

      // Add table of contents if requested
      if (options.includeToc) {
        pandocOptions.toc = true;
        pandocOptions.tocDepth = 3;
      }

      // Add styling options
      if (options.styling) {
        if (options.styling.fontSize) {
          pandocOptions.variables = pandocOptions.variables || {};
          pandocOptions.variables.fontsize = options.styling.fontSize;
        }
        
        if (options.styling.fontFamily) {
          pandocOptions.variables = pandocOptions.variables || {};
          pandocOptions.variables.mainfont = options.styling.fontFamily;
        }

        if (options.styling.css && options.format === 'html') {
          pandocOptions.css = options.styling.css;
          pandocOptions.selfContained = true;
        }
      }

      // Format-specific options
      switch (options.format) {
        case 'pdf':
          pandocOptions.pdfEngine = 'wkhtmltopdf'; // Use wkhtmltopdf instead of xelatex
          break;
        case 'html':
          pandocOptions.highlightStyle = 'pygments'; // Use pygments instead of github
          pandocOptions.mathJax = true;
          break;
        case 'docx':
          // DOCX-specific options can be added here
          break;
      }

      // Convert the document
      const result = await Pandoc.convert(content, pandocOptions);

      if (result.success) {
        // Read the generated file into a buffer
        const buffer = fs.readFileSync(filePath);
        
        return {
          success: true,
          fileName,
          filePath,
          buffer,
          warnings: result.warnings || []
        };
      } else {
        return {
          success: false,
          error: result.error || 'Unknown conversion error'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async generateDocxFromMarkdown(
    content: string,
    options: Omit<DocumentGenerationOptions, 'format'> = {}
  ): Promise<DocumentGenerationResult> {
    return this.generateDocument(content, { ...options, format: 'docx' });
  }

  static async generatePdfFromMarkdown(
    content: string,
    options: Omit<DocumentGenerationOptions, 'format'> = {}
  ): Promise<DocumentGenerationResult> {
    return this.generateDocument(content, { ...options, format: 'pdf' });
  }

  static async generateHtmlFromMarkdown(
    content: string,
    options: Omit<DocumentGenerationOptions, 'format'> = {}
  ): Promise<DocumentGenerationResult> {
    return this.generateDocument(content, { ...options, format: 'html' });
  }

  static async cleanupOldFiles(maxAgeHours: number = 24): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(this.OUTPUT_DIR)) return;

      const files = fs.readdirSync(this.OUTPUT_DIR);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(this.OUTPUT_DIR, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }
  }
}

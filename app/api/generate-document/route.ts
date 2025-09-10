import { NextRequest, NextResponse } from 'next/server';
import { DocumentGenerationService, DocumentGenerationOptions } from '../../../lib/documentGeneration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, format, title, author, includeToc, styling } = body;

    if (!content || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: content and format' },
        { status: 400 }
      );
    }

    if (!['docx', 'pdf', 'html'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be docx, pdf, or html' },
        { status: 400 }
      );
    }

    const options: DocumentGenerationOptions = {
      format,
      title,
      author,
      includeToc,
      styling
    };

    const result = await DocumentGenerationService.generateDocument(content, options);

    if (result.success) {
      return NextResponse.json({
        success: true,
        fileName: result.fileName,
        filePath: result.filePath,
        downloadUrl: `/api/download/${result.fileName}`,
        warnings: result.warnings || []
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Document generation failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Document generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Document Generation API',
    supportedFormats: ['docx', 'pdf', 'html'],
    endpoint: 'POST /api/generate-document',
    parameters: {
      content: 'string (required) - Markdown content to convert',
      format: 'string (required) - Output format: docx, pdf, or html',
      title: 'string (optional) - Document title',
      author: 'string (optional) - Document author',
      includeToc: 'boolean (optional) - Include table of contents',
      styling: {
        fontSize: 'string (optional) - Font size (e.g., "12pt")',
        fontFamily: 'string (optional) - Font family (e.g., "Arial")',
        margins: 'string (optional) - Page margins',
        css: 'string[] (optional) - CSS files for HTML output'
      }
    }
  });
}

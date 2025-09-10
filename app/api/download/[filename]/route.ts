import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    if (!filename) {
      return NextResponse.json(
        { error: 'Filename parameter is required' },
        { status: 400 }
      );
    }

    // Security: Only allow alphanumeric characters, hyphens, dots, and underscores
    if (!/^[a-zA-Z0-9\-_.]+$/.test(filename)) {
      return NextResponse.json(
        { error: 'Invalid filename format' },
        { status: 400 }
      );
    }

    const outputDir = '/tmp/ai-agent-docs';
    const filePath = path.join(outputDir, filename);

    // Security: Ensure the file is within the output directory
    const resolvedPath = path.resolve(filePath);
    const resolvedOutputDir = path.resolve(outputDir);
    
    if (!resolvedPath.startsWith(resolvedOutputDir)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileExtension = path.extname(filename).toLowerCase();

    // Set appropriate content type based on file extension
    let contentType = 'application/octet-stream';
    let disposition = 'attachment';

    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.html':
        contentType = 'text/html';
        disposition = 'inline';
        break;
      case '.md':
        contentType = 'text/markdown';
        disposition = 'inline';
        break;
      case '.txt':
        contentType = 'text/plain';
        disposition = 'inline';
        break;
    }

    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Disposition', `${disposition}; filename="${filename}"`);
    
    // Set cache headers for generated documents
    response.headers.set('Cache-Control', 'private, max-age=3600');
    
    return response;
  } catch (error) {
    console.error('Download API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Join the path segments to create the full file path
    const filePath = path.join(process.cwd(), 'deliverables', ...params.path);
    
    // Security check: ensure the path is within the deliverables directory
    const deliverablesDir = path.join(process.cwd(), 'deliverables');
    const resolvedPath = path.resolve(filePath);
    
    if (!resolvedPath.startsWith(deliverablesDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(resolvedPath);
    const fileName = path.basename(resolvedPath);
    
    // Determine content type based on file extension
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.html':
        contentType = 'text/html';
        break;
      case '.js':
        contentType = 'application/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.md':
        contentType = 'text/markdown';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
    }

    // For Word documents and PDFs, set appropriate headers for download
    if (ext === '.docx' || ext === '.pdf') {
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    }

    // For other files, serve them directly
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error serving deliverable file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

interface DeliverableItem {
  name: string;
  type: 'code' | 'document' | 'research' | 'presentation' | 'other';
  format: string;
  path: string;
  url: string;
  size: number;
  createdAt: string;
  metadata?: any;
}

export async function GET(request: NextRequest) {
  try {
    const deliverablesDir = path.join(process.cwd(), 'deliverables');
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    
    // Check if deliverables directory exists
    try {
      await fs.access(deliverablesDir);
    } catch {
      return NextResponse.json({ 
        deliverables: [],
        message: 'No deliverables directory found'
      });
    }

    const categories = ['applications', 'documents', 'research-papers', 'presentations', 'misc'];
    const deliverables: DeliverableItem[] = [];

    for (const category of categories) {
      const categoryPath = path.join(deliverablesDir, category);
      
      try {
        const files = await fs.readdir(categoryPath);
        
        for (const file of files) {
          // Skip metadata files
          if (file.endsWith('.meta.json')) continue;
          
          const filePath = path.join(categoryPath, file);
          const stats = await fs.stat(filePath);
          
          const ext = path.extname(file).toLowerCase();
          const typeMap: Record<string, 'code' | 'document' | 'research' | 'presentation' | 'other'> = {
            'applications': 'code',
            'documents': 'document', 
            'research-papers': 'research',
            'presentations': 'presentation',
            'misc': 'other'
          };
          
          // Try to load metadata
          let metadata = null;
          try {
            const metadataPath = filePath + '.meta.json';
            const metadataContent = await fs.readFile(metadataPath, 'utf8');
            metadata = JSON.parse(metadataContent);
          } catch {
            // Metadata not found or invalid
          }
          
          deliverables.push({
            name: (metadata as any)?.title || file.replace(/\.[^/.]+$/, ''),
            type: typeMap[category] || 'other',
            format: ext.substring(1),
            path: `${category}/${file}`,
            url: `${baseUrl}/api/deliverables/${category}/${file}`,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
            metadata
          });
        }
      } catch {
        // Category directory doesn't exist or is empty
      }
    }

    // Sort by creation date (newest first)
    deliverables.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const summary = {
      total: deliverables.length,
      byType: deliverables.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byFormat: deliverables.reduce((acc, item) => {
        acc[item.format] = (acc[item.format] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      deliverables,
      summary,
      message: `Found ${deliverables.length} deliverables`
    });

  } catch (error) {
    console.error('Error listing deliverables:', error);
    return NextResponse.json({ 
      error: 'Failed to list deliverables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

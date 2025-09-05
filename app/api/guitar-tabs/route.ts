import { NextRequest, NextResponse } from 'next/server';
import GuitarTabService from '@/lib/guitar-tab-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    const tabService = new GuitarTabService();

    switch (action) {
      case 'search':
        const searchResults = await tabService.searchTabs({
          query: params.query,
          instrument: params.instrument || 'all',
          difficulty: params.difficulty || 'all',
          limit: params.limit || 20
        });
        
        return NextResponse.json({
          success: true,
          results: searchResults,
          count: searchResults.length
        });

      case 'download':
        if (!params.url) {
          return NextResponse.json(
            { success: false, error: 'URL is required for download' },
            { status: 400 }
          );
        }

        const downloadResult = await tabService.downloadTab({
          url: params.url,
          format: params.format || 'gp5',
          extractDrums: params.extractDrums || false
        });

        return NextResponse.json(downloadResult);

      case 'popular':
        const popularTabs = await tabService.getPopularTabs(params.limit || 20);
        
        return NextResponse.json({
          success: true,
          results: popularTabs,
          count: popularTabs.length
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Guitar tab API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    const tabService = new GuitarTabService();

    if (action === 'popular') {
      const limit = parseInt(searchParams.get('limit') || '20');
      const popularTabs = await tabService.getPopularTabs(limit);
      
      return NextResponse.json({
        success: true,
        results: popularTabs,
        count: popularTabs.length
      });
    }

    if (action === 'search') {
      const query = searchParams.get('query');
      if (!query) {
        return NextResponse.json(
          { success: false, error: 'Query parameter is required' },
          { status: 400 }
        );
      }

      const searchResults = await tabService.searchTabs({
        query,
        instrument: (searchParams.get('instrument') as 'guitar' | 'bass' | 'drums' | 'all') || 'all',
        difficulty: (searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced' | 'all') || 'all',
        limit: parseInt(searchParams.get('limit') || '20')
      });
      
      return NextResponse.json({
        success: true,
        results: searchResults,
        count: searchResults.length
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Guitar Tab Service API',
      endpoints: {
        'POST /api/guitar-tabs': 'Search, download, or get popular tabs',
        'GET /api/guitar-tabs?action=search&query=...': 'Search tabs',
        'GET /api/guitar-tabs?action=popular': 'Get popular tabs'
      },
      actions: ['search', 'download', 'popular'],
      formats: ['gp5', 'midi', 'ascii', 'all']
    });
  } catch (error) {
    console.error('Guitar tab API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

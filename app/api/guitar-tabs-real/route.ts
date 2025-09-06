import { NextRequest, NextResponse } from 'next/server';
import { GuitarTabService } from '../../../lib/guitar-tab-service-real';

const tabService = new GuitarTabService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'search';
    const query = searchParams.get('query') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }
        
        const searchResults = await tabService.searchTabs({ 
          query, 
          limit,
          includeContent: false 
        });
        
        return NextResponse.json({ 
          success: true, 
          results: searchResults,
          total: searchResults.length,
          query
        });

      case 'popular':
        const popularTabs = await tabService.getPopularTabs(limit);
        return NextResponse.json({ 
          success: true, 
          results: popularTabs,
          total: popularTabs.length
        });

      default:
        return NextResponse.json({
          success: true,
          message: "Real Ultimate Guitar Tab Service API",
          endpoints: {
            "GET /api/guitar-tabs-real?action=search&query=...": "Search tabs on Ultimate Guitar",
            "GET /api/guitar-tabs-real?action=popular": "Get popular tabs",
            "POST /api/guitar-tabs-real": "Advanced search with content retrieval"
          },
          actions: ["search", "popular"],
          note: "Powered by real Ultimate Guitar scraping"
        });
    }
  } catch (error) {
    console.error('Guitar tabs API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, limit = 10, includeContent = false } = body;

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const results = await tabService.searchTabs({ 
          query, 
          limit,
          includeContent 
        });

        return NextResponse.json({ 
          success: true, 
          results,
          total: results.length,
          query
        });

      case 'download':
      case 'getContent':
        const { url } = body;
        if (!url) {
          return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const content = await tabService.getTabContent(url);
        return NextResponse.json(content);

      case 'popular':
        const popularTabs = await tabService.getPopularTabs(limit);
        return NextResponse.json({ 
          success: true, 
          results: popularTabs,
          total: popularTabs.length
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Guitar tabs API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

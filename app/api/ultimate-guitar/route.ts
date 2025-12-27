import { NextRequest, NextResponse } from 'next/server';
import UltimateGuitarExtractor from '../../../lib/ultimate-guitar-extractor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'search';
    const query = searchParams.get('query');
    const url = searchParams.get('url');
    const limit = parseInt(searchParams.get('limit') || '20');

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Query parameter is required for search' },
            { status: 400 }
          );
        }
        
        const searchResults = await UltimateGuitarExtractor.searchTabs(query, limit);
        return NextResponse.json({
          success: true,
          action: 'search',
          query,
          limit,
          count: searchResults.length,
          results: searchResults
        });

      case 'extract':
        if (!url) {
          return NextResponse.json(
            { success: false, error: 'URL parameter is required for tab extraction' },
            { status: 400 }
          );
        }

        const tabContent = await UltimateGuitarExtractor.extractTab(url);
        return NextResponse.json({
          success: true,
          action: 'extract',
          url,
          tab: tabContent
        });

      default:
        return NextResponse.json({
          success: true,
          message: 'Ultimate Guitar Tab Service - Real Implementation',
          endpoints: {
            'GET /api/ultimate-guitar?action=search&query={song}': 'Search for tabs',
            'GET /api/ultimate-guitar?action=extract&url={tab_url}': 'Extract full tab content'
          },
          example_urls: {
            'Search': '/api/ultimate-guitar?action=search&query=wonderwall&limit=5',
            'Extract': '/api/ultimate-guitar?action=extract&url=https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-62122'
          }
        });
    }
  } catch (error) {
    console.error('Ultimate Guitar API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, url, limit = 20 } = body;

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Query is required for search' },
            { status: 400 }
          );
        }
        
        const searchResults = await UltimateGuitarExtractor.searchTabs(query, limit);
        return NextResponse.json({
          success: true,
          action: 'search',
          query,
          limit,
          count: searchResults.length,
          results: searchResults
        });

      case 'extract':
        if (!url) {
          return NextResponse.json(
            { success: false, error: 'URL is required for tab extraction' },
            { status: 400 }
          );
        }

        const tabContent = await UltimateGuitarExtractor.extractTab(url);
        return NextResponse.json({
          success: true,
          action: 'extract',
          url,
          tab: tabContent
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use "search" or "extract"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Ultimate Guitar API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

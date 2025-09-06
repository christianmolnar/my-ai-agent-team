/**
 * Real Ultimate Guitar Tab Service
 * Uses Python scraper to access Ultimate Guitar's actual database
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface GuitarTab {
  title: string;
  artist: string;
  type: string;
  rating: number;
  votes: number;
  url: string;
  difficulty: string;
  id: string;
  content?: string;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  includeContent?: boolean;
}

export class GuitarTabService {
  private readonly scriptPath: string;

  constructor() {
    // Path to our Python Ultimate Guitar scraper
    this.scriptPath = path.join(process.cwd(), 'scripts', 'ultimate_guitar_scraper.py');
  }

  async searchTabs(options: SearchOptions): Promise<GuitarTab[]> {
    const { query, limit = 10, includeContent = false } = options;
    
    try {
      console.log(`🔍 Searching Ultimate Guitar for: "${query}"`);
      
      const command = `python3 "${this.scriptPath}" "${query}" ${limit} ${includeContent ? 'true' : 'false'}`;
      const { stdout, stderr } = await execAsync(command, { 
        timeout: 30000,
        maxBuffer: 1024 * 1024 // 1MB buffer for large responses
      });
      
      if (stderr) {
        console.log('🐍 Python scraper debug:', stderr);
      }
      
      if (!stdout.trim()) {
        console.log('❌ No results from scraper');
        return [];
      }
      
      const results = JSON.parse(stdout) as GuitarTab[];
      console.log(`✅ Found ${results.length} tabs from Ultimate Guitar`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Guitar tab search error:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      
      // Return fallback demo data so the API doesn't break
      return this.getFallbackResults(options.query);
    }
  }

  async getTabContent(tabUrl: string): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      const command = `python3 -c "
import sys
sys.path.append('scripts')
from ultimate_guitar_scraper import UltimateGuitarScraper
import json
scraper = UltimateGuitarScraper()
result = scraper.get_tab_content('${tabUrl}')
print(json.dumps(result))
"`;
      
      const { stdout } = await execAsync(command, { timeout: 15000 });
      const result = JSON.parse(stdout);
      
      return {
        success: result.success,
        content: result.content,
        error: result.error
      };
      
    } catch (error) {
      console.error('❌ Tab content retrieval error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getFallbackResults(query: string): GuitarTab[] {
    // Provide realistic fallback data when scraper fails
    return [
      {
        title: `Search for "${query}"`,
        artist: "Ultimate Guitar",
        type: "Info",
        rating: 0,
        votes: 0,
        url: `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(query)}`,
        difficulty: "",
        id: "fallback",
        content: `// Visit Ultimate Guitar to search for "${query}" tabs\n// Our scraper is temporarily unavailable`
      }
    ];
  }

  // Popular tabs that are commonly searched
  async getPopularTabs(limit: number = 10): Promise<GuitarTab[]> {
    const popularSongs = [
      'wonderwall oasis',
      'hotel california eagles', 
      'stairway to heaven led zeppelin',
      'blackbird beatles',
      'wish you were here pink floyd'
    ];
    
    const randomSong = popularSongs[Math.floor(Math.random() * popularSongs.length)];
    return this.searchTabs({ query: randomSong, limit });
  }

  // Legacy compatibility methods
  async searchTabsLegacy(options: { query: string; limit?: number }): Promise<GuitarTab[]> {
    return this.searchTabs(options);
  }

  async downloadTab(tabId: string, format?: string): Promise<{ success: boolean; url?: string; error?: string }> {
    // For Ultimate Guitar, we redirect to the tab URL instead of downloading
    const tabs = await this.searchTabs({ query: tabId, limit: 1 });
    
    if (tabs.length > 0) {
      return {
        success: true,
        url: tabs[0].url
      };
    }
    
    return {
      success: false,
      error: 'Tab not found'
    };
  }
}

// Export legacy interfaces for compatibility
export interface TabSearchQuery {
  query: string;
  instrument?: 'guitar' | 'bass' | 'drums' | 'all';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  tuning?: string;
  limit?: number;
}

export interface TabSearchResult {
  id: number;
  artist: string;
  title: string;
  url: string;
  instrument: string;
  difficulty?: string;
  tuning?: string;
  hasGuitarPro?: boolean;
  previewUrl?: string;
}

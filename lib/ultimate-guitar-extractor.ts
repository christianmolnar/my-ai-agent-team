import axios from 'axios';
import * as cheerio from 'cheerio';

interface UltimateTabInfo {
  title: string;
  artist: string;
  author: string;
  difficulty?: string;
  key?: string;
  capo?: string;
  tuning?: string;
}

interface ChordItem {
  note: string;
  pre_spaces: number;
}

interface TabLine {
  type: 'chords' | 'lyric' | 'blank' | 'section';
  chords?: ChordItem[];
  lyric?: string;
  section?: string;
}

interface UltimateTab {
  title: string;
  artist_name: string;
  author: string;
  difficulty?: string;
  key?: string;
  capo?: string;
  tuning?: string;
  lines: TabLine[];
}

export class UltimateGuitarExtractor {
  private static readonly SUPPORTED_UG_URI = 'tabs.ultimate-guitar.com';
  
  /**
   * Extracts full tab content from an Ultimate Guitar URL
   */
  static async extractTab(url: string): Promise<UltimateTab> {
    // Validate URL
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname !== this.SUPPORTED_UG_URI) {
      throw new Error(`Unsupported URL. Expected ${this.SUPPORTED_UG_URI}`);
    }

    try {
      // Fetch the HTML content
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract tab info
      const tabInfo = this.extractTabInfo($);
      
      // Extract tab content
      const tabContent = this.extractTabContent($);

      return {
        title: tabInfo.title,
        artist_name: tabInfo.artist,
        author: tabInfo.author,
        difficulty: tabInfo.difficulty,
        key: tabInfo.key,
        capo: tabInfo.capo,
        tuning: tabInfo.tuning,
        lines: tabContent
      };
    } catch (error) {
      throw new Error(`Failed to extract tab: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extracts tab metadata from the page
   */
  private static extractTabInfo($: cheerio.CheerioAPI): UltimateTabInfo {
    // Get song title and artist
    let songTitle = 'UNKNOWN';
    let artistName = 'UNKNOWN';
    let author = 'UNKNOWN';
    let difficulty: string | undefined;
    let key: string | undefined;
    let capo: string | undefined;
    let tuning: string | undefined;

    try {
      songTitle = $('[itemprop="name"]').first().text().replace(/chords/i, '').trim();
    } catch (e) {
      // Use fallback or keep UNKNOWN
    }

    try {
      artistName = $('.t_autor').first().text().replace(/by/i, '').replace(/\n/g, '').trim();
    } catch (e) {
      // Use fallback or keep UNKNOWN
    }

    // Extract additional info (author, difficulty, etc.)
    try {
      const infoHeader = $('.t_dt').text().replace(/\n/g, '');
      const infoHeaders = infoHeader.split(' ').filter(x => x).map(x => x.toLowerCase());
      const infoValues = $('.t_dtde');

      infoHeaders.forEach((header, index) => {
        try {
          const valueElement = infoValues.eq(index);
          const value = valueElement.text().trim();

          switch (header) {
            case 'author':
              author = valueElement.find('a').text() || value;
              break;
            case 'difficulty':
              difficulty = value;
              break;
            case 'key':
              key = value;
              break;
            case 'capo':
              capo = value;
              break;
            case 'tuning':
              tuning = value;
              break;
          }
        } catch (e) {
          // Continue to next header
        }
      });
    } catch (e) {
      // Continue without detailed info
    }

    return { title: songTitle, artist: artistName, author, difficulty, key, capo, tuning };
  }

  /**
   * Extracts tab content (chords and lyrics)
   */
  private static extractTabContent($: cheerio.CheerioAPI): TabLine[] {
    const lines: TabLine[] = [];
    
    // First try to get content from js-store JSON data
    const storeDiv = $('.js-store').attr('data-content');
    if (storeDiv) {
      try {
        const storeData = JSON.parse(storeDiv.replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
        
        // Extract tab content from the store data
        const tabContent = storeData?.store?.page?.data?.tab_view?.wiki_tab?.content;
        if (tabContent) {
          // Decode HTML entities and clean up the content
          let cleanContent = tabContent
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n');
          
          // Split into lines and process
          const contentLines = cleanContent.split('\n');
          for (const line of contentLines) {
            if (!line.trim()) {
              lines.push({ type: 'blank' });
            } else if (line.includes('[ch]') || line.includes('[/ch]')) {
              // This is a chord line
              lines.push(this.parseChordLineFromContent(line));
            } else if (line.startsWith('[') && line.endsWith(']')) {
              // This is a section header like [Verse], [Chorus]
              lines.push({ type: 'section', section: line.replace(/[\[\]]/g, '') });
            } else if (line.includes('[tab]') || line.includes('[/tab]')) {
              // This is a combined chord/lyric line
              lines.push(this.parseTabLineFromContent(line));
            } else {
              // Regular lyric or text line
              lines.push({ type: 'lyric', lyric: line.trim() });
            }
          }
          
          return lines;
        }
      } catch (parseError) {
        console.error('Error parsing store data:', parseError);
        // Fall back to HTML parsing
      }
    }
    
    // Fallback: Look for tab content in HTML elements
    const tabClasses = ['js-tab-content', 'js-copy-content'];
    let tabContent: cheerio.Cheerio<any> | null = null;

    for (const className of tabClasses) {
      tabContent = $(`.${className}`);
      if (tabContent.length > 0) break;
    }

    if (!tabContent || tabContent.length === 0) {
      // Try pre tags as final fallback
      tabContent = $('pre');
      if (tabContent.length === 0) {
        throw new Error('Could not find tab content on the page');
      }
    }

    // Get the raw HTML content
    const rawContent = tabContent.html();
    if (!rawContent) {
      throw new Error('Tab content is empty');
    }

    // Split into lines and process each
    const tabLines = rawContent.split('\n');
    
    for (const line of tabLines) {
      const processedLine = this.processTabLine(line);
      lines.push(processedLine);
    }

    return lines;
  }

  /**
   * Processes a single line of tab content
   */
  private static processTabLine(line: string): TabLine {
    // Remove HTML tags but preserve structure for chord detection
    const spanTagRegex = /<span[^>]*>|<\/span[^>]*>/g;
    
    if (!line.trim()) {
      // Blank line
      return { type: 'blank' };
    } else if (spanTagRegex.test(line)) {
      // Line contains chords (span tags indicate chord positions)
      const sanitizedLine = line.replace(spanTagRegex, ' ');
      return this.parseChordLine(sanitizedLine);
    } else {
      // Line contains lyrics
      const cleanLine = line.replace(/<[^>]*>/g, ''); // Remove any remaining HTML tags
      return { type: 'lyric', lyric: cleanLine };
    }
  }

  /**
   * Parses a chord line and extracts chord positions
   */
  private static parseChordLine(chordsLine: string): TabLine {
    const chords: ChordItem[] = [];
    let leadingSpaces = 0;

    const parts = chordsLine.split(' ');
    
    for (const part of parts) {
      if (!part) {
        leadingSpaces++;
      } else {
        chords.push({
          note: part,
          pre_spaces: leadingSpaces
        });
        leadingSpaces = 1; // Reset for next chord
      }
    }

    return { type: 'chords', chords };
  }

  /**
   * Search Ultimate Guitar for tabs
   */
  static async searchTabs(query: string, limit: number = 20): Promise<any[]> {
    try {
      const searchUrl = `https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(query)}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // Look for the JSON data in the js-store div
      const storeDiv = $('.js-store');
      if (storeDiv.length === 0) {
        throw new Error('Could not find search data on Ultimate Guitar page');
      }
      
      const dataContent = storeDiv.attr('data-content');
      if (!dataContent) {
        throw new Error('No search data found in Ultimate Guitar response');
      }
      
      try {
        // Parse the HTML-encoded JSON
        const decodedData = dataContent.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const searchData = JSON.parse(decodedData);
        
        if (searchData.store && searchData.store.page && searchData.store.page.data && searchData.store.page.data.results) {
          const results = searchData.store.page.data.results.slice(0, limit);
          
          // Less restrictive filtering - include more result types
          const filteredResults = results.filter((result: any) => {
            // Keep public tabs and allow more tab types
            return result.tab_access_type === 'public' && 
                   result.type && 
                   (result.type.toLowerCase().includes('chord') || 
                    result.type.toLowerCase().includes('tab') ||
                    result.type === 'Chords' || 
                    result.type === 'Tab' || 
                    result.type === 'Tabs');
          });
          
          return filteredResults.slice(0, limit);
        }
        
        return [];
      } catch (parseError) {
        throw new Error(`Failed to parse Ultimate Guitar search data: ${parseError instanceof Error ? parseError.message : 'Parse error'}`);
      }
    } catch (error) {
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parses a chord line from Ultimate Guitar content format
   */
  private static parseChordLineFromContent(line: string): TabLine {
    const chords: ChordItem[] = [];
    
    // Remove [ch] and [/ch] tags and extract chord positions
    let cleanLine = line;
    const chordMatches = line.match(/\[ch\]([^[]+)\[\/ch\]/g);
    
    if (chordMatches) {
      let currentPos = 0;
      for (const match of chordMatches) {
        const chord = match.replace(/\[ch\]|\[\/ch\]/g, '');
        const matchIndex = cleanLine.indexOf(match, currentPos);
        
        chords.push({
          note: chord,
          pre_spaces: matchIndex - currentPos
        });
        
        cleanLine = cleanLine.replace(match, chord);
        currentPos = matchIndex + chord.length;
      }
    }
    
    return { type: 'chords', chords };
  }

  /**
   * Parses a combined tab/chord line from Ultimate Guitar content format
   */
  private static parseTabLineFromContent(line: string): TabLine {
    // Remove [tab] and [/tab] tags
    let cleanLine = line.replace(/\[tab\]|\[\/tab\]/g, '').trim();
    
    // If it contains chords, parse as chord line
    if (cleanLine.includes('[ch]') || cleanLine.includes('[/ch]')) {
      return this.parseChordLineFromContent(cleanLine);
    }
    
    // Otherwise treat as lyric line
    return { type: 'lyric', lyric: cleanLine };
  }
}

export default UltimateGuitarExtractor;

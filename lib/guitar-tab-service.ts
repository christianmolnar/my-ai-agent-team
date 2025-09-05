/**
 * Guitar Tablature Search & Download Service
 * Integrates with Songsterr API and provides download capabilities
 */

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

export interface TabDownloadOptions {
  url: string;
  format: 'gp5' | 'midi' | 'ascii' | 'all';
  extractDrums?: boolean;
}

export interface TabDownloadResult {
  success: boolean;
  files: {
    gp5File?: string;
    midiFile?: string;
    asciiTab?: string;
  };
  error?: string;
  tabInfo: {
    artist: string;
    title: string;
    instrument: string;
  };
}

export class GuitarTabService {
  private baseUrl = 'https://www.songsterr.com/a/';
  private tempDir = '/tmp/guitar-tabs';

  constructor() {
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.warn('Could not create temp directory:', error);
    }
  }

  /**
   * Search for guitar tabs using Songsterr API
   */
  async searchTabs(query: TabSearchQuery): Promise<TabSearchResult[]> {
    try {
      // Use Songsterr's public API endpoints
      const searchUrl = `${this.baseUrl}ra/songs.json?pattern=${encodeURIComponent(query.query)}`;
      
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Music-Coach-Agent/1.0',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Songsterr API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Convert to our format
      const results: TabSearchResult[] = data
        .slice(0, query.limit || 20)
        .map((item: any) => ({
          id: item.id,
          artist: item.artist?.name || 'Unknown Artist',
          title: item.title || 'Unknown Title',
          url: `https://www.songsterr.com/a/wsa/${item.artist?.nameWithoutThePrefix?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}-${item.title?.toLowerCase().replace(/\s+/g, '-') || 'unknown'}-tab-s${item.id}`,
          instrument: this.determineInstrument(item),
          difficulty: this.determineDifficulty(item),
          hasGuitarPro: true, // Most Songsterr tabs have GP files
          previewUrl: `https://www.songsterr.com/a/wa/song?id=${item.id}`
        }));

      // Filter by instrument if specified
      if (query.instrument && query.instrument !== 'all') {
        return results.filter(tab => 
          tab.instrument.toLowerCase().includes(query.instrument!)
        );
      }

      return results;
    } catch (error) {
      console.error('Tab search error:', error);
      return [];
    }
  }

  /**
   * Download tablature in specified format(s)
   */
  async downloadTab(options: TabDownloadOptions): Promise<TabDownloadResult> {
    try {
      // Extract Songsterr ID from URL
      const songsterrId = this.extractSongsterrId(options.url);
      if (!songsterrId) {
        throw new Error('Invalid Songsterr URL - cannot extract ID');
      }

      // Get tab info
      const tabInfo = await this.getTabInfo(songsterrId);
      
      const result: TabDownloadResult = {
        success: false,
        files: {},
        tabInfo
      };

      // Download GP5 file if requested
      if (options.format === 'gp5' || options.format === 'all') {
        result.files.gp5File = await this.downloadGP5File(songsterrId, tabInfo);
      }

      // Convert to MIDI if requested
      if ((options.format === 'midi' || options.format === 'all') && result.files.gp5File) {
        result.files.midiFile = await this.convertGP5ToMidi(result.files.gp5File, options.extractDrums);
      }

      // Generate ASCII tab if requested  
      if (options.format === 'ascii' || options.format === 'all') {
        result.files.asciiTab = await this.generateASCIITab(songsterrId, tabInfo);
      }

      result.success = true;
      return result;

    } catch (error) {
      return {
        success: false,
        files: {},
        error: error instanceof Error ? error.message : 'Download failed',
        tabInfo: {
          artist: 'Unknown',
          title: 'Unknown', 
          instrument: 'Unknown'
        }
      };
    }
  }

  /**
   * Extract Songsterr song ID from URL
   */
  private extractSongsterrId(url: string): string | null {
    const match = url.match(/-s(\d+)$/);
    return match ? match[1] : null;
  }

  /**
   * Get basic tab information
   */
  private async getTabInfo(songId: string): Promise<{ artist: string; title: string; instrument: string }> {
    try {
      const infoUrl = `${this.baseUrl}wa/song?id=${songId}`;
      const response = await fetch(infoUrl);
      
      if (response.ok) {
        const html = await response.text();
        
        // Extract info from HTML (basic parsing)
        const artistMatch = html.match(/<meta property="og:title" content="([^"]+) by ([^"]+)"/);
        if (artistMatch) {
          return {
            title: artistMatch[1],
            artist: artistMatch[2], 
            instrument: 'Guitar' // Default, could be enhanced
          };
        }
      }
      
      return {
        artist: 'Unknown Artist',
        title: 'Unknown Title',
        instrument: 'Guitar'
      };
    } catch (error) {
      return {
        artist: 'Unknown Artist',
        title: 'Unknown Title', 
        instrument: 'Guitar'
      };
    }
  }

  /**
   * Download GP5 file from Songsterr
   */
  private async downloadGP5File(songId: string, tabInfo: any): Promise<string> {
    try {
      // Songsterr's GP file download endpoint
      const downloadUrl = `https://d12dccao7qhd7w.cloudfront.net/c/${songId}/track0.gp5`;
      
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to download GP5 file: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const filename = `${this.tempDir}/${this.sanitizeFilename(tabInfo.artist)}-${this.sanitizeFilename(tabInfo.title)}.gp5`;
      
      await fs.writeFile(filename, Buffer.from(buffer));
      return filename;
      
    } catch (error) {
      throw new Error(`GP5 download failed: ${error}`);
    }
  }

  /**
   * Convert GP5 file to MIDI
   */
  private async convertGP5ToMidi(gp5File: string, extractDrums = false): Promise<string> {
    try {
      const outputFile = gp5File.replace('.gp5', '.mid');
      
      // Use TuxGuitar command line if available
      try {
        await execAsync(`tuxguitar-cli -export midi "${gp5File}" "${outputFile}"`);
        return outputFile;
      } catch (error) {
        // Fallback: Use Python script
        return await this.convertGP5WithPython(gp5File, extractDrums);
      }
      
    } catch (error) {
      throw new Error(`MIDI conversion failed: ${error}`);
    }
  }

  /**
   * Python-based GP5 to MIDI conversion
   */
  private async convertGP5WithPython(gp5File: string, extractDrums = false): Promise<string> {
    const pythonScript = `
import guitarpro as gp
import pretty_midi
import sys
import os

def convert_gp5_to_midi(gp5_path, output_path, drums_only=False):
    try:
        # Load the GP5 file
        song = gp.open(gp5_path)
        
        # Create MIDI file
        midi = pretty_midi.PrettyMIDI()
        
        for track_idx, track in enumerate(song.tracks):
            # Skip if drums_only is True and this isn't a drum track
            if drums_only and track.channel.channel != 9:  # MIDI channel 10 (index 9) is drums
                continue
                
            # Create instrument
            if track.channel.channel == 9:
                instrument = pretty_midi.Instrument(program=0, is_drum=True)
            else:
                instrument = pretty_midi.Instrument(program=track.channel.instrument)
            
            # Process measures and beats
            current_time = 0.0
            tempo = 120  # Default tempo
            
            for measure in track.measures:
                for voice in measure.voices:
                    for beat in voice.beats:
                        if beat.notes:
                            duration = 60.0 / tempo * (4.0 / beat.duration.value)
                            
                            for note in beat.notes:
                                if note.value >= 0:  # Valid fret
                                    # Calculate MIDI note number
                                    midi_note = track.strings[note.string].value + note.value
                                    
                                    midi_note_obj = pretty_midi.Note(
                                        velocity=80,
                                        pitch=midi_note,
                                        start=current_time,
                                        end=current_time + duration
                                    )
                                    instrument.notes.append(midi_note_obj)
                        
                        current_time += 60.0 / tempo * (4.0 / beat.duration.value)
            
            midi.instruments.append(instrument)
        
        # Save MIDI file
        midi.write(output_path)
        print(f"Converted {gp5_path} to {output_path}")
        return True
        
    except Exception as e:
        print(f"Conversion error: {e}")
        return False

if __name__ == "__main__":
    gp5_file = sys.argv[1]
    output_file = sys.argv[2]
    drums_only = len(sys.argv) > 3 and sys.argv[3].lower() == 'true'
    
    success = convert_gp5_to_midi(gp5_file, output_file, drums_only)
    if success:
        sys.exit(0)
    else:
        sys.exit(1)
`;

    const scriptPath = `${this.tempDir}/convert_gp5.py`;
    const outputFile = gp5File.replace('.gp5', extractDrums ? '_drums.mid' : '.mid');
    
    await fs.writeFile(scriptPath, pythonScript);
    
    try {
      await execAsync(`python3 "${scriptPath}" "${gp5File}" "${outputFile}" ${extractDrums}`);
      return outputFile;
    } catch (error) {
      throw new Error(`Python conversion failed: ${error}`);
    }
  }

  /**
   * Generate ASCII tablature
   */
  private async generateASCIITab(songId: string, tabInfo: any): Promise<string> {
    try {
      // Try to get ASCII tab from Songsterr's text view
      const textUrl = `${this.baseUrl}wa/view?r=${songId}&fmt=text`;
      const response = await fetch(textUrl);
      
      if (response.ok) {
        const asciiTab = await response.text();
        return asciiTab;
      }
      
      // Fallback: Generate basic ASCII tab structure
      return this.generateBasicASCIITab(tabInfo);
      
    } catch (error) {
      return this.generateBasicASCIITab(tabInfo);
    }
  }

  /**
   * Generate basic ASCII tablature template
   */
  private generateBasicASCIITab(tabInfo: any): string {
    return `${tabInfo.title} by ${tabInfo.artist}
${'-'.repeat(40)}

Standard Tuning (E A D G B E)

E|---------------------------------------|
B|---------------------------------------|
G|---------------------------------------|
D|---------------------------------------|
A|---------------------------------------|
E|---------------------------------------|

Note: This is a simplified template. 
For full tablature, use the Guitar Pro file format.
Visit Songsterr.com for the complete interactive tab.

${'-'.repeat(40)}`;
  }

  /**
   * Determine primary instrument from track data
   */
  private determineInstrument(item: any): string {
    if (item.tracks) {
      const instruments = item.tracks.map((track: any) => track.instrument || 'Guitar');
      return instruments.join(', ');
    }
    return 'Guitar';
  }

  /**
   * Determine difficulty (basic heuristic)
   */
  private determineDifficulty(item: any): string {
    // This would need more sophisticated analysis
    // For now, return a placeholder
    const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  }

  /**
   * Sanitize filename for file system
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9\-_\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  /**
   * Get popular tabs (trending/featured)
   */
  async getPopularTabs(limit = 20): Promise<TabSearchResult[]> {
    try {
      const popularUrl = `${this.baseUrl}ra/songs.json?size=${limit}`;
      const response = await fetch(popularUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to get popular tabs: ${response.status}`);
      }
      
      const data = await response.json();
      return data.slice(0, limit).map((item: any) => ({
        id: item.id,
        artist: item.artist?.name || 'Unknown Artist',
        title: item.title || 'Unknown Title',
        url: `https://www.songsterr.com/a/wsa/tab-s${item.id}`,
        instrument: 'Guitar',
        hasGuitarPro: true
      }));
      
    } catch (error) {
      console.error('Popular tabs error:', error);
      return [];
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      for (const file of files) {
        await fs.unlink(`${this.tempDir}/${file}`);
      }
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  }
}

export default GuitarTabService;

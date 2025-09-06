"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function GuitarTabsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadResult, setDownloadResult] = useState<string>("");

  const searchTabs = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearchResults([]);
    
    try {
      const response = await fetch('/api/ultimate-guitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'search', 
          query: searchQuery,
          limit: 10
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        alert(data.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTab = async (tabUrl: string, format: string, songInfo?: any) => {
    setLoading(true);
    setDownloadResult("");
    
    try {
      const response = await fetch('/api/ultimate-guitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'extract', 
          url: tabUrl
        }),
      });

      const data = await response.json();
      
      if (data.success && data.tab) {
        // Use song info from search results or fallback to extracted data
        const title = songInfo?.song_name || songInfo?.title || data.tab.title || 'Unknown Title';
        const artist = songInfo?.artist_name || songInfo?.artist || data.tab.artist_name || 'Unknown Artist';
        
        // Format the tab content for display
        let formatted = `${artist} - ${title}\n`;
        formatted += `Author: ${data.tab.author}\n`;
        if (data.tab.difficulty) formatted += `Difficulty: ${data.tab.difficulty}\n`;
        if (data.tab.capo) formatted += `Capo: ${data.tab.capo}\n`;
        if (songInfo?.rating) formatted += `Rating: ⭐ ${songInfo.rating.toFixed(1)} (${songInfo.votes} votes)\n`;
        formatted += `\n`;
        
        // Add the tab lines
        data.tab.lines.forEach((line: any) => {
          if (line.type === 'section') {
            formatted += `\n[${line.section}]\n`;
          } else if (line.type === 'chords') {
            let chordLine = '';
            line.chords.forEach((chord: any, index: number) => {
              if (index > 0) chordLine += ' '.repeat(Math.max(1, chord.pre_spaces));
              chordLine += chord.note;
            });
            formatted += chordLine + '\n';
          } else if (line.type === 'lyric') {
            formatted += line.lyric + '\n';
          } else if (line.type === 'blank') {
            formatted += '\n';
          }
        });
        
        setDownloadResult(formatted);
        
        // Scroll to the tab result after a short delay
        setTimeout(() => {
          const tabResult = document.getElementById('tab-result');
          if (tabResult) {
            tabResult.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        alert(data.error || 'Failed to extract tab');
      }
    } catch (error) {
      console.error('Extract error:', error);
      alert('Failed to extract tab. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #181a1b 0%, #232526 100%)",
      padding: "20px"
    }}>
      <main style={{
        maxWidth: "1200px",
        margin: "0 auto",
        color: "#f3f3f3"
      }}>
        {/* Header */}
        <div style={{
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}>
          <Link 
            href="/agents/music-coach"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 15px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #333",
              textDecoration: "none",
              color: "#f3f3f3",
              fontSize: "14px"
            }}
          >
            ← Back to Music Coach
          </Link>
        </div>

        <div style={{
          background: "#232526",
          borderRadius: "20px",
          padding: "30px",
          border: "1px solid #444"
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: "30px"
          }}>
            <h1 style={{
              fontSize: "32px",
              fontWeight: "600",
              color: "#ffb347",
              marginBottom: "10px"
            }}>
              🎸 Guitar Tablature Search
            </h1>
            <p style={{
              color: "#ccc",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Search and view guitar tabs from Ultimate Guitar. Get chords, lyrics, and tablature with ratings and community feedback.
            </p>
            <div style={{
              marginTop: "15px",
              padding: "8px 16px",
              background: "#0f4c1b",
              borderRadius: "8px",
              display: "inline-block"
            }}>
              <span style={{ fontSize: "14px", color: "#4ade80", fontWeight: "600" }}>
                ✓ FREE - No API key required
              </span>
            </div>
          </div>

          {/* Search Section */}
          <div style={{
            background: "#181a1b",
            borderRadius: "12px",
            border: "1px solid #333",
            padding: "25px",
            marginBottom: "25px"
          }}>
            <h2 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px"
            }}>
              🔍 Search for Guitar Tabs
            </h2>
            
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchTabs()}
                placeholder="Enter song name, artist, or keywords..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "#232526",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  color: "#f3f3f3",
                  fontSize: "14px"
                }}
              />
              <button
                onClick={searchTabs}
                disabled={loading || !searchQuery.trim()}
                style={{
                  padding: "12px 24px",
                  background: loading || !searchQuery.trim() ? "#444" : "#ffb347",
                  color: loading || !searchQuery.trim() ? "#999" : "#000",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: loading || !searchQuery.trim() ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={{
              background: "#181a1b",
              borderRadius: "12px",
              border: "1px solid #333",
              padding: "25px",
              marginBottom: "25px"
            }}>
              <h2 style={{
                color: "#ffb347",
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "20px"
              }}>
                🎵 Search Results ({searchResults.length} found)
              </h2>
              
              <div style={{
                display: "grid",
                gap: "15px"
              }}>
                {searchResults.map((song, index) => (
                  <div key={index} style={{
                    padding: "20px",
                    background: "#232526",
                    borderRadius: "10px",
                    border: "1px solid #444"
                  }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "20px"
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          color: "#ffb347",
                          fontSize: "16px",
                          fontWeight: "600",
                          marginBottom: "8px"
                        }}>
                          {song.song_name || song.title}
                        </h3>
                        <p style={{
                          color: "#ccc",
                          fontSize: "14px",
                          marginBottom: "8px"
                        }}>
                          by {song.artist_name || song.artist}
                        </p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          {song.type && (
                            <div style={{
                              padding: "4px 8px",
                              background: "#333",
                              borderRadius: "4px",
                              fontSize: "12px",
                              color: "#aaa"
                            }}>
                              {song.type}
                            </div>
                          )}
                          {song.rating && (
                            <div style={{
                              padding: "4px 8px",
                              background: "#0f4c1b",
                              borderRadius: "4px",
                              fontSize: "12px",
                              color: "#4ade80"
                            }}>
                              ⭐ {song.rating.toFixed(1)}
                            </div>
                          )}
                          {song.votes && (
                            <div style={{
                              padding: "4px 8px",
                              background: "#1e3a8a",
                              borderRadius: "4px",
                              fontSize: "12px",
                              color: "#60a5fa"
                            }}>
                              {song.votes} votes
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => downloadTab(song.tab_url, 'tab', song)}
                          disabled={loading}
                          style={{
                            padding: "8px 16px",
                            background: loading ? "#444" : "#ffb347",
                            color: loading ? "#999" : "#1a1a1a",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            cursor: loading ? "not-allowed" : "pointer"
                          }}
                        >
                          View Tab
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Result */}
          {downloadResult && (
            <div id="tab-result" style={{
              background: "#181a1b",
              borderRadius: "12px",
              border: "1px solid #333",
              padding: "25px"
            }}>
              <h2 style={{
                color: "#ffb347",
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "20px"
              }}>
                🎸 Guitar Tab
              </h2>
              <div style={{
                background: "#232526",
                border: "1px solid #444",
                borderRadius: "8px",
                padding: "15px",
                maxHeight: "500px",
                overflowY: "auto"
              }}>
                <pre style={{
                  color: "#f3f3f3",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                  lineHeight: "1.4"
                }}>
                  {downloadResult}
                </pre>
              </div>
              <div style={{
                marginTop: "15px",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap"
              }}>
                <button
                  onClick={() => navigator.clipboard.writeText(downloadResult)}
                  style={{
                    padding: "8px 16px",
                    background: "#4ade80",
                    color: "#000",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  📋 Copy to Clipboard
                </button>
                <button
                  onClick={() => setDownloadResult("")}
                  style={{
                    padding: "8px 16px",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  ✖ Close Tab
                </button>
              </div>
            </div>
          )}

          {/* Usage Information */}
          <div style={{
            background: "#181a1b",
            borderRadius: "12px",
            border: "1px solid #333",
            padding: "25px",
            marginTop: "25px"
          }}>
            <h2 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px"
            }}>
              📚 Format Information
            </h2>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px"
            }}>
              <div style={{
                padding: "15px",
                background: "#232526",
                borderRadius: "8px",
                border: "1px solid #444"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "18px" }}>🎸</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffb347" }}>
                    Guitar Pro (.gp5)
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#ccc", margin: 0, lineHeight: "1.4" }}>
                  Professional tablature format. Works with Guitar Pro, TuxGuitar, and other tab software.
                </p>
              </div>

              <div style={{
                padding: "15px",
                background: "#232526",
                borderRadius: "8px",
                border: "1px solid #444"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "18px" }}>🎵</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffb347" }}>
                    MIDI (.mid)
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#ccc", margin: 0, lineHeight: "1.4" }}>
                  Compatible with DAWs and music software. Great for playback and further editing.
                </p>
              </div>

              <div style={{
                padding: "15px",
                background: "#232526",
                borderRadius: "8px",
                border: "1px solid #444"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <span style={{ fontSize: "18px" }}>�</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffb347" }}>
                    ASCII Tab
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#ccc", margin: 0, lineHeight: "1.4" }}>
                  Simple text-based tablature. Easy to read, share, and print.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

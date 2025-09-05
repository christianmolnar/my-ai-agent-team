"use client";

import { useState } from "react";
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
      const response = await fetch('/api/guitar-tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'search', 
          query: searchQuery 
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

  const downloadTab = async (songId: number, format: string) => {
    setLoading(true);
    setDownloadResult("");
    
    try {
      const response = await fetch('/api/guitar-tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'download', 
          songId: songId,
          format: format
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setDownloadResult(data.content);
      } else {
        alert(data.error || 'Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
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
              Search and download guitar tabs from over 500,000 songs. Convert to MIDI, ASCII, or Guitar Pro formats.
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
                          {song.title}
                        </h3>
                        <p style={{
                          color: "#ccc",
                          fontSize: "14px",
                          marginBottom: "8px"
                        }}>
                          by {song.artist}
                        </p>
                        {song.type && (
                          <div style={{
                            padding: "4px 8px",
                            background: "#333",
                            borderRadius: "4px",
                            display: "inline-block",
                            fontSize: "12px",
                            color: "#aaa"
                          }}>
                            {song.type}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        {['gp5', 'midi', 'ascii'].map((format) => (
                          <button
                            key={format}
                            onClick={() => downloadTab(song.id, format)}
                            disabled={loading}
                            style={{
                              padding: "8px 12px",
                              background: loading ? "#444" : "#333",
                              color: loading ? "#999" : "#f3f3f3",
                              border: "1px solid #555",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: loading ? "not-allowed" : "pointer",
                              textTransform: "uppercase"
                            }}
                          >
                            {format}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Result */}
          {downloadResult && (
            <div style={{
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
                📋 Download Result
              </h2>
              <div style={{
                background: "#232526",
                border: "1px solid #444",
                borderRadius: "8px",
                padding: "15px"
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

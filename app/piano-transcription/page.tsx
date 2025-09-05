"use client";

import { useState } from "react";
import Link from "next/link";

export default function PianoTranscriptionPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const transcribePiano = async () => {
    if (!youtubeUrl.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/transcribe-piano', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          youtubeUrl: youtubeUrl.trim()
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Transcription error:', error);
      setResult({ 
        success: false, 
        error: 'Failed to connect to transcription service. Please try again.' 
      });
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
              🎹 Piano Transcription
            </h1>
            <p style={{
              color: "#ccc",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Convert YouTube piano videos to sheet music. Extract MIDI and generate treble/bass clef notation.
            </p>
            <div style={{
              marginTop: "15px",
              padding: "8px 16px",
              background: "#7c2d12",
              borderRadius: "8px",
              display: "inline-block"
            }}>
              <span style={{ fontSize: "14px", color: "#fb7185", fontWeight: "600" }}>
                BETA - Limited availability
              </span>
            </div>
          </div>

          {/* Input Section */}
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
              🎥 Enter YouTube Video URL
            </h2>
            
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && transcribePiano()}
                placeholder="https://www.youtube.com/watch?v=..."
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
                onClick={transcribePiano}
                disabled={loading || !youtubeUrl.trim()}
                style={{
                  padding: "12px 24px",
                  background: loading || !youtubeUrl.trim() ? "#444" : "#ffb347",
                  color: loading || !youtubeUrl.trim() ? "#999" : "#000",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: loading || !youtubeUrl.trim() ? "not-allowed" : "pointer"
                }}
              >
                {loading ? "Processing..." : "Transcribe"}
              </button>
            </div>

            <div style={{
              marginTop: "15px",
              padding: "12px 16px",
              background: "#232526",
              borderRadius: "8px",
              border: "1px solid #444"
            }}>
              <p style={{
                fontSize: "12px",
                color: "#aaa",
                margin: 0,
                lineHeight: "1.4"
              }}>
                💡 <strong>Tips:</strong> Best results with clear solo piano recordings. Ensure the video has good audio quality and minimal background noise.
              </p>
            </div>
          </div>

          {/* Result Display */}
          {result && (
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
                📋 Transcription Result
              </h2>
              
              {result.success ? (
                <div style={{
                  padding: "20px",
                  background: "#232526",
                  borderRadius: "10px",
                  border: "1px solid #444"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "15px"
                  }}>
                    <span style={{ fontSize: "18px" }}>✅</span>
                    <span style={{ color: "#4ade80", fontWeight: "600" }}>
                      Transcription Complete!
                    </span>
                  </div>
                  
                  {result.sheetMusic && (
                    <div style={{ marginBottom: "15px" }}>
                      <h3 style={{ color: "#ffb347", fontSize: "14px", marginBottom: "10px" }}>
                        📄 Sheet Music
                      </h3>
                      <pre style={{
                        color: "#f3f3f3",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        background: "#333",
                        padding: "15px",
                        borderRadius: "6px",
                        lineHeight: "1.4",
                        margin: 0
                      }}>
                        {result.sheetMusic}
                      </pre>
                    </div>
                  )}
                  
                  {result.midi && (
                    <div style={{ marginBottom: "15px" }}>
                      <h3 style={{ color: "#ffb347", fontSize: "14px", marginBottom: "10px" }}>
                        🎵 MIDI Data
                      </h3>
                      <p style={{ color: "#ccc", fontSize: "12px" }}>
                        MIDI file ready for download or DAW import
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: "20px",
                  background: "#232526",
                  borderRadius: "10px",
                  border: "1px solid #444"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px"
                  }}>
                    <span style={{ fontSize: "18px" }}>❌</span>
                    <span style={{ color: "#fb7185", fontWeight: "600" }}>
                      Transcription Failed
                    </span>
                  </div>
                  <p style={{ color: "#ccc", fontSize: "14px", lineHeight: "1.4" }}>
                    {result.error || 'An unexpected error occurred during transcription.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Service Status */}
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
              ⚙️ Service Information
            </h2>
            
            <div style={{
              display: "grid",
              gap: "15px"
            }}>
              <div style={{
                padding: "15px",
                background: "#232526",
                borderRadius: "8px",
                border: "1px solid #444"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🔬</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffb347" }}>
                    Beta Service
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#ccc", margin: 0, lineHeight: "1.4" }}>
                  This feature is in beta testing. Audio-to-MIDI transcription requires specialized AI models that may not always be available.
                </p>
              </div>

              <div style={{
                padding: "15px",
                background: "#232526",
                borderRadius: "8px",
                border: "1px solid #444"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>🎯</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffb347" }}>
                    Best Practices
                  </span>
                </div>
                <ul style={{ fontSize: "12px", color: "#ccc", margin: 0, paddingLeft: "20px", lineHeight: "1.4" }}>
                  <li>Use solo piano recordings for best results</li>
                  <li>Ensure clear audio quality without distortion</li>
                  <li>Avoid videos with background music or noise</li>
                  <li>Shorter clips (30-60 seconds) typically work better</li>
                </ul>
              </div>

              <div style={{
                padding: "15px",
                background: "#232526",
                borderRadius: "8px",
                border: "1px solid #444"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "16px" }}>💰</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffb347" }}>
                    Free Alternative
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#ccc", margin: 0, lineHeight: "1.4" }}>
                  For reliable piano transcription, try the <Link href="/guitar-tabs" style={{ color: "#4ade80" }}>Guitar Tabs service</Link> which works great and is completely free!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

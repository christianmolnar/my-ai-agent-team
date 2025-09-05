"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MusicCoachAgentPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #181a1b 0%, #232526 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#f3f3f3"
      }}>
        <div style={{
          padding: "20px",
          background: "#232526",
          borderRadius: "10px",
          border: "1px solid #444",
          textAlign: "center"
        }}>
          <p style={{ color: "#ffb347", fontSize: "18px" }}>Loading agent details...</p>
        </div>
      </div>
    );
  }

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
        <div style={{
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          gap: "15px"
        }}>
          <Link 
            href="/"
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
            ← Back to Home
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
              🎹 Music Coach Agent
            </h1>
            <p style={{
              color: "#ccc",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Your personal music instructor specializing in New Orleans piano, jazz theory, and music education.
              Provides personalized coaching and interactive learning experiences.
            </p>
          </div>

          <div style={{
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            padding: "20px",
            marginBottom: "25px"
          }}>
            <h2 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px"
            }}>
              🎯 Core Capabilities
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px"
            }}>
              {[
                { icon: "🎹", title: "New Orleans Piano", desc: "Traditional and modern New Orleans styles" },
                { icon: "🎼", title: "Jazz Theory", desc: "Comprehensive jazz harmony and theory" },
                { icon: "🎓", title: "Music Education", desc: "Personalized learning and instruction" },
                { icon: "🎭", title: "Improvisation", desc: "Creative improvisation techniques" },
                { icon: "🎵", title: "Technique Training", desc: "Piano technique and skill development" },
                { icon: "📚", title: "Music History", desc: "Cultural and historical context" },
                { icon: "🎸", title: "Guitar Tablature", desc: "Search and download guitar tabs from 500k+ songs" },
                { icon: "📋", title: "Piano Transcription", desc: "YouTube video to piano sheet music (beta)" }
              ].map((capability, index) => (
                <div key={index} style={{
                  padding: "15px",
                  background: "#232526",
                  borderRadius: "8px",
                  border: "1px solid #444"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "18px" }}>{capability.icon}</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffb347" }}>
                      {capability.title}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: "12px", 
                    color: "#ccc", 
                    margin: 0,
                    lineHeight: "1.4"
                  }}>
                    {capability.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            padding: "20px",
            marginBottom: "25px"
          }}>
            <h2 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px"
            }}>
              🎼 Music Transcription Tools
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px"
            }}>
              <Link
                href="/guitar-tabs"
                style={{
                  display: "block",
                  padding: "20px",
                  background: "#232526",
                  borderRadius: "12px",
                  border: "1px solid #444",
                  textDecoration: "none",
                  color: "#f3f3f3",
                  transition: "all 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#2a2d2e";
                  e.currentTarget.style.borderColor = "#ffb347";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#232526";
                  e.currentTarget.style.borderColor = "#444";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "24px" }}>🎸</span>
                  <span style={{ fontSize: "16px", fontWeight: "600", color: "#ffb347" }}>
                    Guitar Tablature Search
                  </span>
                </div>
                <p style={{ 
                  fontSize: "14px", 
                  color: "#ccc", 
                  margin: 0,
                  lineHeight: "1.5"
                }}>
                  Search and download guitar tabs from over 500,000 songs. Convert to MIDI, ASCII, or Guitar Pro formats.
                </p>
                <div style={{
                  marginTop: "12px",
                  padding: "6px 12px",
                  background: "#0f4c1b",
                  borderRadius: "6px",
                  display: "inline-block"
                }}>
                  <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: "600" }}>
                    ✓ FREE - No API key required
                  </span>
                </div>
              </Link>

              <Link
                href="/piano-transcription"
                style={{
                  display: "block",
                  padding: "20px",
                  background: "#232526",
                  borderRadius: "12px",
                  border: "1px solid #444",
                  textDecoration: "none",
                  color: "#f3f3f3",
                  transition: "all 0.2s",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#2a2d2e";
                  e.currentTarget.style.borderColor = "#ffb347";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#232526";
                  e.currentTarget.style.borderColor = "#444";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "24px" }}>🎹</span>
                  <span style={{ fontSize: "16px", fontWeight: "600", color: "#ffb347" }}>
                    Piano Transcription
                  </span>
                </div>
                <p style={{ 
                  fontSize: "14px", 
                  color: "#ccc", 
                  margin: 0,
                  lineHeight: "1.5"
                }}>
                  Convert YouTube piano videos to sheet music. Extract MIDI and generate treble/bass clef notation.
                </p>
                <div style={{
                  marginTop: "12px",
                  padding: "6px 12px",
                  background: "#7c2d12",
                  borderRadius: "6px",
                  display: "inline-block"
                }}>
                  <span style={{ fontSize: "12px", color: "#fb7185", fontWeight: "600" }}>
                    BETA - Limited availability
                  </span>
                </div>
              </Link>
            </div>
          </div>

          <div style={{
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            padding: "20px",
            marginBottom: "25px"
          }}>
            <h2 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "15px"
            }}>
              📈 Recent Activity
            </h2>
            <div style={{
              padding: "20px",
              background: "#232526",
              borderRadius: "8px",
              border: "1px solid #444",
              textAlign: "center"
            }}>
              <p style={{ color: "#ccc", fontSize: "14px", margin: 0 }}>
                Activity log integration coming soon...
              </p>
            </div>
          </div>

          <div style={{
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            padding: "20px"
          }}>
            <h2 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "15px"
            }}>
              🔧 API Configuration
            </h2>
            <div style={{ textAlign: "center" }}>
              <Link
                href="/api-status"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  background: "#ffb347",
                  color: "#000",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px"
                }}
              >
                🔑 Configure API Keys
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
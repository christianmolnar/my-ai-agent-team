"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CommunicationsAgentPage() {
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    // Simulate loading
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
        {/* Navigation */}
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
              fontSize: "14px",
              transition: "all 0.2s"
            }}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Main Card */}
        <div style={{
          background: "#232526",
          borderRadius: "20px",
          padding: "30px",
          border: "1px solid #444"
        }}>
          {/* Header */}
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
              📝 Communications Agent
            </h1>
            <p style={{
              color: "#ccc",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Email writing, document writing, meeting notes, presentation creation. 
              This agent excels at professional communication across all mediums and formats.
            </p>
          </div>

          {/* Agent Status */}
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
              📊 Agent Status
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                background: "#232526",
                borderRadius: "8px",
                border: "1px solid #444"
              }}>
                <span style={{ color: "#16a34a", fontSize: "16px" }}>✅</span>
                <span style={{ fontSize: "14px" }}>Agent Active</span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                background: "#232526",
                borderRadius: "8px",
                border: "1px solid #444"
              }}>
                <span style={{ color: "#3b82f6", fontSize: "16px" }}>🔑</span>
                <span style={{ fontSize: "14px" }}>API Keys Required</span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                background: "#232526",
                borderRadius: "8px",
                border: "1px solid #444"
              }}>
                <span style={{ color: "#f59e0b", fontSize: "16px" }}>⚡</span>
                <span style={{ fontSize: "14px" }}>Ready for Tasks</span>
              </div>
            </div>
          </div>

          {/* Capabilities */}
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
                { icon: "📧", title: "Email Writing", desc: "Professional emails, follow-ups, and correspondence" },
                { icon: "📄", title: "Document Creation", desc: "Reports, proposals, and formal documentation" },
                { icon: "📝", title: "Meeting Notes", desc: "Action items, summaries, and follow-up documentation" },
                { icon: "📊", title: "Presentations", desc: "Slide content, speaking notes, and visual narratives" },
                { icon: "🔄", title: "Content Editing", desc: "Proofreading, style improvements, and revisions" },
                { icon: "🌐", title: "Multi-format Output", desc: "Adaptable to various communication channels" }
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

          {/* Recent Activity */}
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
              <p style={{ color: "#888", fontSize: "12px", margin: "8px 0 0 0" }}>
                This will show real-time agent activities and task completions
              </p>
            </div>
          </div>

          {/* API Configuration */}
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
            <p style={{ color: "#ccc", fontSize: "14px", marginBottom: "15px" }}>
              Configure API keys to enable full agent functionality
            </p>
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
                  fontSize: "14px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f59e0b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffb347";
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

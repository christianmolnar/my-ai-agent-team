"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ResearcherAgentPage() {
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
          marginBottom: "30px"
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
              width: "fit-content"
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
              🔍 Researcher Agent
            </h1>
            <p style={{
              color: "#ccc",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Comprehensive research expert across all domains with specialized capabilities.
              Integrates vinyl research and fact-checking with academic and market research.
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
              🔍 Core Capabilities
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px"
            }}>
              {[
                { icon: "🌐", title: "General Research", desc: "Comprehensive research across all knowledge domains" },
                { icon: "🎵", title: "Vinyl & Music Research", desc: "Specialized vinyl and music industry expertise" },
                { icon: "✅", title: "Fact Checking", desc: "Source validation and credibility assessment" },
                { icon: "📊", title: "Market Research", desc: "Competitive analysis and market insights" },
                { icon: "🎓", title: "Academic Research", desc: "Scientific research with citation management" },
                { icon: "📈", title: "Real-time Data", desc: "Live data gathering and trend analysis" }
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
              marginBottom: "15px"
            }}>
              🔧 Technical Integration
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px"
            }}>
              {[
                "Google Scholar APIs",
                "PubMed & JSTOR",
                "Discogs & MusicBrainz",
                "Legal Databases",
                "Fact-Check Services",
                "Real-time News APIs"
              ].map((tech, index) => (
                <div key={index} style={{
                  padding: "8px 12px",
                  background: "#232526",
                  borderRadius: "6px",
                  border: "1px solid #444",
                  fontSize: "12px",
                  color: "#ccc",
                  textAlign: "center"
                }}>
                  {tech}
                </div>
              ))}
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
              📊 Performance Metrics
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px"
            }}>
              {[
                { metric: "Research Accuracy", target: "96%" },
                { metric: "Source Quality", target: "95%" },
                { metric: "Completion Time", target: "85%" },
                { metric: "Fact-Check Success", target: "98%" }
              ].map((item, index) => (
                <div key={index} style={{
                  padding: "15px",
                  background: "#232526",
                  borderRadius: "8px",
                  border: "1px solid #444",
                  textAlign: "center"
                }}>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#ffb347",
                    marginBottom: "5px"
                  }}>
                    {item.target}
                  </div>
                  <div style={{
                    fontSize: "12px",
                    color: "#ccc"
                  }}>
                    {item.metric}
                  </div>
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

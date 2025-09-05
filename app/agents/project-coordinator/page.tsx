"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProjectCoordinatorAgentPage() {
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
              📋 Project Coordinator Agent
            </h1>
            <p style={{
              color: "#ccc",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Detailed project execution and inter-agent coordination. Takes strategic plans and creates 
              detailed, granular project execution plans with specific agent interactions.
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
              📋 Core Capabilities
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px"
            }}>
              {[
                { icon: "📋", title: "Project Planning", desc: "Detailed execution plans with milestones" },
                { icon: "🔄", title: "Agent Coordination", desc: "Inter-agent task delegation and workflow" },
                { icon: "📊", title: "Activity Tracking", desc: "Comprehensive project progress monitoring" },
                { icon: "⏰", title: "Timeline Management", desc: "Deadline tracking and schedule optimization" },
                { icon: "🎯", title: "Quality Assurance", desc: "Cross-agent quality coordination" },
                { icon: "🔗", title: "Communication Hub", desc: "Central coordination and status updates" }
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
              📈 Recent Projects
            </h2>
            <div style={{
              padding: "20px",
              background: "#232526",
              borderRadius: "8px",
              border: "1px solid #444",
              textAlign: "center"
            }}>
              <p style={{ color: "#ccc", fontSize: "14px", margin: 0 }}>
                Project tracking integration coming soon...
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
              🔧 Management Tools
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
                  fontSize: "14px",
                  marginRight: "10px"
                }}
              >
                🔑 API Configuration
              </Link>
              <Link
                href="/master-orchestrator"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 20px",
                  background: "#232526",
                  color: "#ffb347",
                  border: "1px solid #ffb347",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "14px"
                }}
              >
                🎯 View Master Orchestrator
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

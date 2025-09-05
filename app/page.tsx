"use client";

import { useState } from "react";
import Link from "next/link";

const agents = [
  {
    id: "master-orchestrator",
    name: "Master Orchestrator Agent",
    description: "Central coordination hub that manages and orchestrates all other agents",
    emoji: "🎯"
  },
  {
    id: "project-coordinator",
    name: "Project Coordinator Agent",
    description: "Project management, timeline coordination, resource allocation",
    emoji: "📋"
  },
  {
    id: "communications-agent",
    name: "Communications Agent",
    description: "Email writing, document writing, meeting notes, presentation creation",
    emoji: "📝"
  },
  {
    id: "researcher-agent",
    name: "Researcher Agent",
    description: "General research automation, data gathering, fact checking, vinyl research",
    emoji: "🔍"
  },
  {
    id: "image-video-generator",
    name: "Image & Video Generator Agent",
    description: "Static image generation, video content creation, graphic design, visual storytelling",
    emoji: "🎨"
  },
  {
    id: "personal-assistant-agent",
    name: "Personal Assistant Agent",
    description: "Schedule management, task coordination, personal workflow optimization",
    emoji: "🤖"
  },
  {
    id: "data-scientist",
    name: "Data Scientist Agent",
    description: "Data researcher and analysis expert, project viability analysis",
    emoji: "📊"
  },
  {
    id: "full-stack-developer",
    name: "Full Stack Developer Agent",
    description: "End-to-end application development, full stack architecture design",
    emoji: "💻"
  },
  {
    id: "music-coach",
    name: "Music Coach Agent",
    description: "Music learning, practice coordination, creative development",
    emoji: "🎵"
  },
  {
    id: "vinylresearcheragent",
    name: "Vinyl Researcher Agent",
    description: "Vinyl record research, music collection analysis and curation",
    emoji: "🎶"
  }
];

export default function Home() {
  const [message, setMessage] = useState<string>("");

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
              🤖 AI Agent Team
            </h1>
            <p style={{
              color: "#ccc",
              fontSize: "16px"
            }}>
              Modern, agent-driven infrastructure for your AI team
            </p>
          </div>

          {/* Status Section */}
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
              📊 System Status
            </h2>
            <div style={{ display: "grid", gap: "8px" }}>
              {[
                "Next.js foundation established",
                "TypeScript configuration ready", 
                "Component structure in place",
                "API routes directory prepared",
                "Agent files transferred (Phase 2)",
                "Core agent pages functional"
              ].map((item, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px",
                  fontSize: "14px",
                  color: "#f3f3f3"
                }}>
                  <span style={{ color: "#16a34a", fontSize: "16px" }}>✅</span>
                  <span>{item}</span>
                </div>
              ))}
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px",
                fontSize: "14px",
                color: "#f3f3f3"
              }}>
                <span style={{ color: "#3b82f6", fontSize: "16px" }}>🔄</span>
                <span>Ready for optimization (Phase 3)</span>
              </div>
            </div>
          </div>

          {/* AI Agents Section */}
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
              🤖 AI Agents
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px",
              marginBottom: "20px"
            }}>
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  style={{
                    display: "block",
                    padding: "16px",
                    background: "#232526",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "#f3f3f3",
                    transition: "all 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#2a2d2e";
                    e.currentTarget.style.borderColor = "#555";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#232526";
                    e.currentTarget.style.borderColor = "#444";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "20px" }}>{agent.emoji}</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "#ffb347" }}>
                      {agent.name}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: "12px", 
                    color: "#ccc", 
                    margin: 0,
                    lineHeight: "1.4"
                  }}>
                    {agent.description}
                  </p>
                </Link>
              ))}
            </div>

            {/* Configure API Keys Button */}
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
                🔧 Configure API Keys
              </Link>
            </div>
          </div>

          {/* Quick Actions Section */}
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
              ⚡ Quick Actions
            </h2>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Enter a test message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: "200px",
                  padding: "10px 12px",
                  background: "#232526",
                  border: "1px solid #555",
                  borderRadius: "6px",
                  color: "#f3f3f3",
                  fontSize: "14px"
                }}
              />
              <button
                onClick={() => setMessage("")}
                style={{
                  padding: "10px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  background: "#555",
                  color: "#f3f3f3",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#666";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#555";
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

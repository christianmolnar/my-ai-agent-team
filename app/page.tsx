"use client";

import { useState } from "react";
import Link from "next/link";

// Official Agent Teams from AGENT-ROSTER-SPECIFICATION.md
const agentTeams = {
  management: [
    {
      id: "master-orchestrator",
      name: "Master Orchestrator",
      description: "Strategic oversight and multi-agent coordination",
      emoji: "🎯"
    },
    {
      id: "project-coordinator", 
      name: "Project Coordinator",
      description: "Detailed project execution and inter-agent coordination",
      emoji: "📋"
    },
    {
      id: "communications-agent",
      name: "Communications Agent",
      description: "All forms of written communication and content creation",
      emoji: "📝"
    },
    {
      id: "researcher-agent",
      name: "Researcher Agent", 
      description: "Comprehensive research across all domains with specialized capabilities",
      emoji: "🔍"
    },
    {
      id: "data-scientist",
      name: "Data Scientist",
      description: "Data-driven decision making and analytics",
      emoji: "📊"
    },
    {
      id: "personal-assistant-bridge",
      name: "Personal Assistant Bridge",
      description: "Secure interface between public agents and private repository",
      emoji: "🤝"
    }
  ],
  education: [
    {
      id: "music-coach",
      name: "Music Coach",
      description: "Music education, theory, practice guidance, and transcription tools (guitar tabs, piano scores from YouTube)",
      emoji: "🎹"
    }
  ],
  productDevelopment: [
    {
      id: "product-manager",
      name: "Product Manager",
      description: "Business requirements and product strategy",
      emoji: "💼"
    },
    {
      id: "experience-designer",
      name: "Experience Designer",
      description: "User interface and experience design",
      emoji: "🎨"
    },
    {
      id: "full-stack-developer",
      name: "Full Stack Developer", 
      description: "End-to-end application development and architecture",
      emoji: "💻"
    },
    {
      id: "back-end-developer",
      name: "Back End Developer",
      description: "Server-side application development and infrastructure",
      emoji: "⚙️"
    },
    {
      id: "front-end-developer",
      name: "Front End Developer",
      description: "Client-side application development and user interfaces",
      emoji: "🖥️"
    },
    {
      id: "test-expert",
      name: "Test Expert",
      description: "Quality assurance and comprehensive testing strategy",
      emoji: "�"
    },
    {
      id: "dev-design-doc-creator",
      name: "Dev Design Doc Creator",
      description: "Technical architecture and system design documentation",
      emoji: "�"
    }
  ],
  operations: [
    {
      id: "monitoring-expert",
      name: "Monitoring Expert",
      description: "System monitoring and observability",
      emoji: "📊"
    },
    {
      id: "availability-reliability-expert",
      name: "Availability & Reliability Expert",
      description: "High availability and disaster recovery",
      emoji: "�️"
    },
    {
      id: "performance-expert",
      name: "Performance Expert",
      description: "System performance optimization and tuning",
      emoji: "⚡"
    },
    {
      id: "security-expert",
      name: "Security Expert",
      description: "Application and infrastructure security",
      emoji: "�"
    },
    {
      id: "privacy-guardian",
      name: "Privacy Guardian",
      description: "Data privacy and protection compliance",
      emoji: "🛡️"
    },
    {
      id: "image-video-generator",
      name: "Image & Video Generator",
      description: "Visual content creation across all media types",
      emoji: "🎬"
    }
  ]
};

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I\'m your Personal Assistant. I can help coordinate projects across your entire AI agent team. What would you like to work on today?' }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, { role: 'user', content: message }]);
      setMessage('');
      
      // Simulate assistant response
      setTimeout(() => {
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: `I understand you want to "${message.trim()}". Let me coordinate with the appropriate agents from our team to help with this. I'll involve the Master Orchestrator to create a comprehensive plan and delegate tasks to the right specialists.` 
        }]);
      }, 1000);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #181a1b 0%, #232526 100%)",
      padding: "20px"
    }}>
      <main style={{
        maxWidth: "1400px",
        margin: "0 auto",
        color: "#f3f3f3"
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: "30px"
        }}>
          <h1 style={{
            fontSize: "36px",
            fontWeight: "600",
            color: "#ffb347",
            marginBottom: "10px"
          }}>
            🤖 AI Agent Team
          </h1>
          <p style={{
            color: "#ccc",
            fontSize: "18px"
          }}>
            Intelligent, coordinated agents working together for your success
          </p>
        </div>

        {/* Personal Assistant Chat Interface */}
        <div style={{
          background: "#232526",
          borderRadius: "20px",
          padding: "30px",
          border: "1px solid #444",
          marginBottom: "30px"
        }}>
          <div style={{
            textAlign: "center",
            marginBottom: "20px"
          }}>
            <h2 style={{
              fontSize: "24px",
              fontWeight: "600",
              color: "#ffb347",
              marginBottom: "8px"
            }}>
              🤖 Personal Assistant
            </h2>
            <p style={{
              color: "#ccc",
              fontSize: "14px"
            }}>
              Tell me what you need, and I'll coordinate the entire team to make it happen
            </p>
          </div>

          {/* Chat History */}
          <div style={{
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            padding: "20px",
            marginBottom: "20px",
            height: "300px",
            overflowY: "auto"
          }}>
            {chatHistory.map((msg, index) => (
              <div key={index} style={{ marginBottom: "15px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px"
                }}>
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: msg.role === 'assistant' ? "#ffb347" : "#555",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: msg.role === 'assistant' ? "#000" : "#fff"
                  }}>
                    {msg.role === 'assistant' ? '🤖' : 'U'}
                  </div>
                  <div style={{
                    background: msg.role === 'assistant' ? "#232526" : "#2a2d2e",
                    padding: "12px 15px",
                    borderRadius: "12px",
                    border: "1px solid #444",
                    flex: 1,
                    fontSize: "14px",
                    lineHeight: "1.5"
                  }}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <input
              type="text"
              placeholder="What project or task do you need help with?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "#181a1b",
                border: "1px solid #555",
                borderRadius: "8px",
                color: "#f3f3f3",
                fontSize: "14px"
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                cursor: message.trim() ? "pointer" : "not-allowed",
                fontWeight: "600",
                fontSize: "14px",
                background: message.trim() ? "#ffb347" : "#555",
                color: message.trim() ? "#000" : "#ccc",
                transition: "all 0.2s"
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Agent Teams */}
        <div style={{ display: "grid", gap: "30px" }}>
          
          {/* Management and Coordination Team */}
          <div style={{
            background: "#232526",
            borderRadius: "20px",
            padding: "30px",
            border: "1px solid #444"
          }}>
            <div style={{
              textAlign: "center",
              marginBottom: "25px"
            }}>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#ffb347",
                marginBottom: "8px"
              }}>
                🏛️ Management and Coordination
              </h2>
              <p style={{
                color: "#ccc",
                fontSize: "14px"
              }}>
                Strategic oversight, project management, and secure data integration
              </p>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px"
            }}>
              {agentTeams.management.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  style={{
                    display: "block",
                    padding: "16px",
                    background: "#181a1b",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "#f3f3f3",
                    transition: "all 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1f2122";
                    e.currentTarget.style.borderColor = "#555";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#181a1b";
                    e.currentTarget.style.borderColor = "#333";
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
          </div>

          {/* Education and Learning Team */}
          <div style={{
            background: "#232526",
            borderRadius: "20px",
            padding: "30px",
            border: "1px solid #444"
          }}>
            <div style={{
              textAlign: "center",
              marginBottom: "25px"
            }}>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#ffb347",
                marginBottom: "8px"
              }}>
                🎓 Education and Learning
              </h2>
              <p style={{
                color: "#ccc",
                fontSize: "14px"
              }}>
                Specialized educational support and skill development
              </p>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px"
            }}>
              {agentTeams.education.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  style={{
                    display: "block",
                    padding: "16px",
                    background: "#181a1b",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "#f3f3f3",
                    transition: "all 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1f2122";
                    e.currentTarget.style.borderColor = "#555";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#181a1b";
                    e.currentTarget.style.borderColor = "#333";
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
          </div>

          {/* Product Development Team */}
          <div style={{
            background: "#232526",
            borderRadius: "20px",
            padding: "30px",
            border: "1px solid #444"
          }}>
            <div style={{
              textAlign: "center",
              marginBottom: "25px"
            }}>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#ffb347",
                marginBottom: "8px"
              }}>
                💻 Product Development
              </h2>
              <p style={{
                color: "#ccc",
                fontSize: "14px"
              }}>
                Complete software development lifecycle from strategy to delivery
              </p>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px"
            }}>
              {agentTeams.productDevelopment.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  style={{
                    display: "block",
                    padding: "16px",
                    background: "#181a1b",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "#f3f3f3",
                    transition: "all 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1f2122";
                    e.currentTarget.style.borderColor = "#555";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#181a1b";
                    e.currentTarget.style.borderColor = "#333";
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
          </div>

          {/* Operations and Infrastructure Team */}
          <div style={{
            background: "#232526",
            borderRadius: "20px",
            padding: "30px",
            border: "1px solid #444"
          }}>
            <div style={{
              textAlign: "center",
              marginBottom: "25px"
            }}>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#ffb347",
                marginBottom: "8px"
              }}>
                🔧 Operations and Infrastructure
              </h2>
              <p style={{
                color: "#ccc",
                fontSize: "14px"
              }}>
                Production operations, security, monitoring, and creative content
              </p>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "15px"
            }}>
              {agentTeams.operations.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  style={{
                    display: "block",
                    padding: "16px",
                    background: "#181a1b",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    textDecoration: "none",
                    color: "#f3f3f3",
                    transition: "all 0.2s",
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1f2122";
                    e.currentTarget.style.borderColor = "#555";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#181a1b";
                    e.currentTarget.style.borderColor = "#333";
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
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{
          textAlign: "center",
          marginTop: "40px",
          padding: "30px",
          background: "#232526",
          borderRadius: "20px",
          border: "1px solid #444"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#ffb347",
            marginBottom: "15px"
          }}>
            🔧 System Configuration
          </h3>
          <Link
            href="/api-status"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
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
            🔑 Configure API Keys & System Status
          </Link>
        </div>
      </main>
    </div>
  );
}

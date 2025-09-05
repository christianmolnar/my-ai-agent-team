"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FullStackDeveloperAgentPage() {
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
              💻 Full Stack Developer Agent
            </h1>
            <p style={{
              color: "#ccc",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Builds, maintains, and optimizes web applications with expertise across the full technology stack.
              Delivers robust, scalable solutions for both frontend and backend development.
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
                { icon: "🎨", title: "Frontend Development", desc: "React, Vue, Angular, responsive design" },
                { icon: "⚙️", title: "Backend Development", desc: "Node.js, Python, databases, APIs" },
                { icon: "🔗", title: "API Integration", desc: "RESTful and GraphQL API design" },
                { icon: "🚀", title: "Performance Optimization", desc: "Code optimization and scalability" },
                { icon: "📱", title: "Mobile Development", desc: "React Native, responsive web apps" },
                { icon: "☁️", title: "Cloud Deployment", desc: "AWS, Vercel, Docker containerization" }
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

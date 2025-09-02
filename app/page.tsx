"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState<string>("");

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      background: "linear-gradient(135deg, #181a1b 0%, #232526 100%)",
      color: "#f3f3f3",
      fontFamily: "Segoe UI, Arial, sans-serif",
      padding: 0,
      margin: 0
    }}>
      <main style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "40px",
        background: "rgba(34, 40, 49, 0.98)",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        minHeight: "600px"
      }}>
        <h1 style={{
          textAlign: "center",
          color: "#ffb347",
          letterSpacing: "1px",
          fontSize: "36px",
          marginBottom: "8px"
        }}>
          AI Agent Team - Foundation
        </h1>
        
        <p style={{
          textAlign: "center",
          color: "#ccc",
          marginBottom: "40px"
        }}>
          Bare bones infrastructure ready for agent implementation
        </p>

        <div style={{
          background: "#232526",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "30px",
          border: "1px solid #444"
        }}>
          <h2 style={{
            color: "#ffb347",
            fontSize: "20px",
            marginBottom: "16px"
          }}>
            Status
          </h2>
          <p style={{
            color: "#ccc",
            lineHeight: "1.6"
          }}>
            ✅ Next.js foundation established<br/>
            ✅ TypeScript configuration ready<br/>
            ✅ Component structure in place<br/>
            ✅ API routes directory prepared<br/>
            ✅ Agent files transferred (Phase 2)<br/>
            ✅ Major cleanup completed (Phase 3)<br/>
            🔄 API infrastructure setup (Phase 4)<br/>
            🔧 CNS development team pending
          </p>
        </div>

        <div style={{
          background: "#232526",
          borderRadius: "10px",
          padding: "20px",
          border: "1px solid #444",
          marginBottom: "30px"
        }}>
          <h2 style={{
            color: "#ffb347",
            fontSize: "20px",
            marginBottom: "16px"
          }}>
            Available Agents
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px"
          }}>
            <a href="/vinyl-info-page" style={{
              display: "block",
              padding: "12px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #333",
              textDecoration: "none",
              color: "#f3f3f3",
              textAlign: "center",
              transition: "all 0.2s"
            }}>
              Vinyl Research
            </a>
            <a href="/image-generator" style={{
              display: "block",
              padding: "12px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #333",
              textDecoration: "none",
              color: "#f3f3f3",
              textAlign: "center",
              transition: "all 0.2s"
            }}>
              Image Generator
            </a>
            <a href="/fact-checker" style={{
              display: "block",
              padding: "12px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #333",
              textDecoration: "none",
              color: "#f3f3f3",
              textAlign: "center",
              transition: "all 0.2s"
            }}>
              Fact Checker
            </a>
          </div>
        </div>

        <div style={{
          background: "#232526",
          borderRadius: "10px",
          padding: "20px",
          border: "1px solid #444",
          marginBottom: "30px"
        }}>
          <h2 style={{
            color: "#ffb347",
            fontSize: "20px",
            marginBottom: "16px"
          }}>
            🔑 Configuration & Setup
          </h2>
          <p style={{
            color: "#ccc",
            marginBottom: "16px",
            lineHeight: "1.6"
          }}>
            Your agents need API keys to function properly. Check your configuration and verify that your APIs are working.
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px"
          }}>
            <a href="/api-status" style={{
              display: "block",
              padding: "12px",
              background: "#2563eb",
              borderRadius: "8px",
              border: "1px solid #3b82f6",
              textDecoration: "none",
              color: "#ffffff",
              textAlign: "center",
              transition: "all 0.2s",
              fontWeight: "600"
            }}>
              🔍 Check API Status
            </a>
            <div style={{
              display: "block",
              padding: "12px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #333",
              color: "#ccc",
              textAlign: "center",
              fontSize: "12px"
            }}>
              Run ./setup-env.sh<br/>to configure
            </div>
          </div>
        </div>

        <div style={{
          background: "#232526",
          borderRadius: "10px",
          padding: "20px",
          border: "1px solid #444"
        }}>
          <h2 style={{
            color: "#ffb347",
            fontSize: "20px",
            marginBottom: "16px"
          }}>
            Test Message
          </h2>
          <div style={{ marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Enter a test message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                padding: "10px",
                width: "70%",
                borderRadius: "5px",
                border: "1px solid #555",
                background: "#181a1b",
                color: "#f3f3f3"
              }}
            />
            <button
              onClick={() => setMessage("")}
              style={{
                marginLeft: "10px",
                padding: "10px 20px",
                borderRadius: "5px",
                background: "#ffb347",
                color: "#000",
                border: "none",
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Clear
            </button>
          </div>
          {message && (
            <div style={{
              background: "#181a1b",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #333",
              color: "#ccc"
            }}>
              Message: {message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

"use client";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            AI Agent Team
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            A comprehensive 20-agent AI system with specialized capabilities, 
            coordinated by the Master Orchestrator for complex project delivery.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/agents" 
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              View All Agents
            </Link>
            <Link 
              href="/agents/orchestrator" 
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Master Orchestrator
            </Link>
          </div>
        </div>

        {/* Core Team Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link href="/agents/orchestrator" className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">Master Orchestrator</h3>
              <p className="text-slate-300 text-sm">Central coordination for multi-agent projects</p>
            </div>
          </Link>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20">
            <div className="text-center">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-semibold text-white mb-2">Personal Assistant</h3>
              <p className="text-slate-300 text-sm">Executive stakeholder interface and relationship management</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Project Coordinator</h3>
              <p className="text-slate-300 text-sm">Timeline management and resource allocation</p>
            </div>
          </div>
          
          <Link href="/agents/music-coach" className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all border border-white/20">
            <div className="text-center">
              <div className="text-4xl mb-4">🎹</div>
              <h3 className="text-xl font-semibold text-white mb-2">Music Coach</h3>
              <p className="text-slate-300 text-sm">Specialized music education and New Orleans piano</p>
            </div>
          </Link>
        </div>

        {/* System Architecture */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-16">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">System Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold text-white mb-3">CNS Architecture</h3>
              <p className="text-slate-300">Each agent has a Central Nervous System with Brain, Memory, Reflexes, and Integration components for intelligent behavior.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold text-white mb-3">Secure Bridge</h3>
              <p className="text-slate-300">Personal Assistant Bridge manages all API access with rate limiting, authentication, and audit logging for security.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-3">Real-time Coordination</h3>
              <p className="text-slate-300">Master Orchestrator coordinates complex multi-agent workflows with real-time status tracking and quality assurance.</p>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/agents/music-coach" className="block w-full p-3 bg-purple-600/20 text-purple-200 rounded-lg hover:bg-purple-600/30 transition-colors text-center">
                Create New Orleans Piano Masterclass
              </Link>
              <Link href="/agents/orchestrator" className="block w-full p-3 bg-blue-600/20 text-blue-200 rounded-lg hover:bg-blue-600/30 transition-colors text-center">
                Start New Project
              </Link>
              <Link href="/api-status" className="block w-full p-3 bg-green-600/20 text-green-200 rounded-lg hover:bg-green-600/30 transition-colors text-center">
                System Status
              </Link>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-semibold text-white mb-4">Agent Categories</h3>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>Core Team (Priority 1):</span>
                <span className="text-green-400">4 agents</span>
              </div>
              <div className="flex justify-between">
                <span>Supporting Team (Priority 2):</span>
                <span className="text-yellow-400">4 agents</span>
              </div>
              <div className="flex justify-between">
                <span>Specialized Team (Priority 3):</span>
                <span className="text-blue-400">12 agents</span>
              </div>
              <div className="border-t border-white/20 pt-2 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total Active Agents:</span>
                  <span className="text-white">20</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
            ✅ Core agent pages functional<br/>
            🔄 Ready for optimization (Phase 3)
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
            AI Agents
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
            marginBottom: "20px"
          }}>
            <div style={{
              display: "block",
              padding: "12px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #333",
              textAlign: "center",
              color: "#f3f3f3"
            }}>
              Communications Agent
            </div>
            <div style={{
              display: "block",
              padding: "12px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #333",
              textAlign: "center",
              color: "#f3f3f3"
            }}>
              Researcher Agent
            </div>
            <div style={{
              display: "block",
              padding: "12px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #333",
              textAlign: "center",
              color: "#f3f3f3"
            }}>
              Image and Video Generator Agent
            </div>
            <div style={{
              display: "block",
              padding: "12px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #333",
              textAlign: "center",
              color: "#f3f3f3"
            }}>
              Full Stack Developer Agent
            </div>
            <div style={{
              display: "block",
              padding: "12px",
              background: "#181a1b",
              borderRadius: "8px",
              border: "1px solid #333",
              textAlign: "center",
              color: "#f3f3f3"
            }}>
              Data Scientist Agent
            </div>
          </div>
          
          {/* API Management Navigation */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px"
          }}>
            <a href="/api-status" style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "#ffb347",
              color: "#000",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              transition: "all 0.2s"
            }}>
              🔧 Configure API Keys
            </a>
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

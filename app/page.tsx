"use client";

import { useState, useRef, useEffect } from "react";
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
  
  // User personalization
  const [userName, setUserName] = useState<string>("");
  const [showNameSetting, setShowNameSetting] = useState<boolean>(false);
  
  // Learning system state
  const [showLearningPanel, setShowLearningPanel] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>("");
  const [methodologyArea, setMethodologyArea] = useState<string>("");
  const [methodologyImprovement, setMethodologyImprovement] = useState<string>("");
  const [lastUserMessage, setLastUserMessage] = useState<string>("");
  const [lastAgentResponse, setLastAgentResponse] = useState<string>("");
  
  // Loading and performance state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [lastChanges, setLastChanges] = useState<string>("");
  
  const [chatHistory, setChatHistory] = useState<Array<{
    role: string;
    content: string;
    metadata?: {
      conversationType?: string;
      suggestedFollowUps?: string[];
      involvedAgents?: string[];
      deliverables?: string[];
      isLoading?: boolean;
    };
  }>>([
    { role: 'assistant', content: 'Hello! I\'m your Personal Assistant. I can help coordinate projects across your entire AI agent team. What would you like to work on today?' }
  ]);

  // Create ref for auto-scrolling chat
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load user name from localStorage on component mount
  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, []);

  // Save user name to localStorage when it changes
  useEffect(() => {
    if (userName.trim()) {
      localStorage.setItem('userName', userName);
    }
  }, [userName]);

  // Auto-scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Function to start a new chat
  const handleNewChat = () => {
    const greeting = userName.trim() 
      ? `Hello ${userName}! I'm your Personal Assistant. I can help coordinate projects across your entire AI agent team. What would you like to work on today?`
      : `Hello! I'm your Personal Assistant. I can help coordinate projects across your entire AI agent team. What would you like to work on today?`;
    
    setChatHistory([
      { role: 'assistant', content: greeting }
    ]);
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = message.trim();
      setChatHistory([...chatHistory, { role: 'user', content: userMessage }]);
      setMessage('');
      setIsLoading(true);
      setLoadingStage("🧠 Analyzing your request...");
      
      // Check if this relates to a project and conversation context is needed
      const needsContext = userMessage.toLowerCase().includes('project') || 
                          userMessage.toLowerCase().includes('work on') ||
                          userMessage.toLowerCase().includes('discuss') ||
                          userMessage.toLowerCase().includes('continue') ||
                          userMessage.toLowerCase().includes('what we') ||
                          userMessage.toLowerCase().includes('again') ||
                          userMessage.toLowerCase().includes('try') ||
                          userMessage.toLowerCase().includes('previous') ||
                          userMessage.toLowerCase().includes('questions') ||
                          userMessage.toLowerCase().includes('formatting') ||
                          chatHistory.length > 2; // Always include context if we have ongoing conversation
      
      // Update loading message based on whether we need context
      const contextLoadingMessage = needsContext ? 
        '🤔 Processing your request...\n\n⚙️ Loading persona context\n⚙️ Reviewing conversation history\n⚙️ Analyzing intent and complexity\n⚙️ Coordinating team response' :
        '🤔 Processing your request...\n\n⚙️ Loading persona context\n⚙️ Analyzing intent and complexity\n⚙️ Coordinating team response';
      
      // Add enhanced loading message with spinner
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: contextLoadingMessage,
        metadata: { isLoading: true }
      }]);
      
      try {
        setLoadingStage("📡 Calling Personal Assistant API...");
        
        // Call the actual Personal Assistant API
        const response = await fetch('/api/personal-assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: userMessage,
            context: needsContext ? chatHistory.filter(msg => !msg.metadata?.isLoading) : undefined,
            userName: userName.trim() || undefined
          })
        });
        
        setLoadingStage("📄 Processing response...");
        const data = await response.json();
        
        setIsLoading(false);
        setLoadingStage("");
        
        if (data.success) {
          // Track messages for learning context
          setLastUserMessage(userMessage);
          setLastAgentResponse(data.response);
          
          // Replace loading message with actual response
          setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = {
              role: 'assistant',
              content: data.response,
              metadata: {
                conversationType: data.conversationType,
                suggestedFollowUps: data.suggestedFollowUps,
                involvedAgents: data.involvedAgents,
                deliverables: data.deliverables,
                isLoading: false
              }
            };
            return newHistory;
          });
        } else {
          // Handle error
          setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = {
              role: 'assistant',
              content: `I apologize, but I encountered an error: ${data.error}. Please try again.`
            };
            return newHistory;
          });
        }
      } catch (error) {
        console.error('Error calling Personal Assistant:', error);
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = {
            role: 'assistant',
            content: 'I apologize, but I\'m having trouble connecting to my services right now. Please try again in a moment.'
          };
          return newHistory;
        });
      }
    }
  };

  // Learning system functions
  const handleSendFeedback = async () => {
    if (!feedback.trim()) return;

    try {
      const response = await fetch('/api/personal-assistant/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedback,
          context: {},
          sessionId: `session-${Date.now()}`,
          userMessage: lastUserMessage,
          agentResponse: lastAgentResponse
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setFeedback("");
        
        // Display detailed feedback impact to user
        const filesUpdated = data.learningDetails?.updatedFiles || [];
        const changes = data.learningDetails?.changes || [];
        
        const impactMessage = `✅ **Feedback processed successfully!**

📊 **Learning Impact Details:**
• **${changes.length}** specific improvements captured
• **${filesUpdated.length}** CNS brain files updated
• **Applied to:** ${data.learningDetails?.appliedTo || 'Future conversations'}
• **Confidence boost:** ${data.learningDetails?.confidenceBoost || 'Moderate improvement'}

📁 **Updated Files:**
${filesUpdated.map(file => `• ${file}`).join('\n')}

🧠 **Changes Applied:**
${changes.map((change, i) => `${i + 1}. ${change}`).join('\n')}

Thank you for helping me learn and improve! These changes will be applied to all future responses.`;
        
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: impactMessage,
          metadata: {
            conversationType: 'feedback-confirmation',
            suggestedFollowUps: ['Continue our conversation', 'Ask about my learning progress']
          }
        }]);
        
      } else {
        alert('Failed to send feedback: ' + data.error);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('Error sending feedback');
    }
  };

  const handleUpdateMethodology = async () => {
    if (!methodologyArea.trim() || !methodologyImprovement.trim()) return;

    try {
      const response = await fetch('/api/personal-assistant/methodology', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          area: methodologyArea,
          improvement: methodologyImprovement
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMethodologyArea("");
        setMethodologyImprovement("");
        alert(`Methodology updated for area: ${data.area}`);
      } else {
        alert('Failed to update methodology: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating methodology:', error);
      alert('Error updating methodology');
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #181a1b 0%, #232526 100%)",
      padding: "20px"
    }}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      
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

          {/* User Name Input */}
          <div style={{
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <label style={{
              color: "#ffb347",
              fontSize: "14px",
              fontWeight: "500"
            }}>
              Your Name:
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name (optional)"
              style={{
                background: "#1a1b1c",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "8px 12px",
                color: "#fff",
                fontSize: "14px",
                flex: "1",
                maxWidth: "200px"
              }}
            />
            {userName && (
              <span style={{
                color: "#90EE90",
                fontSize: "12px"
              }}>
                ✓ Saved
              </span>
            )}
          </div>

          {/* Chat History */}
          <div ref={chatContainerRef} style={{
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            padding: "20px",
            marginBottom: "20px",
            height: "600px",
            overflowY: "auto",
            scrollBehavior: "smooth"
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
                    lineHeight: "1.5",
                    // Add special styling for loading messages
                    ...(msg.metadata?.isLoading && {
                      background: "linear-gradient(135deg, #232526 0%, #2a2d2e 100%)",
                      border: "1px solid #ffb347",
                      animation: "pulse 1.5s ease-in-out infinite"
                    })
                  }}>
                    {/* Add loading spinner for loading messages */}
                    {msg.metadata?.isLoading && (
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "8px"
                      }}>
                        <div style={{
                          width: "20px",
                          height: "20px",
                          border: "2px solid #555",
                          borderTop: "2px solid #ffb347",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite"
                        }}></div>
                        <span style={{ color: "#ffb347", fontWeight: "600" }}>Processing...</span>
                      </div>
                    )}
                    
                    {/* Render content with proper line breaks */}
                    {msg.content.split('\n').map((line, i) => (
                      line.trim() ? <div key={i} style={{ marginBottom: line.startsWith('•') || line.match(/^\d+\./) ? '4px' : '8px' }}>
                        {line}
                      </div> : <br key={i} />
                    ))}
                    
                    {/* Show metadata for assistant responses */}
                    {msg.role === 'assistant' && msg.metadata && (
                      <div style={{
                        marginTop: "10px",
                        paddingTop: "10px",
                        borderTop: "1px solid #444",
                        fontSize: "12px",
                        color: "#aaa"
                      }}>
                        {msg.metadata.conversationType && (
                          <div>Type: <span style={{ color: "#ffb347" }}>{msg.metadata.conversationType}</span></div>
                        )}
                        {msg.metadata.involvedAgents && msg.metadata.involvedAgents.length > 0 && (
                          <div>Agents: <span style={{ color: "#ffb347" }}>{msg.metadata.involvedAgents.join(', ')}</span></div>
                        )}
                        {msg.metadata.suggestedFollowUps && msg.metadata.suggestedFollowUps.length > 0 && (
                          <details style={{ marginTop: "5px" }}>
                            <summary style={{ cursor: "pointer", color: "#ffb347" }}>Follow-up suggestions</summary>
                            <ul style={{ marginLeft: "20px", marginTop: "5px" }}>
                              {msg.metadata.suggestedFollowUps.map((followUp, i) => (
                                <li key={i} style={{ marginBottom: "2px" }}>{followUp}</li>
                              ))}
                            </ul>
                          </details>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: message.trim() ? "pointer" : "not-allowed",
                fontWeight: "600",
                fontSize: "18px",
                background: message.trim() ? "#ffb347" : "#555",
                color: message.trim() ? "#000" : "#ccc",
                transition: "all 0.2s",
                minWidth: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              title="Send message to Personal Assistant"
              onMouseOver={(e) => {
                if (message.trim()) {
                  e.currentTarget.style.background = "#ffa500";
                }
              }}
              onMouseOut={(e) => {
                if (message.trim()) {
                  e.currentTarget.style.background = "#ffb347";
                }
              }}
            >
              💬
            </button>
            <button
              onClick={handleNewChat}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #555",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                background: "#232526",
                color: "#f3f3f3",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
              title="Start a new conversation"
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#2a2d2e";
                e.currentTarget.style.borderColor = "#777";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#232526";
                e.currentTarget.style.borderColor = "#555";
              }}
            >
              🔄 New Chat
            </button>
            <button
              onClick={() => setShowLearningPanel(!showLearningPanel)}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "1px solid #555",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                background: showLearningPanel ? "#ffb347" : "#232526",
                color: showLearningPanel ? "#000" : "#f3f3f3",
                transition: "all 0.2s",
                whiteSpace: "nowrap"
              }}
              title="Open learning system controls"
              onMouseOver={(e) => {
                if (!showLearningPanel) {
                  e.currentTarget.style.background = "#2a2d2e";
                  e.currentTarget.style.borderColor = "#777";
                }
              }}
              onMouseOut={(e) => {
                if (!showLearningPanel) {
                  e.currentTarget.style.background = "#232526";
                  e.currentTarget.style.borderColor = "#555";
                }
              }}
            >
              🧠 Learning
            </button>
          </div>
        </div>

        {/* Learning Panel */}
        {showLearningPanel && (
          <div style={{
            background: "#232526",
            borderRadius: "15px",
            padding: "25px",
            border: "1px solid #444",
            marginTop: "20px"
          }}>
            <h3 style={{
              color: "#ffb347",
              marginBottom: "20px",
              fontSize: "24px",
              fontWeight: "600"
            }}>
              🧠 Agent Learning System
            </h3>
            
            {/* Feedback Section */}
            <div style={{ marginBottom: "30px" }}>
              <h4 style={{
                color: "#f3f3f3",
                marginBottom: "10px",
                fontSize: "18px"
              }}>
                Provide Feedback on My Response
              </h4>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell me how I can improve my last response..."
                style={{
                  width: "100%",
                  height: "100px",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "1px solid #555",
                  background: "#1a1c1d",
                  color: "#f3f3f3",
                  fontSize: "16px",
                  resize: "vertical",
                  marginBottom: "10px"
                }}
              />
              <button
                onClick={handleSendFeedback}
                disabled={!feedback.trim()}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: feedback.trim() ? "pointer" : "not-allowed",
                  fontWeight: "600",
                  fontSize: "14px",
                  background: feedback.trim() ? "#ffb347" : "#555",
                  color: feedback.trim() ? "#000" : "#ccc",
                  transition: "all 0.2s"
                }}
              >
                📤 Send Feedback
              </button>
            </div>

            {/* Methodology Update Section */}
            <div>
              <h4 style={{
                color: "#f3f3f3",
                marginBottom: "10px",
                fontSize: "18px"
              }}>
                Teach Me New Behavior
              </h4>
              <input
                value={methodologyArea}
                onChange={(e) => setMethodologyArea(e.target.value)}
                placeholder="Area to improve (e.g. 'question-asking', 'project-scoping')"
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  border: "1px solid #555",
                  background: "#1a1c1d",
                  color: "#f3f3f3",
                  fontSize: "16px",
                  marginBottom: "10px"
                }}
              />
              <textarea
                value={methodologyImprovement}
                onChange={(e) => setMethodologyImprovement(e.target.value)}
                placeholder="How should I improve in this area? (e.g. 'Always ask 3-5 clarifying questions before starting complex projects')"
                style={{
                  width: "100%",
                  height: "80px",
                  padding: "15px",
                  borderRadius: "10px",
                  border: "1px solid #555",
                  background: "#1a1c1d",
                  color: "#f3f3f3",
                  fontSize: "16px",
                  resize: "vertical",
                  marginBottom: "10px"
                }}
              />
              <button
                onClick={handleUpdateMethodology}
                disabled={!methodologyArea.trim() || !methodologyImprovement.trim()}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: (methodologyArea.trim() && methodologyImprovement.trim()) ? "pointer" : "not-allowed",
                  fontWeight: "600",
                  fontSize: "14px",
                  background: (methodologyArea.trim() && methodologyImprovement.trim()) ? "#4CAF50" : "#555",
                  color: (methodologyArea.trim() && methodologyImprovement.trim()) ? "#fff" : "#ccc",
                  transition: "all 0.2s"
                }}
              >
                🎓 Update Methodology
              </button>
            </div>
          </div>
        )}

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

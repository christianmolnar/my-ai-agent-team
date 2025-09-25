"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import LearningFeedback from "../components/learning/LearningFeedback";
import RealTimeLoggingPanel from "../components/RealTimeLoggingPanel";

// Function to convert markdown-like formatting to HTML
const formatMessageContent = (content: string) => {
  if (!content) return content;
  
  let formatted = content;
  
  // Remove or reduce headings - convert ### to just bold text instead
  formatted = formatted.replace(/^### (.+)$/gm, '<strong style="font-weight: 600; color: #ffb347; display: block; margin: 4px 0 2px 0;">$1:</strong>');
  
  // Convert **bold** to <strong>
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #ffb347;">$1</strong>');
  
  // BEFORE bullet conversion, group consecutive bullets and clean spacing between them
  formatted = formatted.replace(/(^• .+$(\n• .+$)*)/gm, (match) => {
    // Remove line breaks between consecutive bullet points
    const cleanBullets = match.replace(/\n(?=• )/g, '\n');
    return cleanBullets;
  });
  
  // Convert • bullet points to proper list items with zero spacing
  formatted = formatted.replace(/^• (.+)$/gm, '<div style="margin: 0; padding-left: 12px; position: relative; line-height: 1.4;"><span style="position: absolute; left: 0; color: #ffb347;">•</span>$1</div>');
  
  // Convert numbered lists (1. 2. 3. etc) with zero spacing
  formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '<div style="margin: 0; padding-left: 16px; position: relative; line-height: 1.4;"><span style="position: absolute; left: 0; color: #ffb347; font-weight: 600;">$1.</span>$2</div>');
  
  // Aggressively clean up line breaks - remove excessive spacing
  formatted = formatted.replace(/\n{4,}/g, '\n\n');
  formatted = formatted.replace(/\n{3}/g, '\n\n');
  
  // Special cleanup: Remove extra line breaks around bullet lists
  formatted = formatted.replace(/\n+(<div style="margin: 0; padding-left: 12px[^>]*>)/g, '\n$1');
  formatted = formatted.replace(/(<\/div>)\n+(?=<div style="margin: 0; padding-left: 12px)/g, '$1\n');
  
  // Convert double line breaks to minimal paragraph breaks
  formatted = formatted.replace(/\n\n/g, '</p><p style="margin: 2px 0; line-height: 1.5;">');
  
  // Convert single line breaks to minimal breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Clean up excessive <br> tags more aggressively, especially around bullet lists
  formatted = formatted.replace(/(<br>\s*){3,}/g, '<br>');
  formatted = formatted.replace(/(<br>\s*){2}/g, '<br>');
  formatted = formatted.replace(/<br>(?=<div style="margin: 0; padding-left: 12px)/g, '');
  formatted = formatted.replace(/(<\/div>)<br>/g, '$1');
  
  // Wrap in paragraph tags with minimal margins
  formatted = `<div style="line-height: 1.5;">${formatted}</div>`;
  
  return formatted;
};

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
  const [newBehavior, setNewBehavior] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [pendingLearningId, setPendingLearningId] = useState<string | null>(null);
  const [showLearningHistory, setShowLearningHistory] = useState<boolean>(false);
  const [showInteractionLogs, setShowInteractionLogs] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Ref for auto-resizing textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Log when showInteractionLogs changes (can be removed in production)
  useEffect(() => {
    if (showInteractionLogs) {
      console.log('Interaction Logs opened');
    }
  }, [showInteractionLogs]);
  const [chatHistory, setChatHistory] = useState<Array<{
    role: string;
    content: string;
    metadata?: {
      conversationType?: string;
      suggestedFollowUps?: string[];
      involvedAgents?: string[];
      deliverables?: string[];
    };
  }>>([
    { role: 'assistant', content: 'Hello! I\'m your Personal Assistant. I can help coordinate projects across your entire AI agent team. What would you like to work on today?' }
  ]);

  // Create ref for auto-scrolling chat
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Function to start a new chat
  const handleNewChat = () => {
    setChatHistory([
      { role: 'assistant', content: 'Hello! I\'m your Personal Assistant. I can help coordinate projects across your entire AI agent team. What would you like to work on today?' }
    ]);
    setSessionId(null); // Reset session ID for new chat
  };

  // Handle teaching new behavior
  const handleTeachBehavior = async () => {
    if (!newBehavior.trim()) {
      alert('Please describe the behavior you want me to learn.');
      return;
    }

    try {
      const response = await fetch('/api/personal-assistant/methodology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: 'behavior-modification',
          improvement: newBehavior.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        
        // If we got a learning ID, set it for feedback
        if (data.learningId) {
          setPendingLearningId(data.learningId);
        }
        
        setNewBehavior('');
      } else {
        alert(`❌ Failed to teach behavior: ${data.error}`);
      }
    } catch (error) {
      console.error('Error teaching behavior:', error);
      alert('❌ Error teaching behavior. Please try again.');
    }
  };

  // Handle sending feedback
  const handleSendFeedback = async () => {
    if (!feedback.trim()) {
      alert('Please provide your feedback.');
      return;
    }

    try {
      const response = await fetch('/api/personal-assistant/methodology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area: 'performance-feedback',
          improvement: feedback.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        
        // If we got a learning ID, set it for feedback
        if (data.learningId) {
          setPendingLearningId(data.learningId);
        }
        
        setFeedback('');
      } else {
        alert(`❌ Failed to send feedback: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('❌ Error sending feedback. Please try again.');
    }
  };

  // Auto-resize textarea function
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  // Handle learning feedback submission
  const handleLearningFeedback = (learningId: string, action: 'internalize' | 'forget') => {
    console.log(`Learning ${learningId} ${action}d`);
    
    // Clear pending learning ID if it matches
    if (pendingLearningId === learningId) {
      setPendingLearningId(null);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage = message.trim();
      setChatHistory([...chatHistory, { role: 'user', content: userMessage }]);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
      
      // Add loading message
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: '🤔 Thinking...' 
      }]);
      
      try {
        // Call the actual Personal Assistant API with conversation history
        const response = await fetch('/api/personal-assistant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: userMessage,
            conversationHistory: chatHistory.filter(msg => msg.role !== 'assistant' || !msg.content.includes('🤔 Thinking...')),
            sessionId: sessionId
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Store session ID for future requests
          if (data.sessionId && !sessionId) {
            setSessionId(data.sessionId);
            console.log(`📋 Session started: ${data.sessionId}`);
          }
          
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
                deliverables: data.deliverables
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

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #181a1b 0%, #232526 100%)",
      padding: "20px"
    }}>
      {/* Navigation Bar */}
      <nav style={{
        maxWidth: "1400px",
        margin: "0 auto 20px auto",
        background: "rgba(35, 37, 38, 0.8)",
        borderRadius: "15px",
        padding: "15px 25px",
        paddingRight: "200px", // More space to move deliverables button further left
        border: "1px solid #444",
        backdropFilter: "blur(10px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#ffb347"
        }}>
          {/* Removed duplicate AI Agent Team title */}
        </div>
        <div style={{
          display: "flex",
          gap: "20px",
          alignItems: "center"
        }}>
          <Link 
            href="/api-status" 
            target="_blank"
            style={{
              background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
              color: "#181a1b",
              textDecoration: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            🔧 API Status
          </Link>
          <Link 
            href="/deliverables" 
            target="_blank"
            style={{
              background: "linear-gradient(135deg, #ffb347 0%, #ff8c42 100%)",
              color: "#181a1b",
              textDecoration: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            📋 View Deliverables
          </Link>
        </div>
      </nav>

      <main style={{
        maxWidth: "1400px",
        margin: "0 auto",
        color: "#f3f3f3",
        fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif"
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
            AI Agent Team
          </h1>
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
                    lineHeight: "1.5"
                  }}>
                    <div 
                      dangerouslySetInnerHTML={{
                        __html: formatMessageContent(msg.content)
                      }}
                    />
                    
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
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <textarea
              ref={textareaRef}
              placeholder="What project or task do you need help with?"
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "#181a1b",
                border: "1px solid #555",
                borderRadius: "8px",
                color: "#f3f3f3",
                fontSize: "14px",
                minHeight: "44px",
                maxHeight: "120px",
                resize: "none",
                overflow: "auto",
                fontFamily: "inherit",
                lineHeight: "1.4"
              }}
              rows={1}
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
          </div>
        </div>

        {/* Teach Me New Behaviors & Feedback Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>
          {/* Teach Me New Behaviors */}
          <div style={{
            background: "#232526",
            borderRadius: "10px",
            border: "1px solid #444",
            padding: "20px"
          }}>
            <h3 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "10px",
              textAlign: "center"
            }}>
              🧠 Teach Me New Behaviors
            </h3>
            <p style={{
              color: "#ccc",
              fontSize: "14px",
              textAlign: "center",
              marginBottom: "15px",
              lineHeight: "1.4"
            }}>
              Help me learn new ways to assist you better.
            </p>
            <textarea
              value={newBehavior}
              onChange={(e) => setNewBehavior(e.target.value)}
              style={{
                width: "100%",
                height: "80px",
                background: "#181a1b",
                border: "1px solid #555",
                borderRadius: "8px",
                color: "#f3f3f3",
                fontSize: "14px",
                padding: "12px",
                marginBottom: "15px",
                resize: "vertical",
                fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
                outline: "none"
              }}
              placeholder="Describe a new behavior or skill you'd like me to learn..."
            />
            <button 
              onClick={handleTeachBehavior}
              disabled={!newBehavior.trim()}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: newBehavior.trim() ? "#ffb347" : "#666",
                border: "none",
                borderRadius: "8px",
                color: newBehavior.trim() ? "#000" : "#ccc",
                fontSize: "14px",
                fontWeight: "600",
                cursor: newBehavior.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                if (newBehavior.trim()) {
                  e.currentTarget.style.background = "#ffa500";
                }
              }}
              onMouseOut={(e) => {
                if (newBehavior.trim()) {
                  e.currentTarget.style.background = "#ffb347";
                }
              }}
            >
              Teach Behavior
            </button>
          </div>

          {/* Provide Feedback */}
          <div style={{
            background: "#232526",
            borderRadius: "10px",
            border: "1px solid #444",
            padding: "20px"
          }}>
            <h3 style={{
              color: "#ffb347",
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "10px",
              textAlign: "center"
            }}>
              🗣️ Provide Feedback
            </h3>
            <p style={{
              color: "#ccc",
              fontSize: "14px",
              textAlign: "center",
              marginBottom: "15px",
              lineHeight: "1.4"
            }}>
              Your feedback helps me improve my performance.
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={{
                width: "100%",
                height: "80px",
                background: "#181a1b",
                border: "1px solid #555",
                borderRadius: "8px",
                color: "#f3f3f3",
                fontSize: "14px",
                padding: "12px",
                marginBottom: "15px",
                resize: "vertical",
                fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
                outline: "none"
              }}
              placeholder="What did I do well? What could I do better?"
            />
            <button 
              onClick={handleSendFeedback}
              disabled={!feedback.trim()}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: feedback.trim() ? "#ffb347" : "#666",
                border: "none",
                borderRadius: "8px",
                color: feedback.trim() ? "#000" : "#ccc",
                fontSize: "14px",
                fontWeight: "600",
                cursor: feedback.trim() ? "pointer" : "not-allowed",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                if (feedback.trim()) {
                  e.currentTarget.style.background = "#ffa500";
                }
              }}
              onMouseOut={(e) => {
                if (feedback.trim()) {
                  e.currentTarget.style.background = "#ffb347";
                }
              }}
            >
              Send Feedback
            </button>
          </div>
        </div>

        {/* Learning Management Section */}
        <div style={{ marginBottom: "30px" }}>
          {/* Pending Learning Feedback */}
          {pendingLearningId && (
            <LearningFeedback 
              learningId={pendingLearningId}
              onFeedbackSubmitted={handleLearningFeedback}
            />
          )}
          
          {/* Learning History Toggle */}
          <div style={{
            background: "#232526",
            borderRadius: "10px",
            border: "1px solid #444",
            padding: "20px",
            marginTop: pendingLearningId ? "20px" : "0"
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: showLearningHistory ? "20px" : "0"
            }}>
              <h3 style={{
                color: "#ffb347",
                fontSize: "18px",
                fontWeight: "600",
                margin: 0
              }}>
                📚 Learning Management
              </h3>
              <button 
                onClick={() => setShowLearningHistory(!showLearningHistory)}
                style={{
                  padding: "8px 16px",
                  background: showLearningHistory ? "#ff6b6b" : "#ffb347",
                  border: "none",
                  borderRadius: "6px",
                  color: "#000",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = showLearningHistory ? "#ff5252" : "#ffa500";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = showLearningHistory ? "#ff6b6b" : "#ffb347";
                }}
              >
                {showLearningHistory ? "Hide History" : "Show History"}
              </button>
            </div>
            
            {showLearningHistory && (
              <LearningFeedback 
                showHistory={true}
                onFeedbackSubmitted={handleLearningFeedback}
              />
            )}
          </div>
        </div>

        {/* Agent Team Sections */}
        <div style={{ marginBottom: "30px" }}>
          {Object.entries(agentTeams).map(([teamName, agents]) => (
            <div key={teamName} style={{ marginBottom: "30px" }}>
              <h2 style={{
                color: "#ffb347",
                fontSize: "24px",
                fontWeight: "600",
                marginBottom: "20px"
              }}>
                {teamName === 'management' && '🏛️'}
                {teamName === 'education' && '🎓'}
                {teamName === 'productDevelopment' && '💻'}
                {teamName === 'operations' && '🔧'}
                {` ${teamName.charAt(0).toUpperCase() + teamName.slice(1).replace(/([A-Z])/g, ' $1')}`}
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px"
              }}>
                {agents.map(agent => (
                  <Link 
                    key={agent.id} 
                    href={`/agents/${agent.id}`} 
                    style={{
                      display: "block",
                      padding: "20px",
                      background: "#232526",
                      borderRadius: "10px",
                      border: "1px solid #444",
                      textDecoration: "none",
                      color: "inherit",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = "#2a2d2e";
                      e.currentTarget.style.borderColor = "#555";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = "#232526";
                      e.currentTarget.style.borderColor = "#444";
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "10px"
                    }}>
                      <span style={{ fontSize: "24px" }}>{agent.emoji}</span>
                      <h3 style={{
                        color: "#ffb347",
                        fontSize: "16px",
                        fontWeight: "600",
                        margin: 0
                      }}>
                        {agent.name}
                      </h3>
                    </div>
                    <p style={{
                      color: "#ccc",
                      fontSize: "14px",
                      margin: 0,
                      lineHeight: "1.4"
                    }}>
                      {agent.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Real-Time Agent Coordination Logs */}
        <RealTimeLoggingPanel 
          isVisible={showInteractionLogs}
          onToggle={() => setShowInteractionLogs(!showInteractionLogs)}
        />
      </main>
    </div>
  );
}

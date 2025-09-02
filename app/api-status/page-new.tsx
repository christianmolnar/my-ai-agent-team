"use client";

import { useState, useEffect } from "react";

interface ApiKeyConfig {
  envVar: string;
  displayName: string;
  provider: string;
  required: boolean;
  configured: boolean;
}

interface AgentConfig {
  name: string;
  description: string;
  requiredApis: ApiKeyConfig[];
}

interface ApiRowData extends ApiKeyConfig {
  agentName: string;
  agentDescription: string;
}

export default function ApiStatusPage() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ApiKeyConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Define agent configurations with unique API keys per agent
  const agentConfigs: AgentConfig[] = [
    {
      name: "Communications Agent",
      description: "Handles email, messaging, and communication tasks",
      requiredApis: [
        { envVar: "COMMUNICATIONS_OPENAI_API_KEY", displayName: "OpenAI API", provider: "openai", required: true, configured: false },
        { envVar: "COMMUNICATIONS_ANTHROPIC_API_KEY", displayName: "Anthropic API", provider: "anthropic", required: false, configured: false }
      ]
    },
    {
      name: "Research Agent", 
      description: "Performs web research and data analysis",
      requiredApis: [
        { envVar: "RESEARCH_OPENAI_API_KEY", displayName: "OpenAI API", provider: "openai", required: true, configured: false },
        { envVar: "RESEARCH_PERPLEXITY_API_KEY", displayName: "Perplexity API", provider: "perplexity", required: true, configured: false },
        { envVar: "RESEARCH_GOOGLE_AI_API_KEY", displayName: "Google AI API", provider: "google", required: false, configured: false }
      ]
    },
    {
      name: "Creative Agent",
      description: "Generates creative content, images, and designs", 
      requiredApis: [
        { envVar: "CREATIVE_OPENAI_API_KEY", displayName: "OpenAI API", provider: "openai", required: true, configured: false },
        { envVar: "CREATIVE_STABILITY_API_KEY", displayName: "Stability AI API", provider: "stability", required: true, configured: false },
        { envVar: "CREATIVE_ANTHROPIC_API_KEY", displayName: "Anthropic API", provider: "anthropic", required: false, configured: false }
      ]
    },
    {
      name: "Code Agent",
      description: "Assists with programming and development tasks",
      requiredApis: [
        { envVar: "CODE_OPENAI_API_KEY", displayName: "OpenAI API", provider: "openai", required: true, configured: false },
        { envVar: "CODE_ANTHROPIC_API_KEY", displayName: "Anthropic API", provider: "anthropic", required: true, configured: false },
        { envVar: "CODE_TOGETHER_API_KEY", displayName: "Together API", provider: "together", required: false, configured: false }
      ]
    },
    {
      name: "Analysis Agent",
      description: "Performs data analysis and provides insights",
      requiredApis: [
        { envVar: "ANALYSIS_OPENAI_API_KEY", displayName: "OpenAI API", provider: "openai", required: true, configured: false },
        { envVar: "ANALYSIS_COHERE_API_KEY", displayName: "Cohere API", provider: "cohere", required: false, configured: false }
      ]
    }
  ];

  // Flatten agent configs to create table rows
  const allApiRequirements: ApiRowData[] = agentConfigs.flatMap(agent =>
    agent.requiredApis.map(api => ({
      ...api,
      agentName: agent.name,
      agentDescription: agent.description
    }))
  );

  // Load API keys from localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem('ai-agent-api-keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys(parsed);
      } catch (e) {
        console.error('Failed to parse saved API keys:', e);
      }
    }
    setLoading(false);
    
    // Load status on component mount
    checkApiStatus();
  }, []);

  const saveApiKeys = (keys: Record<string, string>) => {
    localStorage.setItem('ai-agent-api-keys', JSON.stringify(keys));
    setHasUnsavedChanges(false);
  };

  const handleApiKeyChange = (envVar: string, value: string) => {
    const newKeys = { ...apiKeys, [envVar]: value };
    setApiKeys(newKeys);
    setHasUnsavedChanges(true);
    
    // Auto-save after a short delay
    setTimeout(() => {
      saveApiKeys(newKeys);
    }, 500);
  };

  const handleSaveAll = () => {
    saveApiKeys(apiKeys);
  };

  const checkApiStatus = async () => {
    setIsCheckingStatus(true);
    setError(null);
    
    try {
      const response = await fetch('/api/verify-api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiKeys),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setStatus(result.results || []);
      
      if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error checking API status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const getApiStatus = (envVar: string) => {
    const apiKey = apiKeys[envVar];
    const statusItem = status.find(s => s.envVar === envVar);
    
    if (!apiKey) {
      return { icon: '❌', status: 'No Key' };
    }
    if (!statusItem) {
      return { icon: '⏸️', status: 'Not Checked' };
    }
    return statusItem.configured 
      ? { icon: '✅', status: 'Connected' }
      : { icon: '🔴', status: 'Invalid' };
  };

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
          <p style={{ color: "#ffb347", fontSize: "18px" }}>Loading API configurations...</p>
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
          <a 
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
          </a>
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
              🤖 AI Agent API Management
            </h1>
            <p style={{
              color: "#ccc",
              fontSize: "16px"
            }}>
              Configure API keys for each agent and monitor connectivity
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              background: "rgba(220, 38, 38, 0.1)",
              border: "1px solid rgba(220, 38, 38, 0.3)",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}>
              <span style={{ fontSize: "20px" }}>⚠️</span>
              <p style={{ color: "#f87171", margin: 0 }}>
                Error checking API status: {error}
              </p>
            </div>
          )}

          {/* Controls */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
            padding: "15px",
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            flexWrap: "wrap",
            gap: "15px"
          }}>
            <div style={{ fontSize: "14px", color: "#ccc" }}>
              <span style={{ color: "#ffb347", fontWeight: "600" }}>💡 Auto-Save:</span> API keys are automatically saved as you type
              {hasUnsavedChanges && (
                <span style={{ marginLeft: "15px", color: "#ffb347", fontWeight: "600" }}>
                  ⚠️ You have unsaved changes
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSaveAll}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
                  fontWeight: "600",
                  fontSize: "14px",
                  background: hasUnsavedChanges ? "#ffb347" : "#555",
                  color: hasUnsavedChanges ? "#000" : "#999",
                  opacity: hasUnsavedChanges ? 1 : 0.6
                }}
                disabled={!hasUnsavedChanges}
              >
                💾 Save All
              </button>
              <button
                onClick={checkApiStatus}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: isCheckingStatus ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  background: "#3b82f6",
                  color: "#fff"
                }}
                disabled={isCheckingStatus}
              >
                {isCheckingStatus ? '🔄 Checking...' : '🔍 Refresh Status'}
              </button>
            </div>
          </div>

          {/* API Management Table */}
          <div style={{
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333",
            overflow: "hidden"
          }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse"
            }}>
              <thead>
                <tr style={{
                  background: "#2a2d2e",
                  borderBottom: "2px solid #444"
                }}>
                  <th style={{
                    padding: "15px 12px",
                    textAlign: "left",
                    color: "#ffb347",
                    fontWeight: "600",
                    borderRight: "1px solid #444"
                  }}>Agent</th>
                  <th style={{
                    padding: "15px 12px",
                    textAlign: "left",
                    color: "#ffb347",
                    fontWeight: "600",
                    borderRight: "1px solid #444"
                  }}>API Service</th>
                  <th style={{
                    padding: "15px 12px",
                    textAlign: "left",
                    color: "#ffb347",
                    fontWeight: "600",
                    borderRight: "1px solid #444"
                  }}>Provider</th>
                  <th style={{
                    padding: "15px 12px",
                    textAlign: "left",
                    color: "#ffb347",
                    fontWeight: "600",
                    borderRight: "1px solid #444"
                  }}>Status</th>
                  <th style={{
                    padding: "15px 12px",
                    textAlign: "left",
                    color: "#ffb347",
                    fontWeight: "600",
                    borderRight: "1px solid #444"
                  }}>Required</th>
                  <th style={{
                    padding: "15px 12px",
                    textAlign: "left",
                    color: "#ffb347",
                    fontWeight: "600",
                    borderRight: "1px solid #444"
                  }}>API Key</th>
                  <th style={{
                    padding: "15px 12px",
                    textAlign: "left",
                    color: "#ffb347",
                    fontWeight: "600"
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allApiRequirements.map((api, index) => {
                  const apiStatus = getApiStatus(api.envVar);
                  return (
                    <tr 
                      key={`${api.agentName}-${api.envVar}`}
                      style={{
                        borderBottom: index < allApiRequirements.length - 1 ? "1px solid #333" : "none"
                      }}
                    >
                      <td style={{
                        padding: "12px",
                        borderRight: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <div style={{
                          fontWeight: "600",
                          color: "#f3f3f3",
                          fontSize: "14px"
                        }}>
                          {api.agentName}
                        </div>
                      </td>
                      <td style={{
                        padding: "12px",
                        borderRight: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <div style={{ fontSize: "14px", color: "#f3f3f3", fontWeight: "500" }}>
                          {api.displayName}
                        </div>
                        <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                          {api.envVar}
                        </div>
                      </td>
                      <td style={{
                        padding: "12px",
                        borderRight: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          background: "#2563eb",
                          color: "#fff",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "600",
                          textTransform: "uppercase"
                        }}>
                          {api.provider}
                        </span>
                      </td>
                      <td style={{
                        padding: "12px",
                        borderRight: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "16px" }}>{apiStatus.icon}</span>
                          <span style={{ fontSize: "13px", color: "#ccc" }}>{apiStatus.status}</span>
                        </div>
                      </td>
                      <td style={{
                        padding: "12px",
                        borderRight: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          background: api.required ? "#dc2626" : "#16a34a",
                          color: "#fff",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "600"
                        }}>
                          {api.required ? 'Required' : 'Optional'}
                        </span>
                      </td>
                      <td style={{
                        padding: "12px",
                        borderRight: "1px solid #333",
                        verticalAlign: "top"
                      }}>
                        <input
                          type="password"
                          placeholder={`Enter ${api.displayName} key...`}
                          value={apiKeys[api.envVar] || ''}
                          onChange={(e) => handleApiKeyChange(api.envVar, e.target.value)}
                          onBlur={() => saveApiKeys(apiKeys)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Tab') {
                              saveApiKeys(apiKeys);
                            }
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            background: "#232526",
                            border: "1px solid #555",
                            borderRadius: "4px",
                            color: "#f3f3f3",
                            fontSize: "13px"
                          }}
                        />
                      </td>
                      <td style={{
                        padding: "12px",
                        verticalAlign: "top"
                      }}>
                        <button
                          onClick={() => {
                            handleApiKeyChange(api.envVar, '');
                            saveApiKeys({ ...apiKeys, [api.envVar]: '' });
                          }}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "4px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "12px",
                            background: "#dc2626",
                            color: "#fff"
                          }}
                          title="Clear API key"
                        >
                          🗑️ Clear
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Instructions */}
          <div style={{
            marginTop: "25px",
            padding: "20px",
            background: "#181a1b",
            borderRadius: "10px",
            border: "1px solid #333"
          }}>
            <h3 style={{
              color: "#ffb347",
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "15px"
            }}>
              📋 How Saving Works:
            </h3>
            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: "13px",
              lineHeight: "1.6",
              color: "#ccc"
            }}>
              <li style={{ marginBottom: "8px" }}>
                • <strong style={{ color: "#ffb347" }}>Auto-save on blur:</strong> Keys are saved when you click outside the input field
              </li>
              <li style={{ marginBottom: "8px" }}>
                • <strong style={{ color: "#ffb347" }}>Save on Tab/Enter:</strong> Press Tab or Enter to save immediately
              </li>
              <li style={{ marginBottom: "8px" }}>
                • <strong style={{ color: "#ffb347" }}>Manual save:</strong> Click the "Save All" button to save all changes at once
              </li>
              <li style={{ marginBottom: "8px" }}>
                • <strong style={{ color: "#ffb347" }}>Status checking:</strong> Click "Refresh Status" to verify connectivity
              </li>
              <li>
                • <strong style={{ color: "#ffb347" }}>Local storage:</strong> Keys are stored in your browser and ready for .env.local
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

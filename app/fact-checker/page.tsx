"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function FactCheckerPage() {
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    document.body.style.background = "linear-gradient(135deg, #181a1b 0%, #232526 100%)";
    document.body.style.color = "#f3f3f3";
    document.body.style.fontFamily = "Segoe UI, Arial, sans-serif";
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
      document.body.style.fontFamily = "";
    };
  }, []);

  async function handleFactCheck(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      console.log('Sending fact-check request for:', claim);
      const response = await axios.post("/api/rss-test", { query: claim });
      console.log('RSS fact-check API response:', response.data);
      setResult(response.data);
    } catch (error) {
      console.error("Error fetching RSS fact-check results:", error);
      setResult({ error: "Failed to fetch fact-check results. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      padding: "20px",
      background: "linear-gradient(135deg, #181a1b 0%, #232526 100%)",
      color: "#f3f3f3",
      fontFamily: "Segoe UI, Arial, sans-serif"
    }}>
      <main style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: 32,
        background: "rgba(34, 40, 49, 0.98)",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        minHeight: 600,
      }}>
        <h1 style={{
          textAlign: "center",
          color: "#ffb347",
          letterSpacing: 1,
        }}>
          RSS-Based Fact Checker
        </h1>
        
        <form onSubmit={handleFactCheck} style={{
          marginBottom: 32,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}>
          <input
            type="text"
            placeholder="Enter a claim or URL to fact-check"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 6,
              border: "1px solid #888",
              background: "#232526",
              color: "#f3f3f3",
              fontSize: 16,
            }}
          />
          
          <button
            type="submit"
            disabled={loading || !claim}
            style={{
              padding: "12px 0",
              borderRadius: 6,
              border: "none",
              background: "linear-gradient(90deg, #ffb347 0%, #ffcc33 100%)",
              color: "#232526",
              fontWeight: 700,
              fontSize: 18,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            }}
          >
            {loading ? "Checking..." : "Check Claim or URL"}
          </button>
        </form>

        {loading && (
          <div style={{ textAlign: "center", color: "#ffb347" }}>
            Checking fact sources from RSS feeds...
          </div>
        )}

        {result && (
          <div style={{
            background: "rgba(44, 62, 80, 0.98)",
            borderRadius: 12,
            padding: 24,
            marginTop: 16,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}>
            {result.error ? (
              <p style={{ color: "red" }}>{result.error}</p>
            ) : (
              <div>                <div style={{ marginBottom: 16 }}>
                  <strong style={{ color: "#ffb347", fontSize: 18 }}>Decision: </strong>
                  <span style={{ 
                    color: result.decision === "true" ? "#4caf50" : result.decision === "false" ? "#f44336" : "#ffcc33",
                    fontWeight: "bold",
                    fontSize: 18
                  }}>
                    {result.decision === "true" ? "True" : result.decision === "false" ? "False" : "Inconclusive"}
                  </span>
                  
                  {result.confidence !== undefined && (
                    <div style={{ 
                      marginTop: 8,
                      fontSize: 14,
                      color: '#ccc'
                    }}>
                      Confidence: {Math.round(result.confidence * 100)}%
                      <div style={{
                        width: '100%',
                        height: 6,
                        backgroundColor: '#444',
                        marginTop: 4,
                        borderRadius: 3,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.round(result.confidence * 100)}%`,
                          backgroundColor: result.confidence > 0.7 ? '#4caf50' : 
                                          result.confidence > 0.4 ? '#ffcc33' : '#f44336',
                          borderRadius: 3
                        }} />
                      </div>
                    </div>
                  )}
                </div>
                  {result.claimSummary && (
                  <div style={{
                    margin: '16px 0',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: 8,
                    fontSize: 15,
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: "#ffb347", display: "block", marginBottom: 8 }}>Claim Summary:</strong>
                    {result.claimSummary}
                  </div>
                )}
                
                {result.reason && (
                  <div style={{
                    margin: '16px 0',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    fontSize: 15,
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: "#ffb347", display: "block", marginBottom: 8 }}>Reason:</strong>
                    {result.reason}
                  </div>
                )}

                <div style={{ marginTop: 24, marginBottom: 16 }}>
                  <h3 style={{ color: "#4caf50" }}>Supporting Sources:</h3>
                  {result.for && result.for.length > 0 ? (
                    <ul style={{ listStyle: "disc", paddingLeft: 20 }}>
                      {result.for.map((source: any, index: number) => (
                        <li key={`for-${index}`} style={{ marginBottom: 8 }}>
                          <a 
                            href={source.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: "#8bc34a", textDecoration: "underline" }}
                          >
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No supporting sources found</p>
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ color: "#f44336" }}>Opposing Sources:</h3>
                  {result.against && result.against.length > 0 ? (
                    <ul style={{ listStyle: "disc", paddingLeft: 20 }}>
                      {result.against.map((source: any, index: number) => (
                        <li key={`against-${index}`} style={{ marginBottom: 8 }}>
                          <a 
                            href={source.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: "#ff7043", textDecoration: "underline" }}
                          >
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No opposing sources found</p>
                  )}
                </div>                {/* Inconclusive sources removed as requested */}{result && !result.error && (
                  <div style={{ 
                    marginTop: 32, 
                    padding: 16, 
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    textAlign: 'center' 
                  }}>
                    <h3 style={{ color: "#ffb347", marginBottom: 12 }}>Was this fact-check helpful?</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                      <button 
                        onClick={() => alert('Thank you for your feedback!')}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 4,
                          border: "none",
                          background: "rgba(76, 175, 80, 0.2)",
                          color: "#4caf50",
                          cursor: "pointer",
                        }}
                      >
                        👍 Yes
                      </button>
                      <button 
                        onClick={() => alert('We appreciate your feedback and will work to improve our fact-checking!')}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 4,
                          border: "none",
                          background: "rgba(244, 67, 54, 0.2)",
                          color: "#f44336",
                          cursor: "pointer",
                        }}
                      >
                        👎 No
                      </button>
                    </div>
                    
                    {result.debug && (
                      <div style={{ 
                        marginTop: 24, 
                        fontSize: 12, 
                        color: '#aaa', 
                        textAlign: 'left',
                        padding: 12,
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: 4
                      }}>
                        <h4>Debug Information</h4>
                        <p>Total articles examined: {result.debug.totalArticlesFound || 0}</p>
                        <p>Relevant articles found: {result.debug.relevantArticlesFound || 0}</p>
                        <p>Original input: {result.debug.originalInput || claim}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

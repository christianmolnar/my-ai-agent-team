"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Real Estate Analysis Component
const RealEstateAnalysisInterface = ({ onClose }: { onClose: () => void }) => {
  const [analysisType, setAnalysisType] = useState<'primary' | 'investment' | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [budget, setBudget] = useState({ min: 950000, max: 1600000 });
  const [downPayment, setDownPayment] = useState(690000);
  const [majorFactors, setMajorFactors] = useState({
    lotSize: true,
    pickleballSpace: true,
    pool: true,
    guestHouse: true,
    observatory: true,
    noHOA: true
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [hasPreviewedAnalysis, setHasPreviewedAnalysis] = useState(false);
  const [analysisDepth, setAnalysisDepth] = useState<'basic' | 'comprehensive' | 'investment-grade'>('comprehensive');
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  const generateAnalysisPreview = () => {
    return {
      propertyCount: files.length,
      analysisType,
      budget,
      downPayment,
      majorFactors: Object.entries(majorFactors).filter(([key, value]) => value).map(([key]) => key),
      evaluationCriteria: [
        "Price vs Budget Alignment",
        "Lot Size Analysis (minimum 0.5+ acres preferred)",
        "Monthly Payment Calculation (with down payment)",
        "HOA Fee Analysis",
        "Space for Recreation (Pickleball court potential)",
        "Guest House/Casita Evaluation", 
        "Observatory/Dark Sky Potential",
        "Investment ROI (if investment property)",
        "Market Trend Analysis",
        "Commute/Location Scoring"
      ],
      documentsToCreate: [
        "Arizona Trip Itinerary with property visit schedule",
        "Property Comparison Matrix (all uploaded properties)",
        "Financial Analysis Report with payment calculations",
        "Executive Summary with recommendations",
        "Quality Score Report (targeting 85/100+)"
      ]
    };
  };
  
  const startAnalysis = async () => {
    setShowPreview(false);
    setAnalyzing(true);
    // Simulate realistic analysis process with different steps
    setTimeout(() => {
      setAnalyzing(false);
      alert(`🚀 DEMO ANALYSIS COMPLETE! 🚀\n\n📊 Analyzed ${files.length} properties\n💰 Budget: $${budget.min.toLocaleString()} - $${budget.max.toLocaleString()}\n💵 Down Payment: $${downPayment.toLocaleString()}\n🔍 Analysis Depth: ${analysisDepth}\n\n📋 Mock Documents Generated:\n• Property Comparison Matrix\n• Arizona Trip Itinerary\n• Financial Analysis Report\n• Executive Summary\n\n⚠️  IMPORTANT: This is currently a UI DEMO only.\n\n🔧 The actual Universal Methodology Engine integration with real property analysis, document generation, and CNS learning is not yet implemented.\n\n✅ Next Step: Integrate with real estate APIs and implement the 7-step methodology for actual property analysis.`);
    }, 3000);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#232526",
        borderRadius: "20px",
        padding: "30px",
        border: "1px solid #444",
        maxWidth: "800px",
        width: "90%",
        maxHeight: "80vh",
        overflowY: "auto",
        color: "#f3f3f3"
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#4ade80",
            margin: 0
          }}>
            🏠 Real Estate Analysis
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #444",
              color: "#ccc",
              borderRadius: "5px",
              padding: "5px 10px",
              cursor: "pointer"
            }}
          >
            ✕
          </button>
        </div>

        {/* Analysis Type Selection */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ color: "#ffb347", marginBottom: "15px" }}>Select Analysis Type</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px"
          }}>
            <button
              onClick={() => setAnalysisType('primary')}
              style={{
                padding: "20px",
                background: analysisType === 'primary' ? "#2d4a3e" : "#181a1b",
                border: analysisType === 'primary' ? "2px solid #4ade80" : "1px solid #444",
                borderRadius: "10px",
                cursor: "pointer",
                color: "#f3f3f3"
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>🏠</div>
              <div style={{ fontWeight: "600" }}>Primary Residence</div>
              <div style={{ fontSize: "12px", color: "#ccc" }}>Personal home purchase analysis</div>
            </button>
            <button
              onClick={() => setAnalysisType('investment')}
              style={{
                padding: "20px",
                background: analysisType === 'investment' ? "#2d4a3e" : "#181a1b",
                border: analysisType === 'investment' ? "2px solid #4ade80" : "1px solid #444",
                borderRadius: "10px",
                cursor: "pointer",
                color: "#f3f3f3"
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>💰</div>
              <div style={{ fontWeight: "600" }}>Investment Property</div>
              <div style={{ fontSize: "12px", color: "#ccc" }}>Rental income & ROI analysis</div>
            </button>
          </div>
        </div>

        {analysisType && (
          <>
            {/* File Upload */}
            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ color: "#ffb347", marginBottom: "15px" }}>Upload Property Documents</h3>
              <div style={{
                border: "2px dashed #444",
                borderRadius: "10px",
                padding: "30px",
                textAlign: "center",
                background: "#181a1b"
              }}>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.md,.txt,.jpg,.png"
                  onChange={handleFileUpload}
                  style={{
                    width: "100%",
                    padding: "10px",
                    background: "#232526",
                    border: "1px solid #444",
                    borderRadius: "5px",
                    color: "#f3f3f3"
                  }}
                />
                <p style={{ margin: "10px 0 0 0", fontSize: "12px", color: "#ccc" }}>
                  PDF, DOCX, MD, TXT, Images • Max 50MB per file
                </p>
                {files.length > 0 && (
                  <div style={{ marginTop: "15px" }}>
                    <p style={{ color: "#4ade80" }}>✓ {files.length} files selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Budget Range */}
            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ color: "#ffb347", marginBottom: "15px" }}>Budget Range</h3>
              <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ 
                    position: "absolute", 
                    left: "12px", 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    color: "#ccc", 
                    fontSize: "14px" 
                  }}>$</span>
                  <input
                    type="number"
                    placeholder="950,000"
                    value={budget.min}
                    step="10000"
                    onChange={(e) => setBudget({...budget, min: parseInt(e.target.value) || 0})}
                    style={{
                      width: "100%",
                      padding: "10px 10px 10px 25px",
                      background: "#181a1b",
                      border: "1px solid #444",
                      borderRadius: "5px",
                      color: "#f3f3f3"
                    }}
                  />
                </div>
                <span style={{ color: "#ccc" }}>to</span>
                <div style={{ position: "relative", flex: 1 }}>
                  <span style={{ 
                    position: "absolute", 
                    left: "12px", 
                    top: "50%", 
                    transform: "translateY(-50%)", 
                    color: "#ccc", 
                    fontSize: "14px" 
                  }}>$</span>
                  <input
                    type="number"
                    placeholder="1,600,000"
                    value={budget.max}
                    step="10000"
                    onChange={(e) => setBudget({...budget, max: parseInt(e.target.value) || 0})}
                    style={{
                      width: "100%",
                      padding: "10px 10px 10px 25px",
                      background: "#181a1b",
                      border: "1px solid #444",
                      borderRadius: "5px",
                      color: "#f3f3f3"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Analysis Depth */}
            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ color: "#ffb347", marginBottom: "15px" }}>Analysis Depth</h3>
              <select
                value={analysisDepth}
                onChange={(e) => setAnalysisDepth(e.target.value as 'basic' | 'comprehensive' | 'investment-grade')}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#181a1b",
                  border: "1px solid #444",
                  borderRadius: "5px",
                  color: "#f3f3f3",
                  fontSize: "14px"
                }}
              >
                <option value="basic">Basic Analysis (Quick overview)</option>
                <option value="comprehensive">Comprehensive Analysis (Recommended)</option>
                <option value="investment-grade">Investment Grade (Detailed ROI analysis)</option>
              </select>
            </div>

            {/* Down Payment */}
            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ color: "#ffb347", marginBottom: "15px" }}>Down Payment Amount</h3>
              <div style={{ position: "relative" }}>
                <span style={{ 
                  position: "absolute", 
                  left: "15px", 
                  top: "50%", 
                  transform: "translateY(-50%)", 
                  color: "#ccc", 
                  fontSize: "14px" 
                }}>$</span>
                <input
                  type="number"
                  placeholder="690,000"
                  value={downPayment}
                  step="10000"
                  onChange={(e) => setDownPayment(parseInt(e.target.value) || 0)}
                  style={{
                    width: "100%",
                    padding: "12px 12px 12px 28px",
                    background: "#181a1b",
                    border: "1px solid #444",
                    borderRadius: "5px",
                    color: "#f3f3f3",
                    fontSize: "14px",
                    boxSizing: "border-box"
                  }}
                />
              </div>
              <p style={{ margin: "5px 0 0 0", fontSize: "12px", color: "#ccc" }}>
                Used for accurate monthly payment calculations
              </p>
            </div>

            {/* Major Factors */}
            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ color: "#ffb347", marginBottom: "15px" }}>Major Decision Factors</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                background: "#181a1b",
                padding: "15px",
                borderRadius: "8px"
              }}>
                {Object.entries({
                  lotSize: "Large Lot Size (0.5+ acres)",
                  pickleballSpace: "Space for Pickleball Court",
                  pool: "Swimming Pool",
                  guestHouse: "Guest House/Casita",
                  observatory: "Observatory Potential (Dark Skies)",
                  noHOA: "No HOA Fees"
                }).map(([key, label]) => (
                  <label key={key} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#f3f3f3",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}>
                    <input
                      type="checkbox"
                      checked={majorFactors[key as keyof typeof majorFactors]}
                      onChange={(e) => setMajorFactors(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      style={{ accentColor: "#4ade80" }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Analysis Action Buttons */}
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={() => {
                  setShowPreview(true);
                  setHasPreviewedAnalysis(true);
                }}
                disabled={files.length === 0}
                style={{
                  flex: 1,
                  padding: "15px",
                  background: files.length === 0 ? "#444" : "#ffb347",
                  color: files.length === 0 ? "#ccc" : "#000",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: files.length === 0 ? "not-allowed" : "pointer"
                }}
              >
                👀 Preview Analysis
              </button>
              <button
                onClick={startAnalysis}
                disabled={files.length === 0 || !hasPreviewedAnalysis}
                style={{
                  flex: 1,
                  padding: "15px",
                  background: (files.length === 0 || !hasPreviewedAnalysis) ? "#444" : "#4ade80",
                  color: (files.length === 0 || !hasPreviewedAnalysis) ? "#ccc" : "#000",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: (files.length === 0 || !hasPreviewedAnalysis) ? "not-allowed" : "pointer"
                }}
              >
                🚀 {hasPreviewedAnalysis ? 'Execute Analysis' : 'Preview Required'}
              </button>
            </div>

            {/* Preview Analysis Modal */}
            {showPreview && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100
              }}>
                <div style={{
                  background: "#232526",
                  borderRadius: "15px",
                  padding: "25px",
                  border: "1px solid #4ade80",
                  maxWidth: "600px",
                  width: "90%",
                  maxHeight: "70vh",
                  overflowY: "auto",
                  color: "#f3f3f3"
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px"
                  }}>
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: "600",
                      color: "#4ade80",
                      margin: 0
                    }}>
                      📋 Analysis Preview
                    </h3>
                    <button
                      onClick={() => setShowPreview(false)}
                      style={{
                        background: "transparent",
                        border: "1px solid #444",
                        color: "#ccc",
                        borderRadius: "5px",
                        padding: "5px 10px",
                        cursor: "pointer"
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {(() => {
                    const preview = generateAnalysisPreview();
                    return (
                      <div>
                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ color: "#ffb347", marginBottom: "10px" }}>📊 Analysis Overview</h4>
                          <div style={{ background: "#181a1b", padding: "15px", borderRadius: "8px" }}>
                            <p><strong>Analysis Type:</strong> {preview.analysisType === 'primary' ? 'Primary Residence' : 'Investment Property'}</p>
                            <p><strong>Properties to Analyze:</strong> {preview.propertyCount} files</p>
                            <p><strong>Budget Range:</strong> ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}</p>
                            <p><strong>Down Payment:</strong> ${downPayment.toLocaleString()}</p>
                            <p><strong>Analysis Depth:</strong> {analysisDepth}</p>
                          </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ color: "#ffb347", marginBottom: "10px" }}>🎯 Major Decision Factors</h4>
                          <div style={{ background: "#181a1b", padding: "15px", borderRadius: "8px" }}>
                            {preview.majorFactors.map(factor => (
                              <div key={factor} style={{ marginBottom: "5px" }}>
                                ✅ {factor.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ color: "#ffb347", marginBottom: "10px" }}>🔍 Evaluation Criteria</h4>
                          <div style={{ background: "#181a1b", padding: "15px", borderRadius: "8px", fontSize: "14px" }}>
                            {preview.evaluationCriteria.map((criteria, index) => (
                              <div key={index} style={{ marginBottom: "5px" }}>
                                • {criteria}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                          <h4 style={{ color: "#ffb347", marginBottom: "10px" }}>📄 Documents to Generate</h4>
                          <div style={{ background: "#181a1b", padding: "15px", borderRadius: "8px", fontSize: "14px" }}>
                            {preview.documentsToCreate.map((doc, index) => (
                              <div key={index} style={{ marginBottom: "5px" }}>
                                📋 {doc}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                          <button
                            onClick={() => {
                              setShowPreview(false);
                              setHasPreviewedAnalysis(false);
                            }}
                            style={{
                              flex: 1,
                              padding: "12px",
                              background: "#444",
                              color: "#ccc",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            ← Back to Edit
                          </button>
                          <button
                            onClick={startAnalysis}
                            style={{
                              flex: 2,
                              padding: "12px",
                              background: "#4ade80",
                              color: "#000",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer"
                            }}
                          >
                            ✅ Execute Analysis (DEMO)
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {analyzing && (
              <div style={{
                marginTop: "20px",
                padding: "15px",
                background: "#181a1b",
                borderRadius: "10px",
                border: "1px solid #4ade80"
              }}>
                <p style={{ margin: "0 0 10px 0", color: "#4ade80", fontWeight: "600" }}>
                  🎭 DEMO: 7-Step Universal Methodology Engine Simulation
                </p>
                <div style={{ fontSize: "14px", color: "#ccc" }}>
                  <div>✓ Step 1: Data ingestion and validation (simulated)</div>
                  <div>✓ Step 2: Market analysis and comparison (simulated)</div>
                  <div>🔄 Step 3: Quality assurance review (simulated)...</div>
                  <div style={{ marginTop: "10px", fontSize: "12px", color: "#ffb347" }}>
                    💡 This is a UI demonstration. Real analysis coming soon!
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default function ResearcherAgentPage() {
  const [loading, setLoading] = useState(true);
  const [showRealEstate, setShowRealEstate] = useState(false);

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
          marginBottom: "30px"
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
              fontSize: "14px",
              width: "fit-content"
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
              🔍 Researcher Agent
            </h1>
            <p style={{
              color: "#ccc",
              fontSize: "16px",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6"
            }}>
              Comprehensive research expert across all domains with specialized capabilities.
              Integrates vinyl research and fact-checking with academic and market research.
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
              🔍 Core Capabilities
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px"
            }}>
              {[
                { icon: "🌐", title: "General Research", desc: "Comprehensive research across all knowledge domains" },
                { icon: "🎵", title: "Vinyl & Music Research", desc: "Specialized vinyl and music industry expertise" },
                { icon: "🏠", title: "Real Estate Analysis", desc: "Property analysis for primary residence & investment decisions", active: true },
                { icon: "✅", title: "Fact Checking", desc: "Source validation and credibility assessment" },
                { icon: "📊", title: "Market Research", desc: "Competitive analysis and market insights" },
                { icon: "📈", title: "Real-time Data", desc: "Live data gathering and trend analysis" }
              ].map((capability, index) => (
                <div key={index} style={{
                  padding: "15px",
                  background: capability.active ? "#2d4a3e" : "#232526",
                  borderRadius: "8px",
                  border: capability.active ? "1px solid #4ade80" : "1px solid #444",
                  cursor: capability.active ? "pointer" : "default",
                  transition: "all 0.3s ease"
                }}
                onClick={() => capability.active && setShowRealEstate(true)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "18px" }}>{capability.icon}</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: capability.active ? "#4ade80" : "#ffb347" }}>
                      {capability.title}
                    </span>
                    {capability.active && (
                      <span style={{
                        fontSize: "10px",
                        background: "#4ade80",
                        color: "#000",
                        padding: "2px 6px",
                        borderRadius: "10px",
                        fontWeight: "600"
                      }}>
                        NEW
                      </span>
                    )}
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
              🔧 Technical Integration
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "10px"
            }}>
              {[
                "Google Scholar APIs",
                "PubMed & JSTOR",
                "Discogs & MusicBrainz",
                "Legal Databases",
                "Fact-Check Services",
                "Real-time News APIs"
              ].map((tech, index) => (
                <div key={index} style={{
                  padding: "8px 12px",
                  background: "#232526",
                  borderRadius: "6px",
                  border: "1px solid #444",
                  fontSize: "12px",
                  color: "#ccc",
                  textAlign: "center"
                }}>
                  {tech}
                </div>
              ))}
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
              📊 Performance Metrics
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px"
            }}>
              {[
                { metric: "Research Accuracy", target: "96%" },
                { metric: "Source Quality", target: "95%" },
                { metric: "Completion Time", target: "85%" },
                { metric: "Fact-Check Success", target: "98%" }
              ].map((item, index) => (
                <div key={index} style={{
                  padding: "15px",
                  background: "#232526",
                  borderRadius: "8px",
                  border: "1px solid #444",
                  textAlign: "center"
                }}>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#ffb347",
                    marginBottom: "5px"
                  }}>
                    {item.target}
                  </div>
                  <div style={{
                    fontSize: "12px",
                    color: "#ccc"
                  }}>
                    {item.metric}
                  </div>
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

      {showRealEstate && (
        <RealEstateAnalysisInterface onClose={() => setShowRealEstate(false)} />
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

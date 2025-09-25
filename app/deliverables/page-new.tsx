'use client';

import { useState, useEffect } from 'react';

interface DeliverableItem {
  name: string;
  type: 'code' | 'document' | 'research' | 'presentation' | 'other';
  format: string;
  path: string;
  url: string;
  size: number;
  createdAt: string;
  metadata?: any;
}

interface DeliverablesSummary {
  total: number;
  byType: Record<string, number>;
  byFormat: Record<string, number>;
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
    color: 'white'
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: 0.9,
    fontWeight: '300'
  },
  card: {
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '15px',
    padding: '30px',
    marginBottom: '30px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    color: 'white',
    textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.9
  },
  deliverablesList: {
    display: 'grid',
    gap: '15px'
  },
  deliverableItem: {
    background: 'white',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  deliverableItemHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
  },
  deliverableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px'
  },
  deliverableName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '5px'
  },
  deliverableType: {
    background: '#3b82f6',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  deliverableDescription: {
    color: '#6b7280',
    fontSize: '0.9rem',
    marginBottom: '15px'
  },
  deliverableMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: '#9ca3af'
  },
  downloadButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer'
  },
  refreshButton: {
    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    color: '#8b4513',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    margin: '20px auto',
    display: 'block'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    color: '#6b7280'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#374151'
  },
  emptyDescription: {
    fontSize: '1rem',
    lineHeight: '1.6'
  },
  loadingSpinner: {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center' as const
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: '10px'
  },
  errorDescription: {
    color: '#7f1d1d',
    fontSize: '1rem'
  }
};

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);
  const [summary, setSummary] = useState<DeliverablesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  useEffect(() => {
    fetchDeliverables();
  }, []);

  const fetchDeliverables = async () => {
    try {
      const response = await fetch('/api/deliverables');
      const data = await response.json();
      
      if (response.ok) {
        setDeliverables(data.deliverables);
        setSummary(data.summary);
      } else {
        setError(data.error || 'Failed to fetch deliverables');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={{...styles.card, textAlign: 'center'}}>
            <div style={styles.loadingSpinner}></div>
            <p style={{marginTop: '20px', color: '#6b7280'}}>Loading deliverables...</p>
          </div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.errorContainer}>
            <div style={{fontSize: '4rem', marginBottom: '20px'}}>❌</div>
            <h1 style={styles.errorTitle}>Error Loading Deliverables</h1>
            <p style={styles.errorDescription}>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{...styles.refreshButton, marginTop: '20px'}}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>📋 AI Agent Deliverables</h1>
          <p style={styles.subtitle}>
            Your AI agents have created {summary?.total || 0} deliverables
          </p>
        </div>

        {summary && (
          <div style={styles.card}>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{summary.total}</div>
                <div style={styles.statLabel}>Total Files</div>
              </div>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'}}>
                <div style={styles.statNumber}>{Object.keys(summary.byType).length}</div>
                <div style={styles.statLabel}>File Types</div>
              </div>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%)'}}>
                <div style={styles.statNumber}>{Object.keys(summary.byFormat).length}</div>
                <div style={styles.statLabel}>Formats</div>
              </div>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'}}>
                <div style={styles.statNumber}>
                  {formatFileSize(deliverables.reduce((sum, item) => sum + item.size, 0))}
                </div>
                <div style={styles.statLabel}>Total Size</div>
              </div>
            </div>
          </div>
        )}

        <div style={styles.card}>
          {deliverables.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📁</div>
              <h2 style={styles.emptyTitle}>No Deliverables Yet</h2>
              <p style={styles.emptyDescription}>
                Start using your AI agents to create documents, applications, and research papers.<br/>
                They'll appear here when ready for download.
              </p>
            </div>
          ) : (
            <div>
              <h2 style={{fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '20px'}}>Recent Deliverables</h2>
              
              <div style={styles.deliverablesList}>
                {deliverables.map((item, index) => (
                  <div 
                    key={index} 
                    style={{
                      ...styles.deliverableItem,
                      ...(hoveredItem === index ? styles.deliverableItemHover : {})
                    }}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div style={styles.deliverableHeader}>
                      <div>
                        <h3 style={styles.deliverableName}>{item.name}</h3>
                        <div style={styles.deliverableType}>
                          {item.type}
                        </div>
                      </div>
                      <a 
                        href={item.url} 
                        style={styles.downloadButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        📥 Download
                      </a>
                    </div>
                    
                    {item.metadata?.description && (
                      <p style={styles.deliverableDescription}>
                        {item.metadata.description}
                      </p>
                    )}
                    
                    <div style={styles.deliverableMeta}>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                      <span>{formatFileSize(item.size)} • {item.format}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={fetchDeliverables}
          style={styles.refreshButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          🔄 Refresh Deliverables
        </button>
      </div>
    </div>
  );
}

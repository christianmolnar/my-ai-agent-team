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
    background: 'linear-gradient(135deg, #181a1b 0%, #232526 100%)',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    padding: '20px'
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    color: '#f3f3f3'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '40px',
    color: '#f3f3f3'
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '10px',
    color: '#ffb347'
  },
  subtitle: {
    fontSize: '1.2rem',
    opacity: 0.9,
    fontWeight: '300',
    color: '#ccc'
  },
  card: {
    background: 'rgba(35, 37, 38, 0.8)',
    borderRadius: '20px',
    padding: '30px',
    marginBottom: '30px',
    border: '1px solid #444',
    backdropFilter: 'blur(10px)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'linear-gradient(135deg, rgba(255, 179, 71, 0.8) 0%, rgba(255, 179, 71, 0.6) 100%)',
    padding: '20px',
    borderRadius: '15px',
    textAlign: 'center' as const,
    color: '#181a1b',
    border: '1px solid rgba(255, 179, 71, 0.3)'
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
  selectionBar: {
    background: 'rgba(255, 179, 71, 0.1)',
    border: '1px solid #ffb347',
    borderRadius: '15px',
    padding: '15px 20px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selectionInfo: {
    color: '#f3f3f3',
    fontWeight: '500'
  },
  selectionActions: {
    display: 'flex',
    gap: '10px'
  },
  selectButton: {
    padding: '8px 16px',
    border: '1px solid #ffb347',
    background: 'transparent',
    color: '#ffb347',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  deleteButton: {
    padding: '8px 16px',
    border: 'none',
    background: '#dc2626',
    color: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },
  deliverableItem: {
    background: 'rgba(35, 37, 38, 0.6)',
    borderRadius: '15px',
    padding: '20px',
    paddingRight: '60px', // Extra space for checkbox
    border: '1px solid #444',
    transition: 'all 0.3s ease',
    position: 'relative' as const
  },
  deliverableItemSelected: {
    background: 'rgba(35, 37, 38, 0.8)',
    borderRadius: '15px',
    padding: '20px',
    paddingRight: '60px', // Extra space for checkbox
    border: '2px solid #ffb347',
    transition: 'all 0.3s ease',
    position: 'relative' as const
  },
  checkbox: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#ffb347'
  },
  deliverableItemHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(255, 179, 71, 0.2)'
  },
  deliverableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    paddingRight: '40px' // Ensure content doesn't overlap checkbox
  },
  deliverableName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#f3f3f3',
    marginBottom: '5px'
  },
  deliverableType: {
    background: '#ffb347',
    color: '#181a1b',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  deliverableDescription: {
    color: '#ccc',
    fontSize: '0.9rem',
    marginBottom: '15px'
  },
  deliverableMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: '#999'
  },
  downloadButton: {
    background: 'linear-gradient(135deg, #ffb347 0%, #ff8c42 100%)',
    color: '#181a1b',
    padding: '8px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    border: 'none',
    cursor: 'pointer'
  },
  refreshButton: {
    background: 'linear-gradient(135deg, #ffb347 0%, #ff8c42 100%)',
    color: '#181a1b',
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
    color: '#ccc',
    background: 'rgba(35, 37, 38, 0.6)',
    borderRadius: '15px',
    border: '1px solid #444'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '10px',
    color: '#f3f3f3'
  },
  emptyDescription: {
    fontSize: '1rem',
    lineHeight: '1.6',
    color: '#ccc'
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
    background: 'rgba(35, 37, 38, 0.6)',
    border: '1px solid #ffb347',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center' as const
  },
  errorTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#ffb347',
    marginBottom: '10px'
  },
  errorDescription: {
    color: '#ccc',
    fontSize: '1rem'
  }
};

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);
  const [summary, setSummary] = useState<DeliverablesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSelectItem = (path: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === deliverables.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(deliverables.map(item => item.path)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0 || !confirm(`Are you sure you want to delete ${selectedItems.size} selected deliverable(s)? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/deliverables/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paths: Array.from(selectedItems)
        }),
      });

      if (response.ok) {
        // Remove deleted items from local state
        setDeliverables(prev => prev.filter(item => !selectedItems.has(item.path)));
        setSelectedItems(new Set());
        // Refresh summary
        await fetchDeliverables();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete deliverables');
      }
    } catch (err) {
      setError('Network error during deletion');
    } finally {
      setIsDeleting(false);
    }
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
        </div>

        {summary && (
          <div style={styles.card}>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>{summary.total}</div>
                <div style={styles.statLabel}>Total Files</div>
              </div>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, rgba(255, 179, 71, 0.9) 0%, rgba(255, 140, 66, 0.7) 100%)'}}>
                <div style={styles.statNumber}>{Object.keys(summary.byType).length}</div>
                <div style={styles.statLabel}>File Types</div>
              </div>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, rgba(255, 179, 71, 0.8) 0%, rgba(255, 140, 66, 0.6) 100%)'}}>
                <div style={styles.statNumber}>{Object.keys(summary.byFormat).length}</div>
                <div style={styles.statLabel}>Formats</div>
              </div>
              <div style={{...styles.statCard, background: 'linear-gradient(135deg, rgba(255, 179, 71, 0.7) 0%, rgba(255, 140, 66, 0.5) 100%)'}}>
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
              
              {/* Selection Controls */}
              <div style={styles.selectionBar}>
                <div style={styles.selectionInfo}>
                  {selectedItems.size > 0 ? (
                    `${selectedItems.size} of ${deliverables.length} items selected`
                  ) : (
                    'Select items to delete multiple deliverables'
                  )}
                </div>
                <div style={styles.selectionActions}>
                  <button
                    onClick={handleSelectAll}
                    style={styles.selectButton}
                  >
                    {selectedItems.size === deliverables.length ? 'Deselect All' : 'Select All'}
                  </button>
                  {selectedItems.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      disabled={isDeleting}
                      style={{
                        ...styles.deleteButton,
                        opacity: isDeleting ? 0.6 : 1,
                        cursor: isDeleting ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isDeleting ? 'Deleting...' : `Delete ${selectedItems.size}`}
                    </button>
                  )}
                </div>
              </div>
              
              <div style={styles.deliverablesList}>
                {deliverables.map((item, index) => (
                  <div 
                    key={index} 
                    style={{
                      ...(selectedItems.has(item.path) ? styles.deliverableItemSelected : styles.deliverableItem),
                      ...(hoveredItem === index ? styles.deliverableItemHover : {})
                    }}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.path)}
                      onChange={() => handleSelectItem(item.path)}
                      style={styles.checkbox}
                    />
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

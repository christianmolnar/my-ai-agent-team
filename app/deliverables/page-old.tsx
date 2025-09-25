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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'code': return '💻';
      case 'document': return '📄';
      case 'research': return '📊';
      case 'presentation': return '📊';
      default: return '📁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'code': return 'bg-blue-100 text-blue-800';
      case 'document': return 'bg-green-100 text-green-800';
      case 'research': return 'bg-purple-100 text-purple-800';
      case 'presentation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deliverables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Deliverables</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📋 AI Agent Deliverables</h1>
          <p className="text-lg text-gray-600">
            Your AI agents have created {summary?.total || 0} deliverables
          </p>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 By Type</h3>
              <div className="space-y-2">
                {Object.entries(summary.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="capitalize">{getTypeIcon(type)} {type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📁 By Format</h3>
              <div className="space-y-2">
                {Object.entries(summary.byFormat).map(([format, count]) => (
                  <div key={format} className="flex justify-between items-center">
                    <span className="uppercase">.{format}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Total Files</span>
                  <span className="font-semibold">{summary.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Size</span>
                  <span className="font-semibold">
                    {formatFileSize(deliverables.reduce((sum, item) => sum + item.size, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {deliverables.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Deliverables Yet</h2>
            <p className="text-gray-500">Ask your AI agents to create something amazing!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Recent Deliverables</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {deliverables.map((item, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getTypeIcon(item.type)}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono">
                          .{item.format}
                        </span>
                      </div>
                      
                      {item.metadata?.description && (
                        <p className="text-gray-600 mb-2">{item.metadata.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>📅 {formatDate(item.createdAt)}</span>
                        <span>📏 {formatFileSize(item.size)}</span>
                        {item.metadata?.agentId && (
                          <span>🤖 {item.metadata.agentId}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-6">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {item.type === 'code' ? '🚀 Open App' : '⬇️ Download'}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={fetchDeliverables}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

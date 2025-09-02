'use client';

import { useState, useEffect } from 'react';

interface ApiKeyStatus {
  service: string;
  provider: string;
  configured: boolean;
  valid?: boolean;
  error?: string;
  models?: string[];
  capabilities?: string[];
  costTier?: string;
}

interface StatusSummary {
  configured: number;
  total: number;
  ready: boolean;
  byProvider: Record<string, number>;
  byCapability: Record<string, number>;
}

export default function ApiStatusPage() {
  const [status, setStatus] = useState<ApiKeyStatus[]>([]);
  const [summary, setSummary] = useState<StatusSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const testApiConnections = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/verify-keys');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.results || []);
        setSummary(data.summary || null);
      } else {
        console.error('Failed to verify API keys');
      }
    } catch (error) {
      console.error('Error testing API connections:', error);
    }
    setTesting(false);
    setLoading(false);
  };

  useEffect(() => {
    testApiConnections();
  }, []);

  const getStatusIcon = (item: ApiKeyStatus) => {
    if (!item.configured) return '❌';
    if (item.valid === true) return '✅';
    if (item.valid === false) return '🔴';
    return '❓';
  };

  const getStatusText = (item: ApiKeyStatus) => {
    if (!item.configured) return 'Not configured';
    if (item.valid === true) return 'Working';
    if (item.valid === false) return 'Error';
    return 'Unknown';
  };

  const getCostTierColor = (tier?: string) => {
    switch (tier) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Group services by provider
  const groupedByProvider = status.reduce((acc, item) => {
    if (!acc[item.provider]) acc[item.provider] = [];
    acc[item.provider].push(item);
    return acc;
  }, {} as Record<string, ApiKeyStatus[]>);

  const coreProviders = ['openai', 'anthropic', 'google'];
  const allConfigured = summary?.ready || false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying API connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            � Universal AI Model Status
          </h1>

          {/* Overall Status */}
          <div className={`p-6 rounded-lg mb-6 ${
            allConfigured 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <h2 className="text-xl font-semibold mb-3">
              {allConfigured ? '✅ Universal AI System Ready!' : '⚙️ Configuration in Progress'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary?.configured || 0}</div>
                <div className="text-sm text-gray-600">Models Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(summary?.byProvider || {}).length}</div>
                <div className="text-sm text-gray-600">AI Providers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Object.keys(summary?.byCapability || {}).length}</div>
                <div className="text-sm text-gray-600">Capabilities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summary?.total || 0}</div>
                <div className="text-sm text-gray-600">Total Models</div>
              </div>
            </div>
            <p className="text-gray-700">
              {allConfigured 
                ? 'All agents can now access multiple AI models through the universal system. The intelligent routing will automatically select the best model for each task.'
                : 'Configure your API keys to unlock the full potential of the multi-model AI system. Even with just OpenAI, you\'ll have access to powerful capabilities.'
              }
            </p>
          </div>

          {/* Capabilities Overview */}
          {summary?.byCapability && Object.keys(summary.byCapability).length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                🎯 Available Capabilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(summary.byCapability).map(([capability, count]) => (
                  <span 
                    key={capability}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {capability} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Setup Instructions */}
          {!allConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                🚀 Quick Setup Guide
              </h3>
              <ol className="list-decimal list-inside text-amber-800 space-y-1">
                <li>Run <code className="bg-amber-100 px-2 py-1 rounded">./setup-env.sh</code> in your terminal</li>
                <li>Add your API keys to the <code className="bg-amber-100 px-2 py-1 rounded">.env.local</code> file</li>
                <li>Start with <strong>OpenAI</strong> for basic functionality</li>
                <li>Add <strong>Anthropic</strong> and <strong>Google AI</strong> for advanced capabilities</li>
                <li>Restart your development server: <code className="bg-amber-100 px-2 py-1 rounded">npm run dev</code></li>
              </ol>
            </div>
          )}

          {/* Provider Status */}
          <div className="space-y-6">
            {Object.entries(groupedByProvider).map(([provider, services]) => {
              const isCore = coreProviders.includes(provider);
              const providerConfigured = services.some(s => s.configured);
              
              return (
                <div key={provider} className={`border rounded-lg p-4 ${
                  isCore ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                      {providerConfigured ? '🟢' : '🔴'} {provider}
                      {isCore && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">CORE</span>}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {services.filter(s => s.configured).length} / {services.length} configured
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {services.map((item, index) => (
                      <div key={index} className="bg-white border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getStatusIcon(item)}</span>
                            <h4 className="font-medium text-gray-900 text-sm">{item.service}</h4>
                          </div>
                          {item.costTier && (
                            <span className={`text-xs ${getCostTierColor(item.costTier)}`}>
                              {item.costTier}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2">{getStatusText(item)}</p>
                        
                        {item.capabilities && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {item.capabilities.slice(0, 3).map((cap, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                {cap}
                              </span>
                            ))}
                            {item.capabilities.length > 3 && (
                              <span className="text-xs text-gray-500">+{item.capabilities.length - 3}</span>
                            )}
                          </div>
                        )}
                        
                        {item.error && (
                          <div className="text-xs text-red-600 bg-red-50 p-1 rounded">
                            {item.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Test Button */}
          <div className="border-t pt-6 mt-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <button
                  onClick={testApiConnections}
                  disabled={testing}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                >
                  {testing ? 'Testing Connections...' : 'Refresh API Status'}
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  This will verify all configured API keys by making test requests.
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Model Selection Strategy: <span className="font-medium">Balanced</span>
                </div>
                <div className="text-xs text-gray-500">
                  Optimizes for cost, performance, and capabilities
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="border-t pt-6 mt-6">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Agent Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

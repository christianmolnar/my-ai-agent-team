"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const agentDetails = {
  'personal-assistant': {
    name: 'Personal Assistant',
    description: 'Executive stakeholder interface and relationship management',
    status: 'active',
    uptime: '99.8%',
    responseTime: '150ms',
    capabilities: [
      'Meeting scheduling and calendar management',
      'Email prioritization and response drafting',
      'Task prioritization and deadline tracking',
      'Relationship management and contact coordination',
      'Document organization and retrieval',
      'Travel planning and logistics coordination'
    ],
    recentTasks: [
      'Scheduled 3 meetings for tomorrow',
      'Prioritized 15 urgent emails',
      'Updated project timelines',
      'Coordinated team communications'
    ],
    apiKeys: ['OpenAI GPT-4', 'Google Calendar', 'Gmail API', 'Slack Integration'],
    memory: '2.1GB used of 8GB allocated',
    lastUpdated: '2 minutes ago'
  },
  'master-orchestrator': {
    name: 'Master Orchestrator',
    description: 'Multi-agent project coordination and strategic planning',
    status: 'active',
    uptime: '99.9%',
    responseTime: '200ms',
    capabilities: [
      'Cross-agent task delegation and coordination',
      'Strategic project planning and resource allocation',
      'Multi-phase project management',
      'Agent workload balancing',
      'Conflict resolution between agents',
      'Performance monitoring and optimization'
    ],
    recentTasks: [
      'Coordinated New Orleans piano learning project',
      'Allocated resources across 4 agents',
      'Optimized agent workload distribution',
      'Generated comprehensive project timeline'
    ],
    apiKeys: ['OpenAI GPT-4', 'Anthropic Claude', 'Agent Communication Protocol'],
    memory: '3.7GB used of 16GB allocated',
    lastUpdated: '1 minute ago'
  }
  // Add more agent details as needed
};

export default function AgentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  
  const agent = agentDetails[agentId as keyof typeof agentDetails];

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Agent Details Not Found</h1>
          <button 
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'working': return 'text-blue-400';
      case 'idle': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'working': return '🔄';
      case 'idle': return '⚫';
      default: return '⚫';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{agent.name}</h1>
              <p className="text-gray-400 text-lg">{agent.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getStatusIndicator(agent.status)}</span>
              <span className={`text-lg font-medium ${getStatusColor(agent.status)}`}>
                {agent.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Metrics */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Performance Metrics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{agent.uptime}</div>
                  <div className="text-gray-400 text-sm">Uptime</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{agent.responseTime}</div>
                  <div className="text-gray-400 text-sm">Avg Response</div>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-400">{agent.memory.split(' ')[0]}</div>
                  <div className="text-gray-400 text-sm">Memory Usage</div>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Core Capabilities</h2>
              <div className="space-y-3">
                {agent.capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-200">{capability}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {agent.recentTasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border-l-2 border-orange-500 bg-gray-700/50">
                    <span className="text-orange-400">●</span>
                    <span className="text-gray-200">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - System Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  href={`/agents/${agentId}`}
                  className="block w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg text-center transition-colors font-medium"
                >
                  Talk to {agent.name.split(' ')[0]} {agent.name.split(' ')[1] || ''}
                </Link>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-3 rounded-lg transition-colors">
                  Restart Agent
                </button>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors">
                  Emergency Stop
                </button>
              </div>
            </div>

            {/* System Configuration */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">System Info</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Memory Usage:</span>
                  <div className="text-gray-200 font-mono">{agent.memory}</div>
                </div>
                <div>
                  <span className="text-gray-400">Last Updated:</span>
                  <div className="text-gray-200">{agent.lastUpdated}</div>
                </div>
                <div>
                  <span className="text-gray-400">Agent ID:</span>
                  <div className="text-gray-200 font-mono">{agentId}</div>
                </div>
              </div>
            </div>

            {/* API Keys Status */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">API Integration</h2>
              <div className="space-y-2">
                {agent.apiKeys.map((api, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-gray-200 text-sm">{api}</span>
                    <span className="text-green-400 text-xs">✓ Active</span>
                  </div>
                ))}
              </div>
              <Link
                href="/api-status"
                className="block w-full mt-4 bg-gray-700 hover:bg-gray-600 text-center text-gray-300 px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Manage API Keys
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

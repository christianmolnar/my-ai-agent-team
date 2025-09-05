"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'working' | 'idle';
  description: string;
  currentTasks: number;
  completed: number;
  lastActivity: string;
  category: 'executive' | 'command' | 'software-development' | 'specialized-services' | 'core-operations';
}

const agents: Agent[] = [
  // Executive Level (Top Priority)
  {
    id: 'personal-assistant',
    name: 'Personal Assistant',
    status: 'active',
    description: 'Executive stakeholder interface and relationship management',
    currentTasks: 2,
    completed: 45,
    lastActivity: '1 minute ago',
    category: 'executive'
  },
  
  // Command Layer
  {
    id: 'master-orchestrator',
    name: 'Master Orchestrator',
    status: 'active',
    description: 'Multi-agent project coordination and strategic planning',
    currentTasks: 3,
    completed: 27,
    lastActivity: '2 minutes ago',
    category: 'command'
  },
  {
    id: 'project-coordinator',
    name: 'Project Coordinator',
    status: 'working',
    description: 'Timeline management and resource allocation',
    currentTasks: 4,
    completed: 32,
    lastActivity: '5 minutes ago',
    category: 'command'
  },
  
  // Core Operations
  {
    id: 'music-coach',
    name: 'Music Coach',
    status: 'working',
    description: 'Music education and New Orleans piano expertise',
    currentTasks: 1,
    completed: 12,
    lastActivity: '3 minutes ago',
    category: 'core-operations'
  },
  
  // Software Development Team
  {
    id: 'full-stack-developer',
    name: 'Full Stack Developer',
    status: 'active',
    description: 'End-to-end application development and architecture',
    currentTasks: 3,
    completed: 18,
    lastActivity: '4 minutes ago',
    category: 'software-development'
  },
  {
    id: 'front-end-developer',
    name: 'Front End Developer',
    status: 'working',
    description: 'User interface and experience implementation',
    currentTasks: 2,
    completed: 15,
    lastActivity: '6 minutes ago',
    category: 'software-development'
  },
  {
    id: 'back-end-developer',
    name: 'Back End Developer',
    status: 'active',
    description: 'Server-side logic and API development',
    currentTasks: 2,
    completed: 22,
    lastActivity: '8 minutes ago',
    category: 'software-development'
  },
  {
    id: 'test-expert',
    name: 'Test Expert',
    status: 'idle',
    description: 'Quality assurance and automated testing',
    currentTasks: 0,
    completed: 8,
    lastActivity: '2 hours ago',
    category: 'software-development'
  },
  {
    id: 'security-expert',
    name: 'Security Expert',
    status: 'active',
    description: 'Security analysis and vulnerability assessment',
    currentTasks: 1,
    completed: 5,
    lastActivity: '1 hour ago',
    category: 'software-development'
  },
  {
    id: 'performance-expert',
    name: 'Performance Expert',
    status: 'idle',
    description: 'Performance optimization and monitoring',
    currentTasks: 0,
    completed: 3,
    lastActivity: '4 hours ago',
    category: 'software-development'
  },
  {
    id: 'dev-design-doc-creator',
    name: 'Dev Design Doc Creator',
    status: 'idle',
    description: 'Technical documentation and architecture design',
    currentTasks: 0,
    completed: 7,
    lastActivity: '3 hours ago',
    category: 'software-development'
  },
  
  // Specialized Services Team
  {
    id: 'communications-agent',
    name: 'Communications Agent',
    status: 'idle',
    description: 'Content creation and narrative development',
    currentTasks: 0,
    completed: 28,
    lastActivity: '15 minutes ago',
    category: 'specialized-services'
  },
  {
    id: 'researcher-agent',
    name: 'Researcher Agent',
    status: 'active',
    description: 'Data gathering and analysis',
    currentTasks: 2,
    completed: 38,
    lastActivity: '1 minute ago',
    category: 'specialized-services'
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    status: 'working',
    description: 'Data analysis, modeling, and insights generation',
    currentTasks: 1,
    completed: 14,
    lastActivity: '12 minutes ago',
    category: 'specialized-services'
  },
  {
    id: 'image-video-generator',
    name: 'Image Video Generator',
    status: 'idle',
    description: 'Visual content creation and multimedia generation',
    currentTasks: 0,
    completed: 9,
    lastActivity: '1 hour ago',
    category: 'specialized-services'
  },
  {
    id: 'experience-designer',
    name: 'Experience Designer',
    status: 'idle',
    description: 'User experience design and interaction optimization',
    currentTasks: 0,
    completed: 6,
    lastActivity: '2 hours ago',
    category: 'specialized-services'
  },
  {
    id: 'monitoring-expert',
    name: 'Monitoring Expert',
    status: 'active',
    description: 'System monitoring and alerting',
    currentTasks: 1,
    completed: 11,
    lastActivity: '30 minutes ago',
    category: 'specialized-services'
  },
  {
    id: 'availability-reliability-expert',
    name: 'Availability Reliability Expert',
    status: 'idle',
    description: 'System reliability and uptime optimization',
    currentTasks: 0,
    completed: 4,
    lastActivity: '6 hours ago',
    category: 'specialized-services'
  },
  {
    id: 'privacy-guardian',
    name: 'Privacy Guardian',
    status: 'active',
    description: 'Privacy protection and data compliance',
    currentTasks: 1,
    completed: 2,
    lastActivity: '45 minutes ago',
    category: 'specialized-services'
  }
];

export default function AgentDashboard() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

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

  const AgentCard = ({ agent }: { agent: Agent }) => (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
        <span className="flex items-center gap-2">
          <span>{getStatusIndicator(agent.status)}</span>
          <span className={`text-sm ${getStatusColor(agent.status)}`}>
            {agent.status}
          </span>
        </span>
      </div>
      
      <p className="text-gray-300 mb-4 text-sm">{agent.description}</p>
      
      <div className="space-y-2 text-sm text-gray-400 mb-4">
        <div className="flex justify-between">
          <span>Current Tasks:</span>
          <span className="text-blue-400">{agent.currentTasks}</span>
        </div>
        <div className="flex justify-between">
          <span>Completed:</span>
          <span className="text-green-400">{agent.completed}</span>
        </div>
        <div className="flex justify-between">
          <span>Last activity:</span>
          <span>{agent.lastActivity}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Link 
          href={`/agents/${agent.id}`}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-center transition-colors text-sm font-medium"
        >
          Talk to {agent.name}
        </Link>
        <Link 
          href={`/agents/${agent.id}/details`}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );

  const executive = agents.filter(a => a.category === 'executive');
  const command = agents.filter(a => a.category === 'command');
  const coreOps = agents.filter(a => a.category === 'core-operations');
  const softwareDev = agents.filter(a => a.category === 'software-development');
  const specialized = agents.filter(a => a.category === 'specialized-services');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🚀 UPDATED AI Agent Team Dashboard</h1>
              <p className="text-gray-400">Manage and monitor your 20-agent AI team</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {refreshing ? '🔄' : '↻'} Refresh Status
            </button>
          </div>
        </div>

        {/* Executive Level - Personal Assistant */}
        <div className="mb-8">
          <div className="grid grid-cols-1 max-w-2xl mx-auto">
            {executive.map(agent => (
              <div key={agent.id} className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl p-8 border border-purple-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">{agent.name}</h3>
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">{getStatusIndicator(agent.status)}</span>
                    <span className={`text-lg font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </span>
                </div>
                
                <p className="text-gray-200 mb-6">{agent.description}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-400">{agent.currentTasks}</div>
                    <div className="text-gray-300 text-sm">Current Tasks</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{agent.completed}</div>
                    <div className="text-gray-300 text-sm">Completed</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-lg font-medium text-gray-300">{agent.lastActivity}</div>
                    <div className="text-gray-400 text-sm">Last Activity</div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Link 
                    href={`/agents/${agent.id}`}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg text-center transition-colors font-medium"
                  >
                    Talk to {agent.name}
                  </Link>
                  <Link 
                    href={`/agents/${agent.id}/details`}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Command Layer */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Command Layer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {command.map(agent => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        </div>

        {/* Core Operations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Core Operations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreOps.map(agent => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        </div>

        {/* Software Development Team */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Software Development Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwareDev.map(agent => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        </div>

        {/* Specialized Services Team */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Specialized Services Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialized.map(agent => <AgentCard key={agent.id} agent={agent} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
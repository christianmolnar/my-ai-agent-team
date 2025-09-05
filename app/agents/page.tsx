'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Agent {
  id: string
  name: string
  status: 'active' | 'idle' | 'working' | 'offline'
  priority: number
  specialization: string
  lastActivity: string
  capabilities: string[]
  currentTasks: number
  completedTasks: number
}

export default function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents/status')
      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'working': return 'text-blue-600 bg-blue-100'
      case 'idle': return 'text-yellow-600 bg-yellow-100'
      case 'offline': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityBadge = (priority: number) => {
    if (priority === 1) return 'bg-red-100 text-red-800 border-red-200'
    if (priority === 2) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-48 shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI Agent Team Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage and monitor your 20-agent AI team</p>
            </div>
            <div className="flex space-x-4">
              <button 
                onClick={fetchAgents}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Status
              </button>
              <Link 
                href="/agents/orchestrator"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Master Orchestrator
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Core Team Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
            Core Team (Priority 1)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.filter(agent => agent.priority === 1).map((agent) => (
              <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{agent.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{agent.specialization}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Current Tasks:</span>
                      <span className="font-medium">{agent.currentTasks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Completed:</span>
                      <span className="font-medium">{agent.completedTasks}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Last activity: {agent.lastActivity}
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedAgent(agent)}
                    className="w-full mt-4 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting Team Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center">
            <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
            Supporting Team (Priority 2)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.filter(agent => agent.priority === 2).map((agent) => (
              <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{agent.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{agent.specialization}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Current Tasks:</span>
                      <span className="font-medium">{agent.currentTasks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Completed:</span>
                      <span className="font-medium">{agent.completedTasks}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Last activity: {agent.lastActivity}
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedAgent(agent)}
                    className="w-full mt-4 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specialized Team Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
            Specialized Team (Priority 3)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {agents.filter(agent => agent.priority === 3).map((agent) => (
              <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">{agent.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">{agent.specialization}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Current Tasks:</span>
                      <span className="font-medium">{agent.currentTasks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Completed:</span>
                      <span className="font-medium">{agent.completedTasks}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Last activity: {agent.lastActivity}
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedAgent(agent)}
                    className="w-full mt-4 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{selectedAgent.name}</h2>
                <button 
                  onClick={() => setSelectedAgent(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAgent.status)}`}>
                    {selectedAgent.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityBadge(selectedAgent.priority)}`}>
                    Priority {selectedAgent.priority}
                  </span>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Specialization</h3>
                  <p className="text-slate-600">{selectedAgent.specialization}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Capabilities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.capabilities.map((capability, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Current Tasks</h3>
                    <p className="text-2xl font-bold text-blue-600">{selectedAgent.currentTasks}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Completed Tasks</h3>
                    <p className="text-2xl font-bold text-green-600">{selectedAgent.completedTasks}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Last Activity</h3>
                  <p className="text-slate-600">{selectedAgent.lastActivity}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

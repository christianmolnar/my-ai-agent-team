'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  title: string
  status: 'planning' | 'active' | 'review' | 'completed'
  priority: 'high' | 'medium' | 'low'
  assignedAgents: string[]
  progress: number
  startDate: string
  deadline: string
  executiveRequester: string
}

interface AgentStatus {
  id: string
  name: string
  status: 'available' | 'busy' | 'offline'
  currentProject: string | null
  utilization: number
}

export default function MasterOrchestratorPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [agents, setAgents] = useState<AgentStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [newProjectRequest, setNewProjectRequest] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projectsRes, agentsRes] = await Promise.all([
        fetch('/api/orchestrator/projects'),
        fetch('/api/orchestrator/agents')
      ])
      
      const projectsData = await projectsRes.json()
      const agentsData = await agentsRes.json()
      
      setProjects(projectsData.projects || [])
      setAgents(agentsData.agents || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewProject = async () => {
    if (!newProjectRequest.trim()) return
    
    try {
      const response = await fetch('/api/orchestrator/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request: newProjectRequest })
      })
      
      if (response.ok) {
        setNewProjectRequest('')
        fetchData()
      }
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'busy': return 'text-blue-600 bg-blue-100'
      case 'planning': case 'available': return 'text-green-600 bg-green-100'
      case 'review': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-purple-600 bg-purple-100'
      case 'offline': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-32 shadow-sm"></div>
                ))}
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-xl h-64 shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Master Orchestrator</h1>
              <p className="text-slate-600 mt-1">Central command for multi-agent project coordination</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/agents"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Agent Dashboard
              </Link>
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* New Project Request */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">New Executive Request</h2>
                <div className="space-y-4">
                  <textarea
                    value={newProjectRequest}
                    onChange={(e) => setNewProjectRequest(e.target.value)}
                    placeholder="Enter executive request (e.g., 'Create a New Orleans Piano masterclass for Dr. John song [YouTube URL]')"
                    className="w-full p-4 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <button
                    onClick={handleNewProject}
                    disabled={!newProjectRequest.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Orchestrate Project
                  </button>
                </div>
              </div>
            </div>

            {/* Active Projects */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Active Projects</h2>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-slate-900">{project.title}</h3>
                          <p className="text-slate-600 text-sm">Requested by: {project.executiveRequester}</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {project.assignedAgents.slice(0, 3).map((agentId, index) => (
                            <div key={agentId} className="w-8 h-8 bg-blue-100 border-2 border-white rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                              {agentId.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {project.assignedAgents.length > 3 && (
                            <div className="w-8 h-8 bg-slate-100 border-2 border-white rounded-full flex items-center justify-center text-xs font-medium text-slate-600">
                              +{project.assignedAgents.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">
                          Due: {new Date(project.deadline).toLocaleDateString()}
                        </div>
                        <button 
                          onClick={() => setSelectedProject(project)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Agent Status */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Agent Status</h2>
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg">
                      <div>
                        <div className="font-medium text-slate-900">{agent.name}</div>
                        <div className="text-xs text-slate-600">{agent.currentProject || 'Available'}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                          {agent.status}
                        </span>
                        <div className="text-xs text-slate-600 mt-1">{agent.utilization}% util</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Link href="/agents/music-coach" className="block w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm text-center">
                    Music Coach Agent
                  </Link>
                  <Link href="/agents/personal-assistant" className="block w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm text-center">
                    Personal Assistant
                  </Link>
                  <Link href="/agents/project-coordinator" className="block w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm text-center">
                    Project Coordinator
                  </Link>
                  <button className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm">
                    View All Agents
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">{selectedProject.title}</h2>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Project Status</h3>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                        {selectedProject.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedProject.priority)}`}>
                        {selectedProject.priority} priority
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Timeline</h3>
                    <div className="text-sm text-slate-600">
                      <div>Start: {new Date(selectedProject.startDate).toLocaleDateString()}</div>
                      <div>Deadline: {new Date(selectedProject.deadline).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Progress</h3>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${selectedProject.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{selectedProject.progress}% complete</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Assigned Agents</h3>
                  <div className="space-y-2">
                    {selectedProject.assignedAgents.map((agentId) => (
                      <div key={agentId} className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                          {agentId.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-900">{agentId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

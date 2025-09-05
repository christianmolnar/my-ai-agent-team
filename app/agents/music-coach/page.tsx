'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface MasterclassRequest {
  artist: string
  song: string
  youtubeUrl: string
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  focusAreas: string[]
}

interface GeneratedContent {
  title: string
  sections: {
    name: string
    content: string
    exercises?: string[]
    notation?: string
    audio?: string
  }[]
}

export default function MusicCoachPage() {
  const [request, setRequest] = useState<MasterclassRequest>({
    artist: '',
    song: '',
    youtubeUrl: '',
    skillLevel: 'intermediate',
    focusAreas: []
  })
  
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [loading, setLoading] = useState(false)

  const focusAreaOptions = [
    'Chord Progressions',
    'Rhythm and Groove',
    'Left Hand Techniques',
    'New Orleans Style',
    'Blues Elements',
    'Gospel Influences',
    'Improvisation',
    'Performance Style'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!request.artist || !request.song) return

    setLoading(true)
    try {
      const response = await fetch('/api/agents/music-coach/masterclass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })
      
      const data = await response.json()
      if (data.success) {
        setGeneratedContent(data.masterclass)
      }
    } catch (error) {
      console.error('Error generating masterclass:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFocusArea = (area: string) => {
    setRequest(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">🎹 Music Coach Agent</h1>
              <p className="text-slate-600 mt-1">Specialized music education and masterclass creation</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/agents/orchestrator"
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Master Orchestrator
              </Link>
              <Link 
                href="/agents"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Agent Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Masterclass Creation Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Create New Masterclass</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={request.artist}
                    onChange={(e) => setRequest(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="e.g., Dr. John"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Song Title
                  </label>
                  <input
                    type="text"
                    value={request.song}
                    onChange={(e) => setRequest(prev => ({ ...prev, song: e.target.value }))}
                    placeholder="e.g., Right Place Wrong Time"
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    YouTube URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={request.youtubeUrl}
                    onChange={(e) => setRequest(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Student Skill Level
                  </label>
                  <select
                    value={request.skillLevel}
                    onChange={(e) => setRequest(prev => ({ ...prev, skillLevel: e.target.value as any }))}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Focus Areas
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {focusAreaOptions.map((area) => (
                      <label key={area} className="flex items-center space-x-2 p-2 hover:bg-slate-50 rounded">
                        <input
                          type="checkbox"
                          checked={request.focusAreas.includes(area)}
                          onChange={() => toggleFocusArea(area)}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-slate-700">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !request.artist || !request.song}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Creating Masterclass...' : 'Generate Masterclass'}
                </button>
              </form>
            </div>
          </div>

          {/* Generated Content Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Masterclass Preview</h2>
              
              {loading && (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-6 bg-slate-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded"></div>
                      <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                    </div>
                  </div>
                </div>
              )}

              {generatedContent && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{generatedContent.title}</h3>
                  </div>
                  
                  {generatedContent.sections.map((section, index) => (
                    <div key={index} className="border-l-4 border-purple-200 pl-4">
                      <h4 className="font-semibold text-slate-900 mb-2">{section.name}</h4>
                      <p className="text-slate-700 text-sm mb-3 leading-relaxed">{section.content}</p>
                      
                      {section.exercises && (
                        <div className="mb-3">
                          <h5 className="font-medium text-slate-800 text-sm mb-1">Practice Exercises:</h5>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {section.exercises.map((exercise, i) => (
                              <li key={i} className="flex items-start">
                                <span className="text-purple-500 mr-2">•</span>
                                {exercise}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {section.notation && (
                        <div className="bg-slate-50 p-3 rounded text-xs text-slate-600 mb-3">
                          <strong>Musical Notation:</strong> {section.notation}
                        </div>
                      )}
                      
                      {section.audio && (
                        <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                          <strong>Audio Example:</strong> {section.audio}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!generatedContent && !loading && (
                <div className="text-center text-slate-500 py-12">
                  <div className="text-6xl mb-4">🎼</div>
                  <p>Create a masterclass to see the preview here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-3">🎹 New Orleans Specialists</h3>
            <div className="space-y-2 text-sm">
              <button className="block w-full text-left p-2 hover:bg-slate-50 rounded">Dr. John Masterclass</button>
              <button className="block w-full text-left p-2 hover:bg-slate-50 rounded">Professor Longhair Style</button>
              <button className="block w-full text-left p-2 hover:bg-slate-50 rounded">Art Neville Techniques</button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-3">🎼 Quick Lessons</h3>
            <div className="space-y-2 text-sm">
              <button className="block w-full text-left p-2 hover:bg-slate-50 rounded">Blues Progressions</button>
              <button className="block w-full text-left p-2 hover:bg-slate-50 rounded">Gospel Chords</button>
              <button className="block w-full text-left p-2 hover:bg-slate-50 rounded">Rhythm Patterns</button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-3">🎯 Practice Tools</h3>
            <div className="space-y-2 text-sm">
              <button className="block w-full text-left p-2 hover:bg-slate-50 rounded">Chord Trainer</button>
              <button className="block w-full text-left p-2 hover:bg-slate-50 rounded">Rhythm Generator</button>
              <button className="block w-full text-left p-2 hover:bg-slate-50 rounded">Progress Tracker</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

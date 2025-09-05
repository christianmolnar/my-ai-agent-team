'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MusicCoachPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'agent', content: 'Hello! I\'m your Music Coach. I specialize in New Orleans piano, jazz theory, and music education. How can I help you today?' }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { role: 'user', content: message }]);
      setMessage('');
      
      // Simulate agent response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'agent', 
          content: 'I understand you\'re interested in music! As your Music Coach, I can help with piano techniques, jazz theory, improvisation, and specifically New Orleans style piano. What would you like to explore?' 
        }]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/agents" className="text-gray-400 hover:text-white transition-colors">
              ← Back
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Music Coach</h1>
              <p className="text-gray-400">Music education and New Orleans piano expertise</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🔄</span>
            <span className="text-blue-400 text-sm">Working</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Capabilities */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Capabilities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <span className="text-gray-300 text-sm">New Orleans Piano</span>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <span className="text-gray-300 text-sm">Jazz Theory</span>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <span className="text-gray-300 text-sm">Music Education</span>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <span className="text-gray-300 text-sm">Improvisation</span>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-8 h-8 ${msg.role === 'agent' ? 'bg-orange-500' : 'bg-blue-500'} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                  {msg.role === 'agent' ? 'M' : 'U'}
                </div>
                <div className="bg-gray-700 rounded-lg p-3 max-w-md">
                  <p className="text-gray-200">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Ask about New Orleans piano, jazz theory, or music education..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
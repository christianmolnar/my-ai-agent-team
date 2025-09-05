"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

const agentData = {
  'personal-assistant': {
    name: 'Personal Assistant',
    description: 'Executive stakeholder interface and relationship management',
    capabilities: ['Meeting scheduling', 'Email management', 'Task prioritization', 'Relationship tracking'],
    greeting: 'Hello! I\'m your Personal Assistant. How can I help you today?'
  },
  'master-orchestrator': {
    name: 'Master Orchestrator',
    description: 'Multi-agent project coordination and strategic planning',
    capabilities: ['Project coordination', 'Agent delegation', 'Strategic planning', 'Resource allocation'],
    greeting: 'I\'m the Master Orchestrator. I can coordinate complex projects across multiple agents.'
  },
  'music-coach': {
    name: 'Music Coach',
    description: 'Music education and New Orleans piano expertise',
    capabilities: ['Piano instruction', 'New Orleans style teaching', 'Music theory', 'Practice guidance'],
    greeting: 'Welcome to your music lesson! I\'m here to help you master New Orleans piano style.'
  },
  'project-coordinator': {
    name: 'Project Coordinator',
    description: 'Timeline management and resource allocation',
    capabilities: ['Timeline management', 'Resource planning', 'Milestone tracking', 'Team coordination'],
    greeting: 'Hi! I\'m your Project Coordinator. Let\'s organize your projects and timelines.'
  },
  'researcher-agent': {
    name: 'Researcher Agent',
    description: 'Data gathering and analysis',
    capabilities: ['Web research', 'Data analysis', 'Report generation', 'Source verification'],
    greeting: 'I\'m your Research Agent. What would you like me to investigate?'
  }
  // Add more agents as needed
};

export default function AgentPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'agent'}[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const agent = agentData[agentId as keyof typeof agentData];

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Agent Not Found</h1>
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

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = currentMessage;
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setCurrentMessage('');
    setIsLoading(true);

    // Simulate agent response (replace with actual API call)
    setTimeout(() => {
      let response = '';
      if (agentId === 'music-coach' && userMessage.toLowerCase().includes('new orleans')) {
        response = 'Great choice! New Orleans piano style is rich with blues, jazz, and ragtime influences. Let me break down the key elements: syncopated rhythms, blue notes, and the famous "second line" groove. Would you like to start with some basic chord progressions?';
      } else if (agentId === 'personal-assistant') {
        response = `I understand you need help with "${userMessage}". Let me coordinate with the appropriate specialists to provide you with a comprehensive solution.`;
      } else {
        response = `I received your request: "${userMessage}". As your ${agent.name}, I'm processing this and will provide you with detailed assistance.`;
      }
      
      setMessages(prev => [...prev, { text: response, sender: 'agent' }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
              <p className="text-gray-400">{agent.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">🟢</span>
            <span className="text-green-400 text-sm">Active</span>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Capabilities</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {agent.capabilities.map((capability, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3 text-center">
                <span className="text-gray-300 text-sm">{capability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="h-96 overflow-y-auto mb-4 space-y-4">
            {/* Initial greeting */}
            {messages.length === 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {agent.name.charAt(0)}
                </div>
                <div className="bg-gray-700 rounded-lg p-3 max-w-md">
                  <p className="text-gray-200">{agent.greeting}</p>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                {message.sender === 'agent' && (
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {agent.name.charAt(0)}
                  </div>
                )}
                <div className={`rounded-lg p-3 max-w-md ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-200'
                }`}>
                  <p>{message.text}</p>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {agent.name.charAt(0)}
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Message ${agent.name}...`}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !currentMessage.trim()}
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

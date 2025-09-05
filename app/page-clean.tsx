"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [message, setMessage] = useState<string>("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-400 mb-2">
            AI Agent Team - Foundation
          </h1>
          <p className="text-gray-400 text-lg">
            Bare bones infrastructure ready for agent implementation
          </p>
        </div>

        {/* Status Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-orange-400 mb-4">Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-gray-200">
              <span className="text-green-400">✅</span>
              <span>Next.js foundation established</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <span className="text-green-400">✅</span>
              <span>TypeScript configuration ready</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <span className="text-green-400">✅</span>
              <span>Component structure in place</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <span className="text-green-400">✅</span>
              <span>API routes directory prepared</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <span className="text-green-400">✅</span>
              <span>Agent files transferred (Phase 2)</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <span className="text-green-400">✅</span>
              <span>Core agent pages functional</span>
            </div>
            <div className="flex items-center gap-3 text-gray-200">
              <span className="text-blue-400">🔄</span>
              <span>Ready for optimization (Phase 3)</span>
            </div>
          </div>
        </div>

        {/* AI Agents Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-orange-400 mb-4">AI Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/agents/communications-agent"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 p-4 rounded-lg text-center transition-colors border border-gray-600 hover:border-gray-500"
            >
              Communications Agent
            </Link>
            <Link
              href="/agents/researcher-agent"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 p-4 rounded-lg text-center transition-colors border border-gray-600 hover:border-gray-500"
            >
              Researcher Agent
            </Link>
            <Link
              href="/agents/image-video-generator"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 p-4 rounded-lg text-center transition-colors border border-gray-600 hover:border-gray-500"
            >
              Image and Video Generator Agent
            </Link>
            <Link
              href="/agents/full-stack-developer"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 p-4 rounded-lg text-center transition-colors border border-gray-600 hover:border-gray-500"
            >
              Full Stack Developer Agent
            </Link>
            <Link
              href="/agents/data-scientist"
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 p-4 rounded-lg text-center transition-colors border border-gray-600 hover:border-gray-500"
            >
              Data Scientist Agent
            </Link>
          </div>
          
          {/* Configure API Keys Button */}
          <div className="flex justify-center mt-6">
            <Link
              href="/api-status"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              🔧 Configure API Keys
            </Link>
          </div>
        </div>

        {/* Test Message Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-orange-400 mb-4">Test Message</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a test message..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={() => setMessage("")}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Navigation to Full Dashboard */}
        <div className="text-center mt-8">
          <Link
            href="/agents"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg"
          >
            View Full Agent Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function DataScientistAgentPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl bg-white/10 rounded-2xl shadow-xl p-10 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">Data Scientist Agent</h1>
        <p className="text-lg text-gray-200 mb-8 text-center max-w-xl">
          The Data Scientist Agent analyzes data, builds predictive models, and provides actionable insights to support decision-making and agent collaboration.
        </p>
        <section className="w-full bg-white/5 rounded-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Recent Activity</h2>
          <div className="text-gray-300">(Activity log integration coming soon...)</div>
        </section>
        <section className="w-full bg-white/5 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Capabilities</h2>
          <ul className="list-disc list-inside text-gray-200 space-y-1">
            <li>Data analysis and visualization</li>
            <li>Predictive modeling</li>
            <li>Insight generation</li>
            <li>Collaboration with other agents</li>
          </ul>
        </section>
      </div>
    </main>
  );
}

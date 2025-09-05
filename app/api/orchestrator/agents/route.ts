import { NextRequest, NextResponse } from 'next/server';

// Mock agent status data for orchestrator view
const mockOrchestratorAgents = [
  {
    id: 'personal-assistant-agent',
    name: 'Personal Assistant',
    status: 'available' as const,
    currentProject: null,
    utilization: 45
  },
  {
    id: 'project-coordinator',
    name: 'Project Coordinator',
    status: 'busy' as const,
    currentProject: 'New Orleans Piano Masterclass',
    utilization: 75
  },
  {
    id: 'music-coach',
    name: 'Music Coach',
    status: 'busy' as const,
    currentProject: 'New Orleans Piano Masterclass',
    utilization: 85
  },
  {
    id: 'communications-agent',
    name: 'Communications Agent',
    status: 'busy' as const,
    currentProject: 'Documentation Update',
    utilization: 60
  },
  {
    id: 'researcher-agent',
    name: 'Researcher Agent',
    status: 'available' as const,
    currentProject: null,
    utilization: 20
  },
  {
    id: 'experience-designer',
    name: 'Experience Designer',
    status: 'available' as const,
    currentProject: null,
    utilization: 30
  }
];

export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch real-time agent status from private repository
    return NextResponse.json({
      success: true,
      agents: mockOrchestratorAgents,
      totalCount: mockOrchestratorAgents.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching agent status for orchestrator:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent status' },
      { status: 500 }
    );
  }
}

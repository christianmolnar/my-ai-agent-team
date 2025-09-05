import { NextRequest, NextResponse } from 'next/server';

// Mock project data
const mockProjects = [
  {
    id: 'project-1',
    title: 'New Orleans Piano Masterclass - Dr. John Style',
    status: 'active' as const,
    priority: 'high' as const,
    assignedAgents: ['music-coach', 'researcher-agent', 'communications-agent', 'experience-designer'],
    progress: 65,
    startDate: '2025-09-01',
    deadline: '2025-09-05',
    executiveRequester: 'Christian Molnar'
  },
  {
    id: 'project-2',
    title: 'AI Agent Team Documentation Update',
    status: 'review' as const,
    priority: 'medium' as const,
    assignedAgents: ['dev-design-doc-creator', 'communications-agent'],
    progress: 90,
    startDate: '2025-08-28',
    deadline: '2025-09-06',
    executiveRequester: 'Christian Molnar'
  },
  {
    id: 'project-3',
    title: 'System Performance Optimization',
    status: 'planning' as const,
    priority: 'medium' as const,
    assignedAgents: ['performance-expert', 'back-end-developer', 'monitoring-expert'],
    progress: 15,
    startDate: '2025-09-03',
    deadline: '2025-09-10',
    executiveRequester: 'Christian Molnar'
  }
];

export async function GET(request: NextRequest) {
  try {
    // In production, this would fetch from the private repository project management system
    return NextResponse.json({
      success: true,
      projects: mockProjects,
      totalCount: mockProjects.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

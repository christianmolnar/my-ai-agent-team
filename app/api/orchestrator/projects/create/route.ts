import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { request: projectRequest } = await request.json();
    
    if (!projectRequest || !projectRequest.trim()) {
      return NextResponse.json(
        { success: false, error: 'Project request is required' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Parse the executive request using AI
    // 2. Determine required agents based on request type
    // 3. Create project in private repository system
    // 4. Assign agents and create initial project plan
    // 5. Start coordination workflow

    // For now, simulate project creation
    const newProject = {
      id: `project-${Date.now()}`,
      title: extractProjectTitle(projectRequest),
      status: 'planning' as const,
      priority: determinePriority(projectRequest),
      assignedAgents: determineRequiredAgents(projectRequest),
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      deadline: calculateDeadline(projectRequest),
      executiveRequester: 'Christian Molnar', // In production, would be extracted from auth
      originalRequest: projectRequest
    };

    console.log('New project created:', newProject);

    return NextResponse.json({
      success: true,
      project: newProject,
      message: 'Project orchestration initiated'
    });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// Helper functions for project analysis
function extractProjectTitle(request: string): string {
  // Simple extraction - in production would use AI
  if (request.toLowerCase().includes('masterclass')) {
    return 'Music Masterclass Creation';
  }
  if (request.toLowerCase().includes('piano')) {
    return 'Piano Learning Content';
  }
  if (request.toLowerCase().includes('new orleans')) {
    return 'New Orleans Style Music Content';
  }
  return 'Executive Request Project';
}

function determinePriority(request: string): 'high' | 'medium' | 'low' {
  // Simple priority determination - in production would use AI
  if (request.toLowerCase().includes('urgent') || request.toLowerCase().includes('asap')) {
    return 'high';
  }
  if (request.toLowerCase().includes('masterclass') || request.toLowerCase().includes('learning')) {
    return 'high'; // Educational content is high priority
  }
  return 'medium';
}

function determineRequiredAgents(request: string): string[] {
  const agents = ['personal-assistant-agent', 'project-coordinator'];
  
  // Music-related requests
  if (request.toLowerCase().includes('music') || request.toLowerCase().includes('piano')) {
    agents.push('music-coach');
  }
  
  // Content creation requests
  if (request.toLowerCase().includes('masterclass') || request.toLowerCase().includes('content')) {
    agents.push('communications-agent', 'experience-designer');
  }
  
  // Research-intensive requests
  if (request.toLowerCase().includes('research') || request.toLowerCase().includes('analyze')) {
    agents.push('researcher-agent');
  }
  
  return agents;
}

function calculateDeadline(request: string): string {
  // Simple deadline calculation - in production would use AI and scheduling
  const days = request.toLowerCase().includes('urgent') ? 3 : 7;
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + days);
  return deadline.toISOString().split('T')[0];
}

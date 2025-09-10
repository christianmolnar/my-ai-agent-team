/**
 * Interaction Logs API Routes
 * RESTful endpoints for viewing agent interaction logs and session history
 */

import { NextRequest, NextResponse } from 'next/server';
import { interactionLogger } from '../../../lib/interaction-logger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'recent-sessions':
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
        const recentSessions = await interactionLogger.getRecentSessions(limit);
        return NextResponse.json({ success: true, data: recentSessions });

      case 'session-details':
        const sessionId = searchParams.get('sessionId');
        if (!sessionId) {
          return NextResponse.json({
            success: false,
            error: 'sessionId is required'
          }, { status: 400 });
        }

        const sessionDetails = await interactionLogger.getSessionHistory(sessionId);
        return NextResponse.json({ success: true, data: sessionDetails });

      case 'interaction-stats':
        const periodStart = searchParams.get('periodStart') ? new Date(searchParams.get('periodStart')!) : undefined;
        const periodEnd = searchParams.get('periodEnd') ? new Date(searchParams.get('periodEnd')!) : undefined;
        
        const stats = await interactionLogger.getInteractionStats(periodStart, periodEnd);
        return NextResponse.json({ success: true, data: stats });

      case 'search':
        const query = searchParams.get('query') || '';
        const agentFilter = searchParams.get('agentFilter') || undefined;
        const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
        const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

        const dateRange = (startDate && endDate) ? { start: startDate, end: endDate } : undefined;
        const searchResults = await interactionLogger.searchInteractions(query, agentFilter, dateRange);
        
        return NextResponse.json({ success: true, data: searchResults });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: recent-sessions, session-details, interaction-stats, search'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Interaction Logs API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve interaction log data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'start-session':
        const { userId, userRequest, requestSummary } = body;
        
        if (!userId || !userRequest) {
          return NextResponse.json({
            success: false,
            error: 'userId and userRequest are required'
          }, { status: 400 });
        }

        const sessionId = await interactionLogger.startChatSession(userId, userRequest, requestSummary);
        
        return NextResponse.json({
          success: true,
          data: { sessionId },
          message: 'Chat session started successfully'
        });

      case 'log-agent-task':
        const taskData = body.taskData;
        
        if (!taskData || !taskData.sessionId || !taskData.agentId || !taskData.taskAssigned) {
          return NextResponse.json({
            success: false,
            error: 'sessionId, agentId, and taskAssigned are required in taskData'
          }, { status: 400 });
        }

        const interactionId = await interactionLogger.logAgentInteraction(
          taskData.sessionId,
          taskData.agentId,
          taskData.agentName || taskData.agentId,
          taskData.taskAssigned,
          taskData.inputReceived || '',
          taskData.agentType || 'specialist',
          taskData.taskPriority || 'medium',
          taskData.taskComplexity || 'moderate',
          taskData.assignedBy || 'project-coordinator'
        );

        return NextResponse.json({
          success: true,
          data: { interactionId },
          message: 'Agent task logged successfully'
        });

      case 'complete-agent-task':
        const completionData = body.completionData;
        
        if (!completionData || !completionData.sessionId || !completionData.interactionId || !completionData.outputProduced) {
          return NextResponse.json({
            success: false,
            error: 'sessionId, interactionId, and outputProduced are required in completionData'
          }, { status: 400 });
        }

        await interactionLogger.completeAgentInteraction(
          completionData.sessionId,
          completionData.interactionId,
          completionData.outputProduced,
          completionData.success !== false,
          completionData.executionTimeMs
        );

        return NextResponse.json({
          success: true,
          message: 'Agent task completed successfully'
        });

      case 'complete-session':
        const sessionData = body.sessionData;
        
        if (!sessionData || !sessionData.sessionId || !sessionData.finalResponse) {
          return NextResponse.json({
            success: false,
            error: 'sessionId and finalResponse are required in sessionData'
          }, { status: 400 });
        }

        await interactionLogger.completeChatSession(
          sessionData.sessionId,
          sessionData.finalResponse,
          sessionData.deliverables || [],
          sessionData.userSatisfaction
        );

        return NextResponse.json({
          success: true,
          message: 'Chat session completed successfully'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: start-session, log-agent-task, complete-agent-task, complete-session'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Interaction Logs POST Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process interaction log request'
    }, { status: 500 });
  }
}

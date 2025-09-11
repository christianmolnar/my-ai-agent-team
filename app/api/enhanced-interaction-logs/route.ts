import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../../../lib/enhanced-agent-logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'session'; // 'session', 'all', 'agent', 'errors'
    const limit = parseInt(searchParams.get('limit') || '50');
    const agentName = searchParams.get('agent');
    const actionType = searchParams.get('actionType');

    let logs;
    let metadata = {};

    switch (scope) {
      case 'session':
        logs = logger.getSessionLogs(limit);
        metadata = { sessionId: logger.getCurrentSessionId() };
        break;
      
      case 'all':
        logs = logger.getAllRecentLogs(limit);
        break;
      
      case 'agent':
        if (!agentName) {
          return NextResponse.json(
            { success: false, error: 'Agent name required for agent scope' },
            { status: 400 }
          );
        }
        logs = logger.getLogsByAgent(agentName, limit);
        metadata = { agentName };
        break;
      
      case 'actionType':
        if (!actionType) {
          return NextResponse.json(
            { success: false, error: 'Action type required for actionType scope' },
            { status: 400 }
          );
        }
        logs = logger.getLogsByActionType(actionType as any, limit);
        metadata = { actionType };
        break;
      
      case 'errors':
        logs = logger.getErrorLogs(limit);
        break;
      
      case 'stats':
        const stats = logger.getInteractionStats();
        return NextResponse.json({
          success: true,
          stats
        });
      
      default:
        logs = logger.getSessionLogs(limit);
        metadata = { sessionId: logger.getCurrentSessionId() };
    }

    // Convert logs to the format expected by the UI
    const formattedLogs = logs.map(log => ({
      sessionId: log.sessionId,
      timestamp: new Date(log.timestamp).toLocaleString(),
      agent: log.agentName,
      action: log.action,
      details: log.details,
      status: log.status,
      actionType: log.actionType,
      executionTime: log.executionTime,
      errorDetails: log.errorDetails
    }));

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      metadata: {
        ...metadata,
        count: formattedLogs.length,
        scope,
        limit
      },
      source: 'enhanced-agent-logger'
    });

  } catch (error) {
    console.error('Enhanced interaction logs API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load enhanced interaction logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, agentName, details, status, actionType, executionTime, errorDetails } = body;

    // Validate required fields
    if (!agentName || !action || !details) {
      return NextResponse.json(
        { success: false, error: 'agentName, action, and details are required' },
        { status: 400 }
      );
    }

    // Log the interaction
    logger.logInteraction({
      agentName,
      agentType: 'AI Agent',
      actionType: actionType || 'other',
      action,
      details,
      status: status || 'success',
      executionTime,
      errorDetails
    });

    return NextResponse.json({
      success: true,
      message: 'Interaction logged successfully'
    });

  } catch (error) {
    console.error('Enhanced interaction logs POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log interaction' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../../../lib/enhanced-agent-logger';
import fs from 'fs';
import path from 'path';

// Helper function to get session summary data from file
function getSessionSummaryById(sessionId: string): any | null {
  try {
    const logsDir = path.join(process.cwd(), 'data/interaction-logs');
    const filePath = path.join(logsDir, `${sessionId}.json`);
    
    if (fs.existsSync(filePath)) {
      const sessionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return sessionData;
    }
    return null;
  } catch (error) {
    console.error(`Error reading session file for ${sessionId}:`, error);
    return null;
  }
}

// Helper function to read file-based session logs and convert to enhanced logger format
function getFileBasedSessionLogs(limit: number = 100): any[] {
  try {
    const logsDir = path.join(process.cwd(), 'data/interaction-logs');
    if (!fs.existsSync(logsDir)) return [];

    const files = fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.json') && file.startsWith('session_'))
      .sort()
      .reverse() // Most recent first
      .slice(0, 20); // Limit files to read for performance

    const allLogs: any[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(logsDir, file);
        const sessionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        if (sessionData.interactions && Array.isArray(sessionData.interactions)) {
          for (const interaction of sessionData.interactions) {
            allLogs.push({
              id: interaction.id,
              sessionId: interaction.sessionId,
              timestamp: interaction.timestamp,
              agentName: interaction.agentName,
              agentType: interaction.agentType,
              actionType: interaction.status === 'completed' ? 'task_completed' : 'task_received',
              action: interaction.status === 'completed' ? 'Task Completed' : 'Task Assigned',
              details: interaction.status === 'completed' ? 
                (interaction.outputProduced || interaction.outputSummary || 'Task completed') :
                (interaction.taskAssigned || interaction.taskSummary || 'Task assigned'),
              status: interaction.status === 'completed' ? 'success' : 'in_progress',
              executionTime: interaction.executionTimeMs || 0
            });
          }
        }
      } catch (fileError) {
        console.error(`Error reading session file ${file}:`, fileError);
      }
    }

    return allLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error reading file-based session logs:', error);
    return [];
  }
}

// Helper function to get logs for a specific session from files
function getFileBasedSessionLogsById(sessionId: string): any[] {
  try {
    const logsDir = path.join(process.cwd(), 'data/interaction-logs');
    const filePath = path.join(logsDir, `${sessionId}.json`);
    
    if (!fs.existsSync(filePath)) return [];
    
    const sessionData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const logs: any[] = [];
    
    if (sessionData.interactions && Array.isArray(sessionData.interactions)) {
      for (const interaction of sessionData.interactions) {
        logs.push({
          id: interaction.id,
          sessionId: interaction.sessionId,
          timestamp: interaction.timestamp,
          agentName: interaction.agentName,
          agentType: interaction.agentType,
          actionType: interaction.status === 'completed' ? 'task_completed' : 'task_received',
          action: interaction.status === 'completed' ? 'Task Completed' : 'Task Assigned',
          details: interaction.status === 'completed' ? 
            (interaction.outputProduced || interaction.outputSummary || 'Task completed') :
            (interaction.taskAssigned || interaction.taskSummary || 'Task assigned'),
          status: interaction.status === 'completed' ? 'success' : 'in_progress',
          executionTime: interaction.executionTimeMs || 0
        });
      }
    }
    
    return logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } catch (error) {
    console.error(`Error reading session ${sessionId}:`, error);
    return [];
  }
}

// Helper function to get available session IDs from files
function getAvailableFileSessions(): string[] {
  try {
    const logsDir = path.join(process.cwd(), 'data/interaction-logs');
    if (!fs.existsSync(logsDir)) return [];

    return fs.readdirSync(logsDir)
      .filter(file => file.endsWith('.json') && file.startsWith('session_'))
      .map(file => file.replace('.json', ''))
      .sort()
      .reverse()
      .slice(0, 20); // Limit to 20 most recent sessions
  } catch (error) {
    console.error('Error getting available file sessions:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'session'; // 'session', 'all', 'agent', 'errors'
    const limit = parseInt(searchParams.get('limit') || '50');
    const agentName = searchParams.get('agent');
    const actionType = searchParams.get('actionType');
    const sessionId = searchParams.get('sessionId');

    let logs;
    let metadata = {};

    switch (scope) {
      case 'session':
        if (sessionId) {
          // Get session summary data for specific session
          const sessionSummary = getSessionSummaryById(sessionId);
          if (sessionSummary) {
            return NextResponse.json({
              success: true,
              sessionSummary,
              metadata: { sessionId, scope: 'session' }
            });
          } else {
            // Fallback to original log format if session file not found
            const memoryLogs = logger.getLogsBySessionId(sessionId, limit);
            const fileLogs = getFileBasedSessionLogsById(sessionId);
            logs = [...memoryLogs, ...fileLogs]
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
              .slice(0, limit);
            metadata = { sessionId };
          }
        } else {
          // Get current session logs from memory AND check file-based logs for current session
          const currentSessionId = logger.getCurrentSessionId();
          const memoryLogs = logger.getSessionLogs(limit);
          const fileLogs = getFileBasedSessionLogsById(currentSessionId);
          logs = [...memoryLogs, ...fileLogs]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
            .slice(0, limit);
          metadata = { sessionId: currentSessionId };
        }
        break;
      
      case 'all':
        // Combine in-memory and file-based logs
        const allMemoryLogs = logger.getAllRecentLogs(limit);
        const allFileLogs = getFileBasedSessionLogs(limit);
        logs = [...allMemoryLogs, ...allFileLogs]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
        break;
      
      case 'sessions':
        // Return available session IDs for dropdown
        const memorySessions = logger.getAllRecentLogs(100)
          .map(log => log.sessionId)
          .filter((sessionId, index, arr) => arr.indexOf(sessionId) === index);
        const fileSessions = getAvailableFileSessions();
        const allSessions = [...memorySessions, ...fileSessions]
          .filter((sessionId, index, arr) => arr.indexOf(sessionId) === index)
          .slice(0, 20);
        
        return NextResponse.json({
          success: true,
          sessions: allSessions,
          metadata: { count: allSessions.length },
          source: 'enhanced-agent-logger'
        });
      
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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId } = body;

    if (sessionId) {
      // Clear specific session and archive the file
      try {
        const logsDir = path.join(process.cwd(), 'data/interaction-logs');
        const archivedDir = path.join(process.cwd(), 'data/interaction-logs/archived');
        
        // Create archived directory if it doesn't exist
        if (!fs.existsSync(archivedDir)) {
          fs.mkdirSync(archivedDir, { recursive: true });
        }
        
        const sourceFile = path.join(logsDir, `${sessionId}.json`);
        const archivedFile = path.join(archivedDir, `${sessionId}.json`);
        
        // Move the file to archived folder if it exists
        if (fs.existsSync(sourceFile)) {
          fs.renameSync(sourceFile, archivedFile);
        }
        
        // Clear from memory logs for this session (if any)
        logger.clearSessionLogs(sessionId);
        
        return NextResponse.json({
          success: true,
          message: `Session ${sessionId} cleared and archived successfully`
        });
      } catch (error) {
        console.error(`Error archiving session ${sessionId}:`, error);
        return NextResponse.json(
          { success: false, error: 'Failed to archive session' },
          { status: 500 }
        );
      }
    } else {
      // Clear all logs (original behavior)
      logger.clearLogs();

      return NextResponse.json({
        success: true,
        message: 'All logs cleared successfully'
      });
    }

  } catch (error) {
    console.error('Enhanced interaction logs DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear logs' },
      { status: 500 }
    );
  }
}

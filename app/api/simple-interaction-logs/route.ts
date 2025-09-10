import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Import the PersonalAssistantBridge to get live audit logs
    const { PersonalAssistantBridge } = await import('../../../agents/PersonalAssistantBridge');
    
    // Create a bridge instance (now with shared static audit log)
    const bridge = new PersonalAssistantBridge();
    
    // Get the current session's audit log
    const auditLogResult = await bridge.handleTask({
      type: 'get-audit-log',
      payload: {}
    });
    
    if (auditLogResult.success && auditLogResult.result) {
      const auditData = auditLogResult.result;
      const recentEntries = auditData.recent_entries || [];
      
      // Find the most recent conversation session by looking for conversation-related entries
      // A new conversation session starts when we see bridge initialization followed by conversation entries
      const conversationEntries = recentEntries.filter((entry: any) => {
        const action = entry.action;
        // Include conversation-related actions, exclude system maintenance
        return !action.includes('bridge-initialized') && 
               !action.includes('get-audit-log') &&
               (action.includes('get-identity-data') || 
                action.includes('get-communications-style') || 
                action.includes('get-project-context') || 
                action.includes('get-cns-data') ||
                action.includes('conversation') ||
                action.includes('user-message') ||
                action.includes('agent-response'));
      });
      
      // Group entries by conversation session (entries with similar timestamps belong to same conversation)
      let currentSessionEntries: any[] = [];
      if (conversationEntries.length > 0) {
        // Find the most recent conversation session by looking for a gap in timestamps
        const sortedEntries = conversationEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const mostRecentTime = new Date(sortedEntries[0].timestamp).getTime();
        
        // More relaxed session detection - include all entries within 30 minutes of most recent
        const sessionWindow = 30 * 60 * 1000; // 30 minutes for current session
        
        // Include all entries within the session window - no gap threshold restrictions
        currentSessionEntries = sortedEntries.filter(entry => {
          const entryTime = new Date(entry.timestamp).getTime();
          return (mostRecentTime - entryTime) <= sessionWindow;
        });
        
        // Sort back to chronological order for display
        currentSessionEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      }
      
      // Convert audit entries to log format for UI
      const currentSessionLogs = currentSessionEntries.map((entry: any, index: number) => ({
        sessionId: 'current-session',
        timestamp: entry.timestamp,
        agent: entry.agent.split('-').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        action: entry.action.replace(/-/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase()),
        details: entry.summary || `${entry.action} operation for ${entry.dataType}`
      }));
      
      // Return real conversation logs or empty state
      return NextResponse.json({
        success: true,
        logs: currentSessionLogs,
        source: currentSessionLogs.length > 0 ? 'real-bridge-audit-logs' : 'no-conversation-interactions'
      });
    }

    // If bridge audit log access failed, return empty
    return NextResponse.json({
      success: true,
      logs: [],
      source: 'bridge-audit-unavailable'
    });

  } catch (error) {
    console.error('Current session interaction logs API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load current session logs' },
      { status: 500 }
    );
  }
}

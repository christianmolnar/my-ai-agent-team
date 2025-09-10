/**
 * Learning Tracking Service
 * Manages behavior modification history, user feedback, and rollback capabilities
 */

import * as fs from 'fs';
import * as path from 'path';
import { 
  LearningEvent, 
  LearningChange, 
  UserFeedback, 
  LearningStats, 
  LearningHistoryEntry 
} from '../types/learning-tracking';

export class LearningTrackingService {
  private logFilePath: string;
  private backupDir: string;

  constructor() {
    this.logFilePath = path.join(process.cwd(), 'data', 'learning', 'learning-history.jsonl');
    this.backupDir = path.join(process.cwd(), 'data', 'backups');
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist(): void {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Log a new learning event
   */
  async logLearningEvent(event: Omit<LearningEvent, 'id' | 'timestamp' | 'status'>): Promise<string> {
    const learningEvent: LearningEvent = {
      id: this.generateLearningId(),
      timestamp: new Date(),
      status: 'pending',
      ...event
    };

    // Create backup before logging
    if (event.filesModified.length > 0) {
      learningEvent.backupId = await this.createLearningBackup(learningEvent.id, event.filesModified);
    }

    // Append to learning log
    this.appendToLog(learningEvent);

    console.log(`🎓 Learning Event Logged: ${learningEvent.id} - ${event.description}`);
    return learningEvent.id;
  }

  /**
   * Update learning status based on user feedback
   */
  async processFeedback(learningId: string, feedback: UserFeedback): Promise<boolean> {
    try {
      const events = this.readLearningHistory();
      const eventIndex = events.findIndex(e => e.id === learningId);
      
      if (eventIndex === -1) {
        throw new Error(`Learning event ${learningId} not found`);
      }

      const event = events[eventIndex];
      
      // Update event with feedback
      event.userFeedback = feedback;
      event.status = feedback.action === 'internalize' ? 'internalized' : 'forgotten';

      // Process the feedback action
      if (feedback.action === 'forget') {
        await this.revertLearning(event);
        event.status = 'reverted';
      }

      // Update the log
      events[eventIndex] = event;
      this.rewriteLog(events);

      console.log(`✅ Learning ${learningId} ${feedback.action === 'internalize' ? 'internalized' : 'forgotten'}`);
      return true;

    } catch (error) {
      console.error(`❌ Error processing feedback for ${learningId}:`, error);
      return false;
    }
  }

  /**
   * Revert a learning by restoring from backup (if needed)
   */
  private async revertLearning(event: LearningEvent): Promise<void> {
    // If no backup ID, it means no files were modified - just log the reversion
    if (!event.backupId) {
      console.log(`📝 Learning ${event.id} marked as forgotten (no file changes to revert)`);
      return;
    }

    const backupPath = path.join(this.backupDir, `${event.backupId}.json`);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Restore each file from backup
    for (const fileBackup of backup.files) {
      const fullPath = fileBackup.path;
      
      if (fileBackup.existed) {
        // Restore original content
        fs.writeFileSync(fullPath, fileBackup.content, 'utf8');
        console.log(`📄 Restored: ${fullPath}`);
      } else {
        // Delete file that was created
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`🗑️ Deleted: ${fullPath}`);
        }
      }
    }

    console.log(`🔄 Learning reverted using backup: ${event.backupId}`);
  }

  /**
   * Create backup of files before modification
   */
  private async createLearningBackup(learningId: string, filePaths: string[]): Promise<string> {
    const backupId = `backup_${learningId}_${Date.now()}`;
    const backup = {
      id: backupId,
      learningId,
      timestamp: new Date().toISOString(),
      files: [] as Array<{
        path: string;
        existed: boolean;
        content?: string;
      }>
    };

    // Backup each file
    for (const filePath of filePaths) {
      const fileBackup = {
        path: filePath,
        existed: fs.existsSync(filePath),
        content: undefined as string | undefined
      };

      if (fileBackup.existed) {
        fileBackup.content = fs.readFileSync(filePath, 'utf8');
      }

      backup.files.push(fileBackup);
    }

    // Save backup
    const backupPath = path.join(this.backupDir, `${backupId}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    console.log(`💾 Backup created: ${backupId}`);
    return backupId;
  }

  /**
   * Get learning history for UI display
   */
  getLearningHistory(limit?: number): LearningHistoryEntry[] {
    const events = this.readLearningHistory();
    
    const history = events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map(event => ({
        id: event.id,
        timestamp: event.timestamp,
        description: event.description,
        status: event.status,
        filesModified: event.filesModified,
        userAction: event.userFeedback?.action,
        canRollback: event.status === 'internalized' && !!event.backupId
      }));

    return history;
  }

  /**
   * Get learning statistics
   */
  getLearningStats(): LearningStats {
    const events = this.readLearningHistory();
    
    const stats: LearningStats = {
      totalLearnings: events.length,
      internalized: events.filter(e => e.status === 'internalized').length,
      forgotten: events.filter(e => e.status === 'reverted').length,
      pending: events.filter(e => e.status === 'pending').length,
      successRate: 0,
      avgComplexity: 0,
      topAreas: [],
      recentTrends: {
        last7Days: 0,
        last30Days: 0,
        growthRate: 0
      }
    };

    if (stats.totalLearnings > 0) {
      stats.successRate = (stats.internalized / stats.totalLearnings) * 100;
      
      // Calculate complexity average
      const complexityMap = { simple: 1, moderate: 2, complex: 3 };
      const totalComplexity = events.reduce((sum, e) => sum + complexityMap[e.complexity], 0);
      stats.avgComplexity = totalComplexity / events.length;

      // Top areas
      const areaMap = new Map<string, { count: number; internalized: number }>();
      events.forEach(e => {
        if (!areaMap.has(e.area)) {
          areaMap.set(e.area, { count: 0, internalized: 0 });
        }
        const area = areaMap.get(e.area)!;
        area.count++;
        if (e.status === 'internalized') area.internalized++;
      });

      stats.topAreas = Array.from(areaMap.entries())
        .map(([area, data]) => ({
          area,
          count: data.count,
          successRate: (data.internalized / data.count) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent trends
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      stats.recentTrends.last7Days = events.filter(e => 
        new Date(e.timestamp) >= last7Days
      ).length;

      stats.recentTrends.last30Days = events.filter(e => 
        new Date(e.timestamp) >= last30Days
      ).length;

      stats.recentTrends.growthRate = stats.recentTrends.last7Days > 0 
        ? (stats.recentTrends.last7Days / 7) * 30 
        : 0;
    }

    return stats;
  }

  /**
   * Search learning history
   */
  searchLearningHistory(query: string, filters?: {
    status?: LearningEvent['status'];
    area?: string;
    complexity?: LearningEvent['complexity'];
    dateRange?: { start: Date; end: Date };
  }): LearningHistoryEntry[] {
    let events = this.readLearningHistory();

    // Apply filters
    if (filters) {
      if (filters.status) {
        events = events.filter(e => e.status === filters.status);
      }
      if (filters.area) {
        events = events.filter(e => e.area === filters.area);
      }
      if (filters.complexity) {
        events = events.filter(e => e.complexity === filters.complexity);
      }
      if (filters.dateRange) {
        events = events.filter(e => {
          const eventDate = new Date(e.timestamp);
          return eventDate >= filters.dateRange!.start && eventDate <= filters.dateRange!.end;
        });
      }
    }

    // Apply text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      events = events.filter(e => 
        e.description.toLowerCase().includes(lowerQuery) ||
        e.area.toLowerCase().includes(lowerQuery) ||
        e.filesModified.some(f => f.toLowerCase().includes(lowerQuery))
      );
    }

    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map(event => ({
        id: event.id,
        timestamp: event.timestamp,
        description: event.description,
        status: event.status,
        filesModified: event.filesModified,
        userAction: event.userFeedback?.action,
        canRollback: event.status === 'internalized' && !!event.backupId
      }));
  }

  /**
   * Rollback an internalized learning
   */
  async rollbackLearning(learningId: string, reason: string): Promise<boolean> {
    try {
      const events = this.readLearningHistory();
      const event = events.find(e => e.id === learningId);
      
      if (!event) {
        throw new Error(`Learning event ${learningId} not found`);
      }

      if (event.status !== 'internalized') {
        throw new Error('Can only rollback internalized learnings');
      }

      await this.revertLearning(event);
      
      // Update status
      event.status = 'reverted';
      event.userFeedback = {
        ...event.userFeedback,
        action: 'forget',
        timestamp: new Date(),
        comments: `Rollback: ${reason}`,
        wasHelpful: false
      };

      // Update log
      const eventIndex = events.findIndex(e => e.id === learningId);
      events[eventIndex] = event;
      this.rewriteLog(events);

      // Log rollback event
      fs.appendFileSync(
        path.join(this.backupDir, 'rollback-log.txt'),
        `${new Date().toISOString()} - Rollback: ${learningId} - ${reason}\n`
      );

      console.log(`🔄 Learning rolled back: ${learningId}`);
      return true;

    } catch (error) {
      console.error(`❌ Error rolling back learning ${learningId}:`, error);
      return false;
    }
  }

  // Private helper methods
  private generateLearningId(): string {
    return `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private readLearningHistory(): LearningEvent[] {
    if (!fs.existsSync(this.logFilePath)) {
      return [];
    }

    const content = fs.readFileSync(this.logFilePath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    return lines.map(line => {
      try {
        return JSON.parse(line) as LearningEvent;
      } catch (error) {
        console.error('Error parsing learning log line:', line, error);
        return null;
      }
    }).filter(Boolean) as LearningEvent[];
  }

  private appendToLog(event: LearningEvent): void {
    const logLine = JSON.stringify(event) + '\n';
    fs.appendFileSync(this.logFilePath, logLine);
  }

  private rewriteLog(events: LearningEvent[]): void {
    const content = events.map(event => JSON.stringify(event)).join('\n') + '\n';
    fs.writeFileSync(this.logFilePath, content);
  }
}

// Singleton instance
export const learningTracker = new LearningTrackingService();

// deliverableManager.ts
// Agent-driven, flexible file-based deliverable management for /deliverables/*
// Implements best practices from Azure Agent Factory: tool use, reflection, planning, multi-agent, ReAct

import fs from 'fs';
import path from 'path';

export type ActivityLogEntry = {
  timestamp: string;
  agent: string;
  action: string;
  details?: any;
};

export class DeliverableManager {
  basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  // Append an activity log entry (reflection, audit, planning)
  appendActivityLog(entry: ActivityLogEntry) {
    const logPath = path.join(this.basePath, 'team-activity.json');
    let log: ActivityLogEntry[] = [];
    if (fs.existsSync(logPath)) {
      const raw = fs.readFileSync(logPath, 'utf-8');
      try {
        // Support both array and {activity: []} legacy format
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          log = parsed;
        } else if (parsed && Array.isArray(parsed.activity)) {
          log = parsed.activity;
        }
      } catch (e) {
        log = [];
      }
    }
    log.push(entry);
    // Write as { activity: [...] } for compatibility
    fs.writeFileSync(logPath, JSON.stringify({ activity: log }, null, 2));
  }

  // Read the activity log
  readActivityLog(): ActivityLogEntry[] {
    const logPath = path.join(this.basePath, 'team-activity.json');
    if (!fs.existsSync(logPath)) return [];
    return JSON.parse(fs.readFileSync(logPath, 'utf-8'));
  }

  // Write/update a deliverable file (drafts, assets, final, etc.)
  writeFile(relPath: string, content: string) {
    const filePath = path.join(this.basePath, relPath);
    fs.writeFileSync(filePath, content);
  }

  // Read a deliverable file
  readFile(relPath: string): string {
    const filePath = path.join(this.basePath, relPath);
    if (!fs.existsSync(filePath)) return '';
    return fs.readFileSync(filePath, 'utf-8');
  }

  // List files in a subfolder (drafts, assets, etc.)
  listFiles(subfolder: string): string[] {
    const dirPath = path.join(this.basePath, subfolder);
    if (!fs.existsSync(dirPath)) return [];
    return fs.readdirSync(dirPath);
  }
}

import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const ALERTS_LOG_FILE = path.join(process.cwd(), 'logs', 'executive-alerts.json');

export async function GET() {
  try {
    const data = await readFile(ALERTS_LOG_FILE, 'utf8');
    const alerts = JSON.parse(data);
    
    // Sort alerts by timestamp, most recent first
    alerts.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json({
      alerts,
      summary: {
        total: alerts.length,
        last24Hours: alerts.filter((alert: any) => {
          const alertTime = new Date(alert.timestamp);
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return alertTime > yesterday;
        }).length,
        last7Days: alerts.filter((alert: any) => {
          const alertTime = new Date(alert.timestamp);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return alertTime > weekAgo;
        }).length,
      }
    });
  } catch (error) {
    // No alerts file exists yet
    return NextResponse.json({
      alerts: [],
      summary: {
        total: 0,
        last24Hours: 0,
        last7Days: 0,
      }
    });
  }
}

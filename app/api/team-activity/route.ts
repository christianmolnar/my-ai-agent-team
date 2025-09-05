// teamActivityApi.ts
// API handler for agent-driven team-activity.json updates (append-only, real-time)
import { NextRequest, NextResponse } from 'next/server';
import { DeliverableManager } from '../_lib/deliverableManager';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { deliverableId, agent, action, details } = body;
  if (!deliverableId || !agent || !action) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const basePath = `${process.cwd()}/deliverables/${deliverableId}`;
  const mgr = new DeliverableManager(basePath);
  const entry = {
    timestamp: new Date().toISOString(),
    agent,
    action,
    details,
  };
  mgr.appendActivityLog(entry);
  return NextResponse.json({ success: true });
}

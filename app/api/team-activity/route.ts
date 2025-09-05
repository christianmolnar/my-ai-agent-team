// teamActivityApi.ts
// API handler for agent-driven team-activity.json updates (append-only, real-time)
import { NextApiRequest, NextApiResponse } from 'next';
import { DeliverableManager } from '../_lib/deliverableManager';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { deliverableId, agent, action, details } = req.body;
  if (!deliverableId || !agent || !action) {
    return res.status(400).json({ error: 'Missing required fields' });
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
  res.status(200).json({ success: true });
}

import { GlobalAgentLearningSystem, LearningFeedback } from './GlobalAgentLearningSystem';

// This is my base interface for all agents
export interface Agent {
  id: string;
  name: string;
  description: string;
  abilities: string[];
  handleTask(task: AgentTask): Promise<AgentTaskResult>;
  learn?(feedback: LearningFeedback): Promise<void>;
  getLearningSystem?(): GlobalAgentLearningSystem | null;
}

export interface AgentTask {
  type: string;
  payload: any;
}

export interface AgentTaskResult {
  success: boolean;
  result: any;
  error?: string;
}

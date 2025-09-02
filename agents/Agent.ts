// This is my base interface for all agents
export interface Agent {
  id: string;
  name: string;
  description: string;
  abilities: string[];
  handleTask(task: AgentTask): Promise<AgentTaskResult>;
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

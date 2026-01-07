export type ViewState = 'dashboard' | 'workflow-editor' | 'assistant';

export interface WorkflowNode {
  id: string;
  name: string;
  type: 'trigger' | 'action' | 'function' | 'webhook';
  position: { x: number; y: number };
  data: Record<string, any>;
  icon?: string;
}

export interface WorkflowConnection {
  id: string;
  source: string;
  target: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  lastRun?: string;
  status?: 'success' | 'error' | 'idle' | 'running';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface DashboardStats {
  totalExecutions: number;
  activeWorkflows: number;
  successRate: number;
  tokensUsed: number;
}
export type Node = {
  id: string;
  x: number; // percentage of canvas width (0–100)
  y: number; // percentage of canvas height (0–100)
  color: string;
  name?: string;
  type: 'center' | 'peer';
};

export type SidebarOption = 'back' | 'people' | 'tools' | 'settings';

export type SimulationSidebarOption = 'back' | 'simulation' | 'voting' | 'visuals';

export type Tool = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  enabled?: boolean;
};

export type Agent = {
  id: string;
  name: string;
  nodeId: string; // Links to canvas node
  personality: string; // The prompt for the agent
  bias?: number;
  avatar?: string;
  enabled: boolean;
  model_id?: string; // AI model selection for this agent
};

export type EditorConfig = {
  name: string;
  description: string;
  topic: string;
  maxIterations: number;
  maxInterventionsPerAgent?: number;
  agents: Agent[];
  settings: {
    temperature: number;
    model: string;
    timeout: number;
  };
};

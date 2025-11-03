export type Node = {
  id: string;
  x: number; // percentage of canvas width (0–100)
  y: number; // percentage of canvas height (0–100)
  color: string;
  name?: string;
  type: 'center' | 'peer' | 'tool';
  parentAgentId?: string; // For tool nodes - links to the agent node
  toolId?: string; // For tool nodes - identifies which tool this represents
};

export type SidebarOption = 'back' | 'people' | 'tools' | 'settings';

export type SimulationSidebarOption = 'back' | 'simulation' | 'voting' | 'visuals';

export type Tool = {
  id: string;
  name: string;
  description: string;
  icon: string;
  config_schema: {
    enabled: {
      type: string;
      default: boolean;
      description: string;
    };
    sources?: {
      type: string;
      items: { type: string };
      default: string[];
      description: string;
    };
  };
};

export type LMConfig = {
  temperature?: number; // 0.0-2.0, controls creativity
  max_tokens?: number; // 1-4096, response length limit
  top_p?: number; // 0.0-1.0, nucleus sampling
  frequency_penalty?: number; // -2.0-2.0, reduces repetition
  presence_penalty?: number; // -2.0-2.0, encourages new topics
};

export type WebSearchToolsConfig = {
  wikipedia_tool?: {
    enabled: boolean;
    sources?: string[];
    canvas_position?: { x: number; y: number } | null;
  } | null;
  news_tool?: {
    enabled: boolean;
    sources?: string[];
    canvas_position?: { x: number; y: number } | null;
  } | null;
  pages_tool?: {
    enabled: boolean;
    sources?: string[];
    canvas_position?: { x: number; y: number } | null;
  } | null;
  google_ai_tool?: {
    enabled: boolean;
    canvas_position?: { x: number; y: number } | null;
  } | null;
};

export type RecallToolsConfig = {
  notes_tool?: {
    enabled: boolean;
    canvas_position?: { x: number; y: number } | null;
  } | null;
  documents_tool?: {
    enabled: boolean;
    canvas_position?: { x: number; y: number } | null;
  } | null;
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
  lm_config?: LMConfig; // LM parameters for this agent
  web_search_tools?: WebSearchToolsConfig; // Web search tools configuration
  recall_tools?: RecallToolsConfig; // Recall tools configuration
  document_ids?: string[]; // IDs of documents assigned to this agent
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

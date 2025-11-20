const BASE_URL = 'http://localhost:8000';

import { WebSearchToolsConfig, RecallToolsConfig, FactCheckToolsConfig, ContrastToolsConfig, SynthesisToolsConfig } from '@/types';

// Auth interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: {
    email: string;
    id: string;
  };
}

// NEW v3.0 interfaces
export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  provider: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
  default_model: string;
}

export interface ToolInfo {
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
}

export interface ToolsResponse {
  tools: {
    web_search_tools: ToolInfo[];
    recall_tools: ToolInfo[];
    fact_check_tools: ToolInfo[];
    contrast_tools: ToolInfo[];
    synthesis_tools: ToolInfo[];
  };
}

export interface LMConfig {
  temperature?: number; // 0.0-2.0, controls creativity
  max_tokens?: number; // 1-4096, response length limit
  top_p?: number; // 0.0-1.0, nucleus sampling
  frequency_penalty?: number; // -2.0-2.0, reduces repetition
  presence_penalty?: number; // -2.0-2.0, encourages new topics
}

// Document interfaces
export interface Document {
  id: string;
  title: string;
  description: string | null;
  document_type: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  tags: string[];
  content?: string; // Only included in individual document fetch
  created_at: string;
  updated_at: string;
}

export interface DocumentsResponse {
  documents: Document[];
  total: number;
}

export interface DocumentUploadResponse {
  id: string;
  title: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
}

export interface DocumentStatusResponse {
  document_id: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  embedding_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
}

export interface DocumentDeleteResponse {
  message: string;
}

export interface GetDocumentsParams {
  limit?: number;
  offset?: number;
}

export interface Agent {
  name: string;
  profile: string;
  model_id?: string;
  lm_config?: LMConfig;
  web_search_tools?: WebSearchToolsConfig;
  recall_tools?: RecallToolsConfig;
  fact_check_tools?: FactCheckToolsConfig;
  contrast_tools?: ContrastToolsConfig;
  synthesis_tools?: SynthesisToolsConfig;
  document_ids?: string[];
  canvas_position?: {
    x: number;
    y: number;
  };
}

export interface SimulationRequest {
  topic: string;
  agents: Agent[];
  max_iters?: number;
  max_interventions_per_agent?: number;
  bias?: number[];
  stance?: string;
  embedding_model?: string;
  embedding_config?: object;
  config_id?: string;
  config_name?: string;
  config_description?: string;
}

export interface SimulationCreateResponse {
  simulation_id: string;
  status: string;
  message: string;
}

export interface DebateEvent {
  iteration: number;
  speaker: string;
  opinion: string;
  engaged: string[];
  finished: boolean;
  timestamp: string;
}

export interface SimulationProgress {
  current_iteration: number;
  max_iterations: number;
  percentage: number;
}

export interface SimulationStatusResponse {
  simulation_id: string;
  config_id?: string;
  config_name?: string;
  config_version_when_run?: number;
  is_latest_version?: boolean;
  status: "created" | "running" | "finished" | "failed" | "stopped";
  progress: SimulationProgress;
  latest_events: DebateEvent[];
  is_finished: boolean;
  stopped_reason: string | null;
  started_at: string;
  finished_at: string | null;
  created_at: string;
}

export interface IndividualVote {
  agent_name: string;
  agent_background: string;
  vote: boolean;
  reasoning: string;
}

export interface VoteResponse {
  simulation_id: string;
  yea: number;
  nay: number;
  individual_votes: IndividualVote[];
  created_at: string;
}

export interface StopResponse {
  simulation_id: string;
  status: string;
  message: string;
}

export enum AnalyticsType {
  EngagementMatrixType = "engagement_matrix",
  ParticipationStatsType = "participation_stats",
  OpinionSimilarityType = "opinion_similarity",
}

export interface AnalyticsItem {
  type: AnalyticsType;
  title: string;
  description: string;
  data: any;
  metadata: Record<string, any>;
}

export interface AnalyticsResponse {
  run_id: string;
  analytics: AnalyticsItem[];
  computed_at: string;
}

// Agent Templates interfaces
export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private';
  config: {
    model: string;
    temperature: number;
    max_tokens: number;
    background: string;
    bias: number;
    personality_traits: string[];
    speaking_style: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AgentTemplatesResponse {
  agents: AgentTemplate[];
  total: number;
}

export interface GetTemplatesParams {
  limit?: number;
  offset?: number;
}

// Config interfaces
export interface Config {
  id: string;
  name: string;
  description: string | null;
  parameters: {
    topic: string;
    max_iters: number;
    max_interventions_per_agent?: number;
    agent_count?: number;
    bias: number[];
    stance: string;
  };
  version_number: number;
  agents: ConfigAgent[];
  created_at: string;
  updated_at: string;
}

export interface ConfigAgent {
  position: number;
  name: string;
  profile: string;
  model_id: string;
  lm_config?: LMConfig;
  web_search_tools?: WebSearchToolsConfig;
  recall_tools?: RecallToolsConfig;
  fact_check_tools?: FactCheckToolsConfig;
  contrast_tools?: ContrastToolsConfig;
  synthesis_tools?: SynthesisToolsConfig;
  document_ids?: string[];
  canvas_position?: {
    x: number;
    y: number;
  } | null;
  created_at: string;
}

export interface ConfigsResponse {
  configs: Config[];
  total: number;
}

export interface ConfigRun {
  simulation_id: string;
  config_id: string;
  config_name: string;
  config_version_when_run: number;
  is_latest_version: boolean;
  status: "created" | "running" | "finished" | "failed" | "stopped";
  is_finished: boolean;
  created_at: string;
  finished_at: string | null;
}

export interface ConfigRunsResponse {
  runs: ConfigRun[];
  total: number;
}

// Config creation and update interfaces
export interface CreateConfigResponse {
  id: string;
  name: string;
  description: string | null;
  parameters: {
    topic: string;
    max_iters: number;
    bias: number[];
    stance: string;
  };
  version_number: number;
  agents: ConfigAgent[];
  created_at: string;
  updated_at: string;
}

export interface UpdateConfigRequest {
  name?: string;
  description?: string;
  topic?: string;
  agents?: Array<{
    name: string;
    profile: string;
    model_id?: string;
    lm_config?: LMConfig;
    web_search_tools?: WebSearchToolsConfig;
    recall_tools?: RecallToolsConfig;
    fact_check_tools?: FactCheckToolsConfig;
    contrast_tools?: ContrastToolsConfig;
    synthesis_tools?: SynthesisToolsConfig;
    document_ids?: string[];
    canvas_position?: {
      x: number;
      y: number;
    };
  }>;
  max_iters?: number;
  max_interventions_per_agent?: number;
  bias?: number[];
  stance?: string;
}

export interface DeleteConfigResponse {
  message: string;
  deleted_config_name: string;
  deleted_runs_count: number;
}

class DebateApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Always include cookies for httpOnly auth
      ...options,
    });

    if (response.status === 401) {
      // Token expired or invalid - trigger logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));
      const error = new Error('Authentication required') as Error & { status: number };
      error.status = 401;
      throw error;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      const error = new Error(errorData.detail || `HTTP ${response.status}`) as Error & { status: number };
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  // NEW v3.0 methods
  async getAvailableModels(): Promise<ModelsResponse> {
    return this.makeRequest<ModelsResponse>('/simulations/models');
  }

  async getAvailableTools(): Promise<ToolsResponse> {
    return this.makeRequest<ToolsResponse>('/simulations/tools');
  }

  async createSimulation(request: SimulationRequest): Promise<SimulationCreateResponse> {
    return this.makeRequest<SimulationCreateResponse>('/simulations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getSimulationStatus(simId: string): Promise<SimulationStatusResponse> {
    return this.makeRequest<SimulationStatusResponse>(`/simulations/${simId}`);
  }

  async stopSimulation(simId: string): Promise<StopResponse> {
    return this.makeRequest<StopResponse>(`/simulations/${simId}/stop`, {
      method: 'POST',
    });
  }

  async voteSimulation(simId: string): Promise<VoteResponse> {
    return this.makeRequest<VoteResponse>(`/simulations/${simId}/vote`, {
      method: 'POST',
    });
  }

  async getSimulationVotes(simId: string): Promise<VoteResponse> {
    return this.makeRequest<VoteResponse>(`/simulations/${simId}/votes`);
  }

  async getSimulationAnalytics(simId: string): Promise<AnalyticsResponse> {
    return this.makeRequest<AnalyticsResponse>(`/simulations/${simId}/analytics`);
  }

  async analyzeSimulation(simId: string): Promise<AnalyticsResponse> {
    return this.makeRequest<AnalyticsResponse>(`/simulations/${simId}/analyze`, {
      method: 'POST',
    });
  }

  async healthCheck(): Promise<{ ok: boolean }> {
    return this.makeRequest<{ ok: boolean }>('/healthz');
  }

  // Agent Templates methods
  async getAgentTemplates(params?: GetTemplatesParams): Promise<AgentTemplatesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.set('offset', params.offset.toString());
    
    const endpoint = `/agents/templates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<AgentTemplatesResponse>(endpoint);
  }

  async getAgentTemplate(agentId: string): Promise<AgentTemplate> {
    return this.makeRequest<AgentTemplate>(`/agents/templates/${agentId}`);
  }

  // Config methods
  async getConfigs(params?: GetTemplatesParams): Promise<ConfigsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.set('offset', params.offset.toString());
    
    const endpoint = `/configs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const result = await this.makeRequest<ConfigsResponse>(endpoint);
    console.log('DebateApiService.getConfigs - Raw response:', result);
    return result;
  }

  async createConfig(): Promise<CreateConfigResponse> {
    return this.makeRequest<CreateConfigResponse>('/configs', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async updateConfig(configId: string, updates: UpdateConfigRequest): Promise<Config> {
    return this.makeRequest<Config>(`/configs/${configId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getConfig(configId: string): Promise<Config> {
    console.log('🔍 DebateApiService.getConfig - Fetching config:', configId);
    const result = await this.makeRequest<Config>(`/configs/${configId}`);
    console.log('📦 DebateApiService.getConfig - Raw response:', result);
    console.log('👥 DebateApiService.getConfig - Agents in response:', result.agents);
    return result;
  }

  async getConfigRuns(configId: string, params?: GetTemplatesParams): Promise<ConfigRunsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.set('offset', params.offset.toString());
    
    const endpoint = `/configs/${configId}/runs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<ConfigRunsResponse>(endpoint);
  }

  async getConfigVersion(configId: string, versionNumber: number): Promise<Config> {
    console.log('🔍 DebateApiService.getConfigVersion - Fetching version:', { configId, versionNumber });
    const result = await this.makeRequest<Config>(`/config-versions/${configId}/versions/${versionNumber}`);
    console.log('📸 DebateApiService.getConfigVersion - Raw response:', result);
    console.log('👥 DebateApiService.getConfigVersion - Agents in response:', result.agents);
    return result;
  }

  async deleteConfig(configId: string): Promise<DeleteConfigResponse> {
    return this.makeRequest<DeleteConfigResponse>(`/configs/${configId}`, {
      method: 'DELETE',
    });
  }

  // Auth methods
  async login(email: string, password: string): Promise<void> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: formData,
      credentials: 'include', // Include cookies in requests
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(errorData.detail || 'Login failed');
    }

    // Token is now in httpOnly cookie, no need to handle response
    return;
  }

  async logout(): Promise<void> {
    // Just clear the httpOnly cookie on client side by not including credentials
    return;
  }

  async checkAuth(): Promise<boolean> {
    try {
      // Try to access a protected endpoint to verify auth
      const response = await fetch(`${BASE_URL}/configs`, {
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Document methods
  async getDocuments(params?: GetDocumentsParams): Promise<DocumentsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.set('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.set('offset', params.offset.toString());
    
    const endpoint = `/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<DocumentsResponse>(endpoint);
  }

  async uploadDocument(
    file: File, 
    title?: string, 
    description?: string, 
    documentType?: string,
    tags?: string[]
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    if (description) {
      formData.append('description', description);
    }
    
    if (documentType) {
      formData.append('document_type', documentType);
    }
    
    if (tags && tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    // Note: We don't set Content-Type for FormData, let the browser set it with boundary
    const response = await fetch(`${BASE_URL}/documents`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (response.status === 401) {
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(errorData.detail || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getDocument(documentId: string): Promise<Document> {
    return this.makeRequest<Document>(`/documents/${documentId}`);
  }

  async deleteDocument(documentId: string): Promise<DocumentDeleteResponse> {
    return this.makeRequest<DocumentDeleteResponse>(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async getDocumentStatus(documentId: string): Promise<DocumentStatusResponse> {
    return this.makeRequest<DocumentStatusResponse>(`/documents/${documentId}/status`);
  }
}

export const debateApi = new DebateApiService();

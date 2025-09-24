const BASE_URL = 'http://localhost:8000';

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

export interface Agent {
  name: string;
  profile: string;
  model_id?: string;
}

export interface SimulationRequest {
  topic: string;
  agents: Agent[];
  max_iters?: number;
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

export interface VoteResponse {
  simulation_id: string;
  yea: number;
  nay: number;
  reasons: string[];
}

export interface StopResponse {
  simulation_id: string;
  status: string;
  message: string;
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
  description: string;
  visibility: 'public' | 'private';
  parameters: {
    topic: string;
    max_iters: number;
    bias: number[];
    stance: string;
    embedding_model: string;
    agent_count: number;
  };
  version_number: number;
  source_template_id?: string;
  agents?: ConfigAgent[];
  created_at: string;
  updated_at: string;
}

export interface ConfigAgent {
  position: number;
  name: string;
  background: string;
  canvas_position?: {
    x: number;
    y: number;
  };
  snapshot: {
    profile: string;
    model_id: string;
  };
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
  visibility: 'public' | 'private';
  parameters: {
    topic: string;
    max_iters: number;
    bias: number[];
    stance: string;
    embedding_model: string;
    embedding_config: object;
    agents: ConfigAgent[];
  };
  version_number: number;
  agents: ConfigAgent[];
  source_template_id: string | null;
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
    canvas_position?: {
      x: number;
      y: number;
    };
  }>;
  max_iters?: number;
  bias?: number[];
  stance?: string;
  embedding_model?: string;
}

class DebateApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // NEW v3.0 methods
  async getAvailableModels(): Promise<ModelsResponse> {
    return this.makeRequest<ModelsResponse>('/simulations/models');
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

  async getConfigSnapshot(configId: string, versionNumber: number): Promise<Config> {
    console.log('🔍 DebateApiService.getConfigSnapshot - Fetching snapshot:', { configId, versionNumber });
    const result = await this.makeRequest<Config>(`/config-snapshots/${configId}/versions/${versionNumber}`);
    console.log('📸 DebateApiService.getConfigSnapshot - Raw response:', result);
    console.log('👥 DebateApiService.getConfigSnapshot - Agents in response:', result.agents);
    return result;
  }
}

export const debateApi = new DebateApiService();

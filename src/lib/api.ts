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
}

export const debateApi = new DebateApiService();

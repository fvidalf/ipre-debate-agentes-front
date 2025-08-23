const BASE_URL = 'http://localhost:8000';

export interface SimulationRequest {
  topic: string;
  profiles: string[];
  agent_names: string[];
  max_iters?: number;
  bias?: number[];
  stance?: string;
}

export interface SimulationResponse {
  id: string;
  snapshot: {
    topic: string;
    max_iters: number;
    iters: number;
    finished: boolean;
    agents: Array<{
      id: string;
      name: string;
      background: string;
      last_opinion: string;
      memory: string[];
    }>;
    intervenciones: string[];
    engagement_log: string[][];
    opiniones: string[];
    moderator: {
      interventions: any[];
      hands_raised: string[];
      weight: number[];
      bias: number[];
    };
  };
}

export interface VoteResponse {
  id: string;
  yea: number;
  nay: number;
  reasons: string[];
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

  async createSimulation(request: SimulationRequest): Promise<SimulationResponse> {
    return this.makeRequest<SimulationResponse>('/simulations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async startSimulation(simId: string): Promise<SimulationResponse> {
    return this.makeRequest<SimulationResponse>(`/simulations/${simId}/start`, {
      method: 'POST',
    });
  }

  async runSimulation(simId: string): Promise<SimulationResponse> {
    return this.makeRequest<SimulationResponse>(`/simulations/${simId}/run`, {
      method: 'POST',
    });
  }

  async getSimulation(simId: string): Promise<SimulationResponse['snapshot']> {
    return this.makeRequest<SimulationResponse['snapshot']>(`/simulations/${simId}`);
  }

  async voteSimulation(simId: string): Promise<VoteResponse> {
    return this.makeRequest<VoteResponse>(`/simulations/${simId}/vote`, {
      method: 'POST',
    });
  }

  async stopSimulation(simId: string): Promise<SimulationResponse> {
    return this.makeRequest<SimulationResponse>(`/simulations/${simId}/stop`, {
      method: 'POST',
    });
  }

  async healthCheck(): Promise<{ ok: boolean }> {
    return this.makeRequest<{ ok: boolean }>('/healthz');
  }
}

export const debateApi = new DebateApiService();

'use client';

import { useState, useCallback } from 'react';
import { Agent, DebateConfiguration } from '@/types';

interface UseDebateConfigurationReturn {
  configuration: DebateConfiguration;
  updateTopic: (topic: string) => void;
  updateMaxIterations: (maxIterations: number) => void;
  updateSettings: (updates: Partial<DebateConfiguration['settings']>) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  removeAgent: (agentId: string) => void;
  getAgent: (agentId: string) => Agent | undefined;
  getEnabledAgents: () => Agent[];
  hasAgents: () => boolean;
}

const DEFAULT_CONFIGURATION: DebateConfiguration = {
  topic: "Should artificial intelligence be regulated by governments?",
  maxIterations: 21,
  agents: [],
  settings: {
    temperature: 0.7,
    model: "GPT-4",
    timeout: 30
  }
};

export function useDebateConfiguration(initialConfig?: Partial<DebateConfiguration>): UseDebateConfigurationReturn {
  const [configuration, setConfiguration] = useState<DebateConfiguration>({
    ...DEFAULT_CONFIGURATION,
    ...initialConfig,
  });

  const updateTopic = useCallback((topic: string) => {
    setConfiguration(prev => ({ ...prev, topic }));
  }, []);

  const updateMaxIterations = useCallback((maxIterations: number) => {
    setConfiguration(prev => ({ ...prev, maxIterations }));
  }, []);

  const updateSettings = useCallback((updates: Partial<DebateConfiguration['settings']>) => {
    setConfiguration(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  }, []);

  const addAgent = useCallback((agent: Agent) => {
    setConfiguration(prev => ({
      ...prev,
      agents: [...prev.agents, agent]
    }));
  }, []);

  const updateAgent = useCallback((agentId: string, updates: Partial<Agent>) => {
    setConfiguration(prev => ({
      ...prev,
      agents: prev.agents.map(agent =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      )
    }));
  }, []);

  const removeAgent = useCallback((agentId: string) => {
    setConfiguration(prev => ({
      ...prev,
      agents: prev.agents.filter(agent => agent.id !== agentId)
    }));
  }, []);

  const getAgent = useCallback((agentId: string) => {
    return configuration.agents.find(agent => agent.id === agentId);
  }, [configuration.agents]);

  const getEnabledAgents = useCallback(() => {
    return configuration.agents.filter(agent => agent.enabled);
  }, [configuration.agents]);

  const hasAgents = useCallback(() => {
    return configuration.agents.length > 0;
  }, [configuration.agents]);

  return {
    configuration,
    updateTopic,
    updateMaxIterations,
    updateSettings,
    addAgent,
    updateAgent,
    removeAgent,
    getAgent,
    getEnabledAgents,
    hasAgents,
  };
}

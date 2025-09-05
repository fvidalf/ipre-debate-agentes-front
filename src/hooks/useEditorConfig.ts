'use client';

import { useState, useCallback } from 'react';
import { Agent, EditorConfig } from '@/types';

interface UseEditorConfigReturn {
  configuration: EditorConfig;
  updateName: (name: string) => void;
  updateDescription: (description: string) => void;
  updateTopic: (topic: string) => void;
  updateMaxIterations: (maxIterations: number) => void;
  updateSettings: (updates: Partial<EditorConfig['settings']>) => void;
  addAgent: (agent: Agent) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  removeAgent: (agentId: string) => void;
  getAgent: (agentId: string) => Agent | undefined;
  getEnabledAgents: () => Agent[];
  hasAgents: () => boolean;
}

const DEFAULT_CONFIGURATION: EditorConfig = {
  name: "New Debate",
  description: "",
  topic: "Should artificial intelligence be regulated by governments?",
  maxIterations: 21,
  agents: [],
  settings: {
    temperature: 0.7,
    model: "GPT-4",
    timeout: 30
  }
};

export function useEditorConfig(initialConfig?: Partial<EditorConfig>): UseEditorConfigReturn {
  const [configuration, setConfiguration] = useState<EditorConfig>({
    ...DEFAULT_CONFIGURATION,
    ...initialConfig,
  });

  const updateTopic = useCallback((topic: string) => {
    setConfiguration(prev => ({ ...prev, topic }));
  }, []);

  const updateName = useCallback((name: string) => {
    setConfiguration(prev => ({ ...prev, name }));
  }, []);

  const updateDescription = useCallback((description: string) => {
    setConfiguration(prev => ({ ...prev, description }));
  }, []);

  const updateMaxIterations = useCallback((maxIterations: number) => {
    setConfiguration(prev => ({ ...prev, maxIterations }));
  }, []);

  const updateSettings = useCallback((updates: Partial<EditorConfig['settings']>) => {
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
    updateName,
    updateDescription,
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

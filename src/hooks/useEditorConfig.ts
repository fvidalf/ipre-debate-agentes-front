'use client';

import { useState, useCallback, useEffect } from 'react';
import { Agent, EditorConfig } from '@/types';

interface UseEditorConfigReturn {
  configuration: EditorConfig;
  loadedAgents: any[];
  isLoading: boolean;
  loadError: string | null;
  updateName: (name: string) => void;
  updateDescription: (description: string) => void;
  updateTopic: (topic: string) => void;
  updateMaxIterations: (maxIterations: number) => void;
  updateSettings: (updates: Partial<EditorConfig['settings']>) => void;
  updateConfiguration: (updates: Partial<EditorConfig>) => void;
  clearLoadedAgents: () => void;
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

export function useEditorConfig(configId?: string): UseEditorConfigReturn {
  const [configuration, setConfiguration] = useState<EditorConfig>({
    ...DEFAULT_CONFIGURATION
  });
  const [loadedAgents, setLoadedAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!configId) return;
    
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const { debateApi } = await import('@/lib/api');
        const config = await debateApi.getConfig(configId);
        
        setConfiguration(prev => ({
          ...prev,
          name: config.name,
          description: config.description,
          topic: config.parameters.topic,
          maxIterations: config.parameters.max_iters,
        }));
        
        setLoadedAgents(config.agents || []);
      } catch (error) {
        console.error('Failed to load config in useEditorConfig:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load configuration');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, [configId]);

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

  const updateConfiguration = useCallback((updates: Partial<EditorConfig>) => {
    setConfiguration(prev => {
      // Force a new object reference to trigger re-render
      const newConfig = {
        ...prev,
        ...updates,
        settings: { ...prev.settings, ...(updates.settings || {}) },
        agents: updates.agents ? [...updates.agents] : [...prev.agents]
      };
      return newConfig;
    });
  }, []);

  const clearLoadedAgents = useCallback(() => {
    setLoadedAgents([]);
  }, []);

  return {
    configuration,
    loadedAgents,
    isLoading,
    loadError,
    updateName,
    updateDescription,
    updateTopic,
    updateMaxIterations,
    updateSettings,
    updateConfiguration,
    clearLoadedAgents,
    addAgent,
    updateAgent,
    removeAgent,
    getAgent,
    getEnabledAgents,
    hasAgents,
  };
}

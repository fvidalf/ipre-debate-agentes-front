'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Tool } from '@/types';
import { debateApi, ModelInfo } from '@/lib/api';
import { useDebateConfiguration } from './useDebateConfiguration';
import { useCanvasState } from './useCanvasState';
import { useAgentFactory } from './useAgentFactory';
import { useSimulationControl } from './useSimulationControl';
import { useUIState } from './useUIState';

export function useDebateApp(configId?: string) {
  // External data state (models from API)
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>('');
  const [modelsLoading, setModelsLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(!!configId);
  const [configLoadError, setConfigLoadError] = useState<string | null>(null);
  
  // Use ref to prevent re-loading the same config multiple times
  const loadedConfigIdRef = useRef<string | null>(null);

  // Composed hooks
  const debateConfig = useDebateConfiguration();
  const canvasState = useCanvasState();
  const agentFactory = useAgentFactory();
  const simulationControl = useSimulationControl(configId);
  const uiState = useUIState();

  // Load config if configId is provided
  useEffect(() => {
    if (!configId) {
      setConfigLoading(false);
      return;
    }
    
    if (loadedConfigIdRef.current === configId) {
      setConfigLoading(false);
      return;
    }

    loadedConfigIdRef.current = configId; // Mark as loading/loaded
    
    let isCancelled = false; // Flag to prevent state updates if component unmounts
    
    const loadConfig = async () => {
      try {
        setConfigLoading(true);
        setConfigLoadError(null);
        const config = await debateApi.getConfig(configId);
        
        if (isCancelled) return; // Don't update state if cancelled
        
        // Update debate configuration with loaded data
        debateConfig.updateTopic(config.parameters.stance);
        debateConfig.updateMaxIterations(config.parameters.max_iters);
        
        // Clear existing agents and nodes (except center)
        const existingAgents = debateConfig.getEnabledAgents();
        existingAgents.forEach(agent => {
          debateConfig.removeAgent(agent.id);
          canvasState.removeNode(agent.nodeId);
        });
        
        // Load agents from config if they exist
        if (config.agents && config.agents.length > 0) {
          const centerNode = canvasState.getCenterNode();
          if (centerNode) {
            // Add agents from the loaded config
            config.agents.forEach((configAgent) => {
              const { agent, node } = agentFactory.createAgentFromConfigData(
                configAgent, 
                config.agents!.length, // Pass total count instead of index
                centerNode
              );
              canvasState.addNode(node);
              debateConfig.addAgent(agent);
            });
          }
        }
      } catch (error) {
        if (isCancelled) return; // Don't update state if cancelled
        
        console.error('Failed to load config:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setConfigLoadError(errorMessage);
        
        // Reset the ref if loading failed so it can be retried
        loadedConfigIdRef.current = null;
      } finally {
        if (!isCancelled) {
          setConfigLoading(false);
        }
      }
    };

    loadConfig();
    
    // Cleanup function
    return () => {
      isCancelled = true;
    };
  }, [configId]); // Only depend on configId to prevent infinite loops

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setModelsLoading(true);
        const response = await debateApi.getAvailableModels();
        setAvailableModels(response.models);
        setDefaultModel(response.default_model);
      } catch (error) {
        console.error('Failed to fetch available models:', error);
        // Set fallback models if API fails
        setAvailableModels([
          { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Default fallback model', provider: 'openai' }
        ]);
        setDefaultModel('openai/gpt-4o-mini');
      } finally {
        setModelsLoading(false);
      }
    };

    fetchModels();
  }, []);

  // Static tools configuration
  const tools = useMemo<Tool[]>(() => [
    {
      id: 'x-profile',
      title: 'X profile',
      subtitle: 'Link an X profile to base personality on and reference',
      icon: '✂️',
    },
    {
      id: 'documents',
      title: 'Documents',
      subtitle: 'Load in files to use them as context',
      icon: '🗂️',
    },
    {
      id: 'news-access',
      title: 'News access',
      subtitle: 'Look for news to support claims',
      icon: '🌐',
    },
    {
      id: 'past-debates',
      title: 'Past debates',
      subtitle: 'Recall past conversations an agent has been a part of',
      icon: '🗄️',
    },
  ], []);

  // Enhanced node click handler that manages both canvas and agent state
  const handleNodeClick = useCallback((nodeId: string) => {
    canvasState.handleNodeClick(nodeId);
    
    if (nodeId === 'center') {
      // Center node clicked - maybe show global settings in the future
      return;
    }
    
    uiState.setActiveOption('settings'); // Switch to settings panel
    
    // Create agent if it doesn't exist for this node (legacy support)
    const existingAgent = debateConfig.configuration.agents.find(a => a.nodeId === nodeId);
    if (!existingAgent) {
      // This shouldn't happen in the new architecture, but keeping for safety
      console.warn('Node clicked but no corresponding agent found:', nodeId);
    }
  }, [canvasState, uiState, debateConfig]);

  // Agent creation from blank
  const handleCreateAgent = useCallback(() => {
    console.log('Creating new agent...');
    
    const centerNode = canvasState.getCenterNode();
    if (!centerNode) return;
    
    const existingPeers = canvasState.getPeerNodes();
    const { agent, node } = agentFactory.createBlankAgent(existingPeers, centerNode);
    
    // Add to both canvas and configuration
    canvasState.addNode(node);
    debateConfig.addAgent(agent);
    
    // Automatically open configuration for the new agent
    canvasState.setSelectedNodeId(node.id);
    uiState.setActiveOption('settings');
  }, [canvasState, agentFactory, debateConfig, uiState]);

  // Agent creation from template (the "baking" process)
  const handleSelectPrebuiltAgent = useCallback(async (templateId: string) => {
    console.log('Selected prebuilt agent:', templateId);
    
    const centerNode = canvasState.getCenterNode();
    if (!centerNode) return;
    
    const existingPeers = canvasState.getPeerNodes();
    const result = await agentFactory.createAgentFromTemplate(templateId, existingPeers, centerNode);
    
    if (!result) {
      console.error('Failed to create agent from template:', templateId);
      return;
    }
    
    const { agent, node } = result;
    
    // Add to both canvas and configuration (baked into current session)
    canvasState.addNode(node);
    debateConfig.addAgent(agent);
    
    // Automatically open configuration for the new agent
    canvasState.setSelectedNodeId(node.id);
    uiState.setActiveOption('settings');
  }, [canvasState, agentFactory, debateConfig, uiState]);

  // Agent removal - removes from both canvas and configuration
  const handleRemoveAgent = useCallback((agentId: string) => {
    const agent = debateConfig.getAgent(agentId);
    if (!agent) return;

    // Remove from configuration
    debateConfig.removeAgent(agentId);

    // Remove corresponding node from canvas
    canvasState.removeNode(agent.nodeId);

    // Clear selection if this was the selected agent
    if (canvasState.selectedNodeId === agent.nodeId) {
      canvasState.setSelectedNodeId(null);
    }
  }, [debateConfig, canvasState]);

  // Agent selection handler
  const handleAgentSelect = useCallback((agentId: string) => {
    console.log('Agent selected:', agentId);
    
    const agent = debateConfig.getAgent(agentId);
    if (agent) {
      canvasState.setSelectedNodeId(agent.nodeId);
      uiState.setActiveOption('settings');
    }
  }, [debateConfig, canvasState, uiState]);

  // Tool toggle handler
  const handleToolToggle = useCallback((toolId: string) => {
    console.log('Tool toggled:', toolId);
    // TODO: Implement tool activation/deactivation logic
  }, []);

  // Compute highlighted node based on UI state
  const highlightedNodeId = useMemo(() => {
    return uiState.getHighlightedNodeId(canvasState.selectedNodeId);
  }, [uiState, canvasState.selectedNodeId]);

  return {
    // UI State
    activeOption: uiState.activeOption,
    setActiveOption: uiState.setActiveOption,
    
    // Canvas State
    nodes: canvasState.nodes,
    selectedNodeId: canvasState.selectedNodeId,
    setSelectedNodeId: canvasState.setSelectedNodeId,
    highlightedNodeId,
    handleNodeMove: canvasState.handleNodeMove,
    handleNodeClick,
    handleCanvasClick: canvasState.handleCanvasClick,
    
    // Configuration State
    configuration: debateConfig.configuration,
    agents: debateConfig.configuration.agents,
    handleAgentUpdate: debateConfig.updateAgent,
    handleSettingsUpdate: debateConfig.updateSettings,
    handleTopicUpdate: debateConfig.updateTopic,
    handleMaxIterationsUpdate: debateConfig.updateMaxIterations,
    
    // Agent Management
    handleCreateAgent,
    handleSelectPrebuiltAgent,
    handleRemoveAgent,
    handleAgentSelect,
    
    // Simulation Control
    isRunning: simulationControl.isRunning,
    isSaving: simulationControl.isSaving,
    handleRun: () => simulationControl.handleRun(debateConfig.configuration),
    handleSave: () => simulationControl.handleSave(debateConfig.configuration),
    canSave: simulationControl.canSave(debateConfig.hasAgents()),
    
    // External Data
    availableModels,
    defaultModel,
    modelsLoading,
    configLoading,
    configLoadError,
    
    // Tools
    tools,
    handleToolToggle,
  };
}

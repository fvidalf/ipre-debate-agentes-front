'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { debateApi, ModelInfo } from '@/lib/api';
import { Node } from '@/types';
import { useEditorConfig } from './useEditorConfig';
import { useCanvasState } from './useCanvasState';
import { useAgentFactory } from './useAgentFactory';
import { useSimulationControl } from './useSimulationControl';
import { useUIState } from './useUIState';
import { useTools } from './useTools';

export function useDebateApp(configId?: string) {
  // External data state (models from API)
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>('');
  const [modelsLoading, setModelsLoading] = useState(true);
  
  // Use ref to prevent re-loading the same config multiple times
  const loadedConfigIdRef = useRef<string | null>(null);

  // Composed hooks
  const debateConfig = useEditorConfig(configId);
  const canvasState = useCanvasState();
  const agentFactory = useAgentFactory();
  const simulationControl = useSimulationControl(configId);
  const uiState = useUIState();
  const toolsState = useTools();

  // Load agents when loadedAgents data becomes available
  useEffect(() => {
    if (!debateConfig.loadedAgents || debateConfig.loadedAgents.length === 0) return;
    
    console.log('👥 useDebateApp - Processing loaded agents:', debateConfig.loadedAgents.length);
    
    // Use a ref to prevent processing the same agents multiple times
    const agentsToProcess = debateConfig.loadedAgents;
    
    // Clear existing agents and nodes (except center)
    const existingAgents = debateConfig.getEnabledAgents();
    existingAgents.forEach(agent => {
      debateConfig.removeAgent(agent.id);
      canvasState.removeNode(agent.nodeId);
      // Also remove all tool nodes for this agent
      canvasState.removeToolNodesForAgent(agent.nodeId);
    });
    
    // Load agents from config
    const centerNode = canvasState.getCenterNode();
    if (centerNode) {
      // Process agents sequentially to avoid timing issues
      for (const [index, configAgent] of agentsToProcess.entries()) {
        const { agent, node } = agentFactory.createAgentFromConfigData(
          configAgent, 
          agentsToProcess.length,
          centerNode
        );
        
        // First, add the agent node to canvas and agent to config
        canvasState.addNode(node);
        debateConfig.addAgent(agent);
        
        // Then, create tool nodes if agent has tools configured
        // This must happen AFTER the agent node is added to canvas
        const allToolsConfig = [
          ...(agent.web_search_tools ? Object.entries(agent.web_search_tools) : []),
          ...(agent.recall_tools ? Object.entries(agent.recall_tools) : [])
        ];

        allToolsConfig.forEach(([toolId, toolConfig]) => {
          if (toolConfig && toolConfig.enabled) {
            // Use stored canvas position if available, otherwise addToolNode will calculate
            const position = ('canvas_position' in toolConfig && toolConfig.canvas_position) 
              ? toolConfig.canvas_position 
              : undefined;
            
            // Get proper tool name from API
            const toolInfo = toolsState.tools.find(t => t.id === toolId);
            const toolName = toolInfo?.name;
            console.log('🎯 About to create tool node:', { agentNodeId: agent.nodeId, toolId, toolName, position });
            canvasState.addToolNode(agent.nodeId, toolId, toolName, position);
          }
        });
      }
      
      // Clear the loaded agents to prevent reprocessing
      debateConfig.clearLoadedAgents();
    } else {
      console.error('useDebateApp - No center node found');
    }
  }, [debateConfig.loadedAgents.length]); // Only depend on the length, not the array itself

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

  // Enhanced node click handler that manages both canvas and agent state
  const handleNodeClick = useCallback((nodeId: string) => {
    canvasState.handleNodeClick(nodeId);
    
    if (nodeId === 'center') {
      // Center node clicked - maybe show global settings in the future
      return;
    }
    
    // Check if this is a tool node
    const clickedNode = canvasState.getNode(nodeId);
    if (clickedNode?.type === 'tool') {
      // For tool nodes, show tool configuration settings
      uiState.setActiveOption('settings');
      return;
    }
    
    uiState.setActiveOption('settings'); // Switch to settings panel
    
    // For agent nodes, verify the agent exists
    const existingAgent = debateConfig.configuration.agents.find(a => a.nodeId === nodeId);
    if (!existingAgent) {
      // This shouldn't happen in the new architecture, but keeping for safety
      console.warn('Node clicked but no corresponding agent found:', nodeId);
    }
  }, [canvasState, uiState, debateConfig]);

  // Agent creation from blank
  const handleCreateAgent = useCallback(() => {
    
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
    
    const agent = debateConfig.getAgent(agentId);
    if (agent) {
      canvasState.setSelectedNodeId(agent.nodeId);
      uiState.setActiveOption('settings');
    }
  }, [debateConfig, canvasState, uiState]);

    // Tool toggle handler
  const handleToolToggle = useCallback((toolId: string) => {
    console.log('Tool toggle:', toolId);
  }, []);

  // Tool drop handler - adds tool to agent and creates tool node
  const handleToolDrop = useCallback((agentId: string, toolId: string) => {
    console.log('🔧 Tool dropped:', { agentId, toolId });
    
    // Find agent by nodeId (canvas node ID)
    const agent = debateConfig.configuration.agents.find(a => a.nodeId === agentId);
    console.log('🔍 Agent lookup by nodeId result:', agent ? `FOUND: ${agent.name}` : 'NOT_FOUND');
    console.log('🔍 Available agents:', debateConfig.configuration.agents.map(a => ({ id: a.id, nodeId: a.nodeId, name: a.name })));
    console.log('🔍 Tools available:', toolsState.tools.map(t => ({ id: t.id, name: t.name })));
    console.log(' debateConfig:', debateConfig);
    
    if (!agent) {
      console.error('❌ Agent not found in config by nodeId:', agentId);
      return;
    }

    const toolCategory = toolsState.getToolCategory(toolId);
    
    if (toolCategory === null) {
      console.error('❌ Tool category not found for:', toolId);
      return;
    }
    
    if (toolCategory === 'recall') {
      // Handle recall tools
      const currentTools = agent.recall_tools || {};
      const toolKey = toolId as keyof typeof currentTools;
      console.log('🔍 Recall tool check:', { toolKey, currentTools, enabled: currentTools[toolKey]?.enabled });
      
      if (currentTools[toolKey]?.enabled) {
        console.log('⚠️ Recall tool already enabled for this agent');
        return;
      }

      // Enable the recall tool for the agent
      const updatedTools = {
        ...currentTools,
        [toolKey]: { enabled: true }
      };

      debateConfig.updateAgent(agent.id, {
        recall_tools: updatedTools
      });
    } else if (toolCategory === 'web_search') {
      // Handle web search tools
      const currentTools = agent.web_search_tools || {};
      const toolKey = toolId as keyof typeof currentTools;
      console.log('🔍 Web search tool check:', { toolKey, currentTools, enabled: currentTools[toolKey]?.enabled });
      
      if (currentTools[toolKey]?.enabled) {
        console.log('⚠️ Web search tool already enabled for this agent');
        return;
      }

      // Enable the web search tool for the agent
      const updatedTools = {
        ...currentTools,
        [toolKey]: { enabled: true }
      };

      debateConfig.updateAgent(agent.id, {
        web_search_tools: updatedTools
      });
    }

    console.log('✅ Proceeding to create visual node');

    // Add tool node to canvas with proper name from API
    const toolInfo = toolsState.tools.find(t => t.id === toolId);
    const toolName = toolInfo?.name;
    console.log('🎨 About to call addToolNode:', { agentId, toolId, toolName });
    canvasState.addToolNode(agentId, toolId, toolName);
    console.log('✅ addToolNode call completed');
  }, [debateConfig, canvasState, toolsState.recallTools, toolsState.webSearchTools]);

  // Tool removal handler - removes tool from both agent config and canvas
  const handleRemoveTool = useCallback((agentId: string, toolId: string) => {
    const agent = debateConfig.getAgent(agentId);
    if (!agent) return;

    // Get the tool category using the centralized lookup
    const toolCategory = toolsState.getToolCategory(toolId);

    if (toolCategory === null) {
      console.error('❌ Tool category not found for:', toolId);
      return;
    }

    if (toolCategory === 'recall') {
      // Remove recall tool from agent configuration
      debateConfig.updateAgent(agentId, {
        recall_tools: {
          ...agent.recall_tools,
          [toolId]: { enabled: false }
        }
      });
    } else {
      // Remove web search tool from agent configuration
      debateConfig.updateAgent(agentId, {
        web_search_tools: {
          ...agent.web_search_tools,
          [toolId]: { enabled: false }
        }
      });
    }

    // Remove tool node from canvas
    canvasState.removeToolNode(agent.nodeId, toolId);

    // Clear selection if this was the selected tool node
    const toolNodeId = `tool-${agent.nodeId}-${toolId}`;
    if (canvasState.selectedNodeId === toolNodeId) {
      canvasState.setSelectedNodeId(null);
    }
  }, [debateConfig, canvasState, toolsState.recallTools, toolsState.webSearchTools]);

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
    
    // Configuration Management
    configuration: debateConfig.configuration,
    agents: debateConfig.configuration.agents,
    handleAgentUpdate: debateConfig.updateAgent,
    handleNameUpdate: debateConfig.updateName,
    handleDescriptionUpdate: debateConfig.updateDescription,
    handleSettingsUpdate: debateConfig.updateSettings,
    handleTopicUpdate: debateConfig.updateTopic,
    handleMaxIterationsUpdate: debateConfig.updateMaxIterations,
    handleMaxInterventionsPerAgentUpdate: debateConfig.updateMaxInterventionsPerAgent,
    
    // Agent Management
    handleCreateAgent,
    handleSelectPrebuiltAgent,
    handleRemoveAgent,
    handleAgentSelect,
    
    // Simulation Control
    isRunning: simulationControl.isRunning,
    isSaving: simulationControl.isSaving,
    handleRun: () => simulationControl.handleRun(debateConfig.configuration, canvasState.nodes),
    handleSave: () => simulationControl.handleSave(debateConfig.configuration, canvasState.nodes),
    canSave: simulationControl.canSave(debateConfig.hasAgents()),
    
    // External Data
    availableModels,
    defaultModel,
    modelsLoading,
    configLoading: debateConfig.isLoading,
    configLoadError: debateConfig.loadError,
    
    // Tools
    availableTools: toolsState.tools,
    toolsLoading: toolsState.isLoading,
    toolsError: toolsState.error,
    handleToolToggle,
    handleToolDrop,
    handleRemoveTool,
  };
}

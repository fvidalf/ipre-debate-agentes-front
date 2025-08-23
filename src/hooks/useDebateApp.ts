'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Node, SidebarOption, Tool, Agent, DebateConfiguration } from '@/types';
import { debateApi, SimulationRequest } from '@/lib/api';

// Utility function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Smart positioning for new agents
const getNextAgentPosition = (existingPeers: Node[], center: Node) => {
  if (existingPeers.length === 0) {
    // First agent: place at a reasonable distance above center
    return { x: center.x, y: center.y - 25 };
  }

  // Calculate average distance from center to existing peers
  const avgDistance = existingPeers.reduce((sum, peer) => {
    const distance = Math.sqrt(
      Math.pow(peer.x - center.x, 2) + Math.pow(peer.y - center.y, 2)
    );
    return sum + distance;
  }, 0) / existingPeers.length;

  // Use average distance, but constrain it to reasonable bounds
  const targetDistance = Math.max(20, Math.min(35, avgDistance));

  // Get angles of existing peers relative to center
  const existingAngles = existingPeers.map(peer => {
    return Math.atan2(peer.y - center.y, peer.x - center.x);
  }).sort((a, b) => a - b);

  // Find the largest gap between consecutive angles
  let bestAngle = 0;
  let largestGap = 0;

  for (let i = 0; i < existingAngles.length; i++) {
    const currentAngle = existingAngles[i];
    const nextAngle = existingAngles[(i + 1) % existingAngles.length];
    
    // Calculate gap, accounting for wrap-around
    let gap = nextAngle - currentAngle;
    if (gap <= 0) {
      gap += 2 * Math.PI; // wrap around
    }
    
    if (gap > largestGap) {
      largestGap = gap;
      bestAngle = currentAngle + gap / 2; // middle of the gap
    }
  }

  // If we only have one node, place the new one opposite to it
  if (existingPeers.length === 1) {
    bestAngle = existingAngles[0] + Math.PI;
  }

  // Calculate position based on best angle and target distance
  const newX = center.x + targetDistance * Math.cos(bestAngle);
  const newY = center.y + targetDistance * Math.sin(bestAngle);

  // Ensure the position stays within canvas bounds (with some padding)
  return {
    x: Math.max(10, Math.min(90, newX)),
    y: Math.max(10, Math.min(90, newY))
  };
};

export function useDebateApp() {
  const router = useRouter();
  const [activeOption, setActiveOption] = useState<SidebarOption>('tools');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [configuration, setConfiguration] = useState<DebateConfiguration>({
    topic: "Should artificial intelligence be regulated by governments?",
    maxIterations: 21,
    agents: [],
    settings: {
      temperature: 0.7,
      model: "GPT-4",
      timeout: 30
    }
  });
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'center', x: 50, y: 50, color: '#5AC46B', type: 'center' },
  ]);

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

  const agents = useMemo<Agent[]>(() => {
    return configuration.agents;
  }, [configuration.agents]);

  const handleNodeMove = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prev => 
      prev.map(node => 
        node.id === nodeId ? { ...node, x, y } : node
      )
    );
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    if (nodeId === 'center') {
      // Center node opens general settings
      setSelectedNodeId('center');
      setActiveOption('settings');
      return;
    }
    
    setSelectedNodeId(nodeId);
    setActiveOption('settings'); // Switch to settings panel
    
    // Create agent if it doesn't exist for this node
    if (!configuration.agents.find(a => a.nodeId === nodeId)) {
      const newAgent: Agent = {
        id: generateId(),
        name: `Agent ${nodeId.toUpperCase()}`,
        nodeId: nodeId,
        personality: '',
        bias: 0,
        avatar: '',
        enabled: true
      };
      setConfiguration(prev => ({
        ...prev,
        agents: [...prev.agents, newAgent]
      }));
    }
  }, [configuration.agents]);

  const handleCanvasClick = useCallback(() => {
    // Deselect node when clicking empty canvas area
    setSelectedNodeId(null);
  }, []);

  const handleAgentUpdate = useCallback((agentId: string, updates: Partial<Agent>) => {
    setConfiguration(prev => ({
      ...prev,
      agents: prev.agents.map(agent => 
        agent.id === agentId ? { ...agent, ...updates } : agent
      )
    }));
  }, []);

  const handleSettingsUpdate = useCallback((updates: Partial<DebateConfiguration['settings']>) => {
    setConfiguration(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates }
    }));
  }, []);

  const handleTopicUpdate = useCallback((topic: string) => {
    setConfiguration(prev => ({
      ...prev,
      topic
    }));
  }, []);

  const handleMaxIterationsUpdate = useCallback((maxIterations: number) => {
    setConfiguration(prev => ({
      ...prev,
      maxIterations
    }));
  }, []);

  const handleRemoveAgent = useCallback((agentId: string) => {
    const agentToRemove = configuration.agents.find(a => a.id === agentId);
    if (!agentToRemove) return;

    // Remove the agent from configuration
    setConfiguration(prev => ({
      ...prev,
      agents: prev.agents.filter(a => a.id !== agentId)
    }));

    // Remove the corresponding node from canvas
    setNodes(prev => prev.filter(n => n.id !== agentToRemove.nodeId));

    // Clear selection if this was the selected agent
    if (selectedNodeId === agentToRemove.nodeId) {
      setSelectedNodeId(null);
    }
  }, [configuration.agents, selectedNodeId]);

  const handleToolToggle = useCallback((toolId: string) => {
    console.log('Tool toggled:', toolId);
    // Here you would implement tool activation/deactivation logic
  }, []);

  const handleAgentSelect = useCallback((agentId: string) => {
    console.log('Agent selected:', agentId);
    
    // Find the agent and its corresponding node
    const agent = configuration.agents.find(a => a.id === agentId);
    if (agent) {
      setSelectedNodeId(agent.nodeId);
      setActiveOption('settings'); // Switch to settings panel
    }
  }, [configuration.agents, setActiveOption]);

  const handleCreateAgent = useCallback(() => {
    console.log('Creating new agent...');
    
    const centerNode = nodes.find(n => n.type === 'center');
    if (!centerNode) return;
    
    const existingPeers = nodes.filter(n => n.type === 'peer');
    const newPosition = getNextAgentPosition(existingPeers, centerNode);
    
    // Generate unique ID for the new node
    const newNodeId = `agent-${generateId()}`;
    
    // Create new node
    const newNode: Node = {
      id: newNodeId,
      x: newPosition.x,
      y: newPosition.y,
      color: '#5AB3FF',
      type: 'peer'
    };
    
    // Create corresponding agent
    const newAgent: Agent = {
      id: generateId(),
      name: `Agent ${existingPeers.length + 1}`,
      nodeId: newNodeId,
      personality: '',
      bias: 0,
      avatar: '',
      enabled: true
    };
    
    // Add node to canvas
    setNodes(prev => [...prev, newNode]);
    
    // Add agent to configuration
    setConfiguration(prev => ({
      ...prev,
      agents: [...prev.agents, newAgent]
    }));
    
    // Automatically open configuration for the new agent
    setSelectedNodeId(newNodeId);
    setActiveOption('settings');
  }, [nodes, setActiveOption]);

  // Predefined agent templates with full configurations
  const prebuiltAgentTemplates = {
    'javier-a': {
      name: 'Javier A.',
      personality: 'You are Javier, a conservative economist who values free market principles and fiscal responsibility. You tend to support traditional business approaches and are skeptical of government regulation. You base your arguments on economic data and historical precedents.',
      bias: 0.3,
      color: '#DC2626'
    },
    'maria-b': {
      name: 'Maria B.',
      personality: 'You are Maria, a progressive social activist who prioritizes social justice and equality. You advocate for policies that protect marginalized communities and support government intervention when it serves the public good. You are passionate about human rights and environmental issues.',
      bias: -0.3,
      color: '#059669'
    },
    'victor-c': {
      name: 'Victor C.',
      personality: 'You are Victor, a pragmatic technology professional who focuses on practical solutions and evidence-based decision making. You tend to remain neutral on political issues and prefer analyzing problems from multiple angles before forming opinions. You value innovation and efficiency.',
      bias: 0.0,
      color: '#2563EB'
    },
    'ana-d': {
      name: 'Ana D.',
      personality: 'You are Ana, an academic researcher who approaches discussions with scientific rigor and intellectual curiosity. You always seek to understand the underlying principles and long-term implications of any proposal. You value peer review and evidence-based conclusions.',
      bias: 0.1,
      color: '#7C3AED'
    },
    'carlos-e': {
      name: 'Carlos E.',
      personality: 'You are Carlos, an entrepreneur who thinks creatively about business opportunities and market disruption. You are optimistic about new technologies and business models, but also understand the importance of risk management. You focus on practical implementation and scalability.',
      bias: 0.2,
      color: '#EA580C'
    }
  };

  const handleSelectPrebuiltAgent = useCallback((templateId: string) => {
    console.log('Selected prebuilt agent:', templateId);
    
    const template = prebuiltAgentTemplates[templateId as keyof typeof prebuiltAgentTemplates];
    if (!template) {
      console.error('Unknown template ID:', templateId);
      return;
    }
    
    const centerNode = nodes.find(n => n.type === 'center');
    if (!centerNode) return;
    
    const existingPeers = nodes.filter(n => n.type === 'peer');
    const newPosition = getNextAgentPosition(existingPeers, centerNode);
    
    // Generate unique ID for the new node
    const newNodeId = `agent-${generateId()}`;
    
    // Create new node with template color
    const newNode: Node = {
      id: newNodeId,
      x: newPosition.x,
      y: newPosition.y,
      color: template.color,
      type: 'peer'
    };
    
    // Create corresponding agent with predefined settings
    const newAgent: Agent = {
      id: generateId(),
      name: template.name,
      nodeId: newNodeId,
      personality: template.personality,
      bias: template.bias,
      avatar: '',
      enabled: true
    };
    
    // Add node to canvas
    setNodes(prev => [...prev, newNode]);
    
    // Add agent to configuration
    setConfiguration(prev => ({
      ...prev,
      agents: [...prev.agents, newAgent]
    }));
    
    // Automatically open configuration for the new agent so user can see the populated fields
    setSelectedNodeId(newNodeId);
    setActiveOption('settings');
  }, [nodes, setActiveOption]);

  const handleSave = useCallback(() => {
    console.log('Saving configuration...');
    // Here you would implement save logic
  }, []);

  const handleRun = useCallback(async () => {
    console.log('Running simulation...');
    setIsRunning(true);

    try {
      // Build simulation request from current configuration
      const enabledAgents = configuration.agents.filter(a => a.enabled);
      
      if (enabledAgents.length === 0) {
        alert('Please configure at least one agent before running the simulation.');
        setIsRunning(false);
        return;
      }

      if (!configuration.topic.trim()) {
        alert('Please set a debate topic before running the simulation.');
        setIsRunning(false);
        return;
      }

      // Check if all enabled agents have personality prompts
      const agentsWithoutPersonality = enabledAgents.filter(a => !a.personality.trim());
      if (agentsWithoutPersonality.length > 0) {
        const agentNames = agentsWithoutPersonality.map(a => a.name).join(', ');
        alert(`Please configure personality prompts for: ${agentNames}`);
        setIsRunning(false);
        return;
      }

      const simulationRequest: SimulationRequest = {
        topic: configuration.topic,
        profiles: enabledAgents.map(a => a.personality),
        agent_names: enabledAgents.map(a => a.name),
        max_iters: configuration.maxIterations,
        bias: enabledAgents.map(a => a.bias || 0),
        stance: "neutral" // Could be derived from configuration later
      };

      // Create the simulation
      console.log('Creating simulation...');
      const createResponse = await debateApi.createSimulation(simulationRequest);
      console.log('Simulation created:', createResponse.id);

      // Start the simulation
      console.log('Starting simulation...');
      await debateApi.startSimulation(createResponse.id);
      console.log('Simulation started');

      // Run the simulation to completion
      console.log('Running simulation to completion...');
      await debateApi.runSimulation(createResponse.id);
      console.log('Simulation completed');

      // Redirect to simulation page
      router.push(`/simulation?id=${createResponse.id}`);
    } catch (error) {
      console.error('Error running simulation:', error);
      alert(`Failed to run simulation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  }, [router, configuration]);

  const canSave = useMemo(() => {
    // For now, always allow saving when there are nodes
    return nodes.length > 0;
  }, [nodes]);

  // Context-aware highlighting: only highlight nodes when in settings view
  const getHighlightedNodeId = useCallback(() => {
    if (activeOption !== 'settings') return null; // Only highlight in settings view
    return selectedNodeId; // Could be 'center', peer node ID, or null
  }, [activeOption, selectedNodeId]);

  return {
    activeOption,
    setActiveOption,
    nodes,
    tools,
    agents,
    isRunning,
    selectedNodeId,
    highlightedNodeId: getHighlightedNodeId(),
    configuration,
    handleNodeMove,
    handleNodeClick,
    handleCanvasClick,
    handleAgentUpdate,
    handleSettingsUpdate,
    handleTopicUpdate,
    handleMaxIterationsUpdate,
    handleRemoveAgent,
    handleToolToggle,
    handleAgentSelect,
    handleCreateAgent,
    handleSelectPrebuiltAgent,
    handleSave,
    handleRun,
    canSave,
    setSelectedNodeId,
  };
}

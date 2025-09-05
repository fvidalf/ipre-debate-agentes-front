'use client';

import { useCallback } from 'react';
import { Agent, Node } from '@/types';
import { debateApi, ConfigAgent } from '@/lib/api';
import { convertTemplateToAgent, getTemplateColor } from '@/lib/agentUtils';

// Utility function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Smart positioning algorithm for new agents
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
      bestAngle = currentAngle + gap / 2;
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

interface UseAgentFactoryReturn {
  createAgentFromTemplate: (templateId: string, existingPeers: Node[], centerNode: Node) => Promise<{ agent: Agent; node: Node } | null>;
  createBlankAgent: (existingPeers: Node[], centerNode: Node) => { agent: Agent; node: Node };
  createAgentFromConfigData: (configAgent: ConfigAgent, totalAgents: number, centerNode: Node) => { agent: Agent; node: Node };
}

export function useAgentFactory(): UseAgentFactoryReturn {
  const createAgentFromTemplate = useCallback(async (
    templateId: string,
    existingPeers: Node[],
    centerNode: Node
  ): Promise<{ agent: Agent; node: Node } | null> => {
    try {
      // Fetch the template from the API
      const template = await debateApi.getAgentTemplate(templateId);
      if (!template) {
        console.error('Template not found:', templateId);
        return null;
      }

      // Calculate optimal position
      const position = getNextAgentPosition(existingPeers, centerNode);
      
      // Generate unique node ID
      const nodeId = `agent-${generateId()}`;

      // Create the visual node
      const node: Node = {
        id: nodeId,
        x: position.x,
        y: position.y,
        color: getTemplateColor(template.id),
        type: 'peer'
      };

      // Convert template to canvas agent (the "baking" process)
      const agent = convertTemplateToAgent(template, nodeId);

      return { agent, node };
    } catch (error) {
      console.error('Error creating agent from template:', error);
      return null;
    }
  }, []);

  const createBlankAgent = useCallback((
    existingPeers: Node[],
    centerNode: Node
  ): { agent: Agent; node: Node } => {
    // Calculate optimal position
    const position = getNextAgentPosition(existingPeers, centerNode);
    
    // Generate unique node ID
    const nodeId = `agent-${generateId()}`;

    // Create the visual node
    const node: Node = {
      id: nodeId,
      x: position.x,
      y: position.y,
      color: '#5AB3FF',
      type: 'peer'
    };

    // Create blank agent
    const agent: Agent = {
      id: generateId(),
      name: `Agent ${existingPeers.length + 1}`,
      nodeId,
      personality: '',
      bias: 0,
      enabled: true,
      model_id: undefined,
    };

    return { agent, node };
  }, []);

  const createAgentFromConfigData = useCallback((
    configAgent: ConfigAgent,
    totalAgents: number,
    centerNode: Node
  ): { agent: Agent; node: Node } => {
    
    let x: number, y: number;

    // Use stored canvas position if available, otherwise calculate position
    if (configAgent.canvas_position) {
      x = configAgent.canvas_position.x;
      y = configAgent.canvas_position.y;
    } else {
      // Fallback to circular positioning for legacy configs
      const radius = 25;
      const angleStep = (2 * Math.PI) / totalAgents;
      const angle = configAgent.position * angleStep;
      x = Math.max(10, Math.min(90, centerNode.x + radius * Math.cos(angle)));
      y = Math.max(10, Math.min(90, centerNode.y + radius * Math.sin(angle)));
    }

    // Generate unique node ID
    const nodeId = `agent-${generateId()}`;

    // Create the visual node
    const node: Node = {
      id: nodeId,
      x,
      y,
      color: '#5AB3FF', // Default color, could be customized
      type: 'peer'
    };

    // Create agent from config data
    const agent: Agent = {
      id: generateId(),
      name: configAgent.name,
      nodeId,
      personality: configAgent.snapshot.profile,
      bias: 0, // Could extract from config if available
      enabled: true,
      model_id: configAgent.snapshot.model_id,
    };

    return { agent, node };
  }, []);

  return {
    createAgentFromTemplate,
    createBlankAgent,
    createAgentFromConfigData,
  };
}

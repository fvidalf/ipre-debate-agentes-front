import { Config } from '@/lib/api';
import { Node, Agent } from '@/types';

/**
 * Converts a backend Config to frontend canvas nodes
 * Handles both new configs with canvas_position and legacy configs
 */
export function configToCanvasNodes(config: Config): Node[] {
  // console.log('🎨 dd Input config:', config);
  // console.log('👥 dd Config.agents:', config.agents);
  // console.log('🔢 dd Config.parameters.agent_count:', config.parameters.agent_count);
  
  const nodes: Node[] = [
    // Always include center node
    { id: 'center', x: 50, y: 50, type: 'center', color: '#10B981' }
  ];

  if (config.agents && config.agents.length > 0) {
    // console.log('✅ dd Processing agents from config.agents:', config.agents.length);
    // Use actual agent data
    config.agents.forEach((configAgent, index) => {
      // console.log(`👤 dd Agent ${index}:`, configAgent);
      
      let x: number, y: number;
      
      if (configAgent.canvas_position) {
        // console.log(`📍 dd Using stored position:`, configAgent.canvas_position);
        // Use stored position
        x = configAgent.canvas_position.x;
        y = configAgent.canvas_position.y;
      } else {
        // console.log(`🔄 dd Using fallback circular positioning`);
        // Fallback to circular positioning for legacy configs
        const radius = 25;
        const angleStep = (2 * Math.PI) / config.agents!.length;
        const angle = configAgent.position * angleStep;
        x = Math.max(10, Math.min(90, 50 + radius * Math.cos(angle)));
        y = Math.max(10, Math.min(90, 50 + radius * Math.sin(angle)));
        // console.log(`📐 dd Calculated position: x=${x}, y=${y}`);
      }
      
      const node = {
        id: `agent-${index}`,
        x,
        y,
        type: 'peer' as const,
        color: '#5AB3FF',
        name: configAgent.name
      };
      
      // console.log(`✨ dd Created node:`, node);
      nodes.push(node);
    });
  } else if (config.parameters.agent_count > 0) {
    // console.log('🔢 dd No agents array, using parameters.agent_count:', config.parameters.agent_count);
    // Fallback: generate nodes from agent_count parameter
    const agentCount = config.parameters.agent_count;
    const radius = 25;
    const angleStep = (2 * Math.PI) / agentCount;
    
    for (let i = 0; i < agentCount; i++) {
      const angle = i * angleStep;
      const x = Math.max(15, Math.min(85, 50 + radius * Math.cos(angle)));
      const y = Math.max(15, Math.min(85, 50 + radius * Math.sin(angle)));
      
      const node = {
        id: `agent-${i}`,
        x,
        y,
        type: 'peer' as const,
        color: '#5AB3FF',
        name: `Agent ${i + 1}`
      };
      
      // console.log(`🔄 dd Created fallback node ${i}:`, node);
      nodes.push(node);
    }
  } else {
    // console.log('❌ dd No agents found in config and agent_count is 0');
  }

  // console.log('🎯 dd Final nodes:', nodes);
  return nodes;
}

interface AgentUpdateData {
  name: string;
  profile: string;
  model_id?: string;
  canvas_position?: {
    x: number;
    y: number;
  };
}

/**
 * Converts frontend agents and nodes to backend update format
 */
export function agentsToConfigUpdate(agents: Agent[], nodes: Node[]): AgentUpdateData[] {
  return agents
    .filter(agent => agent.enabled)
    .map(agent => {
      const node = nodes.find(n => n.id === agent.nodeId);
      const agentData: AgentUpdateData = {
        name: agent.name,
        profile: agent.personality,
        model_id: agent.model_id || undefined
      };
      
      // Include canvas position if node is found
      if (node) {
        agentData.canvas_position = {
          x: node.x,
          y: node.y
        };
      }
      
      return agentData;
    });
}

/**
 * Get the actual agent count from a config
 * Prioritizes actual agents array over parameters.agent_count
 */
export function getActualAgentCount(config: Config): number {
    // log the 
  const count = config.agents?.length || config.parameters.agent_count;
  console.log('getActualAgentCount - Config:', config.id, 'agents.length:', config.agents?.length, 'agent_count:', config.parameters.agent_count, 'result:', count);
  return count;
}

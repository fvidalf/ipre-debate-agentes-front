import { Config, Agent as ApiAgent } from '@/lib/api';
import { Node, Agent } from '@/types';

/**
 * Convert tool ID to proper display name with capitalization
 */
export function formatToolName(toolId: string): string {
  return toolId
    .replace('_tool', '')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => {
      if (word.toLowerCase() === 'ai') {
        return 'AI';
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Converts a backend Config to frontend canvas nodes
 * Handles both new configs with canvas_position and legacy configs
 */
export function configToCanvasNodes(config: Config): Node[] {
  const nodes: Node[] = [
    // Always include center node
    { id: 'center', x: 50, y: 50, type: 'center', color: '#10B981' }
  ];

  if (config.agents && config.agents.length > 0) {
    config.agents.forEach((configAgent, index) => {      
      let x: number, y: number;
      
      if (configAgent.canvas_position) {
        x = configAgent.canvas_position.x;
        y = configAgent.canvas_position.y;
      } else {
        const radius = 25;
        const angleStep = (2 * Math.PI) / config.agents!.length;
        const angle = configAgent.position * angleStep;
        x = Math.max(10, Math.min(90, 50 + radius * Math.cos(angle)));
        y = Math.max(10, Math.min(90, 50 + radius * Math.sin(angle)));
      }
      
      const node = {
        id: `agent-${index}`,
        x,
        y,
        type: 'peer' as const,
        color: '#5AB3FF',
        name: configAgent.name
      };
      
      nodes.push(node);
    });
  } else if (config.parameters.agent_count && config.parameters.agent_count > 0) {
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
      
      nodes.push(node);
    }
  }
  
  // Create tool nodes from agent configurations
  if (config.agents && config.agents.length > 0) {
    config.agents.forEach((configAgent, agentIndex) => {
      const agentNodeId = `agent-${agentIndex}`;
      
      // Check if agent has web search tools configured
      if (configAgent.web_search_tools) {
        const webSearchTools = configAgent.web_search_tools;
        
        // Process each tool type
        Object.entries(webSearchTools).forEach(([toolId, toolConfig]) => {
          if (toolConfig && typeof toolConfig === 'object' && 'enabled' in toolConfig && toolConfig.enabled) {
            let toolX: number, toolY: number;
            
            // Use stored canvas position if available
            if ('canvas_position' in toolConfig && toolConfig.canvas_position) {
              toolX = toolConfig.canvas_position.x;
              toolY = toolConfig.canvas_position.y;
            } else {
              // Fallback: calculate position around agent (this shouldn't happen with new backend)
              const agentNode = nodes.find(n => n.id === agentNodeId);
              if (agentNode) {
                // Simple offset for now - could be improved
                const existingToolsForAgent = nodes.filter(n => n.type === 'tool' && n.parentAgentId === agentNodeId).length;
                const angle = (existingToolsForAgent / 4) * 2 * Math.PI; // 4 tools max per agent
                const radius = 15;
                toolX = Math.max(5, Math.min(95, agentNode.x + Math.cos(angle) * radius));
                toolY = Math.max(5, Math.min(95, agentNode.y + Math.sin(angle) * radius));
              } else {
                // Last resort fallback
                toolX = 20 + (agentIndex * 10);
                toolY = 20 + (agentIndex * 10);
              }
            }
            
            const toolNode: Node = {
              id: `tool-${agentNodeId}-${toolId}`,
              x: toolX,
              y: toolY,
              color: '#6B7280', // Default gray, will be overridden by tool-specific colors
              type: 'tool',
              parentAgentId: agentNodeId,
              toolId: toolId,
              name: formatToolName(toolId)
            };
            
            nodes.push(toolNode);
          }
        });
      }

      // Check if agent has recall tools configured
      if (configAgent.recall_tools) {
        const recallTools = configAgent.recall_tools;
        
        // Process each recall tool type
        Object.entries(recallTools).forEach(([toolId, toolConfig]) => {
          if (toolConfig && typeof toolConfig === 'object' && 'enabled' in toolConfig && toolConfig.enabled) {
            let toolX: number, toolY: number;
            
            // Use stored canvas position if available
            if ('canvas_position' in toolConfig && toolConfig.canvas_position) {
              toolX = toolConfig.canvas_position.x;
              toolY = toolConfig.canvas_position.y;
            } else {
              // Fallback: calculate position around agent (this shouldn't happen with new backend)
              const agentNode = nodes.find(n => n.id === agentNodeId);
              if (agentNode) {
                // Simple offset for now - could be improved
                const existingToolsForAgent = nodes.filter(n => n.type === 'tool' && n.parentAgentId === agentNodeId).length;
                const angle = (existingToolsForAgent / 6) * 2 * Math.PI; // 6 tools max per agent (4 web + 2 recall)
                const radius = 15;
                toolX = Math.max(5, Math.min(95, agentNode.x + Math.cos(angle) * radius));
                toolY = Math.max(5, Math.min(95, agentNode.y + Math.sin(angle) * radius));
              } else {
                // Last resort fallback
                toolX = 20 + (agentIndex * 10);
                toolY = 20 + (agentIndex * 10);
              }
            }
            
            const toolNode: Node = {
              id: `tool-${agentNodeId}-${toolId}`,
              x: toolX,
              y: toolY,
              color: '#6B7280', // Default gray, will be overridden by tool-specific colors
              type: 'tool',
              parentAgentId: agentNodeId,
              toolId: toolId,
              name: formatToolName(toolId)
            };
            
            nodes.push(toolNode);
          }
        });
      }
    });
  }

  // console.log('🎯 dd Final nodes:', nodes);
  return nodes;
}

/**
 * Converts frontend agents and nodes to backend API format
 * Used for both config updates and simulation requests
 */
export function agentsToApiFormat(agents: Agent[], nodes: Node[]): ApiAgent[] {
  return agents
    .filter(agent => agent.enabled)
    .map(agent => {
      const node = nodes.find(n => n.id === agent.nodeId);
      const agentData: ApiAgent = {
        name: agent.name,
        profile: agent.personality,
        model_id: agent.model_id || undefined,
        lm_config: agent.lm_config,
        web_search_tools: undefined,
        recall_tools: undefined
      };
      
      if (node) {
        agentData.canvas_position = {
          x: node.x,
          y: node.y
        };
      }
      
      // Include web search tools with canvas positions if configured
      if (agent.web_search_tools) {
        agentData.web_search_tools = {};
        
        // Process each tool type and add canvas positions from tool nodes
        Object.entries(agent.web_search_tools).forEach(([toolId, toolConfig]) => {
          if (toolConfig && toolConfig.enabled) {
            const toolNode = nodes.find(n => 
              n.type === 'tool' && 
              n.parentAgentId === agent.nodeId && 
              n.toolId === toolId
            );
            
            const toolConfigWithPosition = {
              ...toolConfig,
              canvas_position: toolNode ? { x: toolNode.x, y: toolNode.y } : undefined
            };
            
            agentData.web_search_tools![toolId as keyof typeof agentData.web_search_tools] = toolConfigWithPosition as any;
          }
        });
        
        if (Object.keys(agentData.web_search_tools).length === 0) {
          agentData.web_search_tools = undefined;
        }
      }
      
      // Include recall tools with canvas positions if configured
      if (agent.recall_tools) {
        agentData.recall_tools = {};
        
        // Process each recall tool type and add canvas positions from tool nodes
        Object.entries(agent.recall_tools).forEach(([toolId, toolConfig]) => {
          if (toolConfig && toolConfig.enabled) {
            const toolNode = nodes.find(n => 
              n.type === 'tool' && 
              n.parentAgentId === agent.nodeId && 
              n.toolId === toolId
            );
            
            const toolConfigWithPosition = {
              ...toolConfig,
              canvas_position: toolNode ? { x: toolNode.x, y: toolNode.y } : undefined
            };
            
            agentData.recall_tools![toolId as keyof typeof agentData.recall_tools] = toolConfigWithPosition as any;
          }
        });
        
        if (Object.keys(agentData.recall_tools).length === 0) {
          agentData.recall_tools = undefined;
        }
      }

      // Include document IDs if assigned
      if (agent.document_ids && agent.document_ids.length > 0) {
        agentData.document_ids = agent.document_ids;
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
  const count = config.agents?.length || config.parameters.agent_count || 0;
  console.log('getActualAgentCount - Config:', config.id, 'agents.length:', config.agents?.length, 'agent_count:', config.parameters.agent_count, 'result:', count);
  return count;
}

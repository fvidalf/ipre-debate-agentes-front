'use client';

import { useState, useCallback } from 'react';
import { Node } from '@/types';
import { formatToolName } from '@/lib/configUtils';

interface UseCanvasStateReturn {
  nodes: Node[];
  selectedNodeId: string | null;
  handleNodeMove: (nodeId: string, x: number, y: number) => void;
  handleNodeClick: (nodeId: string) => void;
  handleCanvasClick: () => void;
  addNode: (node: Node) => void;
  removeNode: (nodeId: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  getNode: (nodeId: string) => Node | undefined;
  getPeerNodes: () => Node[];
  getCenterNode: () => Node | undefined;
  getToolNodes: (agentId?: string) => Node[];
  addToolNode: (agentId: string, toolId: string, toolName?: string, position?: { x: number; y: number }) => void;
  removeToolNode: (agentId: string, toolId: string) => void;
  removeToolNodesForAgent: (agentId: string) => void;
}

const DEFAULT_NODES: Node[] = [
  { id: 'center', x: 50, y: 50, color: '#5AC46B', type: 'center' },
];

export function useCanvasState(): UseCanvasStateReturn {
  const [nodes, setNodes] = useState<Node[]>(DEFAULT_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const handleNodeMove = useCallback((nodeId: string, x: number, y: number) => {
    setNodes(prev =>
      prev.map(node =>
        node.id === nodeId ? { ...node, x, y } : node
      )
    );
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const addNode = useCallback((node: Node) => {
    setNodes(prev => [...prev, node]);
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
  }, []);

  const getNode = useCallback((nodeId: string) => {
    return nodes.find(node => node.id === nodeId);
  }, [nodes]);

  const getPeerNodes = useCallback(() => {
    return nodes.filter(node => node.type === 'peer');
  }, [nodes]);

  const getCenterNode = useCallback(() => {
    return nodes.find(node => node.type === 'center');
  }, [nodes]);

  const getToolNodes = useCallback((agentId?: string) => {
    if (agentId) {
      return nodes.filter(node => node.type === 'tool' && node.parentAgentId === agentId);
    }
    return nodes.filter(node => node.type === 'tool');
  }, [nodes]);

  const addToolNode = useCallback((agentId: string, toolId: string, toolName?: string, position?: { x: number; y: number }) => {
    
    setNodes(prev => {
      // Find agent node in the current state
      const agentNode = prev.find(node => node.id === agentId);
      if (!agentNode) {
        console.error('❌ Agent node not found:', agentId);
        return prev;
      }

      const existingToolNode = prev.find(
        node => node.type === 'tool' && 
                node.parentAgentId === agentId && 
                node.toolId === toolId
      );
      if (existingToolNode) {
        return prev;
      }

      let toolX: number, toolY: number;
      
      if (position) {
        toolX = position.x;
        toolY = position.y;
      } else {
        const existingToolNodes = prev.filter(node => 
          node.type === 'tool' && node.parentAgentId === agentId
        );
        const toolIndex = existingToolNodes.length;
        const radius = 15; // Distance from agent in percentage
        const angle = (toolIndex / Math.max(1, toolIndex + 1)) * 2 * Math.PI;
        
        toolX = Math.max(5, Math.min(95, agentNode.x + Math.cos(angle) * radius));
        toolY = Math.max(5, Math.min(95, agentNode.y + Math.sin(angle) * radius));
      }
      
      const toolNode: Node = {
        id: `tool-${agentId}-${toolId}`,
        x: toolX,
        y: toolY,
        color: '#6B7280', // Default gray, will be overridden by tool-specific color
        type: 'tool',
        parentAgentId: agentId,
        toolId: toolId,
        name: toolName || formatToolName(toolId)
      };

      console.log('🎨 Creating tool node:', toolNode);
      console.log('🎨 Adding tool node to canvas, current nodes:', prev.length);
      return [...prev, toolNode];
    });
  }, []);

  const removeToolNode = useCallback((agentId: string, toolId: string) => {
    setNodes(prev => 
      prev.filter(node => 
        !(node.type === 'tool' && 
          node.parentAgentId === agentId && 
          node.toolId === toolId)
      )
    );
  }, []);

  const removeToolNodesForAgent = useCallback((agentId: string) => {
    setNodes(prev => 
      prev.filter(node => 
        !(node.type === 'tool' && node.parentAgentId === agentId)
      )
    );
  }, []);

  return {
    nodes,
    selectedNodeId,
    handleNodeMove,
    handleNodeClick,
    handleCanvasClick,
    addNode,
    removeNode,
    setSelectedNodeId,
    getNode,
    getPeerNodes,
    getCenterNode,
    getToolNodes,
    addToolNode,
    removeToolNode,
    removeToolNodesForAgent,
  };
}

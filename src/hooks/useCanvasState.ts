'use client';

import { useState, useCallback } from 'react';
import { Node } from '@/types';

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
  };
}

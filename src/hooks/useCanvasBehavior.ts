'use client';

import { useState, useCallback, useRef } from 'react';

interface DragState {
  isDragging: boolean;
  nodeId: string | null;
  startPos: { x: number; y: number };
  dragStarted: boolean;
}

interface InteractiveCanvasOptions {
  onNodeMove?: (nodeId: string, x: number, y: number) => void;
  onNodeClick?: (nodeId: string) => void;
  onCanvasClick?: () => void;
}

export function useInteractiveCanvas({
  onNodeMove,
  onNodeClick,
  onCanvasClick
}: InteractiveCanvasOptions = {}) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    nodeId: null,
    startPos: { x: 0, y: 0 },
    dragStarted: false
  });
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDragState({
      isDragging: true,
      nodeId,
      startPos: { x: e.clientX, y: e.clientY },
      dragStarted: false
    });
  }, []);

  const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeClick?.(nodeId);
  }, [onNodeClick]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only trigger if clicking directly on canvas, not on child elements
    if (e.target === e.currentTarget) {
      onCanvasClick?.();
    }
  }, [onCanvasClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.nodeId || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Mark as dragging if moved enough
    const distance = Math.sqrt(
      Math.pow(e.clientX - dragState.startPos.x, 2) + 
      Math.pow(e.clientY - dragState.startPos.y, 2)
    );
    
    if (distance > 5) {
      setDragState(prev => ({ ...prev, dragStarted: true }));
    }
    
    // Calculate new position as percentage
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    
    onNodeMove?.(dragState.nodeId, x, y);
  }, [dragState, onNodeMove]);

  const handleMouseUp = useCallback(() => {
    setDragState({ 
      isDragging: false, 
      nodeId: null, 
      startPos: { x: 0, y: 0 }, 
      dragStarted: false 
    });
  }, []);

  return {
    canvasRef,
    dragState,
    onNodeMouseDown: handleNodeMouseDown,
    onNodeClick: handleNodeClick,
    onCanvasClick: handleCanvasClick,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseUp
  };
}

export function useStaticCanvas() {
  return {
    canvasRef: null,
    dragState: null,
    onNodeMouseDown: undefined,
    onNodeClick: undefined,
    onCanvasClick: undefined,
    onMouseMove: undefined,
    onMouseUp: undefined,
    onMouseLeave: undefined
  };
}
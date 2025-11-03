'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ToolInfo } from '@/lib/api';

interface DragState {
  isDragging: boolean;
  draggedTool: ToolInfo | null;
  dragPosition: { x: number; y: number };
}

interface DragDropContextType {
  dragState: DragState;
  startDrag: (tool: ToolInfo, position: { x: number; y: number }) => void;
  updateDragPosition: (position: { x: number; y: number }) => void;
  endDrag: () => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTool: null,
    dragPosition: { x: 0, y: 0 },
  });

  // Global mouse tracking for drag position
  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragState(prev => ({
        ...prev,
        dragPosition: { x: e.clientX, y: e.clientY },
      }));
    };

    const handleMouseUp = () => {
      setDragState({
        isDragging: false,
        draggedTool: null,
        dragPosition: { x: 0, y: 0 },
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState.isDragging]);

  const startDrag = useCallback((tool: ToolInfo, position: { x: number; y: number }) => {
    setDragState({
      isDragging: true,
      draggedTool: tool,
      dragPosition: position,
    });
  }, []);

  const updateDragPosition = useCallback((position: { x: number; y: number }) => {
    setDragState(prev => ({
      ...prev,
      dragPosition: position,
    }));
  }, []);

  const endDrag = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedTool: null,
      dragPosition: { x: 0, y: 0 },
    });
  }, []);

  const contextValue = {
    dragState,
    startDrag,
    updateDragPosition,
    endDrag,
  };

  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
}
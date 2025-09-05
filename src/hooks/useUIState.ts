'use client';

import { useState, useCallback, useMemo } from 'react';
import { SidebarOption } from '@/types';

interface UseUIStateReturn {
  activeOption: SidebarOption;
  setActiveOption: (option: SidebarOption) => void;
  highlightedNodeId: string | null;
  getHighlightedNodeId: (selectedNodeId: string | null) => string | null;
}

export function useUIState(): UseUIStateReturn {
  const [activeOption, setActiveOption] = useState<SidebarOption>('settings');

  const getHighlightedNodeId = useCallback((selectedNodeId: string | null) => {
    // Context-aware highlighting: only highlight nodes when in settings view
    if (activeOption !== 'settings') return null;
    return selectedNodeId;
  }, [activeOption]);

  const highlightedNodeId = useMemo(() => {
    return getHighlightedNodeId(null); // This will be overridden by the main hook
  }, [getHighlightedNodeId]);

  return {
    activeOption,
    setActiveOption,
    highlightedNodeId,
    getHighlightedNodeId,
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { debateApi, ToolInfo } from '@/lib/api';

interface UseToolsReturn {
  webSearchTools: ToolInfo[];
  recallTools: ToolInfo[];
  tools: ToolInfo[]; // Combined for backwards compatibility
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getToolCategory: (toolId: string) => 'web_search' | 'recall' | null;
}

export function useTools(): UseToolsReturn {
  const [webSearchTools, setWebSearchTools] = useState<ToolInfo[]>([]);
  const [recallTools, setRecallTools] = useState<ToolInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Main fetch function
  const fetchTools = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await debateApi.getAvailableTools();
      // Extract tools from the nested structure
      setWebSearchTools(response.tools.web_search_tools || []);
      setRecallTools(response.tools.recall_tools || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available tools';

      if (err instanceof Error && (err as Error & { status?: number }).status === 401) {
        // Auth error - clear tools state
        setWebSearchTools([]);
        setRecallTools([]);
        setError('Authentication required');
      } else {
        setError(errorMessage);
      }
      
      console.error('Error fetching available tools:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized refetch function for external use
  const refetch = useCallback(async () => {
    await fetchTools();
  }, []);

  const getToolCategory = useCallback((toolId: string) => {
    if (webSearchTools.some(t => t.id === toolId)) {
      return 'web_search';
    }
    if (recallTools.some(t => t.id === toolId)) {
      return 'recall';
    }
    return null;
  }, [webSearchTools, recallTools]);

  // Fetch tools on component mount
  useEffect(() => {
    fetchTools();
  }, []);

  return {
    webSearchTools,
    recallTools,
    tools: [...webSearchTools, ...recallTools], // Combined for backwards compatibility
    isLoading,
    error,
    refetch,
    getToolCategory,
  };
}
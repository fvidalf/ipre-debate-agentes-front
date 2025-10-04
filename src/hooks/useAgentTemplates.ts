'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { debateApi, AgentTemplate, GetTemplatesParams } from '@/lib/api';

interface UseAgentTemplatesReturn {
  templates: AgentTemplate[];
  isLoading: boolean;
  error: string | null;
  refetch: (params?: GetTemplatesParams) => Promise<void>;
  getTemplate: (templateId: string) => Promise<AgentTemplate | null>;
}

export function useAgentTemplates(initialParams?: GetTemplatesParams): UseAgentTemplatesReturn {
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store initial params to prevent unnecessary re-renders
  const initialParamsRef = useRef(initialParams);

  // Main fetch function - not wrapped in useCallback to avoid dependency issues
  const fetchTemplates = async (params?: GetTemplatesParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await debateApi.getAgentTemplates(params);
      setTemplates(response.agents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agent templates';
      
      if (err instanceof Error && (err as any).status === 401) {
        // Auth error - clear templates state
        setTemplates([]);
        setError('Authentication required');
      } else {
        setError(errorMessage);
      }
      
      console.error('Error fetching agent templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized refetch function for external use
  const refetch = useCallback(async (params?: GetTemplatesParams) => {
    await fetchTemplates(params);
  }, []); // Empty dependency array is safe since fetchTemplates doesn't depend on state

  // Individual template getter - no dependencies needed
  const getTemplate = useCallback(async (templateId: string): Promise<AgentTemplate | null> => {
    try {
      const template = await debateApi.getAgentTemplate(templateId);
      return template;
    } catch (err) {
      console.error('Error fetching agent template:', err);
      return null;
    }
  }, []);

  // Fetch templates only once on mount with initial params
  useEffect(() => {
    fetchTemplates(initialParamsRef.current);
  }, []); // Empty dependency array - only run on mount

  return {
    templates,
    isLoading,
    error,
    refetch,
    getTemplate,
  };
}

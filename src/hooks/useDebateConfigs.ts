'use client';

import { useState, useEffect, useCallback } from 'react';
import { debateApi, Config, ConfigRun } from '@/lib/api';

interface UseDebateConfigsReturn {
  configs: Config[];
  loading: boolean;
  error: string | null;
  selectedConfigId: string | null;
  selectedConfigRuns: ConfigRun[];
  runsLoading: boolean;
  expandedConfigs: Set<string>;
  toggleConfig: (configId: string) => void;
  selectConfig: (configId: string | null) => void;
  refreshConfigs: () => Promise<void>;
}

export function useDebateConfigs(): UseDebateConfigsReturn {
  const [configs, setConfigs] = useState<Config[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [selectedConfigRuns, setSelectedConfigRuns] = useState<ConfigRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);
  const [expandedConfigs, setExpandedConfigs] = useState<Set<string>>(new Set());

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await debateApi.getConfigs({ limit: 50 });
      setConfigs(response.configs);
    } catch (err) {
      console.error('Error fetching configs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch configs');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConfigRuns = useCallback(async (configId: string) => {
    try {
      setRunsLoading(true);
      const response = await debateApi.getConfigRuns(configId, { limit: 20 });
      setSelectedConfigRuns(response.runs);
    } catch (err) {
      console.error('Error fetching config runs:', err);
      setSelectedConfigRuns([]);
    } finally {
      setRunsLoading(false);
    }
  }, []);

  const toggleConfig = useCallback((configId: string) => {
    setExpandedConfigs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(configId)) {
        newSet.delete(configId);
        // If we're collapsing the selected config, clear selection
        if (selectedConfigId === configId) {
          setSelectedConfigId(null);
          setSelectedConfigRuns([]);
        }
      } else {
        newSet.add(configId);
        // When expanding, also select this config and fetch its runs
        setSelectedConfigId(configId);
        fetchConfigRuns(configId);
      }
      return newSet;
    });
  }, [selectedConfigId, fetchConfigRuns]);

  const selectConfig = useCallback((configId: string | null) => {
    setSelectedConfigId(configId);
    if (configId) {
      fetchConfigRuns(configId);
    } else {
      setSelectedConfigRuns([]);
    }
  }, [fetchConfigRuns]);

  const refreshConfigs = useCallback(async () => {
    await fetchConfigs();
  }, [fetchConfigs]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    configs,
    loading,
    error,
    selectedConfigId,
    selectedConfigRuns,
    runsLoading,
    expandedConfigs,
    toggleConfig,
    selectConfig,
    refreshConfigs,
  };
}

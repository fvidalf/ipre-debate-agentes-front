'use client';

import { useState, useEffect, useCallback } from 'react';
import { debateApi, Config, ConfigRun } from '@/lib/api';

interface UseConfigsReturn {
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

export function useConfigs(): UseConfigsReturn {
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
      if (err instanceof Error && (err as Error & { status?: number }).status === 401) {
        // Auth error - clear local state
        setConfigs([]);
        setSelectedConfigId(null);
        setSelectedConfigRuns([]);
        setExpandedConfigs(new Set());
        setError('Authentication required');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch configs');
      }
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
      if (err instanceof Error && (err as Error & { status?: number }).status === 401) {
        // Auth error - clear runs state
        setSelectedConfigRuns([]);
      } else {
        setSelectedConfigRuns([]);
      }
    } finally {
      setRunsLoading(false);
    }
  }, []);

  const toggleConfig = useCallback((configId: string) => {
    setExpandedConfigs(prev => {
      if (prev.has(configId)) {
        // Collapsing the current config
        setSelectedConfigId(null);
        setSelectedConfigRuns([]);
        return new Set(); // Close all expanded configs
      } else {
        // Expanding a new config - close all others and open this one
        setSelectedConfigId(configId);
        fetchConfigRuns(configId);
        return new Set([configId]); // Only this config is expanded
      }
    });
  }, [fetchConfigRuns]);

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

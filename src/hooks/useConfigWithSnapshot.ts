import { useState, useEffect } from 'react';
import { Config, debateApi } from '@/lib/api';

interface UseConfigWithSnapshotReturn {
  displayConfig: Config;
  fullConfig: Config | null;
  snapshotConfig: Config | null;
  selectedRunId: string | null;
  configLoading: boolean;
  configError: string | null;
  snapshotLoading: boolean;
  snapshotError: string | null;
  handleRunSelect: (runId: string, versionNumber: number) => Promise<void>;
}

export function useConfigWithSnapshot(
  configId: string,
  initialConfig: Config,
  isExpanded: boolean
): UseConfigWithSnapshotReturn {
  const [fullConfig, setFullConfig] = useState<Config | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  
  // Selected run and snapshot state
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [snapshotConfig, setSnapshotConfig] = useState<Config | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  // Use snapshot config if a run is selected, otherwise use full config or initial config
  const displayConfig = snapshotConfig || fullConfig || initialConfig;

  // Fetch full config when expanded for the first time
  useEffect(() => {
    if (isExpanded && !fullConfig && !configLoading) {
      const fetchFullConfig = async () => {
        try {
          setConfigLoading(true);
          setConfigError(null);
          console.log('🔍 useConfigWithSnapshot - Fetching full config for:', configId);
          const fullConfigData = await debateApi.getConfig(configId);
          console.log('✅ useConfigWithSnapshot - Loaded full config:', fullConfigData);
          setFullConfig(fullConfigData);
        } catch (error) {
          console.error('❌ useConfigWithSnapshot - Error fetching full config:', error);
          setConfigError(error instanceof Error ? error.message : 'Failed to load config details');
        } finally {
          setConfigLoading(false);
        }
      };

      fetchFullConfig();
    }
  }, [isExpanded, fullConfig, configLoading, configId]);

  // Function to handle run selection
  const handleRunSelect = async (runId: string, versionNumber: number) => {
    if (selectedRunId === runId) {
      // Deselect if clicking the same run
      setSelectedRunId(null);
      setSnapshotConfig(null);
      return;
    }

    try {
      setSelectedRunId(runId);
      setSnapshotLoading(true);
      setSnapshotError(null);
      console.log('🔍 useConfigWithSnapshot - Fetching snapshot for run:', { runId, configId, versionNumber });
      
      const snapshot = await debateApi.getConfigVersion(configId, versionNumber);
      console.log('✅ useConfigWithSnapshot - Loaded snapshot:', snapshot);
      setSnapshotConfig(snapshot);
    } catch (error) {
      console.error('❌ useConfigWithSnapshot - Error fetching snapshot:', error);
      setSnapshotError(error instanceof Error ? error.message : 'Failed to load snapshot');
      setSelectedRunId(null);
    } finally {
      setSnapshotLoading(false);
    }
  };

  return {
    displayConfig,
    fullConfig,
    snapshotConfig,
    selectedRunId,
    configLoading,
    configError,
    snapshotLoading,
    snapshotError,
    handleRunSelect,
  };
}
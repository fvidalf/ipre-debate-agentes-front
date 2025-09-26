'use client';

import { Eye } from 'lucide-react';
import { Config, ConfigRun, debateApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DebateItemHeader from './DebateItemHeader';
import RunsList from './RunsList';
import CanvasPreview from './CanvasPreview';

interface DebateItemProps {
  configId: string;
  initialConfig: Config; // Basic config info from the list
  runs: ConfigRun[];
  runsLoading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: (configId: string, configName: string) => Promise<void>;
}

export default function DebateItem({ 
  configId,
  initialConfig,
  runs, 
  runsLoading, 
  isExpanded, 
  onToggle,
  onDelete 
}: DebateItemProps) {
  const router = useRouter();
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
          console.log('🔍 DebateItem - Fetching full config for:', configId);
          const fullConfigData = await debateApi.getConfig(configId);
          console.log('✅ DebateItem - Loaded full config:', fullConfigData);
          setFullConfig(fullConfigData);
        } catch (error) {
          console.error('❌ DebateItem - Error fetching full config:', error);
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
      console.log('🔍 DebateItem - Fetching snapshot for run:', { runId, configId, versionNumber });
      
      const snapshot = await debateApi.getConfigVersion(configId, versionNumber);
      console.log('✅ DebateItem - Loaded snapshot:', snapshot);
      setSnapshotConfig(snapshot);
    } catch (error) {
      console.error('❌ DebateItem - Error fetching snapshot:', error);
      setSnapshotError(error instanceof Error ? error.message : 'Failed to load snapshot');
      setSelectedRunId(null);
    } finally {
      setSnapshotLoading(false);
    }
  };

  // Log config
  console.log('>>> Rendering DebateItem for displayConfig:', displayConfig);

  const handleOpenInEditor = () => {
    // Force full page reload instead of client-side navigation to avoid
    // React component reuse issues with complex hook dependencies
    window.location.href = `/editor/${configId}`;
  };

  const handleViewSimulation = (runId: string) => {
    router.push(`/simulation?id=${runId}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <DebateItemHeader 
        config={displayConfig}
        isExpanded={isExpanded}
        onToggle={onToggle}
        onOpenEditor={handleOpenInEditor}
        onDelete={() => onDelete(configId, displayConfig.name)}
      />

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {configLoading ? (
            // Loading state for config details
            <div className="grid grid-cols-[3fr_2fr]">
              <div className="p-6 border-r border-gray-100">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Past simulations
                </h4>
                <RunsList 
                  runs={runs}
                  runsLoading={runsLoading}
                  selectedRunId={selectedRunId}
                  onRunSelect={handleRunSelect}
                  onViewSimulation={handleViewSimulation}
                />
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-medium text-gray-900">Preview</h4>
                  <div className="animate-pulse">
                    <div className="bg-gray-200 rounded h-4 w-16"></div>
                  </div>
                </div>
                
                <div className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg w-full h-48 mb-4"></div>
                </div>
                
                <div className="text-center">
                  <div className="animate-pulse">
                    <div className="bg-gray-200 rounded h-8 w-24 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : configError ? (
            // Error state for config details
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-800 font-medium mb-2">Error loading config details</h3>
                <p className="text-red-600 text-sm">{configError}</p>
              </div>
            </div>
          ) : (
            // Full content when config is loaded
            <div className="grid grid-cols-[3fr_2fr]">
              {/* Past Simulations */}
              <div className="p-6 border-r border-gray-100">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Past simulations
                </h4>
                
                <RunsList 
                  runs={runs}
                  runsLoading={runsLoading}
                  selectedRunId={selectedRunId}
                  onRunSelect={handleRunSelect}
                  onViewSimulation={handleViewSimulation}
                />
              </div>

              {/* Canvas Preview */}
              <CanvasPreview 
                config={displayConfig}
                isLoading={snapshotLoading || configLoading}
                error={snapshotError || configError}
                selectedRunId={selectedRunId}
                onOpenEditor={handleOpenInEditor}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

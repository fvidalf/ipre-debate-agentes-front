'use client';

import { ChevronUp, ChevronDown, MoreVertical, Eye } from 'lucide-react';
import { Config, ConfigRun, debateApi } from '@/lib/api';
import { getActualAgentCount } from '@/lib/configUtils';
import MiniCanvas from './MiniCanvas';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface DebateItemProps {
  configId: string;
  initialConfig: Config; // Basic config info from the list
  runs: ConfigRun[];
  runsLoading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function DebateItem({ 
  configId,
  initialConfig,
  runs, 
  runsLoading, 
  isExpanded, 
  onToggle 
}: DebateItemProps) {
  const router = useRouter();
  const [fullConfig, setFullConfig] = useState<Config | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Use the full config if available, otherwise fall back to initial config
  const config = fullConfig || initialConfig;

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

  // Log config
  console.log('>>> Rendering DebateItem for config:', config);

  const handleOpenInEditor = () => {
    // Force full page reload instead of client-side navigation to avoid
    // React component reuse issues with complex hook dependencies
    window.location.href = `/editor/${configId}`;
  };

  const handleViewSimulation = (runId: string) => {
    router.push(`/simulation?id=${runId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status: ConfigRun['status']) => {
    switch (status) {
      case 'finished': return 'text-green-600 bg-green-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'stopped': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {config.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {config.description}
            </p>
            <div className="text-xs text-gray-500">
              Version {config.version_number} • {formatDate(config.updated_at)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenInEditor}
              className="bg-purple-600 text-white hover:bg-purple-700 text-sm px-3 py-1.5"
            >
              Open in editor
            </Button>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

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
                {runsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-100 rounded-lg h-16"></div>
                      </div>
                    ))}
                  </div>
                ) : runs.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {runs.map((run) => (
                      <div 
                        key={run.simulation_id}
                        className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              Run {run.simulation_id.slice(-8)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(run.status)}`}>
                              {run.status}
                            </span>
                            {!run.is_latest_version && (
                              <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
                                v{run.config_version_when_run} (outdated)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(run.created_at)} 
                            {run.finished_at && ` • Finished ${formatDate(run.finished_at)}`}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleViewSimulation(run.simulation_id)}
                          className="bg-purple-600 text-white hover:bg-purple-700 text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          See simulation
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No simulations run yet
                  </div>
                )}
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
                
                {runsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-100 rounded-lg h-16"></div>
                      </div>
                    ))}
                  </div>
                ) : runs.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {runs.map((run) => (
                      <div 
                        key={run.simulation_id}
                        className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              Run {run.simulation_id.slice(-8)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(run.status)}`}>
                              {run.status}
                            </span>
                            {!run.is_latest_version && (
                              <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
                                v{run.config_version_when_run} (outdated)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(run.created_at)} 
                            {run.finished_at && ` • Finished ${formatDate(run.finished_at)}`}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleViewSimulation(run.simulation_id)}
                          className="bg-purple-600 text-white hover:bg-purple-700 text-xs px-3 py-1.5 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          See simulation
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No simulations run yet
                  </div>
                )}
              </div>

              {/* Canvas Preview */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-medium text-gray-900">Preview</h4>
                  <div className="text-xs text-gray-500">
                    {getActualAgentCount(config)} agents
                  </div>
                </div>
                
                <MiniCanvas 
                  config={config}
                  className="w-full aspect-[4/3] mb-4"
                />
                
                <div className="text-center">
                  <Button
                    onClick={handleOpenInEditor}
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm px-4 py-2"
                  >
                    See in editor
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

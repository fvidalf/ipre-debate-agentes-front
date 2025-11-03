'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { debateApi, SimulationStatusResponse, VoteResponse, AnalyticsType, AnalyticsResponse, Config } from '@/lib/api';
import { SimulationLayout } from '@/views/simulation';

function SimulationPageContent() {
  const searchParams = useSearchParams();
  const simulationId = searchParams?.get('id');
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatusResponse | null>(null);
  const [voteResults, setVoteResults] = useState<VoteResponse | null>(null);
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [analyticsResults, setAnalyticsResults] = useState<AnalyticsResponse | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [configSnapshot, setConfigSnapshot] = useState<Config | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [hasPollingError, setHasPollingError] = useState(false);
  const [selectedViz, setSelectedViz] = useState<AnalyticsType | null>(null);

  // Fetch config snapshot for the simulation
  const fetchConfigSnapshot = useCallback(async (configId: string, versionNumber: number) => {
    try {
      setConfigLoading(true);
      const snapshot = await debateApi.getConfigVersion(configId, versionNumber);
      setConfigSnapshot(snapshot);
    } catch (err) {
      console.error('Failed to fetch config snapshot:', err);
      // Don't set error state for config failures - simulation can still work
    } finally {
      setConfigLoading(false);
    }
  }, []);

  // Poll for simulation status
  const pollSimulationStatus = useCallback(async (id: string) => {
    try {
      const status = await debateApi.getSimulationStatus(id);
      console.log('Polled simulation status:', status);
      setSimulationStatus(status);
      setError(null); // Clear any previous errors
      setHasPollingError(false);
      
      // Fetch config snapshot if available and not already loaded
      if (status.config_id && status.config_version_when_run && !configSnapshot && !configLoading) {
        fetchConfigSnapshot(status.config_id, status.config_version_when_run);
      }
      
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load simulation';
      setError(errorMessage);
      setHasPollingError(true);
      
      // Return null to indicate error and stop polling
      return null;
    }
  }, [configSnapshot, configLoading, fetchConfigSnapshot]); // Add dependencies

  // Start polling
  const startPolling = useCallback((id: string) => {
    // Clear any existing interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      const status = await pollSimulationStatus(id);
      
      // Stop polling when finished, failed, or had polling error
      if (status?.is_finished || status === null) {
        clearInterval(interval);
        setPollingInterval(null);
      }
    }, 2000); // Poll every 2 seconds

    setPollingInterval(interval);
    return interval;
  }, []); // Remove dependencies to prevent recreation

  // Stop simulation
  const handleStopSimulation = async () => {
    if (!simulationId) return;
    
    try {
      await debateApi.stopSimulation(simulationId);
      // Polling will detect the stop and update the status
    } catch (err) {
      console.error('Failed to stop simulation:', err);
    }
  };

  const fetchExistingVotes = useCallback(async (id: string) => {
    try {
      setVoteLoading(true);
      setVoteError(null);
      const voteResponse = await debateApi.getSimulationVotes(id);
      setVoteResults(voteResponse);
      console.log('Existing votes fetched:', voteResponse);
    } catch (err: unknown) {
      // Don't set error for 404 - just means no votes exist yet
      if ((err as { status?: number }).status !== 404) {
        console.error('Failed to fetch existing votes:', err);
        const errorMessage = 'Failed to load existing votes';
        setVoteError(errorMessage);
      }
    } finally {
      setVoteLoading(false);
    }
  }, []);

  const fetchExistingAnalytics = useCallback(async (id: string) => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      const analyticsResponse = await debateApi.getSimulationAnalytics(id);
      setAnalyticsResults(analyticsResponse);
      console.log('Existing analytics fetched:', analyticsResponse);
    } catch (err: unknown) {
      if ((err as { status?: number }).status !== 404) {
        console.error('Failed to fetch existing analytics:', err);
        const errorMessage = 'Failed to load existing analytics';
        setAnalyticsError(errorMessage);
      }
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  // Vote simulation
  const handleVoteSimulation = async () => {
    if (!simulationId) return;
    
    try {
      setVoteLoading(true);
      setVoteError(null); // Clear any previous errors
      const voteResponse = await debateApi.voteSimulation(simulationId);
      setVoteResults(voteResponse);
      console.log('Vote results:', voteResponse);
    } catch (err: unknown) {
      // Don't set error for 404 - just means no votes exist yet
      if ((err as { status?: number }).status !== 404) {
        console.error('Failed to trigger voting:', err);
        const errorMessage = 'Failed to start voting';
        setVoteError(errorMessage);
      }
    } finally {
      setVoteLoading(false);
    }
  };

  // Fetch analytics data
  const handleAnalyzeSimulation = async () => {
    if (!simulationId) return;

    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      const analyticsResponse = await debateApi.analyzeSimulation(simulationId);
      setAnalyticsResults(analyticsResponse);
      console.log('Analytics data fetched:', analyticsResponse);
    } catch (err: unknown) {
      // Don't set error for 404 - just means no analytics exist yet
      if ((err as { status?: number }).status !== 404) {
        console.error('Failed to fetch analytics data:', err);
        const errorMessage = 'Failed to load analytics data';
        setAnalyticsError(errorMessage);
      }
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Log selected visualization
  useEffect(() => {
    console.log('Selected visualization:', selectedViz);
  }, [selectedViz]);

  useEffect(() => {
    if (simulationId) {
      setInitialLoading(true);
      
      // Initial poll
      pollSimulationStatus(simulationId).then(status => {
        setInitialLoading(false);
        
        // Start polling if simulation is still running
        if (status && !status.is_finished) {
          startPolling(simulationId);
        }
        
        // Fetch existing votes if simulation is finished
        if (status && status.is_finished) {
          fetchExistingVotes(simulationId);
          fetchExistingAnalytics(simulationId);
        }
      });
    } else {
      setInitialLoading(false);
      setError('No simulation ID provided');
    }

    // Cleanup on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [simulationId, fetchExistingVotes]); // Add fetchExistingVotes dependency

  // Show error screen only if there's an error and no simulation data
  if (error && !simulationStatus) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error
          </h1>
          <p className="text-gray-800 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back to My Debates
          </button>
        </div>
      </div>
    );
  }

  // Show initial loading only if we have no data yet
  if (initialLoading && !simulationStatus) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">
            Loading simulation...
          </h1>
        </div>
      </div>
    );
  }

  if (!simulationStatus) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No simulation data
          </h1>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back to My Debates
          </button>
        </div>
      </div>
    );
  }

  return (
    <SimulationLayout
      simulationId={simulationId || ''}
      simulationStatus={simulationStatus}
      configSnapshot={configSnapshot}
      configLoading={configLoading}
      voteResults={voteResults}
      voteLoading={voteLoading}
      voteError={voteError}
      analyticsResults={analyticsResults}
      analyticsLoading={analyticsLoading}
      analyticsError={analyticsError}
      error={error}
      hasPollingError={hasPollingError}
      initialLoading={initialLoading}
      onStopSimulation={handleStopSimulation}
      onVoteSimulation={handleVoteSimulation}
      onAnalyzeSimulation={handleAnalyzeSimulation}
      selectedViz={selectedViz}
      setSelectedViz={setSelectedViz}
    />
  );
}

export default function SimulationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">
            Loading simulation...
          </h1>
        </div>
      </div>
    }>
      <SimulationPageContent />
    </Suspense>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { debateApi, SimulationStatusResponse, VoteResponse } from '@/lib/api';
import { SimulationLayout } from '@/views/simulation';

function SimulationPageContent() {
  const searchParams = useSearchParams();
  const simulationId = searchParams?.get('id');
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatusResponse | null>(null);
  const [voteResults, setVoteResults] = useState<VoteResponse | null>(null);
  const [configSnapshot, setConfigSnapshot] = useState<any>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [hasPollingError, setHasPollingError] = useState(false);

  // Fetch config snapshot for the simulation
  const fetchConfigSnapshot = useCallback(async (configId: string, versionNumber: number) => {
    try {
      setConfigLoading(true);
      const snapshot = await debateApi.getConfigSnapshot(configId, versionNumber);
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
      setSimulationStatus(status);
      setError(null); // Clear any previous errors
      setHasPollingError(false);
      
      // Fetch config snapshot if available and not already loaded
      if (status.config_id && status.config_version_when_run && !configSnapshot && !configLoading) {
        fetchConfigSnapshot(status.config_id, status.config_version_when_run);
      }
      
      // If simulation finished, get vote results
      if (status.is_finished && status.status === 'finished' && !voteResults) {
        try {
          const votes = await debateApi.voteSimulation(id);
          setVoteResults(votes);
        } catch (voteError) {
          console.error('Failed to get votes:', voteError);
          // Don't set error state for vote failures
        }
      }
      
      return status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load simulation';
      setError(errorMessage);
      setHasPollingError(true);
      
      // Return null to indicate error and stop polling
      return null;
    }
  }, [configSnapshot, configLoading, fetchConfigSnapshot, voteResults]); // Add dependencies

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
  }, [simulationId]); // Only depend on simulationId

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
            onClick={() => window.location.href = '/debate'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back to Debate Setup
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
            onClick={() => window.location.href = '/debate'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back to Debate Setup
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
      error={error}
      hasPollingError={hasPollingError}
      initialLoading={initialLoading}
      onStopSimulation={handleStopSimulation}
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

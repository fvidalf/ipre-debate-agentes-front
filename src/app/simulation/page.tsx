'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { debateApi, SimulationStatusResponse, VoteResponse } from '@/lib/api';

function SimulationPageContent() {
  const searchParams = useSearchParams();
  const simulationId = searchParams?.get('id');
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatusResponse | null>(null);
  const [voteResults, setVoteResults] = useState<VoteResponse | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [hasPollingError, setHasPollingError] = useState(false);

  // Poll for simulation status
  const pollSimulationStatus = useCallback(async (id: string) => {
    try {
      const status = await debateApi.getSimulationStatus(id);
      setSimulationStatus(status);
      setError(null); // Clear any previous errors
      setHasPollingError(false);
      
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
  }, []); // Remove dependencies to prevent recreation

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

  const getStatusColor = (status: string, hasError: boolean = false) => {
    if (hasError) return 'text-red-600 bg-red-100';
    
    switch (status) {
      case 'created': return 'text-blue-600 bg-blue-100';
      case 'running': return 'text-yellow-600 bg-yellow-100';
      case 'finished': 
      case 'stopped': return 'text-green-600 bg-green-100'; // Treat stopped as finished
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string, hasError: boolean = false) => {
    if (hasError) return 'CONNECTION ERROR';
    
    switch (status) {
      case 'stopped': return 'FINISHED'; // Show "FINISHED" instead of "STOPPED"
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Debate Simulation
          </h1>
          {simulationId && (
            <p className="text-gray-700 text-sm">
              ID: {simulationId}
            </p>
          )}
        </div>

        {/* Status and Progress */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Error Banner */}
          {hasPollingError && error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">Connection lost to server</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {simulationStatus ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Status</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(simulationStatus.status, hasPollingError)}`}>
                      {getStatusLabel(simulationStatus.status, hasPollingError)}
                    </span>
                    {simulationStatus.status === 'running' && !hasPollingError && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="animate-pulse w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Debating...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {simulationStatus.status === 'running' && !hasPollingError && (
                  <button
                    onClick={handleStopSimulation}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Stop Simulation
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>Progress</span>
                  <span>
                    {simulationStatus.progress.current_iteration} / {
                      (simulationStatus.status === 'finished' || simulationStatus.status === 'stopped') 
                        ? simulationStatus.progress.current_iteration 
                        : simulationStatus.progress.max_iterations
                    } iterations
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${simulationStatus.status === 'finished' || simulationStatus.status === 'stopped' 
                        ? 100 
                        : simulationStatus.progress.percentage}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>Started: {new Date(simulationStatus.started_at).toLocaleString()}</p>
                {simulationStatus.finished_at && (
                  <p>Finished: {new Date(simulationStatus.finished_at).toLocaleString()}</p>
                )}
                {simulationStatus.stopped_reason && (
                  <p className="text-red-600">Reason: {simulationStatus.stopped_reason}</p>
                )}
              </div>
            </>
          ) : (
            // Loading state for initial data
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Status</h2>
                  <div className="flex items-center gap-3">
                    <div className="h-6 bg-blue-200 rounded-full px-3 py-1 w-24"></div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Initializing...</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                  <span>Progress</span>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-300 h-2 rounded-full w-0"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Latest Debate Events */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Debate Events</h2>
          {simulationStatus?.latest_events?.length > 0 ? (
            <div className="space-y-4">
              {simulationStatus.latest_events.map((event, index) => (
                <div key={index} className="bg-[#f3f3f3] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-purple-600">
                      {event.speaker}
                    </span>
                    <span className="text-xs text-gray-700">
                      Iteration {event.iteration} • {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-2 whitespace-pre-wrap break-words leading-relaxed">{event.opinion}</p>
                  {event.engaged.length > 0 && (
                    <div className="text-xs text-gray-600">
                      Engaged: {event.engaged.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : simulationStatus ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <div className="animate-pulse w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Waiting for debate to begin...</span>
              </div>
            </div>
          ) : (
            // Loading state for debate events
            <div className="space-y-4 animate-pulse">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-28"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          )}
        </div>

        {/* Vote Results */}
        {voteResults && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Final Vote Results</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{voteResults.yea}</div>
                <div className="text-sm text-green-800">Yes Votes</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{voteResults.nay}</div>
                <div className="text-sm text-red-800">No Votes</div>
              </div>
            </div>
            
            <h3 className="font-medium text-gray-900 mb-2">Agent Reasoning:</h3>
            <div className="space-y-2">
              {voteResults.reasons.map((reason, index) => (
                <div key={index} className="bg-[#f3f3f3] rounded p-3 text-sm">
                  {reason}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="text-center">
          <button
            onClick={() => window.location.href = '/debate'}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create New Simulation
          </button>
        </div>
      </div>
    </div>
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

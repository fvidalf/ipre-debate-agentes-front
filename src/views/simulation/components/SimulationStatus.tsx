'use client';

interface SimulationStatusProps {
  simulationStatus: any;
  error: string | null;
  hasPollingError: boolean;
  onStopSimulation: () => void;
}

export default function SimulationStatus({
  simulationStatus,
  error,
  hasPollingError,
  onStopSimulation,
}: SimulationStatusProps) {
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
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Status</h3>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {simulationStatus ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
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
                  onClick={onStopSimulation}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                  Stop
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
    </div>
  );
}
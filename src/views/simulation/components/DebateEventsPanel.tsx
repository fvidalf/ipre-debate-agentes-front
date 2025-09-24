'use client';

interface DebateEventsPanelProps {
  simulationId: string;
  simulationStatus: any;
  voteResults: any;
  error: string | null;
  hasPollingError: boolean;
}

export default function DebateEventsPanel({
  simulationId,
  simulationStatus,
  voteResults,
  error,
  hasPollingError,
}: DebateEventsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Debate Events</h2>
        {simulationId && (
          <p className="text-gray-500 text-sm mt-1">
            ID: {simulationId}
          </p>
        )}
      </div>

      {/* Error Banner */}
      {hasPollingError && error && (
        <div className="flex-shrink-0 mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Latest Debate Events */}
          {simulationStatus?.latest_events?.length > 0 ? (
            <div className="space-y-4">
              {simulationStatus.latest_events.map((event: any, index: number) => (
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

          {/* Vote Results */}
          {voteResults && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Final Vote Results</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{voteResults.yea}</div>
                  <div className="text-sm text-green-800">Yes Votes</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-xl font-bold text-red-600">{voteResults.nay}</div>
                  <div className="text-sm text-red-800">No Votes</div>
                </div>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-2">Agent Reasoning:</h4>
              <div className="space-y-2">
                {voteResults.reasons.map((reason: string, index: number) => (
                  <div key={index} className="bg-white rounded p-3 text-sm border">
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
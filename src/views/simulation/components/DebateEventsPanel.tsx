'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Brain, Search } from 'lucide-react';
import { Config } from '@/lib/api';

interface DebateEventsPanelProps {
  config?: Config;
  simulationId: string;
  simulationStatus: any;
  error: string | null;
  hasPollingError: boolean;
}

export default function DebateEventsPanel({
  config,
  simulationId,
  simulationStatus,
  error,
  hasPollingError,
}: DebateEventsPanelProps) {
  const configName = config?.name || null;

  return (
    <div className="flex flex-col h-full bg-[#f3f3f3]">
      {/* Header */}
      <div className="flex-shrink-0 p-6 ">
        <h2 className="text-2xl font-bold text-neutral-900">Simulation</h2>
        <p className="text-neutral-700 text-sm mt-1">
          {configName ? `Run of ${configName}` : ''}
        </p>
      </div>

      {/* Error Banner */}
      {hasPollingError && error && (
        <div className="flex-shrink-0 mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
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
            <div className="space-y-3">
              {simulationStatus.latest_events.map((event: any, index: number) => (
                <DebateEventCard key={index} event={event} />
              ))}
            </div>
          ) : simulationStatus ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2 text-neutral-600">
                <div className="animate-pulse w-2 h-2 bg-neutral-400 rounded-full"></div>
                <span>Waiting for debate to begin...</span>
              </div>
            </div>
          ) : (
            // Loading state for debate events
            <div className="space-y-3 animate-pulse">
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 bg-neutral-300 rounded w-20"></div>
                  <div className="h-3 bg-neutral-300 rounded w-32"></div>
                </div>
                <div className="h-4 bg-neutral-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-neutral-300 rounded w-3/4"></div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 bg-neutral-300 rounded w-24"></div>
                  <div className="h-3 bg-neutral-300 rounded w-28"></div>
                </div>
                <div className="h-4 bg-neutral-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-neutral-300 rounded w-2/3"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DebateEventCard({ event }: { event: any }) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  const reasoningStepsCount = event.reasoning_timeline?.filter((item: any) => item.type === 'thought')?.length || 0;
  const toolUsagesCount = event.reasoning_timeline?.filter((item: any) => item.type === 'tool_call')?.length || 0;
  const hasReasoningData = event.reasoning_timeline && event.reasoning_timeline.length > 0;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-sm transition-all">
      {/* Event header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-purple-600">
          {event.speaker}
        </span>
        <span className="text-xs text-neutral-600">
          Iteration {event.iteration} • {new Date(event.timestamp).toLocaleTimeString()}
        </span>
      </div>
      
      {/* Event content */}
      <p className="text-neutral-900 mb-2 whitespace-pre-wrap break-words leading-relaxed">
        {event.opinion}
      </p>
      
      {/* Engaged agents */}
      {event.engaged.length > 0 && (
        <div className="text-xs text-neutral-600 mb-3">
          Engaged: {event.engaged.join(', ')}
        </div>
      )}
      
      {/* Reasoning timeline toggle */}
      {hasReasoningData && (
        <div className="border-t border-neutral-100 pt-3">
          <button
            onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
            className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
          >
            {isReasoningExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
            <Brain className="w-3 h-3" />
            <span>
              {event.speaker} took {reasoningStepsCount} reasoning step{reasoningStepsCount !== 1 ? 's' : ''}
              {toolUsagesCount > 0 && `, and used tools ${toolUsagesCount} time${toolUsagesCount !== 1 ? 's' : ''}`}
            </span>
          </button>
          
          {/* Expanded reasoning timeline */}
          {isReasoningExpanded && (
            <div className="mt-3 space-y-2 pl-5 border-l-2 border-neutral-100">
              {event.reasoning_timeline.map((item: any, index: number) => (
                <ReasoningTimelineItem key={index} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Component for individual reasoning timeline items
function ReasoningTimelineItem({ item }: { item: any }) {
  if (item.type === 'thought') {
    return (
      <div className="flex gap-2">
        <Brain className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-neutral-600 leading-relaxed">
          <span className="font-medium text-blue-600">Thought:</span>{' '}
          {item.content}
        </div>
      </div>
    );
  }
  
  if (item.type === 'tool_call') {
    return (
      <div className="flex gap-2">
        <Search className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-neutral-600 leading-relaxed">
          <span className="font-medium text-green-600">Tool ({item.tool_name}):</span>{' '}
          <span className="italic">&quot;{item.query}&quot;</span>
          {item.result && (
            <div className="mt-1 text-neutral-500 bg-neutral-50 p-2 rounded border-l-2 border-green-200 whitespace-pre-wrap">
              {item.result}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return null;
}
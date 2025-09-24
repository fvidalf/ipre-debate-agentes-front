'use client';

import { useState } from 'react';
import { SimulationSidebarOption } from '@/types';
import SimulationSidebar from './components/SimulationSidebar';
import DebateEventsPanel from './components/DebateEventsPanel';
import SimulationCanvas from './components/SimulationCanvas';
import SimulationStatus from './components/SimulationStatus';

interface SimulationLayoutProps {
  simulationId: string;
  simulationStatus: any;
  configSnapshot: any;
  configLoading: boolean;
  voteResults: any;
  error: string | null;
  hasPollingError: boolean;
  initialLoading: boolean;
  onStopSimulation: () => void;
}

export default function SimulationLayout({
  simulationId,
  simulationStatus,
  configSnapshot,
  configLoading,
  voteResults,
  error,
  hasPollingError,
  initialLoading,
  onStopSimulation,
}: SimulationLayoutProps) {
  const [activeOption, setActiveOption] = useState<SimulationSidebarOption>('simulation');

  // Show error screen only if there's an error and no simulation data
  if (error && !simulationStatus) {
    return (
      <div className="h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error
          </h1>
          <p className="text-gray-800 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/my-debates'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to My Debates
          </button>
        </div>
      </div>
    );
  }

  // Show initial loading only if we have no data yet
  if (initialLoading && !simulationStatus) {
    return (
      <div className="h-screen bg-[#f3f3f3] flex items-center justify-center">
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
      <div className="h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No simulation data
          </h1>
          <button
            onClick={() => window.location.href = '/my-debates'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to My Debates
          </button>
        </div>
      </div>
    );
  }

  const handleSidebarOptionChange = (option: SimulationSidebarOption) => {
    setActiveOption(option);
  };

  return (
    <div className="grid grid-cols-[64px_2fr_3fr] h-screen bg-[#f3f3f3] text-neutral-900 font-sans">
      {/* Left Sidebar */}
      <SimulationSidebar
        activeOption={activeOption}
        onOptionChange={handleSidebarOptionChange}
      />

      {/* Middle Panel - Debate Events */}
      <div className="hidden md:flex md:flex-col md:min-h-0 md:overflow-hidden">
        <DebateEventsPanel
          simulationId={simulationId}
          simulationStatus={simulationStatus}
          voteResults={voteResults}
          error={error}
          hasPollingError={hasPollingError}
        />
      </div>

      {/* Right Panel - Canvas and Status */}
      <div className="flex flex-col min-h-0 overflow-hidden">
        {/* Top - Canvas (70% height) */}
        <div className="flex-[7] min-h-0 overflow-hidden">
          <SimulationCanvas
            config={configSnapshot}
            configLoading={configLoading}
          />
        </div>
        
        {/* Bottom - Status (30% height) */}
        <div className="flex-[3] min-h-0 overflow-hidden">
          <SimulationStatus
            simulationStatus={simulationStatus}
            error={error}
            hasPollingError={hasPollingError}
            onStopSimulation={onStopSimulation}
          />
        </div>
      </div>
    </div>
  );
}
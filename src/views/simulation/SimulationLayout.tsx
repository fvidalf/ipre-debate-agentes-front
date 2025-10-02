'use client';

import { useState, useEffect } from 'react';
import { SimulationSidebarOption } from '@/types';
import { AnalyticsType } from '@/lib/api';
import SimulationSidebar from './components/SimulationSidebar';
import DebateEventsPanel from './components/DebateEventsPanel';
import VotingPanel from './components/VotingPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import SimulationCanvas from './components/SimulationCanvas';
import SimulationStatus from './components/SimulationStatus';
import VisualizationRenderer from './components/VisualizationRenderer';
import { 
  EngagementMatrix, 
  ParticipationStats, 
  OpinionSimilarity 
} from './components/AnalyticsVisualization';

interface SimulationLayoutProps {
  simulationId: string;
  simulationStatus: any;
  configSnapshot: any;
  configLoading: boolean;
  voteResults: any;
  voteLoading: boolean;
  voteError: string | null;
  analyticsResults: any;
  analyticsLoading: boolean;
  analyticsError: string | null;
  error: string | null;
  hasPollingError: boolean;
  initialLoading: boolean;
  onStopSimulation: () => void;
  onVoteSimulation: () => void;
  onAnalyzeSimulation: () => void;
  selectedViz: AnalyticsType | null;
  setSelectedViz: (viz: AnalyticsType | null) => void;
}

export default function SimulationLayout({
  simulationId,
  simulationStatus,
  configSnapshot,
  configLoading,
  voteResults,
  voteLoading,
  voteError,
  analyticsResults,
  analyticsLoading,
  analyticsError,
  error,
  hasPollingError,
  initialLoading,
  onStopSimulation,
  onVoteSimulation,
  onAnalyzeSimulation,
  selectedViz,
  setSelectedViz
}: SimulationLayoutProps) {
  const [activeOption, setActiveOption] = useState<SimulationSidebarOption>('simulation');

  // Auto-redirect to simulation if on other option but simulation isn't complete
  useEffect(() => {
    const isSimulationComplete = simulationStatus?.status === 'finished' || simulationStatus?.status === 'stopped';
    
    if (!isSimulationComplete && activeOption !== 'simulation') {
      setActiveOption('simulation');
    }
  }, [simulationStatus?.status, activeOption]);

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

  const renderMiddlePanel = () => {
    switch (activeOption) {
      case 'simulation':
        return (
          <DebateEventsPanel
            config={configSnapshot}
            simulationId={simulationId}
            simulationStatus={simulationStatus}
            error={error}
            hasPollingError={hasPollingError}
          />
        );
      case 'voting':
        return (
          <VotingPanel
            config={configSnapshot}
            simulationId={simulationId}
            simulationStatus={simulationStatus}
            voteResults={voteResults}
            voteLoading={voteLoading}
            voteError={voteError}
            onVoteSimulation={onVoteSimulation}
          />
        );
      case 'visuals':
        return (
          <AnalyticsPanel
            analyticsResults={analyticsResults}
            analyticsLoading={analyticsLoading}
            analyticsError={analyticsError}
            onAnalyzeSimulation={onAnalyzeSimulation}
            selectedViz={selectedViz}
            setSelectedViz={setSelectedViz}
          />
        )
    }
  };

  const renderRightPanel = () => {
    switch (activeOption) {
      // on everything except visuals, show the simulation canvas and status
      case 'simulation':
      case 'voting':
        return (
          <>
            <div className="flex-[7] m-4 mb-2 min-h-0 overflow-hidden">
              <SimulationCanvas
                config={configSnapshot}
                configLoading={configLoading}
              />
            </div>
            
            <div className="flex-[3] m-4 mt-2 min-h-0 overflow-hidden">
              <SimulationStatus
                simulationStatus={simulationStatus}
                error={error}
                hasPollingError={hasPollingError}
                onStopSimulation={onStopSimulation}
              />
            </div>
          </>
        )
      case 'visuals':
        return (
          <div className="m-4 min-h-0 overflow-hidden h-full">
            <VisualizationRenderer
              analytics={analyticsResults?.analytics || []}
              selectedViz={selectedViz}
            />
          </div>
        );
    }
  };

  const handleSidebarOptionChange = (option: SimulationSidebarOption) => {
    setActiveOption(option);
  };

  return (
    <div className="grid grid-cols-[64px_2fr_3fr] h-screen bg-[#f3f3f3] text-neutral-900 font-sans">
      {/* Left Sidebar */}
      <SimulationSidebar
        activeOption={activeOption}
        onOptionChange={handleSidebarOptionChange}
        simulationStatus={simulationStatus}
      />

      {/* Middle Panel - Debate Events */}
      <div className="hidden md:flex md:flex-col md:min-h-0 md:overflow-hidden">
        {renderMiddlePanel()}
      </div>

      <div className="flex flex-col min-h-0 overflow-hidden">
        {renderRightPanel()}
      </div>
    </div>
  );
}
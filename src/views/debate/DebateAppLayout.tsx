'use client';

import { Sidebar, Canvas, ToolsPanel, AgentsPanel, SettingsPanel } from './components';
import { useDebateApp } from '@/hooks/useDebateApp';

export default function DebateAppLayout() {
  const {
    activeOption,
    setActiveOption,
    nodes,
    tools,
    agents,
    isRunning,
    selectedNodeId,
    highlightedNodeId,
    configuration,
    handleNodeMove,
    handleNodeClick,
    handleCanvasClick,
    handleAgentUpdate,
    handleSettingsUpdate,
    handleTopicUpdate,
    handleMaxIterationsUpdate,
    handleRemoveAgent,
    handleToolToggle,
    handleAgentSelect,
    handleCreateAgent,
    handleSelectPrebuiltAgent,
    handleSave,
    handleRun,
    canSave,
    setSelectedNodeId,
  } = useDebateApp();

  // Handle sidebar option changes with context-aware node deselection
  const handleSidebarOptionChange = (option: typeof activeOption) => {
    setActiveOption(option);
    // Clear node selection when switching away from settings view
    if (option !== 'settings') {
      setSelectedNodeId(null);
    }
  };

  const renderMiddlePanel = () => {
    switch (activeOption) {
      case 'people':
        return (
          <AgentsPanel
            agents={agents}
            onAgentSelect={handleAgentSelect}
            onCreateAgent={handleCreateAgent}
            onSelectPrebuiltAgent={handleSelectPrebuiltAgent}
          />
        );
      case 'tools':
        return (
          <ToolsPanel
            tools={tools}
            onToolToggle={handleToolToggle}
          />
        );
      case 'settings':
        return (
          <SettingsPanel 
            selectedNodeId={selectedNodeId}
            configuration={configuration}
            onAgentUpdate={handleAgentUpdate}
            onSettingsUpdate={handleSettingsUpdate}
            onTopicUpdate={handleTopicUpdate}
            onMaxIterationsUpdate={handleMaxIterationsUpdate}
            onRemoveAgent={handleRemoveAgent}
            onClose={() => setSelectedNodeId(null)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-[64px_320px_1fr] h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Left Sidebar */}
      <Sidebar
        activeOption={activeOption}
        onOptionChange={handleSidebarOptionChange}
      />

      {/* Middle Panel */}
      <div className="hidden md:flex md:flex-col md:min-h-0 md:overflow-hidden">
        {renderMiddlePanel()}
      </div>

      {/* Main Canvas */}
      <Canvas
        nodes={nodes}
        selectedNodeId={highlightedNodeId}
        onNodeMove={handleNodeMove}
        onNodeClick={handleNodeClick}
        onCanvasClick={handleCanvasClick}
        onSave={handleSave}
        onRun={handleRun}
        canSave={canSave}
        isRunning={isRunning}
      />
    </div>
  );
}

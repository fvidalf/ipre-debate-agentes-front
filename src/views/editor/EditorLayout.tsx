'use client';

import { Sidebar, Canvas, ToolsPanel, AgentsPanel, SettingsPanel, DragOverlay } from './components';
import { useDebateApp } from '@/hooks/useDebateApp';
import { DragDropProvider, useDragDrop } from '@/hooks/useDragDrop';

interface EditorLayoutProps {
  configId?: string;
}

export default function EditorLayout({ configId }: EditorLayoutProps) {
  const {
    activeOption,
    setActiveOption,
    nodes,
    agents,
    isRunning,
    isSaving,
    selectedNodeId,
    highlightedNodeId,
    configuration,
    availableModels,
    defaultModel,
    modelsLoading,
    configLoading,
    configLoadError,
    handleNodeMove,
    handleNodeClick,
    handleCanvasClick,
    handleNameUpdate,
    handleDescriptionUpdate,
    handleAgentUpdate,
    handleSettingsUpdate,
    handleTopicUpdate,
    handleMaxIterationsUpdate,
    handleMaxInterventionsPerAgentUpdate,
    handleRemoveAgent,
    handleToolToggle,
    handleToolDrop,
    handleRemoveTool,
    handleAgentSelect,
    handleCreateAgent,
    handleSelectPrebuiltAgent,
    handleSave,
    handleRun,
    canSave,
    setSelectedNodeId,
    availableTools,
    toolsLoading,
    toolsError,
  } = useDebateApp(configId);

  // Show loading state when loading config
  if (configLoading) {
    return (
      <div className="h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading debate configuration...</p>
        </div>
      </div>
    );
  }

  // Show error state when config loading fails
  if (configLoadError) {
    return (
      <div className="h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-medium mb-2">Failed to load debate configuration</h3>
            <p className="text-red-600 text-sm mb-4">{configLoadError}</p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try again
              </button>
              <a
                href="/my-debates"
                className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Back to My Debates
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            onToolToggle={handleToolToggle}
          />
        );
      case 'settings':
        return (
          <SettingsPanel 
            selectedNodeId={selectedNodeId}
            nodes={nodes}
            configuration={configuration}
            availableModels={availableModels}
            defaultModel={defaultModel}
            modelsLoading={modelsLoading}
            availableTools={availableTools}
            toolsLoading={toolsLoading}
            toolsError={toolsError}
            onAgentUpdate={handleAgentUpdate}
            onNameUpdate={handleNameUpdate}
            onDescriptionUpdate={handleDescriptionUpdate}
            onSettingsUpdate={handleSettingsUpdate}
            onTopicUpdate={handleTopicUpdate}
            onMaxIterationsUpdate={handleMaxIterationsUpdate}
            onMaxInterventionsPerAgentUpdate={handleMaxInterventionsPerAgentUpdate}
            onRemoveAgent={handleRemoveAgent}
            onRemoveTool={handleRemoveTool}
            onClose={() => setSelectedNodeId(null)}
          />
        );
      case 'back':
        // This case shouldn't be reached since back navigates away,
        // but including it for completeness
        return null;
      default:
        return null;
    }
  };

  return (
    <DragDropProvider>
      <div className="grid grid-cols-[64px_320px_1fr] h-screen bg-[#f3f3f3] text-neutral-900 font-sans">
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
          onToolDrop={handleToolDrop}
          canSave={canSave}
          isRunning={isRunning}
          isSaving={isSaving}
        />
      </div>
      <DragOverlay />
    </DragDropProvider>
  );
}

'use client';

import { Agent, EditorConfig, Node } from '@/types';
import { ModelInfo, ToolInfo } from '@/lib/api';
import BasePanel from './BasePanel';
import { AgentConfigurationForm, GeneralSettingsForm } from './forms';
import { ToolConfigurationRouter } from './tool-configs';

interface SettingsPanelProps {
  selectedNodeId: string | null;
  nodes: Node[];
  configuration: EditorConfig;
  availableModels: ModelInfo[];
  defaultModel: string;
  modelsLoading: boolean;
  availableTools: ToolInfo[];
  toolsLoading: boolean;
  toolsError: string | null;
  onAgentUpdate: (agentId: string, updates: Partial<Agent>) => void;
  onNameUpdate: (name: string) => void;
  onDescriptionUpdate: (description: string) => void;
  onSettingsUpdate: (updates: Partial<EditorConfig['settings']>) => void;
  onTopicUpdate: (topic: string) => void;
  onMaxIterationsUpdate: (maxIterations: number) => void;
  onMaxInterventionsPerAgentUpdate: (maxInterventionsPerAgent: number | undefined) => void;
  onRemoveAgent: (agentId: string) => void;
  onRemoveTool: (agentId: string, toolId: string) => void;
  onClose: () => void;
}

export default function SettingsPanel({ 
  selectedNodeId,
  nodes,
  configuration,
  availableModels,
  defaultModel,
  modelsLoading,
  availableTools,
  toolsLoading,
  toolsError,
  onAgentUpdate,
  onNameUpdate,
  onDescriptionUpdate,
  onSettingsUpdate,
  onTopicUpdate,
  onMaxIterationsUpdate,
  onMaxInterventionsPerAgentUpdate,
  onRemoveAgent,
  onRemoveTool,
  onClose
}: SettingsPanelProps) {
  
  const selectedAgent = selectedNodeId ? 
    configuration.agents.find(a => a.nodeId === selectedNodeId) : null;
    
  const selectedNode = selectedNodeId ? 
    nodes.find(n => n.id === selectedNodeId) : null;
    
  const selectedTool = selectedNode?.type === 'tool' ? selectedNode : null;

  if (selectedTool) {
    // Render tool configuration view
    const parentAgent = selectedTool.parentAgentId 
      ? configuration.agents.find(a => a.nodeId === selectedTool.parentAgentId)
      : null;
    
    const toolInfo = availableTools.find((t: ToolInfo) => t.id === selectedTool.toolId);
    
    const isRecallTool = ['notes_tool', 'documents_tool'].includes(selectedTool.toolId || '');
    const currentToolConfig = isRecallTool
      ? parentAgent?.recall_tools?.[selectedTool.toolId as keyof typeof parentAgent.recall_tools]
      : parentAgent?.web_search_tools?.[selectedTool.toolId as keyof typeof parentAgent.web_search_tools];
    
    const handleToolUpdate = (updates: any) => {
      if (!parentAgent || !selectedTool.toolId) return;
      
      if (isRecallTool) {
        const updatedTools = {
          ...parentAgent.recall_tools,
          [selectedTool.toolId]: {
            ...currentToolConfig,
            ...updates
          }
        };
        
        onAgentUpdate(parentAgent.id, {
          recall_tools: updatedTools
        });
      } else {
        const updatedTools = {
          ...parentAgent.web_search_tools,
          [selectedTool.toolId]: {
            ...currentToolConfig,
            ...updates
          }
        };
        
        onAgentUpdate(parentAgent.id, {
          web_search_tools: updatedTools
        });
      }
    };

    return (
      <BasePanel title={`Configure ${selectedTool.name || selectedTool.toolId}`}>
        <div className="h-full flex flex-col">
          {/* Back button */}
          <div className="flex-shrink-0 mb-4">
            <button 
              onClick={onClose} 
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
            >
              ← Back to general settings
            </button>
          </div>

          {/* Tool name and agent context */}
          <div className="flex-shrink-0 mb-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-1">
              {toolInfo?.name} Tool
            </h3>
            <p className="text-sm text-gray-600">
              Configuring for {parentAgent?.name}
            </p>
          </div>

          {/* Scrollable configuration content */}
          <div className="flex-1 overflow-y-auto">
            {parentAgent && toolInfo && (
              <ToolConfigurationRouter
                toolId={selectedTool.toolId}
                toolInfo={toolInfo}
                parentAgent={parentAgent as any}
                currentToolConfig={currentToolConfig}
                onEnabledToggle={(enabled) => handleToolUpdate({ enabled })}
                onSourcesUpdate={(sources) => handleToolUpdate({ sources })}
                onDocumentsUpdate={(docIds) => onAgentUpdate(parentAgent.id, { document_ids: docIds })}
                onToolUpdate={handleToolUpdate}
              />
            )}
          </div>

          {/* Remove tool button */}
          <div className="flex-shrink-0 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                if (parentAgent && selectedTool.toolId && window.confirm(`Are you sure you want to remove the ${toolInfo?.name} tool from ${parentAgent.name}?`)) {
                  onRemoveTool(parentAgent.id, selectedTool.toolId);
                  onClose();
                }
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Remove Tool
            </button>
          </div>
        </div>
      </BasePanel>
    );
  }

  if (selectedAgent) {
    // Render agent configuration view
    return (
      <BasePanel title={`Configure ${selectedAgent.name}`}>
        <AgentConfigurationForm 
          agent={selectedAgent}
          availableModels={availableModels}
          defaultModel={defaultModel}
          modelsLoading={modelsLoading}
          onUpdate={onAgentUpdate}
          onRemove={onRemoveAgent}
          onClose={onClose}
        />
      </BasePanel>
    );
  }

  // Render general settings view
  return (
    <BasePanel title="Settings">
      <GeneralSettingsForm 
        configuration={configuration}
        onNameUpdate={onNameUpdate}
        onDescriptionUpdate={onDescriptionUpdate}
        onSettingsUpdate={onSettingsUpdate}
        onTopicUpdate={onTopicUpdate}
        onMaxIterationsUpdate={onMaxIterationsUpdate}
        onMaxInterventionsPerAgentUpdate={onMaxInterventionsPerAgentUpdate}
      />
    </BasePanel>
  );
}

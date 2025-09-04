'use client';

import { Agent, DebateConfiguration } from '@/types';
import { ModelInfo } from '@/lib/api';
import BasePanel from './BasePanel';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

interface SettingsPanelProps {
  selectedNodeId: string | null;
  configuration: DebateConfiguration;
  availableModels: ModelInfo[];
  defaultModel: string;
  modelsLoading: boolean;
  onAgentUpdate: (agentId: string, updates: Partial<Agent>) => void;
  onSettingsUpdate: (updates: Partial<DebateConfiguration['settings']>) => void;
  onTopicUpdate: (topic: string) => void;
  onMaxIterationsUpdate: (maxIterations: number) => void;
  onRemoveAgent: (agentId: string) => void;
  onClose: () => void;
}

export default function SettingsPanel({ 
  selectedNodeId,
  configuration,
  availableModels,
  defaultModel,
  modelsLoading,
  onAgentUpdate,
  onSettingsUpdate,
  onTopicUpdate,
  onMaxIterationsUpdate,
  onRemoveAgent,
  onClose
}: SettingsPanelProps) {
  
  const selectedAgent = selectedNodeId ? 
    configuration.agents.find(a => a.nodeId === selectedNodeId) : null;

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
        onSettingsUpdate={onSettingsUpdate}
        onTopicUpdate={onTopicUpdate}
        onMaxIterationsUpdate={onMaxIterationsUpdate}
      />
    </BasePanel>
  );
}

function AgentConfigurationForm({ agent, availableModels, defaultModel, modelsLoading, onUpdate, onRemove, onClose }: {
  agent: Agent;
  availableModels: ModelInfo[];
  defaultModel: string;
  modelsLoading: boolean;
  onUpdate: (agentId: string, updates: Partial<Agent>) => void;
  onRemove: (agentId: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      {/* Back button - fixed at top */}
      <div className="flex-shrink-0 mb-4">
        <button 
          onClick={onClose} 
          className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
        >
          ← Back to general settings
        </button>
      </div>

      {/* Scrollable form content */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
        {/* Agent name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Agent Name
          </label>
          <Input
            value={agent.name}
            onChange={(e) => onUpdate(agent.id, { name: e.target.value })}
            placeholder="Enter agent name"
          />
        </div>

        {/* AI Model selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Model
          </label>
          {modelsLoading ? (
            <div className="text-sm text-gray-500 italic">Loading models...</div>
          ) : (
            <select
              value={agent.model_id || ''}
              onChange={(e) => onUpdate(agent.id, { model_id: e.target.value || undefined })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Use Default ({defaultModel})</option>
              {availableModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
          )}
          {!modelsLoading && availableModels.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {agent.model_id 
                ? availableModels.find(m => m.id === agent.model_id)?.description 
                : `Using default model: ${defaultModel}`
              }
            </p>
          )}
        </div>
        
        {/* Personality prompt - main configuration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personality Prompt
          </label>
          <Textarea
            value={agent.personality}
            onChange={(e) => onUpdate(agent.id, { personality: e.target.value })}
            placeholder="Describe this agent's personality, beliefs, and debate style..."
            rows={8}
            className="w-full"
          />
        </div>
        
        {/* Bias slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bias: {agent.bias?.toFixed(2) || '0.00'}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={agent.bias || 0}
            onChange={(e) => onUpdate(agent.id, { bias: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
        
        {/* Enable/disable toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Enabled for simulation
          </label>
          <input
            type="checkbox"
            checked={agent.enabled}
            onChange={(e) => onUpdate(agent.id, { enabled: e.target.checked })}
            className="w-4 h-4"
          />
        </div>
        
        {/* Remove agent button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to remove ${agent.name}?`)) {
                onRemove(agent.id);
              }
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Remove Agent
          </button>
        </div>
      </div>
    </div>
  );
}

function GeneralSettingsForm({ configuration, onSettingsUpdate, onTopicUpdate, onMaxIterationsUpdate }: {
  configuration: DebateConfiguration;
  onSettingsUpdate: (updates: Partial<DebateConfiguration['settings']>) => void;
  onTopicUpdate: (topic: string) => void;
  onMaxIterationsUpdate: (maxIterations: number) => void;
}) {
  const handleMaxIterationsChange = (value: number) => {
    onMaxIterationsUpdate(value);
  };

  return (
    <div className="h-full overflow-y-auto space-y-6 pr-2">
      
      {/* Topic */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-neutral-800">Topic</h3>
        <div>
          <label className="block text-sm text-neutral-600 mb-1">Debate Topic</label>
          <Textarea
            value={configuration.topic}
            onChange={(e) => onTopicUpdate(e.target.value)}
            placeholder="Enter the topic for debate..."
            rows={3}
            className="w-full"
          />
        </div>
      </div>

      {/* Simulation Settings */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-neutral-800">Simulation</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-neutral-600">Max rounds</label>
            <input 
              type="number" 
              value={configuration.maxIterations}
              onChange={(e) => handleMaxIterationsChange(parseInt(e.target.value) || 21)}
              className="w-16 px-2 py-1 border border-neutral-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-neutral-600">Response timeout (s)</label>
            <input 
              type="number" 
              value={configuration.settings.timeout}
              onChange={(e) => onSettingsUpdate({ timeout: parseInt(e.target.value) || 30 })}
              className="w-16 px-2 py-1 border border-neutral-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Export/Import */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-neutral-800">Data</h3>
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50">
            Export Config
          </button>
          <button className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-neutral-50">
            Import Config
          </button>
        </div>
      </div>

    </div>
  );
}

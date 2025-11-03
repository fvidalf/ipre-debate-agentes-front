'use client';

import { EditorConfig } from '@/types';
import Textarea from '@/components/ui/Textarea';

interface GeneralSettingsFormProps {
  configuration: EditorConfig;
  onNameUpdate: (name: string) => void;
  onDescriptionUpdate: (description: string) => void;
  onSettingsUpdate: (updates: Partial<EditorConfig['settings']>) => void;
  onTopicUpdate: (topic: string) => void;
  onMaxIterationsUpdate: (maxIterations: number) => void;
  onMaxInterventionsPerAgentUpdate: (maxInterventionsPerAgent: number | undefined) => void;
}

export default function GeneralSettingsForm({
  configuration,
  onNameUpdate,
  onDescriptionUpdate,
  onSettingsUpdate,
  onTopicUpdate,
  onMaxIterationsUpdate,
  onMaxInterventionsPerAgentUpdate,
}: GeneralSettingsFormProps) {
  const handleMaxIterationsChange = (value: number) => {
    onMaxIterationsUpdate(value);
  };

  const handleMaxInterventionsPerAgentChange = (value: number | undefined) => {
    onMaxInterventionsPerAgentUpdate(value);
  };

  return (
    <div className="h-full overflow-y-auto space-y-6 pr-2">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-neutral-800">Debate Settings</h3>
        <div className="space-y-4">
          <label className="block text-sm text-neutral-600 mb-1">Debate Name</label>
          <Textarea
            value={configuration.name}
            onChange={(e) => onNameUpdate(e.target.value)}
            placeholder="Enter a name for this debate..."
            rows={3}
            className="w-full"
          />

          <label className="block text-sm text-neutral-600 mb-1">
            Debate Description
          </label>
          <Textarea
            value={configuration.description}
            onChange={(e) => onDescriptionUpdate(e.target.value)}
            placeholder="Enter a description for this debate..."
            rows={3}
            className="w-full"
          />
        </div>
      </div>

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
              onChange={(e) =>
                handleMaxIterationsChange(parseInt(e.target.value) || 21)
              }
              className="w-16 px-2 py-1 border border-neutral-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-neutral-600">
              Max interventions per agent
            </label>
            <input
              type="number"
              value={configuration.maxInterventionsPerAgent || ''}
              placeholder="Auto"
              onChange={(e) => {
                const value = parseInt(e.target.value);
                handleMaxInterventionsPerAgentChange(
                  isNaN(value) ? undefined : value
                );
              }}
              className="w-16 px-2 py-1 border border-neutral-300 rounded text-sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-neutral-600">
              Response timeout (s)
            </label>
            <input
              type="number"
              value={configuration.settings.timeout}
              onChange={(e) =>
                onSettingsUpdate({ timeout: parseInt(e.target.value) || 30 })
              }
              className="w-16 px-2 py-1 border border-neutral-300 rounded text-sm"
            />
          </div>
        </div>
      </div>

      {/* Export/Import */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-neutral-800">Data</h3>
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-[#f3f3f3]">
            Export Config
          </button>
          <button className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm hover:bg-[#f3f3f3]">
            Import Config
          </button>
        </div>
      </div>
    </div>
  );
}

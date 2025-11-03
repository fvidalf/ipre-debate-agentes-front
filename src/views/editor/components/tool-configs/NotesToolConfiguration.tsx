'use client';

import { Agent, ToolInfo } from '@/lib/api';
import SourcesInput from '@/components/ui/SourcesInput';

interface NotesToolConfigurationProps {
  currentToolConfig: any;
  onEnabledToggle: (enabled: boolean) => void;
  toolInfo: ToolInfo;
}

export default function NotesToolConfiguration({
  currentToolConfig,
  onEnabledToggle,
  toolInfo,
}: NotesToolConfigurationProps) {
  return (
    <div className="space-y-6">
      {/* Enable/Disable toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Enable {toolInfo.name}
        </label>
        <input
          type="checkbox"
          checked={currentToolConfig?.enabled || false}
          onChange={(e) => onEnabledToggle(e.target.checked)}
          className="w-4 h-4"
        />
      </div>

      {/* Tool description */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">{toolInfo.description}</p>
        <p className="text-xs text-gray-500 mt-2">
          This tool allows agents to recall information from their own debate
          interventions and tool usage history.
        </p>
      </div>
    </div>
  );
}

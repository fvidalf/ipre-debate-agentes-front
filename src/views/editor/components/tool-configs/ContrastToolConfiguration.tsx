'use client';

import { ToolInfo } from '@/lib/api';

interface ContrastToolConfigurationProps {
  currentToolConfig: any;
  onEnabledToggle: (enabled: boolean) => void;
  toolInfo: ToolInfo;
}

export default function ContrastToolConfiguration({
  currentToolConfig,
  onEnabledToggle,
  toolInfo,
}: ContrastToolConfigurationProps) {
  return (
    <div className="space-y-6">
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

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">{toolInfo.description}</p>
        <p className="text-xs text-gray-500 mt-2">
          This tool contrasts agent viewpoints to strengthen their arguments.
        </p>
      </div>
    </div>
  );
}

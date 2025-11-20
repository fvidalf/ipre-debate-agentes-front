'use client';

import { ToolInfo } from '@/lib/api';

interface FactCheckToolConfigurationProps {
  currentToolConfig: any;
  onEnabledToggle: (enabled: boolean) => void;
  toolInfo: ToolInfo;
  canEnable: boolean;
}

export default function FactCheckToolConfiguration({
  currentToolConfig,
  onEnabledToggle,
  toolInfo,
  canEnable,
}: FactCheckToolConfigurationProps) {
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
          disabled={!canEnable}
          className="w-4 h-4"
        />
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">{toolInfo.description}</p>
        <p className="text-xs text-gray-500 mt-2">
          This meta-tool orchestrates available web search and recall tools to verify claims.
        </p>
        {!canEnable && (
          <p className="text-xs text-red-500 mt-2">
            Enable at least one Web Search or Recall tool to use fact-checking.
          </p>
        )}
      </div>
    </div>
  );
}

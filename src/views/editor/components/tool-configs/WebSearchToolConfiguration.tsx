'use client';

import { ToolInfo } from '@/lib/api';
import SourcesInput from '@/components/ui/SourcesInput';

interface WebSearchToolConfigurationProps {
  toolId: string | undefined;
  currentToolConfig: any;
  onEnabledToggle: (enabled: boolean) => void;
  onSourcesUpdate: (sources: string[]) => void;
  toolInfo: ToolInfo;
}

export default function WebSearchToolConfiguration({
  toolId,
  currentToolConfig,
  onEnabledToggle,
  onSourcesUpdate,
  toolInfo,
}: WebSearchToolConfigurationProps) {
  const schema = toolInfo.config_schema;
  const supportsSourcesConfig =
    schema.sources && (toolId === 'news_tool' || toolId === 'pages_tool');

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

      {/* Sources configuration (only for tools that support it) */}
      {supportsSourcesConfig && schema.sources && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {schema.sources.description || 'Sources'}
          </label>
          <SourcesInput
            sources={(currentToolConfig as any)?.sources || []}
            onSourcesChange={onSourcesUpdate}
            placeholder={
              toolId === 'news_tool'
                ? 'Enter news domain (e.g., bbc.com, reuters.com)'
                : 'Enter web domain (e.g., github.com, arxiv.org)'
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            {toolId === 'news_tool'
              ? 'Specify news source domains to search within'
              : 'Specify web page domains to search within'}
          </p>
        </div>
      )}

      {/* Tool description and additional info */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600 mb-2">{toolInfo.description}</p>
        {(toolId === 'wikipedia_tool' || toolId === 'google_ai_tool') && (
          <p className="text-xs text-gray-500">
            {toolId === 'wikipedia_tool'
              ? 'This tool searches all of Wikipedia automatically.'
              : 'This tool provides AI-enhanced search results from Google.'}
          </p>
        )}
      </div>
    </div>
  );
}

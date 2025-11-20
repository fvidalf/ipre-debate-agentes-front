'use client';

import { Agent, ToolInfo } from '@/lib/api';
import WebSearchToolConfiguration from './WebSearchToolConfiguration';
import NotesToolConfiguration from './NotesToolConfiguration';
import DocumentsToolConfiguration from './DocumentsToolConfiguration';
import FactCheckToolConfiguration from './FactCheckToolConfiguration';
import ContrastToolConfiguration from './ContrastToolConfiguration';
import SynthesisToolConfiguration from './SynthesisToolConfiguration';
import { agentHasSupportingTools } from '@/lib/toolUtils';

interface ToolConfigurationRouterProps {
  toolId: string | undefined;
  toolInfo: ToolInfo | undefined;
  parentAgent: Agent | null;
  currentToolConfig: any;
  onEnabledToggle: (enabled: boolean) => void;
  onSourcesUpdate?: (sources: string[]) => void;
  onDocumentsUpdate?: (docIds: string[]) => void;
  onToolUpdate: (updates: any) => void;
}

export default function ToolConfigurationRouter({
  toolId,
  toolInfo,
  parentAgent,
  currentToolConfig,
  onEnabledToggle,
  onSourcesUpdate,
  onDocumentsUpdate,
  onToolUpdate,
}: ToolConfigurationRouterProps) {
  if (!toolInfo) {
    return (
      <div className="text-sm text-gray-500">Tool information not found</div>
    );
  }

  // Recall tools
  if (toolId === 'notes_tool') {
    return (
      <NotesToolConfiguration
        currentToolConfig={currentToolConfig}
        onEnabledToggle={onEnabledToggle}
        toolInfo={toolInfo}
      />
    );
  }

  if (toolId === 'documents_tool') {
    return (
      <DocumentsToolConfiguration
        parentAgent={parentAgent}
        currentToolConfig={currentToolConfig}
        onEnabledToggle={onEnabledToggle}
        onDocumentsUpdate={(docIds) => onDocumentsUpdate?.(docIds)}
        toolInfo={toolInfo}
      />
    );
  }

  if (toolId === 'fact_check_tool') {
    const canEnableFactCheck = agentHasSupportingTools(parentAgent);
    return (
      <FactCheckToolConfiguration
        currentToolConfig={currentToolConfig}
        onEnabledToggle={onEnabledToggle}
        toolInfo={toolInfo}
        canEnable={canEnableFactCheck}
      />
    );
  }

  if (toolId === 'contrast_tool') {
    return (
      <ContrastToolConfiguration
        currentToolConfig={currentToolConfig}
        onEnabledToggle={onEnabledToggle}
        toolInfo={toolInfo}
      />
    );
  }

  if (toolId === 'synthesis_tool') {
    return (
      <SynthesisToolConfiguration
        currentToolConfig={currentToolConfig}
        onEnabledToggle={onEnabledToggle}
        toolInfo={toolInfo}
      />
    );
  }

  // Web search tools
  if (
    toolId === 'wikipedia_tool' ||
    toolId === 'news_tool' ||
    toolId === 'pages_tool' ||
    toolId === 'google_ai_tool'
  ) {
    return (
      <WebSearchToolConfiguration
        toolId={toolId}
        currentToolConfig={currentToolConfig}
        onEnabledToggle={onEnabledToggle}
        onSourcesUpdate={(sources) => onSourcesUpdate?.(sources)}
        toolInfo={toolInfo}
      />
    );
  }

  return (
    <div className="text-sm text-gray-500">Unknown tool type: {toolId}</div>
  );
}

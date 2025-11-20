import type { Agent, WebSearchToolsConfig, RecallToolsConfig, FactCheckToolsConfig, ContrastToolsConfig } from '@/types';

type ToolGroup =
  | Partial<Record<string, { enabled?: boolean } | null | undefined>>
  | WebSearchToolsConfig
  | RecallToolsConfig
  | FactCheckToolsConfig
  | ContrastToolsConfig
  | undefined
  | null;

export function hasEnabledToolGroup(group?: ToolGroup): boolean {
  if (!group) return false;
  return Object.values(group as Record<string, { enabled?: boolean } | null | undefined>).some(
    (toolConfig) => Boolean(toolConfig && toolConfig.enabled)
  );
}

type Overrides = {
  web?: ToolGroup;
  recall?: ToolGroup;
};

export function agentHasSupportingTools(agent?: Agent | null, overrides?: Overrides): boolean {
  if (!agent) return false;
  const webGroup = overrides?.web ?? agent.web_search_tools;
  const recallGroup = overrides?.recall ?? agent.recall_tools;
  return hasEnabledToolGroup(webGroup) || hasEnabledToolGroup(recallGroup);
}

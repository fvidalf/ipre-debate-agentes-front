'use client';

import { Agent } from '@/types';
import BasePanel from './BasePanel';
import Button from '@/components/ui/Button';
import { User, Loader } from 'lucide-react';
import { useAgentTemplates } from '@/hooks/useAgentTemplates';
import { getTemplateColor } from '@/lib/agentUtils';

interface AgentsPanelProps {
  agents: Agent[];
  onAgentSelect?: (agentId: string) => void;
  onCreateAgent?: () => void;
  onSelectPrebuiltAgent?: (templateId: string) => void;
}

const TEMPLATE_FETCH_PARAMS = { limit: 20 } as const;

export default function AgentsPanel({ 
  agents, 
  onAgentSelect, 
  onCreateAgent,
  onSelectPrebuiltAgent 
}: AgentsPanelProps) {
  const { templates, isLoading, error } = useAgentTemplates(TEMPLATE_FETCH_PARAMS);

  return (
    <BasePanel title="Agents">
      <div className="space-y-4 h-screen max-h-screen overflow-y-auto flex flex-col">
        
        <Button
          onClick={onCreateAgent}
          variant="primary"
          size="lg"
          className="h-14 w-full justify-start text-left bg-purple-600 text-white hover:bg-purple-700 border-purple-600 shadow-lg flex-shrink-0"
        >
          <span className="text-xl">+</span>
          Create a new agent
        </Button>

        {/* Pre-built Agents Section */}
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-neutral-700 mb-3 flex-shrink-0">
            Pre-built agents
          </h3>
          
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-neutral-500" />
              <span className="ml-2 text-sm text-neutral-500">Loading templates...</span>
            </div>
          )}

          {error && (
            <div className="p-3 border border-red-200 rounded-xl bg-red-50">
              <p className="text-sm text-red-600">
                Failed to load templates: {error}
              </p>
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-2">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onSelectPrebuiltAgent?.(template.id)}
                  className="w-full p-3 border border-neutral-200 rounded-xl bg-white hover:bg-[#f3f3f3] hover:shadow-sm transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: getTemplateColor(template.id) }}
                    >
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-900">{template.name}</div>
                      <div className="text-xs text-neutral-600 mt-0.5 line-clamp-2">
                        {template.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              {templates.length === 0 && !isLoading && (
                <p className="text-sm text-neutral-500 text-center py-4">
                  No templates available
                </p>
              )}
            </div>
          )}
        </div>

        {/* Current Agents */}
        {agents.length > 0 && (
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-neutral-700 mb-3 flex-shrink-0">
              Current agents
            </h3>
            
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-3 border border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => onAgentSelect?.(agent.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900">{agent.name}</h4>
                      {agent.personality && (
                        <p className="text-xs text-neutral-600 mt-0.5 line-clamp-1">
                          {agent.personality}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BasePanel>
  );
}

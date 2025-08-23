'use client';

import { Agent } from '@/types';
import BasePanel from './BasePanel';
import Button from '@/components/ui/Button';
import { User } from 'lucide-react';

interface AgentsPanelProps {
  agents: Agent[];
  onAgentSelect?: (agentId: string) => void;
  onCreateAgent?: () => void;
  onSelectPrebuiltAgent?: (templateId: string) => void;
}

// Pre-built agent templates with descriptions
const prebuiltAgents = [
  {
    id: 'javier-a',
    name: 'Javier A.',
    description: 'Conservative economist focused on free market principles',
    color: '#DC2626'
  },
  {
    id: 'maria-b',
    name: 'Maria B.',
    description: 'Progressive activist advocating for social justice',
    color: '#059669'
  },
  {
    id: 'victor-c',
    name: 'Victor C.',
    description: 'Pragmatic technologist with evidence-based approach',
    color: '#2563EB'
  },
  {
    id: 'ana-d',
    name: 'Ana D.',
    description: 'Academic researcher with scientific rigor',
    color: '#7C3AED'
  },
  {
    id: 'carlos-e',
    name: 'Carlos E.',
    description: 'Creative entrepreneur focused on innovation',
    color: '#EA580C'
  },
];

export default function AgentsPanel({ 
  agents, 
  onAgentSelect, 
  onCreateAgent,
  onSelectPrebuiltAgent 
}: AgentsPanelProps) {
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
          
          <div className="space-y-2">
            {prebuiltAgents.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectPrebuiltAgent?.(template.id)}
                className="w-full p-3 border border-neutral-200 rounded-xl bg-white hover:bg-neutral-50 hover:shadow-sm transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: template.color }}
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
          </div>
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

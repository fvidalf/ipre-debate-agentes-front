'use client';

import { Tool } from '@/types';
import { Card } from '@/components/ui';
import { cn } from '@/lib/cn';
import BasePanel from './BasePanel';

interface ToolsPanelProps {
  tools: Tool[];
  onToolToggle?: (toolId: string) => void;
}

export default function ToolsPanel({ tools, onToolToggle }: ToolsPanelProps) {
  return (
    <BasePanel title="Tools">
      <ul className="space-y-3">
        {tools.map((tool) => (
          <ToolItem
            key={tool.id}
            tool={tool}
            onToggle={onToolToggle}
          />
        ))}
      </ul>
    </BasePanel>
  );
}

interface ToolItemProps {
  tool: Tool;
  onToggle?: (toolId: string) => void;
}

function ToolItem({ tool, onToggle }: ToolItemProps) {
  return (
    <Card
      variant="interactive"
      padding="sm"
      className={cn(
        "grid grid-cols-[48px_1fr] items-center gap-3.5 cursor-pointer transition-all duration-150",
        "hover:shadow-lg hover:-translate-y-0.5"
      )}
      onClick={() => onToggle?.(tool.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onToggle?.(tool.id);
        }
      }}
    >
      <div
        className="w-12 h-12 border border-dashed border-neutral-300 rounded-xl flex items-center justify-center text-xl bg-white"
        aria-hidden
      >
        {tool.icon}
      </div>
      <div>
        <p className="font-semibold text-neutral-900 m-0">{tool.title}</p>
        <p className="text-sm text-neutral-600 mt-1 m-0 leading-relaxed">
          {tool.subtitle}
        </p>
      </div>
    </Card>
  );
}

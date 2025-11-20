'use client';

import { ToolInfo } from '@/lib/api';
import { useTools } from '@/hooks/useTools';
import { useDragDrop } from '@/hooks/useDragDrop';
import { getToolIconComponent } from '@/lib/agentUtils';
import BasePanel from './BasePanel';
import { Loader } from 'lucide-react';

interface ToolsPanelProps {
  onToolToggle?: (toolId: string) => void;
}

export default function ToolsPanel({ onToolToggle }: ToolsPanelProps) {
  const { webSearchTools, recallTools, factCheckTools, contrastTools, synthesisTools, isLoading, error } = useTools();

  return (
    <BasePanel title="Tools">
      <div className="space-y-4 h-screen max-h-screen overflow-y-auto flex flex-col">
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-neutral-500" />
            <span className="ml-2 text-sm text-neutral-500">Loading tools...</span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="p-3 border border-red-200 rounded-xl bg-red-50">
            <p className="text-sm text-red-600">
              Failed to load tools: {error}
            </p>
          </div>
        )}

        {/* Tools list */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {/* Web Search Tools */}
            {webSearchTools.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">
                  Web Search Tools
                </h3>
                <div className="space-y-3">
                  {webSearchTools.map((tool) => (
                    <ToolItem
                      key={tool.id}
                      tool={tool}
                      onToggle={onToolToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recall Tools */}
            {recallTools.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">
                  Recall Tools
                </h3>
                <div className="space-y-3">
                  {recallTools.map((tool) => (
                    <ToolItem
                      key={tool.id}
                      tool={tool}
                      onToggle={onToolToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Fact-Check Tools */}
            {factCheckTools.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">
                  Fact-Check Tools
                </h3>
                <div className="space-y-3">
                  {factCheckTools.map((tool) => (
                    <ToolItem
                      key={tool.id}
                      tool={tool}
                      onToggle={onToolToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Contrast Tools */}
            {contrastTools.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">
                  Contrast Tools
                </h3>
                <div className="space-y-3">
                  {contrastTools.map((tool) => (
                    <ToolItem
                      key={tool.id}
                      tool={tool}
                      onToggle={onToolToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Synthesis Tools */}
            {synthesisTools.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-3">
                  Synthesis Tools
                </h3>
                <div className="space-y-3">
                  {synthesisTools.map((tool) => (
                    <ToolItem
                      key={tool.id}
                      tool={tool}
                      onToggle={onToolToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {webSearchTools.length === 0 && recallTools.length === 0 && factCheckTools.length === 0 && contrastTools.length === 0 && synthesisTools.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-4">
                No tools available
              </p>
            )}
          </div>
        )}
      </div>
    </BasePanel>
  );
}

interface ToolItemProps {
  tool: ToolInfo;
  onToggle?: (toolId: string) => void;
}

function ToolItem({ tool, onToggle }: ToolItemProps) {
  const IconComponent = getToolIconComponent(tool.icon);
  const { startDrag, dragState, endDrag } = useDragDrop();
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    startDrag(tool, {
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger toggle if not in middle of drag
    if (!dragState.isDragging) {
      onToggle?.(tool.id);
    }
  };
  
  return (
    <div
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      className={`w-full p-3 border border-neutral-200 rounded-xl bg-white hover:bg-[#f3f3f3] hover:shadow-sm transition-all cursor-pointer select-none ${
        dragState.isDragging && dragState.draggedTool?.id === tool.id 
          ? 'opacity-50' 
          : ''
      }`}
      role="button"
      tabIndex={0}
      draggable={false} // We handle drag manually
    >
      <div className="flex items-center gap-3 pointer-events-none">
        <div className="w-12 h-12 border border-dashed border-neutral-300 rounded-xl flex items-center justify-center text-xl bg-white">
          <IconComponent className="w-6 h-6 text-neutral-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-neutral-900 mb-1">{tool.name}</h4>
          <p className="text-sm text-neutral-600 leading-relaxed line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>
    </div>
  );
}

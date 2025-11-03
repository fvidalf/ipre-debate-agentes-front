'use client';

import { useDragDrop } from '@/hooks/useDragDrop';
import { getToolIconComponent } from '@/lib/agentUtils';

export default function DragOverlay() {
  const { dragState } = useDragDrop();

  if (!dragState.isDragging || !dragState.draggedTool) {
    return null;
  }

  const IconComponent = getToolIconComponent(dragState.draggedTool.icon);

  return (
    <div
      className="fixed pointer-events-none z-50 bg-white border-2 border-purple-400 rounded-xl p-2 shadow-lg"
      style={{
        left: dragState.dragPosition.x - 25,
        top: dragState.dragPosition.y - 25,
        transform: 'scale(0.8)',
      }}
    >
      <div className="w-10 h-10 flex items-center justify-center">
        <IconComponent className="w-6 h-6 text-gray-700" />
      </div>
    </div>
  );
}
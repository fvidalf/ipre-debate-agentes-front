'use client';

import CanvasRenderer from '@/components/canvas/CanvasRenderer';
import { useInteractiveCanvas } from '@/hooks/useCanvasBehavior';
import { Node } from '@/types';

interface CanvasProps {
  nodes: Node[];
  selectedNodeId?: string | null;
  onNodeMove?: (nodeId: string, x: number, y: number) => void;
  onNodeClick?: (nodeId: string) => void;
  onCanvasClick?: () => void;
  onSave?: () => void;
  onRun?: () => void;
  canSave?: boolean;
  isRunning?: boolean;
  isSaving?: boolean;
  apiConnected?: boolean | null;
}

export default function Canvas({ 
  nodes, 
  selectedNodeId,
  onNodeMove, 
  onNodeClick,
  onCanvasClick,
  onSave, 
  onRun, 
  canSave = false, 
  isRunning = false,
  isSaving = false,
  apiConnected = null 
}: CanvasProps) {
  
  // Use the interactive canvas behavior hook
  const interactiveProps = useInteractiveCanvas({
    onNodeMove,
    onNodeClick,
    onCanvasClick
  });

  // Render the action buttons overlay
  const renderOverlay = () => (
    <div className="absolute right-5 bottom-4 flex gap-3">
      {/* API Status Indicator */}
      {apiConnected !== null && (
        <div className={`
          h-11 px-3 rounded-xl border font-medium flex items-center gap-2 text-sm
          ${apiConnected 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
          }
        `}>
          <div className={`
            w-2 h-2 rounded-full
            ${apiConnected ? 'bg-green-500' : 'bg-red-500'}
          `} />
          {apiConnected ? 'API Connected' : 'API Disconnected'}
        </div>
      )}
      
      <button
        onClick={onSave}
        disabled={!canSave || isSaving}
        className={`
          h-11 px-4 rounded-xl border font-semibold transition-all flex items-center gap-2
          ${canSave && !isSaving
            ? 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50' 
            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {isSaving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
            Saving...
          </>
        ) : (
          <>
            💾 Save
          </>
        )}
      </button>
      <button
        onClick={onRun}
        disabled={isRunning || apiConnected === false}
        className={`
          h-11 px-4 rounded-xl font-semibold border transition-all flex items-center gap-2
          ${isRunning || apiConnected === false
            ? 'bg-gray-400 text-white border-gray-400 cursor-not-allowed' 
            : 'bg-purple-600 text-white border-purple-600 shadow-lg hover:bg-purple-700'
          }
        `}
      >
        {isRunning ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Running...
          </>
        ) : (
          <>
            ▶ Run simulation
          </>
        )}
      </button>
    </div>
  );

  return (
    <section className="m-5">
      <div ref={interactiveProps.canvasRef} className="h-full">
        <CanvasRenderer
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          nodeSize="large"
          variant="editor"
          showLabels={true}
          className="overflow-hidden rounded-3xl h-full"
          containerClassName='h-full'
          renderOverlay={renderOverlay}
          onNodeMouseDown={interactiveProps.onNodeMouseDown}
          onNodeClick={interactiveProps.onNodeClick}
          onCanvasClick={interactiveProps.onCanvasClick}
          onMouseMove={interactiveProps.onMouseMove}
          onMouseUp={interactiveProps.onMouseUp}
          onMouseLeave={interactiveProps.onMouseLeave}
        />
      </div>
    </section>
  );
}

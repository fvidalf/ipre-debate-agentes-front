'use client';

import CanvasRenderer from '@/components/canvas/CanvasRenderer';
import { useInteractiveCanvas } from '@/hooks/useCanvasBehavior';
import { useDragDrop } from '@/hooks/useDragDrop';
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
  onToolDrop?: (agentId: string, toolId: string) => void;
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
  apiConnected = null,
  onToolDrop
}: CanvasProps) {
  
  const { dragState, endDrag, updateDragPosition } = useDragDrop();
  
  // Use the interactive canvas behavior hook
  const interactiveProps = useInteractiveCanvas({
    onNodeMove,
    onNodeClick,
    onCanvasClick
  });

  // Handle tool drop detection
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragState.isDragging) {
      updateDragPosition({ x: e.clientX, y: e.clientY });
      // Don't allow node movement when dragging tools
      return;
    }
    interactiveProps.onMouseMove?.(e);
  };

  const handleMouseUp = () => {
    if (dragState.isDragging && dragState.draggedTool) {
      // Detect drop anywhere on mouse up
      console.log('🔧 Tool drop detected on mouse up');
      
      const canvas = interactiveProps.canvasRef?.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const canvasX = ((dragState.dragPosition.x - rect.left) / rect.width) * 100;
        const canvasY = ((dragState.dragPosition.y - rect.top) / rect.height) * 100;
        
        console.log('Drop position:', { x: canvasX, y: canvasY });
        
        // Find peer agent nodes near drop position (exclude center node)
        const agentNodes = nodes.filter(n => n.type === 'peer');
        console.log('Available peer nodes:', agentNodes.map(n => ({ id: n.id, name: n.name, x: n.x, y: n.y })));
        
        const dropTarget = agentNodes.find(node => {
          const distance = Math.sqrt(
            Math.pow(node.x - canvasX, 2) + Math.pow(node.y - canvasY, 2)
          );
          console.log(`Distance to ${node.name || node.id}:`, distance);
          return distance < 8; // 8% tolerance for drop
        });
        
        if (dropTarget && onToolDrop) {
          console.log('🎯 Tool dropped on agent:', dropTarget.name || dropTarget.id);
          onToolDrop(dropTarget.id, dragState.draggedTool.id);
        } else {
          console.log('❌ No valid drop target found');
        }
      }
      endDrag();
    } else {
      interactiveProps.onMouseUp?.();
    }
  };

  const handleMouseLeave = () => {
    if (dragState.isDragging) {
      endDrag();
    } else {
      interactiveProps.onMouseLeave?.();
    }
  };

  // Handle node mouse down - prevent when tool dragging
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (dragState.isDragging) {
      // Don't allow node dragging when tool is being dragged
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Call the original node mouse down handler
    interactiveProps.onNodeMouseDown?.(nodeId, e);
  };

  // Handle canvas click to detect drops
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (dragState.isDragging && dragState.draggedTool) {
      console.log('🔧 Canvas click during drag - drop will be handled by mouseUp');
      // Drop detection is now handled by handleMouseUp
    } else {
      interactiveProps.onCanvasClick?.(e);
    }
  };

  // Custom node renderer to add drop zone highlighting
  const renderNode = (node: Node, defaultNode: React.ReactNode) => {
    // Don't modify the DOM structure - just return the default node
    // Drop zone indicators will be rendered separately
    return defaultNode;
  };

  // Render the action buttons overlay
  const renderOverlay = () => (
    <>
      {/* Drop zone indicators - rendered as overlay without affecting node positioning */}
      {dragState.isDragging && nodes.map(node => {
        const isPeerNode = node.type === 'peer'; // Only peer nodes can accept tools
        if (!isPeerNode) return null;
        
        return (
          <div 
            key={`drop-zone-${node.id}`}
            className="absolute rounded-2xl border-4 border-dashed border-purple-400 bg-purple-50/20 pointer-events-none animate-pulse"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              width: '120px',
              height: '120px',
            }}
          />
        );
      })}
      
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
    </>
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
          renderNode={renderNode}
          onNodeMouseDown={handleNodeMouseDown}
          onNodeClick={interactiveProps.onNodeClick}
          onCanvasClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />
      </div>
    </section>
  );
}

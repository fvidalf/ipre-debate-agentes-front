'use client';

import { useState, useCallback, useRef } from 'react';
import { User, Mic } from 'lucide-react';
import { Node } from '@/types';
import { getNodeStyles } from '@/styles/patterns';

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
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    nodeId: string | null;
    startPos: { x: number; y: number };
    dragStarted: boolean;
  }>({ isDragging: false, nodeId: null, startPos: { x: 0, y: 0 }, dragStarted: false });
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDragState({
      isDragging: true,
      nodeId,
      startPos: { x: e.clientX, y: e.clientY },
      dragStarted: false
    });
  }, []);

  const handleNodeClick = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent canvas click when clicking nodes
    onNodeClick?.(nodeId);
  }, [onNodeClick]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only trigger if clicking directly on canvas, not on child elements
    if (e.target === e.currentTarget) {
      onCanvasClick?.();
    }
  }, [onCanvasClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.nodeId || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Mark as dragging if moved enough
    const distance = Math.sqrt(
      Math.pow(e.clientX - dragState.startPos.x, 2) + 
      Math.pow(e.clientY - dragState.startPos.y, 2)
    );
    
    if (distance > 5) {
      setDragState(prev => ({ ...prev, dragStarted: true }));
    }
    
    // Calculate new position as percentage
    const x = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));
    
    onNodeMove?.(dragState.nodeId, x, y);
  }, [dragState, onNodeMove]);

  const handleMouseUp = useCallback(() => {
    setDragState({ isDragging: false, nodeId: null, startPos: { x: 0, y: 0 }, dragStarted: false });
  }, []);

  const center = nodes.find(n => n.type === 'center');
  const peers = nodes.filter(n => n.type === 'peer');

  return (
    <section
      ref={canvasRef}
      className="relative overflow-hidden bg-gray-50 m-5 rounded-3xl border border-gray-300 select-none"
      style={{
        backgroundImage: `
          radial-gradient(circle at 0 0, transparent 0, transparent 8px, #e5e7eb 8px, #e5e7eb 9px, transparent 9px),
          linear-gradient(#f9fafb, #f9fafb)
        `,
        backgroundSize: '28px 28px, 100% 100%',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
    >
      {/* SVG edges */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {center && peers.map((peer) => (
          <line
            key={`edge-${peer.id}`}
            x1={center.x}
            y1={center.y}
            x2={peer.x}
            y2={peer.y}
            vectorEffect="non-scaling-stroke"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="0.6"
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <NodeComponent
          key={node.id}
          node={node}
          onMouseDown={handleMouseDown}
          onClick={handleNodeClick}
          isDragging={dragState.nodeId === node.id}
          isSelected={selectedNodeId === node.id}
        />
      ))}

      {/* Actions */}
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
    </section>
  );
}

interface NodeComponentProps {
  node: Node;
  onMouseDown: (nodeId: string, e: React.MouseEvent) => void;
  onClick: (nodeId: string, e: React.MouseEvent) => void;
  isDragging: boolean;
  isSelected: boolean;
}

function NodeComponent({ node, onMouseDown, onClick, isDragging, isSelected }: NodeComponentProps) {
  const isCenter = node.type === 'center';
  
  // Use the specialized node styling utility
  const nodeStyles = getNodeStyles(node.type, { isSelected, isDragging });
  
  return (
    <div
      className={nodeStyles}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        backgroundColor: node.color,
      }}
      onMouseDown={(e) => onMouseDown(node.id, e)}
      onClick={(e) => onClick(node.id, e)}
      aria-label={isCenter ? 'Main agent' : 'Peer agent'}
    >
      <Avatar isCenter={isCenter} />
    </div>
  );
}

function Avatar({ isCenter }: { isCenter: boolean }) {
  return (
    <div className="w-16 h-16 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-inner">
      {isCenter ? (
        <Mic className="w-8 h-8 text-gray-700" />
      ) : (
        <User className="w-8 h-8 text-gray-700" />
      )}
    </div>
  );
}

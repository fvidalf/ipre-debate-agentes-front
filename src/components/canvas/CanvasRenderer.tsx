'use client';

import { forwardRef } from 'react';
import { User, Mic } from 'lucide-react';
import { Node } from '@/types';
import { getNodeStyles, getNodeSizeInfo, getMiniNodeStyles, getInnerNodeSize } from '@/styles/patterns';

interface CanvasRendererProps {
  nodes: Node[];
  selectedNodeId?: string | null;
  
  // Visual customization
  nodeSize?: 'small' | 'medium' | 'large';
  variant?: 'mini' | 'simulation' | 'editor';
  showLabels?: boolean;
  className?: string;
  containerClassName?: string;
  
  // Behavior callbacks (optional)
  onNodeMouseDown?: (nodeId: string, e: React.MouseEvent) => void;
  onNodeClick?: (nodeId: string, e: React.MouseEvent) => void;
  onCanvasClick?: (e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  
  // Custom renderers
  renderOverlay?: () => React.ReactNode;
  renderNode?: (node: Node, defaultNode: React.ReactNode) => React.ReactNode;
  
  // SVG viewBox for different aspect ratios
  viewBox?: string;
  preserveAspectRatio?: string;
}

const CanvasRenderer = forwardRef<HTMLDivElement, CanvasRendererProps>(({
  nodes,
  selectedNodeId,
  nodeSize = 'medium',
  variant = 'editor',
  showLabels = true,
  className = '',
  containerClassName = '',
  onNodeMouseDown,
  onNodeClick,
  onCanvasClick,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  renderOverlay,
  renderNode,
  viewBox = '0 0 100 100',
  preserveAspectRatio = 'none'
}, ref) => {
  const center = nodes.find(n => n.type === 'center');
  const peers = nodes.filter(n => n.type === 'peer');

  // Get size information from patterns
  const sizeInfo = getNodeSizeInfo(nodeSize);

  return (
    <div className={containerClassName}>
      <div
        ref={ref}
        className={`relative overflow-hidden bg-gray-50 rounded-lg border border-gray-200 select-none ${className}`}
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #d1d5db 0, #d1d5db ${nodeSize === 'large' ? '1px' : nodeSize === 'medium' ? '0.8px' : '0.6px'}, transparent ${nodeSize === 'large' ? '1px' : nodeSize === 'medium' ? '0.8px' : '0.6px'}),
            linear-gradient(#f9fafb, #f9fafb)
          `,
          backgroundSize: nodeSize === 'large' ? '28px 28px, 100% 100%' : nodeSize === 'medium' ? '20px 20px, 100% 100%' : '14px 14px, 100% 100%',
        }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onClick={onCanvasClick}
      >
        {/* SVG edges */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
          viewBox={viewBox}
          preserveAspectRatio={preserveAspectRatio}
        >
          {center && peers.map((peer) => (
            <line
              key={`edge-${peer.id}`}
              x1={center.x}
              y1={center.y}
              x2={peer.x}
              y2={peer.y}
              vectorEffect="non-scaling-stroke"
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="0.8"
            />
          ))}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const defaultNode = (
            <NodeComponent
              key={node.id}
              node={node}
              sizeInfo={sizeInfo}
              nodeSize={nodeSize}
              showLabel={showLabels}
              selectedNodeId={selectedNodeId}
              variant={variant}
              onMouseDown={onNodeMouseDown}
              onClick={onNodeClick}
            />
          );
          
          return renderNode ? renderNode(node, defaultNode) : defaultNode;
        })}

        {/* Custom overlay */}
        {renderOverlay?.()}
      </div>
    </div>
  );
});

CanvasRenderer.displayName = 'CanvasRenderer';

interface NodeComponentProps {
  node: Node;
  sizeInfo: {
    center: string;
    peer: string;
    inner: { center: string; peer: string };
    icon: string;
  };
  nodeSize: 'small' | 'medium' | 'large';
  showLabel: boolean;
  selectedNodeId?: string | null;
  variant: 'mini' | 'simulation' | 'editor';
  onMouseDown?: (nodeId: string, e: React.MouseEvent) => void;
  onClick?: (nodeId: string, e: React.MouseEvent) => void;
}

function NodeComponent({ 
  node, 
  sizeInfo,
  nodeSize,
  showLabel, 
  selectedNodeId,
  variant,
  onMouseDown, 
  onClick 
}: NodeComponentProps) {
  const isCenter = node.type === 'center';
  const isSelected = selectedNodeId === node.id;
  
  // Get appropriate styles based on variant
  if (variant === 'mini') {
    const miniStyles = getMiniNodeStyles(node.type, nodeSize);
    return (
      <div
        className={miniStyles.container}
        style={{
          left: `${node.x}%`,
          top: `${node.y}%`,
        }}
        onMouseDown={onMouseDown ? (e) => onMouseDown(node.id, e) : undefined}
        onClick={onClick ? (e) => {
          e.stopPropagation();
          onClick(node.id, e);
        } : undefined}
        aria-label={isCenter ? 'Main agent' : 'Peer agent'}
      >
        <div className={`${miniStyles.inner} ${
          isCenter ? 'border-green-400 bg-green-50' : 'border-blue-400 bg-blue-50'
        }`}>
          {isCenter ? (
            <Mic className={`${miniStyles.iconSize} text-green-600`} />
          ) : (
            <User className={`${miniStyles.iconSize} text-blue-600`} />
          )}
        </div>
        
        {/* Node label */}
        {showLabel && node.name && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
            <div className="bg-white px-2 py-1 rounded border shadow-sm text-xs font-medium text-gray-700 whitespace-nowrap">
              {node.name}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // For editor and simulation variants
  const nodeClassName = getNodeStyles(node.type, { isSelected, isDragging: false }, nodeSize);
  const innerNodeSize = getInnerNodeSize(node.type, nodeSize);
  
  return (
    <div
      className={nodeClassName}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        backgroundColor: variant === 'editor' || variant === 'simulation' ? node.color : undefined,
      }}
      onMouseDown={onMouseDown ? (e) => onMouseDown(node.id, e) : undefined}
      onClick={onClick ? (e) => {
        e.stopPropagation();
        onClick(node.id, e);
      } : undefined}
      aria-label={isCenter ? 'Main agent' : 'Peer agent'}
    >
      <div className={`${innerNodeSize} rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-inner`}>
        {isCenter ? (
          <Mic className={`${sizeInfo.icon} text-gray-700`} />
        ) : (
          <User className={`${sizeInfo.icon} text-gray-700`} />
        )}
      </div>
      
      {/* Node label */}
      {showLabel && node.name && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
          <div className="bg-white px-2 py-1 rounded border shadow-sm text-xs font-medium text-gray-700 whitespace-nowrap">
            {node.name}
          </div>
        </div>
      )}
    </div>
  );
}

export default CanvasRenderer;
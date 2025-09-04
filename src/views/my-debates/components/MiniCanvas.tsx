'use client';

import { User, Mic } from 'lucide-react';
import { Config } from '@/lib/api';

interface MiniCanvasProps {
  config: Config;
  className?: string;
}

export default function MiniCanvas({ config, className = '' }: MiniCanvasProps) {
  // Generate positions for agents based on config
  const generateNodePositions = (agentCount: number) => {
    const nodes: Array<{ id: string; x: number; y: number; type: 'center' | 'peer' }> = [
      { id: 'center', x: 50, y: 50, type: 'center' }
    ];
    
    if (agentCount > 0) {
      const radius = 25; // Distance from center
      const angleStep = (2 * Math.PI) / agentCount;
      
      for (let i = 0; i < agentCount; i++) {
        const angle = i * angleStep;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        nodes.push({ 
          id: `agent-${i}`, 
          x: Math.max(15, Math.min(85, x)), 
          y: Math.max(15, Math.min(85, y)), 
          type: 'peer'
        });
      }
    }
    
    return nodes;
  };

  const nodes = generateNodePositions(config.parameters.agent_count);
  const centerNode = nodes.find(n => n.type === 'center');
  const peerNodes = nodes.filter(n => n.type === 'peer');

  return (
    <div className={`relative bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
      {/* Background pattern */}
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          backgroundImage: `
            radial-gradient(circle at 0 0, transparent 0, transparent 4px, #e5e7eb 4px, #e5e7eb 4.5px, transparent 4.5px),
            linear-gradient(#f9fafb, #f9fafb)
          `,
          backgroundSize: '14px 14px, 100% 100%',
        }}
      />
      
      {/* SVG edges */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none rounded-lg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {centerNode && peerNodes.map((peer) => (
          <line
            key={`edge-${peer.id}`}
            x1={centerNode.x}
            y1={centerNode.y}
            x2={peer.x}
            y2={peer.y}
            vectorEffect="non-scaling-stroke"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="0.8"
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
            node.type === 'center' 
              ? 'w-8 h-8' 
              : 'w-6 h-6'
          }`}
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
          }}
        >
          <div className={`w-full h-full rounded-lg bg-white border-2 flex items-center justify-center shadow-sm ${
            node.type === 'center'
              ? 'border-green-400 bg-green-50'
              : 'border-blue-400 bg-blue-50'
          }`}>
            {node.type === 'center' ? (
              <Mic className="w-3 h-3 text-green-600" />
            ) : (
              <User className="w-3 h-3 text-blue-600" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

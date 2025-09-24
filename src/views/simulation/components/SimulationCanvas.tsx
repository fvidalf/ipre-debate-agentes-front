'use client';

import { User, Mic } from 'lucide-react';
import { Config } from '@/lib/api';
import { configToCanvasNodes } from '@/lib/configUtils';

interface SimulationCanvasProps {
  config?: Config;
  configLoading?: boolean;
}

export default function SimulationCanvas({ config, configLoading }: SimulationCanvasProps) {
  if (!config) {
    return (
      <div className="h-full bg-white border-b border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-500">
            {configLoading ? 'Loading configuration...' : 'No configuration available'}
          </p>
        </div>
      </div>
    );
  }

  // Convert config to canvas nodes using the shared utility
  const nodes = configToCanvasNodes(config);
  const centerNode = nodes.find(n => n.type === 'center');
  const peerNodes = nodes.filter(n => n.type === 'peer');

  return (
    <div className="h-full bg-white border-b border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Debate Configuration</h3>
        <p className="text-sm text-gray-600">{config.name}</p>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4">
        <div className="relative h-full bg-gray-50 rounded-lg border border-gray-200">
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
                  ? 'w-12 h-12' 
                  : 'w-10 h-10'
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
                  <Mic className="w-4 h-4 text-green-600" />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
              </div>
              
              {/* Node label */}
              {node.name && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                  <div className="bg-white px-2 py-1 rounded border shadow-sm text-xs font-medium text-gray-700 whitespace-nowrap">
                    {node.name}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
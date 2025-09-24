'use client';

import CanvasRenderer from '@/components/canvas/CanvasRenderer';
import { useStaticCanvas } from '@/hooks/useCanvasBehavior';
import { Config } from '@/lib/api';
import { configToCanvasNodes } from '@/lib/configUtils';

interface SimulationCanvasProps {
  config?: Config;
  configLoading?: boolean;
}

export default function SimulationCanvas({ config, configLoading }: SimulationCanvasProps) {
  // Use static canvas behavior (no interactivity)
  const staticProps = useStaticCanvas();

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

  // Render the header overlay
  const renderOverlay = () => (
    <div className="absolute top-0 left-0 right-0 flex-shrink-0 p-4 border-b border-gray-200 bg-white rounded-t-lg">
      <h3 className="text-lg font-medium text-gray-900">Debate Configuration</h3>
      <p className="text-sm text-gray-600">{config.name}</p>
    </div>
  );

  return (
    <div className="h-full bg-white border-b border-gray-200 flex flex-col">
      <div className="flex-1 p-4">
        <CanvasRenderer
          nodes={nodes}
          nodeSize="medium"
          variant="simulation"
          showLabels={true}
          className="h-full pt-20" // Add padding-top to account for header overlay
          containerClassName="h-full"
          renderOverlay={renderOverlay}
          {...staticProps}
        />
      </div>
    </div>
  );
}
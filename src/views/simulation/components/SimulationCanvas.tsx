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
      <div className="h-full bg-[#f3f3f3] flex items-center justify-center">
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

  return (
    <div className="h-full bg-[#f3f3f3] flex flex-col">
      <div className="flex-1">
        <CanvasRenderer
          nodes={nodes}
          nodeSize="medium"
          variant="simulation"
          showLabels={true}
          className="h-full"
          containerClassName="h-full"
          {...staticProps}
        />
      </div>
    </div>
  );
}
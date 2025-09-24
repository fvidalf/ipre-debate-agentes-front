'use client';

import CanvasRenderer from '@/components/canvas/CanvasRenderer';
import { useStaticCanvas } from '@/hooks/useCanvasBehavior';
import { Config } from '@/lib/api';
import { configToCanvasNodes } from '@/lib/configUtils';

interface MiniCanvasProps {
  config: Config;
  className?: string;
}

export default function MiniCanvas({ config, className = '' }: MiniCanvasProps) {
  // Convert config to canvas nodes using the shared utility
  const nodes = configToCanvasNodes(config);
  
  // Use static canvas behavior (no interactivity)
  const staticProps = useStaticCanvas();

  return (
    <CanvasRenderer
      nodes={nodes}
      nodeSize="small"
      variant="mini"
      showLabels={false}
      className={className}
      {...staticProps}
    />
  );
}

import { Config } from '@/lib/api';
import { getActualAgentCount } from '@/lib/configUtils';
import MiniCanvas from './MiniCanvas';
import Button from '@/components/ui/Button';

interface CanvasPreviewProps {
  config: Config;
  isLoading: boolean;
  error: string | null;
  selectedRunId: string | null;
  onOpenEditor: () => void;
}

export default function CanvasPreview({ 
  config, 
  isLoading, 
  error, 
  selectedRunId,
  onOpenEditor 
}: CanvasPreviewProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-medium text-gray-900">Preview</h4>
        <div className="text-xs text-gray-500">
          {getActualAgentCount(config)} agents
          {selectedRunId && config && (
            <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
              v{config.version_number}
            </span>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="w-full aspect-[4/3] mb-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">
              {selectedRunId ? 'Loading snapshot...' : 'Loading config...'}
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="w-full aspect-[4/3] mb-4 bg-red-50 rounded-lg border border-red-200 flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-sm font-medium mb-1">
              {selectedRunId ? 'Error loading snapshot' : 'Error loading config'}
            </p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      ) : (
        <MiniCanvas 
          config={config}
          className="w-full aspect-[4/3] mb-4"
        />
      )}
      
    </div>
  );
}
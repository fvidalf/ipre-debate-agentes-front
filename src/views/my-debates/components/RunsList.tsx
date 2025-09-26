import { Eye } from 'lucide-react';
import { ConfigRun } from '@/lib/api';
import Button from '@/components/ui/Button';

interface RunsListProps {
  runs: ConfigRun[];
  runsLoading: boolean;
  selectedRunId: string | null;
  onRunSelect: (runId: string, versionNumber: number) => Promise<void>;
  onViewSimulation: (runId: string) => void;
}

export default function RunsList({ 
  runs, 
  runsLoading, 
  selectedRunId, 
  onRunSelect, 
  onViewSimulation 
}: RunsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status: ConfigRun['status']) => {
    switch (status) {
      case 'finished': return 'text-green-600 bg-green-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'stopped': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (runsLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-100 rounded-lg h-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No simulations run yet
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {runs.map((run) => (
        <div 
          key={run.simulation_id}
          className={`rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors ${
            selectedRunId === run.simulation_id 
              ? 'bg-purple-50 border-2 border-purple-200' 
              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
          }`}
          onClick={() => onRunSelect(run.simulation_id, run.config_version_when_run)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">
                Run {run.simulation_id}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(run.status)}`}>
                {run.status}
              </span>
              {!run.is_latest_version && (
                <span className="px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700">
                  v{run.config_version_when_run} (outdated)
                </span>
              )}
              {selectedRunId === run.simulation_id && (
                <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                  Selected
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(run.created_at)} 
              {run.finished_at && ` • Finished ${formatDate(run.finished_at)}`}
            </div>
          </div>
          {selectedRunId === run.simulation_id && (
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Prevent run selection when clicking the button
                onViewSimulation(run.simulation_id);
              }}
              className="bg-purple-600 text-white hover:bg-purple-700 text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" />
              See simulation
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
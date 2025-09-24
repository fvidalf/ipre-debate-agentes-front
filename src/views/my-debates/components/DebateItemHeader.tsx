import { ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
import { Config } from '@/lib/api';
import Button from '@/components/ui/Button';

interface DebateItemHeaderProps {
  config: Config;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenEditor: () => void;
}

export default function DebateItemHeader({ config, isExpanded, onToggle, onOpenEditor }: DebateItemHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {config.name}
          </h3>
          <p className="text-gray-600 text-sm mb-2">
            {config.description}
          </p>
          <p className="text-xs text-gray-500">
            Version {config.version_number} • {formatDate(config.updated_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button
            onClick={onOpenEditor}
            className="bg-purple-600 text-white hover:bg-purple-700 text-sm px-3 py-1.5"
          >
            Open in editor
          </Button>
          <button 
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
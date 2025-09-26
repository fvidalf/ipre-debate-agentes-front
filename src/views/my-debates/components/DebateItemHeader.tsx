'use client';

import { ChevronUp, ChevronDown, MoreVertical, Trash2 } from 'lucide-react';
import { Config } from '@/lib/api';
import Button from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';

interface DebateItemHeaderProps {
  config: Config;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenEditor: () => void;
  onDelete: () => Promise<void>;
}

export default function DebateItemHeader({ config, isExpanded, onToggle, onOpenEditor, onDelete }: DebateItemHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const handleDeleteClick = async () => {
    setShowDropdown(false);
    await onDelete();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                <button
                  onClick={handleDeleteClick}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
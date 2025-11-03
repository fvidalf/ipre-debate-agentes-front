'use client';

import { useState } from 'react';
import Input from './Input';

interface SourcesInputProps {
  sources: string[];
  onSourcesChange: (sources: string[]) => void;
  placeholder?: string;
}

export default function SourcesInput({
  sources,
  onSourcesChange,
  placeholder,
}: SourcesInputProps) {
  const [newSource, setNewSource] = useState('');

  const addSource = () => {
    const trimmed = newSource.trim();
    if (trimmed && !sources.includes(trimmed)) {
      onSourcesChange([...sources, trimmed]);
      setNewSource('');
    }
  };

  const removeSource = (index: number) => {
    onSourcesChange(sources.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSource();
    }
  };

  return (
    <div className="space-y-3">
      {/* Current sources */}
      {sources.length > 0 && (
        <div className="space-y-2">
          {sources.map((source, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-2 rounded"
            >
              <span className="text-sm text-gray-800">{source}</span>
              <button
                onClick={() => removeSource(index)}
                className="text-red-500 hover:text-red-700 text-sm px-2"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new source */}
      <div className="flex gap-2">
        <Input
          value={newSource}
          onChange={(e) => setNewSource(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || 'Enter domain'}
          className="flex-1"
        />
        <button
          onClick={addSource}
          disabled={!newSource.trim()}
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Agent, ToolInfo } from '@/lib/api';
import DocumentLibraryModal from '@/components/documents/DocumentLibraryModal';
import { FileText, X, BookOpen } from 'lucide-react';

interface DocumentsToolConfigurationProps {
  parentAgent: Agent | null;
  currentToolConfig: any;
  onEnabledToggle: (enabled: boolean) => void;
  onDocumentsUpdate: (docIds: string[]) => void;
  toolInfo: ToolInfo;
}

export default function DocumentsToolConfiguration({
  parentAgent,
  currentToolConfig,
  onEnabledToggle,
  onDocumentsUpdate,
  toolInfo,
}: DocumentsToolConfigurationProps) {
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);

  const assignedDocIds = parentAgent?.document_ids || [];

  return (
    <div className="space-y-6">
      {/* Enable/Disable toggle */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Enable {toolInfo.name}
        </label>
        <input
          type="checkbox"
          checked={currentToolConfig?.enabled || false}
          onChange={(e) => onEnabledToggle(e.target.checked)}
          className="w-4 h-4"
        />
      </div>

      {/* Tool description */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm text-gray-600">{toolInfo.description}</p>
      </div>

      {/* Assigned Documents List */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Assigned Documents ({assignedDocIds.length})
        </label>

        {assignedDocIds.length === 0 ? (
          <div className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-lg">
            No documents assigned yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {assignedDocIds.map((docId, index) => (
              <div
                key={docId}
                className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-lg"
              >
                <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">
                  Document ID: {docId}
                </span>
                <button
                  onClick={() => {
                    const updated = assignedDocIds.filter((_, i) => i !== index);
                    onDocumentsUpdate(updated);
                  }}
                  className="p-1 hover:bg-purple-200 rounded text-purple-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Open Document Library Button */}
      <button
        onClick={() => setLibraryModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
      >
        <BookOpen className="w-4 h-4" />
        Manage Document Library
      </button>

      {/* Document Library Modal */}
      <DocumentLibraryModal
        isOpen={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
        preselectedDocumentIds={assignedDocIds}
        onDocumentsSelected={(docIds: string[]) => {
          onDocumentsUpdate(docIds);
        }}
      />
    </div>
  );
}

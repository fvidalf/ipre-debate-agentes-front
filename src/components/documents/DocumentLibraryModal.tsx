"use client";

import { useDocuments } from '@/hooks/useDocuments';
import { Dialog } from '@headlessui/react';
import { useState } from 'react';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '../ui/shadcn-io/dropzone';
import { X, UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';

interface DocumentLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentsSelected?: (documentIds: string[]) => void;
  preselectedDocumentIds?: string[];
}

export default function DocumentLibraryModal({ isOpen, onClose, onDocumentsSelected, preselectedDocumentIds = [] }: DocumentLibraryModalProps) {
  const {
    documents,
    loading,
    error,
    uploading,
    uploadError,
    uploadProgress,
    totalCount,
    hasMore,
    uploadDocument,
    loadMore,
  } = useDocuments();

  // For assignment visuals (initialized with preselected docs)
  const [selectedIds, setSelectedIds] = useState<string[]>(preselectedDocumentIds);

  const handleSelect = (docId: string) => {
    setSelectedIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  // File upload states
  const [uploadTitle, setUploadTitle] = useState<string | undefined>(undefined);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (acceptedFiles: File[], fileRejections: any[]) => {
    // Clear previous errors
    setFileError(null);

    // Handle file rejections
    if (fileRejections.length > 0) {
      const firstError = fileRejections[0].errors[0];
      setFileError(firstError.message);
      return;
    }

    // Handle accepted files
    if (acceptedFiles && acceptedFiles[0]) {
      setUploadFile(acceptedFiles[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    try {
      await uploadDocument(
        uploadFile,
        uploadTitle || undefined,
      );
      setUploadFile(null);
      setUploadTitle(undefined);
      setFileError(null);
    } catch {}
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <Dialog.Panel className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <Dialog.Title className="text-lg font-semibold">Document Library</Dialog.Title>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
          )}

          {/* Document List */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">All Documents ({totalCount})</span>
              {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-2" />}
            </div>
            <div className="space-y-2">
              {documents.length === 0 && !loading && (
                <div className="text-gray-500 text-sm py-8 text-center">No documents found.</div>
              )}
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition group`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(doc.id)}
                    onChange={() => handleSelect(doc.id)}
                    className="accent-purple-600 w-4 h-4"
                  />
                  <div className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{doc.title}</div>
                    <div className="text-xs text-gray-500 truncate">{doc.original_filename}</div>
                    <div className="text-xs text-gray-400">{doc.document_type}</div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {Math.round(doc.file_size / 1024)} KB
                  </div>
                  <div className="text-xs">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        doc.processing_status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : doc.processing_status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {doc.processing_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {hasMore && !loading && (
              <button
                onClick={loadMore}
                className="mt-4 w-full py-2 text-sm font-medium rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Load more
              </button>
            )}
          </div>
        </div>

        {/* Upload section */}
        <form onSubmit={handleUpload} className="border-t px-6 py-4 bg-gray-50">
          {/* Dropzone */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">File *</label>
            <Dropzone
              accept={{
                'text/plain': [],
                'text/markdown': [],
                'application/pdf': [],
                'application/msword': [],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': []
              }}
              maxFiles={1}
              maxSize={1024 * 1024 * 10}
              onDrop={handleFileChange}
              src={[uploadFile].filter(Boolean) as File[]}
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>

            {/* File error notification */}
            {fileError && (
              <div className="mt-2 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700">File error</p>
                  <p className="text-xs text-red-600">{fileError}</p>
                </div>
              </div>
            )}

            {/* Upload progress */}
            {uploadProgress !== null && (
              <div className="mt-2 h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-purple-500 rounded transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Title and Submit */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full border rounded px-2 py-2 text-sm"
                placeholder="Document title (optional)"
              />
            </div>
            <button
              type="submit"
              disabled={uploading || !uploadFile}
              className="flex items-center gap-2 px-4 py-2 rounded bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <UploadCloud className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Upload error notification */}
          {uploadError && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Upload failed</p>
                <p className="text-xs text-red-600">{uploadError}</p>
              </div>
            </div>
          )}
        </form>

        {/* Action buttons */}
        {onDocumentsSelected && (
          <div className="border-t px-6 py-3 bg-gray-50 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDocumentsSelected(selectedIds);
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              Save Selection
            </button>
          </div>
        )}
      </Dialog.Panel>
    </Dialog>
  );
}

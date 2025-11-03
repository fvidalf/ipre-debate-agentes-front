'use client';

import { useState, useEffect, useCallback } from 'react';
import { debateApi, Document, DocumentUploadResponse, GetDocumentsParams } from '@/lib/api';

interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  uploading: boolean;
  uploadError: string | null;
  uploadProgress: number | null;
  totalCount: number;
  hasMore: boolean;
  fetchDocuments: (params?: GetDocumentsParams) => Promise<void>;
  uploadDocument: (
    file: File, 
    title?: string, 
    description?: string, 
    documentType?: string,
    tags?: string[]
  ) => Promise<DocumentUploadResponse>;
  deleteDocument: (documentId: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
  loadMore: () => Promise<void>;
  clearError: () => void;
  clearUploadError: () => void;
}

const DEFAULT_LIMIT = 20;

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchDocuments = useCallback(async (params?: GetDocumentsParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const limit = params?.limit || DEFAULT_LIMIT;
      const offset = params?.offset || 0;
      
      const response = await debateApi.getDocuments({ limit, offset });
      
      if (offset === 0) {
        // Fresh fetch - replace documents
        setDocuments(response.documents);
        setCurrentOffset(response.documents.length);
      } else {
        // Load more - append documents
        setDocuments(prev => [...prev, ...response.documents]);
        setCurrentOffset(prev => prev + response.documents.length);
      }
      
      setTotalCount(response.total);
      setHasMore(response.documents.length === limit && (offset + response.documents.length) < response.total);
    } catch (err) {
      console.error('Error fetching documents:', err);
      if (err instanceof Error && (err as Error & { status?: number }).status === 401) {
        setDocuments([]);
        setError('Authentication required');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (
    file: File, 
    title?: string, 
    description?: string, 
    documentType?: string,
    tags?: string[]
  ): Promise<DocumentUploadResponse> => {
    try {
      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);
      
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return 10;
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 200);

      const response = await debateApi.uploadDocument(file, title, description, documentType, tags);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Refresh documents list to include the new document
      await fetchDocuments({ limit: DEFAULT_LIMIT, offset: 0 });
      
      // Clear progress after a short delay
      setTimeout(() => {
        setUploadProgress(null);
      }, 1000);
      
      return response;
    } catch (err) {
      console.error('Error uploading document:', err);
      setUploadError(err instanceof Error ? err.message : 'Failed to upload document');
      setUploadProgress(null);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      await debateApi.deleteDocument(documentId);
      
      // Remove the document from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setTotalCount(prev => prev - 1);
      
      // Adjust current offset
      setCurrentOffset(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete document');
      throw err;
    }
  }, []);

  const refreshDocuments = useCallback(async () => {
    setCurrentOffset(0);
    await fetchDocuments({ limit: DEFAULT_LIMIT, offset: 0 });
  }, [fetchDocuments]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchDocuments({ limit: DEFAULT_LIMIT, offset: currentOffset });
  }, [hasMore, loading, currentOffset, fetchDocuments]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    uploading,
    uploadError,
    uploadProgress,
    totalCount,
    hasMore,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    refreshDocuments,
    loadMore,
    clearError,
    clearUploadError,
  };
}
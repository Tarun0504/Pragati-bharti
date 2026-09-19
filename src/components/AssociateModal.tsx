import React, { useState } from 'react';
import { X, Link2, AlertCircle, CheckCircle } from 'lucide-react';
import { DocumentRecord } from '../types';
import { api } from '../api';

interface AssociateModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceDocId: string | null;
  documents: DocumentRecord[];
  onAssociated: () => void;
}

export const AssociateModal: React.FC<AssociateModalProps> = ({
  isOpen,
  onClose,
  sourceDocId,
  documents,
  onAssociated
}) => {
  const [targetDocId, setTargetDocId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !sourceDocId) return null;

  const sourceDoc = documents.find((d) => d.id === sourceDocId);
  const availableDocs = documents.filter((d) => d.id !== sourceDocId);

  const handleAssociate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDocId) {
      setError('Please select a target document to link.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.associateDocuments(sourceDocId, targetDocId);
      onAssociated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to link documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg border border-stone-300 w-full max-w-md shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-stone-800" />
            <h3 className="text-sm font-bold text-stone-900">
              Associate Related Documents (Section 8)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleAssociate} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded">
              {error}
            </div>
          )}

          <div className="text-xs text-stone-600 leading-relaxed">
            Link a <strong>Question Paper</strong> with a separate <strong>Answer Key</strong> file so the extraction pipeline can automatically map answers to the questions across documents.
          </div>

          <div className="p-3 bg-stone-50 border border-stone-200 rounded text-xs">
            <span className="text-stone-500">Source Document:</span>
            <div className="font-bold text-stone-900 font-mono mt-0.5">
              {sourceDoc?.title}
            </div>
            <div className="text-stone-500 font-mono text-xs">
              Role: {sourceDoc?.document_role}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Select Document to Link With:
            </label>
            <select
              value={targetDocId}
              onChange={(e) => setTargetDocId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:border-stone-800 font-sans"
            >
              <option value="">-- Choose document --</option>
              {availableDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} ({d.document_role})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-medium text-stone-700 border border-stone-300 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!targetDocId || loading}
              className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? 'Linking...' : 'Establish Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

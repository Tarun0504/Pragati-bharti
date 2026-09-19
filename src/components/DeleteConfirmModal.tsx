import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg border border-stone-300 w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Confirm Deletion</span>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-stone-400 hover:text-stone-600 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-sm text-stone-800 font-medium mb-2">
            Are you sure you want to permanently delete this document?
          </p>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded text-xs text-stone-700 break-all font-mono mb-3">
            {title}
          </div>
          <p className="text-xs text-stone-500">
            This action cannot be undone. All extracted questions, associated answer keys, and verification status for this document will be permanently removed.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-stone-50 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-1.5 rounded text-xs font-semibold text-stone-700 hover:bg-stone-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-confirm-delete"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold bg-rose-700 hover:bg-rose-800 text-white transition-colors disabled:opacity-60"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? 'Deleting...' : 'Delete Document'}
          </button>
        </div>
      </div>
    </div>
  );
};

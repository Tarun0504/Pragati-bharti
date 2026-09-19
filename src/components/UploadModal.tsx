import React, { useState, useRef } from 'react';
import { X, Upload, FileCheck, AlertCircle, Link2 } from 'lucide-react';
import { DocumentRecord, DocumentRole } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingDocs: DocumentRecord[];
  onUploadSuccess: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  existingDocs,
  onUploadSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [documentRole, setDocumentRole] = useState<DocumentRole>('composite');
  const [associateDocId, setAssociateDocId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    const validMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const fileName = (file.name || '').toLowerCase();
    const hasValidExt = fileName.endsWith('.pdf') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');

    if (!validMimes.includes(file.type) && !hasValidExt) {
      setErrorMsg(`Unsupported file: ${file.name || 'unknown'}. Only PDF, JPG, and PNG are supported.`);
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 25MB maximum limit.');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please choose a file to upload.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim() || selectedFile.name);
      formData.append('document_role', documentRole);
      if (associateDocId) {
        formData.append('associate_with_document_id', associateDocId);
      }

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Server rejected file upload');
      }

      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during file upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg border border-stone-300 w-full max-w-lg shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Upload Document for Extraction
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Supports digitally generated PDFs, scanned PDFs, JPG, and PNG images
            </p>
          </div>
          <button
            id="btn-close-upload-modal"
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-stone-800 bg-stone-50'
                : 'border-stone-300 hover:border-stone-400 bg-stone-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />
            {selectedFile ? (
              <div className="flex flex-col items-center gap-1">
                <FileCheck className="w-8 h-8 text-stone-800" />
                <span className="text-xs font-semibold text-stone-900 mt-1">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                </span>
                <span className="text-xs text-stone-600 underline mt-1">
                  Click to choose different file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-8 h-8 text-stone-500" />
                <span className="text-xs font-semibold text-stone-900 mt-1">
                  Drag and drop document here, or click to browse
                </span>
                <span className="text-xs text-stone-500">
                  PDF, Scanned PDF, JPG, PNG (up to 25MB)
                </span>
              </div>
            )}
          </div>

          {/* Document Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CBSE 12th Chemistry Board Examination"
              className="w-full text-xs px-3 py-2 border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:border-stone-800"
            />
          </div>

          {/* Document Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Document Role (Section 8)
              </label>
              <select
                value={documentRole}
                onChange={(e) => setDocumentRole(e.target.value as DocumentRole)}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:border-stone-800"
              >
                <option value="composite">Composite (Questions + Answers in doc)</option>
                <option value="question_paper">Question Paper Only</option>
                <option value="answer_key">Answer Key Only</option>
              </select>
            </div>

            {/* Associate with another doc */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Link with Document (Optional)
              </label>
              <select
                value={associateDocId}
                onChange={(e) => setAssociateDocId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:border-stone-800"
              >
                <option value="">-- No Association --</option>
                {existingDocs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.document_role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-medium text-stone-700 border border-stone-300 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-upload"
              type="submit"
              disabled={!selectedFile || isUploading}
              className="px-4 py-1.5 rounded text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {isUploading ? (
                <>Processing Asynchronously...</>
              ) : (
                <>Upload &amp; Enqueue Job</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

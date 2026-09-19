import React, { useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Layers,
  Link2,
  Trash2,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';
import { DocumentRecord } from '../types';

interface DocumentListProps {
  documents: DocumentRecord[];
  selectedDocId: string | null;
  onSelectDoc: (id: string) => void;
  onInspectQuestions: (id: string) => void;
  onViewAnswerKey: (id: string) => void;
  onOpenAssociate: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onOpenUpload?: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onInspectQuestions,
  onViewAnswerKey,
  onOpenAssociate,
  onDeleteDoc,
  onOpenUpload
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || doc.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (doc: DocumentRecord) => {
    switch (doc.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
        );
      case 'requires_review':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Requires Review ({doc.review_required_count})
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-medium">
            <Clock className="w-3 h-3 text-sky-600 animate-spin" />
            Processing ({doc.progress}%)
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-300 font-medium">
            Queued
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-medium">
            Failed
          </span>
        );
    }
  };

  const getRoleBadge = (role: DocumentRecord['document_role']) => {
    switch (role) {
      case 'question_paper':
        return (
          <span className="text-xs px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 font-mono">
            Question Paper
          </span>
        );
      case 'answer_key':
        return (
          <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-mono">
            Answer Key
          </span>
        );
      case 'composite':
        return (
          <span className="text-xs px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200 font-mono">
            Composite Paper
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-xs overflow-hidden">
      {/* Search and Filters */}
      <div className="p-3.5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-stone-50/50">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by title or file name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:border-stone-800"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-500 font-medium">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-stone-300 rounded bg-white text-stone-800 focus:outline-none focus:border-stone-800"
          >
            <option value="all">All Documents ({documents.length})</option>
            <option value="completed">Completed</option>
            <option value="requires_review">Requires Review</option>
            <option value="processing">In Progress</option>
          </select>
        </div>
      </div>

      {/* Document Table / List */}
      {filteredDocs.length === 0 ? (
        <div className="p-12 text-center">
          <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-stone-800">
            {documents.length === 0 ? 'No documents uploaded yet' : 'No documents matching filter'}
          </p>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {documents.length === 0
              ? 'Upload a question paper, answer key, or composite exam document (PDF, PNG, JPG) to begin structured extraction.'
              : 'Try clearing your search term or selecting "All Documents" in the filter.'}
          </p>
          {documents.length === 0 && onOpenUpload && (
            <button
              onClick={onOpenUpload}
              className="mt-4 inline-flex items-center gap-2 px-3.5 py-2 rounded bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              Upload Your First Document
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-stone-100">
          {filteredDocs.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            return (
              <div
                key={doc.id}
                id={`doc-row-${doc.id}`}
                className={`p-4 transition-colors ${
                  isSelected ? 'bg-stone-50 border-l-4 border-l-stone-900' : 'hover:bg-stone-50/70'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                  {/* Left: Metadata */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-stone-700" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-stone-900 truncate">
                          {doc.title}
                        </h4>
                        {getStatusBadge(doc)}
                        {getRoleBadge(doc.document_role)}
                        {doc.sample_tag && (
                          <span className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded border border-stone-200">
                            Demo
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 mt-1 font-mono">
                        <span>File: {doc.filename}</span>
                        <span>Type: {doc.file_type.toUpperCase()}</span>
                        <span>Size: {(doc.file_size / 1024).toFixed(0)} KB</span>
                        <span>Pages: {doc.page_count}</span>
                        {doc.processing_time_ms && (
                          <span>Time: {(doc.processing_time_ms / 1000).toFixed(2)}s</span>
                        )}
                      </div>

                      {/* Associated Documents */}
                      {doc.related_document_ids && doc.related_document_ids.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-700">
                          <Link2 className="w-3.5 h-3.5 text-stone-500" />
                          <span className="font-medium text-stone-600">Associated with:</span>
                          {doc.related_document_ids.map((relId) => {
                            const relDoc = documents.find((d) => d.id === relId);
                            return (
                              <span
                                key={relId}
                                className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 text-xs border border-stone-200 font-mono"
                              >
                                {relDoc ? relDoc.title : relId}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Warnings if any */}
                      {doc.warnings && doc.warnings.length > 0 && (
                        <div className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">Document Notes:</span>{' '}
                            {doc.warnings.join(' • ')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Summary Metrics & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 lg:self-center shrink-0">
                    <div className="text-right px-3 py-1 bg-stone-50 border border-stone-200 rounded text-xs">
                      <div className="text-stone-500 text-xs">Extracted</div>
                      <div className="font-bold text-stone-900 font-mono">
                        {doc.total_questions_extracted} Qs
                      </div>
                    </div>

                    <button
                      id={`btn-inspect-questions-${doc.id}`}
                      onClick={() => onInspectQuestions(doc.id)}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors flex items-center gap-1"
                    >
                      Inspect Questions
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      id={`btn-view-answers-${doc.id}`}
                      onClick={() => onViewAnswerKey(doc.id)}
                      className="px-2.5 py-1.5 rounded text-xs font-medium bg-white text-stone-700 border border-stone-300 hover:bg-stone-100 transition-colors"
                    >
                      Answer Key
                    </button>

                    <button
                      id={`btn-associate-doc-${doc.id}`}
                      onClick={() => onOpenAssociate(doc.id)}
                      className="px-2.5 py-1.5 rounded text-xs font-medium bg-white text-stone-700 border border-stone-300 hover:bg-stone-100 transition-colors"
                      title="Link this document with another related Question Paper or Answer Key"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      id={`btn-delete-doc-${doc.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDoc(doc.id);
                      }}
                      className="p-1.5 rounded text-stone-400 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar if processing */}
                {doc.status === 'processing' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-stone-500 mb-1 font-mono">
                      <span>Stage: {doc.stage}</span>
                      <span>{doc.progress}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-1.5 rounded overflow-hidden">
                      <div
                        className="bg-stone-800 h-1.5 transition-all duration-300"
                        style={{ width: `${doc.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  FileText,
  Download,
  BookOpen,
  Code2,
  CheckCircle2,
  Upload,
  AlertTriangle
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'documents' | 'questions' | 'answer-key' | 'review' | 'api' | 'architecture';
  setActiveTab: (tab: 'documents' | 'questions' | 'answer-key' | 'review' | 'api' | 'architecture') => void;
  onOpenUpload: () => void;
  reviewCount: number;
  totalDocs: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  reviewCount,
  totalDocs
}) => {
  return (
    <header className="bg-white border-b border-stone-200">
      {/* Top Banner / Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-stone-900 text-white font-bold text-sm">
              PB
            </span>
            <h1 className="text-xl font-bold text-stone-900 tracking-tight">
              Pragati Bharti
            </h1>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Asynchronous Document Intelligence &amp; Structured Question Extraction Service
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-upload-new-doc"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Document
          </button>

          <a
            id="btn-export-postman"
            href="/api/export/postman"
            download="Pragati_DocIntel_Postman_Collection.json"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-white text-stone-700 text-xs font-medium border border-stone-300 hover:bg-stone-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            Postman Collection
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 border-t border-stone-100 overflow-x-auto py-2">
          <button
            id="nav-tab-documents"
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeTab === 'documents'
                ? 'bg-stone-100 text-stone-900 border border-stone-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Documents &amp; Workspace
            <span className="text-xs bg-stone-200 text-stone-800 px-1.5 py-0.2 rounded font-mono">
              {totalDocs}
            </span>
          </button>

          <button
            id="nav-tab-questions"
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeTab === 'questions'
                ? 'bg-stone-100 text-stone-900 border border-stone-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Extracted Questions Explorer
          </button>

          <button
            id="nav-tab-answer-key"
            onClick={() => setActiveTab('answer-key')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeTab === 'answer-key'
                ? 'bg-stone-100 text-stone-900 border border-stone-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Answer Key &amp; Associations
          </button>

          <button
            id="nav-tab-review"
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeTab === 'review'
                ? 'bg-stone-100 text-stone-900 border border-stone-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Human Review Queue
            {reviewCount > 0 && (
              <span className="text-xs bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono font-bold">
                {reviewCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-api"
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeTab === 'api'
                ? 'bg-stone-100 text-stone-900 border border-stone-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            OpenAPI &amp; REST Explorer
          </button>

          <button
            id="nav-tab-architecture"
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded whitespace-nowrap transition-colors ${
              activeTab === 'architecture'
                ? 'bg-stone-100 text-stone-900 border border-stone-300'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Architecture &amp; Design (Sec 14)
          </button>
        </nav>
      </div>
    </header>
  );
};

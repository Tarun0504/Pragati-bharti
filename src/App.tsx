import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DocumentList } from './components/DocumentList';
import { QuestionDetailView } from './components/QuestionDetailView';
import { AnswerKeyView } from './components/AnswerKeyView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { ApiExplorerView } from './components/ApiExplorerView';
import { ArchitectureDocView } from './components/ArchitectureDocView';
import { UploadModal } from './components/UploadModal';
import { AssociateModal } from './components/AssociateModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { DocumentRecord, ExtractedQuestion } from './types';
import { api } from './api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'documents' | 'questions' | 'answer-key' | 'review' | 'api' | 'architecture'
  >('documents');

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [reviewCount, setReviewCount] = useState<number>(0);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAssociateOpen, setIsAssociateOpen] = useState(false);
  const [associateSourceId, setAssociateSourceId] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const showNotification = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success'
  ) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Fetch documents and review queue count
  const loadDocuments = async (autoSelectFirst = false) => {
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);

      if (autoSelectFirst && docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].id);
      }

      // Compute total review count across all documents
      const reviewItems = await api.getReviewQueue();
      setReviewCount(reviewItems.length);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    }
  };

  // Fetch questions for selected document
  const loadQuestions = async (docId: string) => {
    try {
      const qs = await api.getQuestions(docId);
      setQuestions(qs);
    } catch (err: any) {
      console.error('Failed to load questions:', err);
    }
  };

  useEffect(() => {
    loadDocuments(true);
  }, []);

  useEffect(() => {
    if (selectedDocId) {
      loadQuestions(selectedDocId);
    } else if (documents.length > 0) {
      setSelectedDocId(documents[0].id);
      loadQuestions(documents[0].id);
    }
  }, [selectedDocId, documents]);

  // Polling for processing documents
  useEffect(() => {
    const hasActiveJobs = documents.some(
      (d) => d.status === 'processing' || d.status === 'queued'
    );

    if (!hasActiveJobs) return;

    const interval = setInterval(() => {
      loadDocuments(false);
      if (selectedDocId) {
        loadQuestions(selectedDocId);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [documents, selectedDocId]);

  const handleInspectQuestions = (docId: string) => {
    setSelectedDocId(docId);
    loadQuestions(docId);
    setActiveTab('questions');
  };

  const handleViewAnswerKey = (docId: string) => {
    setSelectedDocId(docId);
    setActiveTab('answer-key');
  };

  const handleOpenAssociate = (docId: string) => {
    setAssociateSourceId(docId);
    setIsAssociateOpen(true);
  };

  const handleDeleteDoc = (docId: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (doc) {
      setDocToDelete(doc);
    } else {
      setDocToDelete({
        id: docId,
        title: 'Document ' + docId,
        filename: docId,
        file_type: 'pdf',
        file_size: 0,
        page_count: 1,
        status: 'completed',
        stage: 'finalized',
        progress: 100,
        created_at: new Date().toISOString(),
        related_document_ids: [],
        document_role: 'composite',
        total_questions_extracted: 0,
        high_confidence_count: 0,
        review_required_count: 0,
        warnings: []
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    const docId = docToDelete.id;
    try {
      await api.deleteDocument(docId);
      showNotification('Document deleted successfully');
      setDocToDelete(null);
      await loadDocuments();
      if (selectedDocId === docId) {
        setSelectedDocId(null);
        setQuestions([]);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete document', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReviewQuestion = async (
    questionId: string,
    action: 'approve' | 'modify' | 'reject',
    notes?: string,
    correctedAnswer?: string,
    correctedText?: string
  ) => {
    try {
      await api.reviewQuestion(questionId, {
        action,
        notes,
        corrected_answer: correctedAnswer,
        corrected_question_text: correctedText
      });
      showNotification(`Question ${action}d successfully`);
      if (selectedDocId) {
        loadQuestions(selectedDocId);
      }
      loadDocuments();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const selectedDocument = documents.find((d) => d.id === selectedDocId);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        reviewCount={reviewCount}
        totalDocs={documents.length}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 w-full">
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between shadow-xs ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : notification.type === 'error'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-sky-50 border-sky-300 text-sky-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-stone-500 hover:text-stone-800 ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 space-y-6">
        {/* Tab 1: Documents & Workspace */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <DocumentList
              documents={documents}
              selectedDocId={selectedDocId}
              onSelectDoc={(id) => {
                setSelectedDocId(id);
                loadQuestions(id);
              }}
              onInspectQuestions={handleInspectQuestions}
              onViewAnswerKey={handleViewAnswerKey}
              onOpenAssociate={handleOpenAssociate}
              onDeleteDoc={handleDeleteDoc}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          </div>
        )}

        {/* Tab 2: Questions Explorer */}
        {activeTab === 'questions' && (
          <QuestionDetailView
            questions={questions}
            selectedDocument={selectedDocument}
            onReviewQuestion={handleReviewQuestion}
          />
        )}

        {/* Tab 3: Answer Key & Associations */}
        {activeTab === 'answer-key' && (
          <AnswerKeyView
            documents={documents}
            currentDocId={selectedDocId}
            onSelectDoc={(id) => {
              setSelectedDocId(id);
              loadQuestions(id);
            }}
            onOpenAssociate={handleOpenAssociate}
          />
        )}

        {/* Tab 4: Human Review Queue */}
        {activeTab === 'review' && (
          <ReviewQueueView
            onReviewCompleted={() => {
              loadDocuments();
              if (selectedDocId) loadQuestions(selectedDocId);
            }}
          />
        )}

        {/* Tab 5: OpenAPI & REST Explorer */}
        {activeTab === 'api' && <ApiExplorerView />}

        {/* Tab 6: Architecture & Design Documentation (Section 14) */}
        {activeTab === 'architecture' && <ArchitectureDocView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2 font-mono">
          <div>
            Pragati Bharti • Document Intelligence &amp; Question Extraction Service
          </div>
          <div className="flex items-center gap-4">
            <span>FastAPI/Express Layer</span>
            <span>•</span>
            <span>Multimodal Gemini OCR</span>
            <span>•</span>
            <span>Asynchronous Processing Queue</span>
            <span>•</span>
            <span>OpenAPI 3.0</span>
          </div>
        </div>
      </footer>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        existingDocs={documents}
        onUploadSuccess={() => {
          showNotification('Document uploaded and enqueued for asynchronous extraction');
          loadDocuments(true);
        }}
      />

      {/* Associate Modal */}
      <AssociateModal
        isOpen={isAssociateOpen}
        onClose={() => {
          setIsAssociateOpen(false);
          setAssociateSourceId(null);
        }}
        sourceDocId={associateSourceId}
        documents={documents}
        onAssociated={() => {
          showNotification('Documents associated successfully');
          loadDocuments();
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={docToDelete?.title || docToDelete?.filename || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
}

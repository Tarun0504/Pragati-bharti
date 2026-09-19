import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  Edit3,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import { ExtractedQuestion, DocumentRecord, ReviewerStatus } from '../types';

interface QuestionDetailViewProps {
  questions: ExtractedQuestion[];
  selectedDocument?: DocumentRecord | null;
  onReviewQuestion: (
    questionId: string,
    action: 'approve' | 'modify' | 'reject',
    notes?: string,
    correctedAnswer?: string,
    correctedText?: string
  ) => void;
}

export const QuestionDetailView: React.FC<QuestionDetailViewProps> = ({
  questions,
  selectedDocument,
  onReviewQuestion
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    questions[0]?.id || null
  );
  const [filterType, setFilterType] = useState<string>('all');
  const [filterReview, setFilterReview] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit / Review modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editAnswerKey, setEditAnswerKey] = useState('');
  const [editText, setEditText] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Synchronize selection if questions change
  React.useEffect(() => {
    if (questions.length > 0 && !questions.some((q) => q.id === selectedQuestionId)) {
      setSelectedQuestionId(questions[0].id);
    }
  }, [questions, selectedQuestionId]);

  const filteredQuestions = questions.filter((q) => {
    if (filterType !== 'all' && q.question_type !== filterType) return false;
    if (filterReview === 'needs_review' && !q.needs_review) return false;
    if (filterReview === 'high_confidence' && q.confidence < 0.85) return false;
    if (filterReview === 'pending' && q.reviewer_status !== 'pending') return false;
    if (filterReview === 'approved' && q.reviewer_status !== 'approved') return false;
    return true;
  });

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) || filteredQuestions[0];

  const handleCopyJson = (q: ExtractedQuestion) => {
    navigator.clipboard.writeText(JSON.stringify(q, null, 2));
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEdit = (q: ExtractedQuestion) => {
    setEditAnswerKey(q.answer?.key || '');
    setEditText(q.question_text);
    setEditNotes(q.reviewer_notes || '');
    setIsEditing(true);
  };

  const handleSaveEdit = (action: 'approve' | 'modify' | 'reject') => {
    if (!selectedQuestion) return;
    onReviewQuestion(
      selectedQuestion.id,
      action,
      editNotes,
      editAnswerKey,
      editText
    );
    setIsEditing(false);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-12 text-center">
        <FileText className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-stone-800">No questions extracted yet</p>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          {selectedDocument
            ? `Processing for "${selectedDocument.title}" is ${selectedDocument.status === 'processing' ? 'in progress (' + selectedDocument.progress + '%)' : 'complete'}. Questions will appear here once extracted.`
            : 'Select a document from the Documents tab or upload an exam paper to inspect extracted questions.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Title & Filters */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <span>Extracted Questions</span>
            {selectedDocument && (
              <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-normal border border-stone-200">
                {selectedDocument.title}
              </span>
            )}
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Showing {filteredQuestions.length} of {questions.length} questions
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-stone-300 rounded bg-white text-stone-800 focus:outline-none focus:border-stone-800"
          >
            <option value="all">All Types</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="multi_select">Multi-Select</option>
            <option value="true_false">True / False</option>
            <option value="numerical">Numerical</option>
            <option value="descriptive">Descriptive</option>
          </select>

          <select
            value={filterReview}
            onChange={(e) => setFilterReview(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-stone-300 rounded bg-white text-stone-800 focus:outline-none focus:border-stone-800"
          >
            <option value="all">All Confidence &amp; Status</option>
            <option value="needs_review">Needs Human Review</option>
            <option value="high_confidence">High Confidence (&ge;85%)</option>
            <option value="pending">Review Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Two Column Layout: List on Left, Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Question Cards List */}
        <div className="lg:col-span-5 space-y-2">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-lg p-6 text-center text-xs text-stone-500">
              No questions match the current filter selection.
            </div>
          ) : (
            filteredQuestions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              return (
                <div
                  key={q.id}
                  id={`q-item-${q.id}`}
                  onClick={() => {
                    setSelectedQuestionId(q.id);
                    setIsEditing(false);
                  }}
                  className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all bg-white ${
                    isSelected
                      ? 'border-stone-900 ring-1 ring-stone-900 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                        {q.question_number.startsWith('Q') ? q.question_number : `Q${q.question_number}`}
                      </span>
                      <span className="text-xs text-stone-600 capitalize">
                        {q.question_type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {q.needs_review ? (
                        <span className="text-xs px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                          Review Needed
                        </span>
                      ) : (
                        <span className="text-xs px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium font-mono">
                          {(q.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-stone-800 line-clamp-2 leading-relaxed">
                    {q.question_text}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 text-xs text-stone-500 font-mono">
                    <span>
                      Page {q.source_pages.join(', ')}
                      {q.source_pages.length > 1 && ' (Split)'}
                    </span>
                    {q.answer && (
                      <span className="font-semibold text-stone-700">
                        Ans: {q.answer.key || q.answer.text?.substring(0, 15)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Question Inspector */}
        <div className="lg:col-span-7">
          {selectedQuestion ? (
            <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs space-y-4">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-900 font-mono bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    Question {selectedQuestion.question_number}
                  </span>
                  <span className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200 capitalize font-medium">
                    {selectedQuestion.question_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-copy-json"
                    onClick={() => handleCopyJson(selectedQuestion)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    {copiedId === selectedQuestion.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copied JSON
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        Copy JSON
                      </>
                    )}
                  </button>

                  <button
                    id="btn-edit-question"
                    onClick={() => startEdit(selectedQuestion)}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Review / Edit
                  </button>
                </div>
              </div>

              {/* Source Page & Traceability (Section 3 Requirement) */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded text-xs font-mono">
                <div className="flex items-center gap-2 text-stone-700">
                  <FileText className="w-3.5 h-3.5 text-stone-500" />
                  <span>
                    Source Document Page(s):{' '}
                    <strong className="text-stone-900">
                      [{selectedQuestion.source_pages.join(', ')}]
                    </strong>
                  </span>
                  {selectedQuestion.source_pages.length > 1 && (
                    <span className="bg-amber-100 text-amber-900 text-xs px-1.5 py-0.2 rounded font-sans font-medium">
                      Continuous across page boundary
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-sans">Confidence:</span>
                  <span className="font-bold text-stone-900 font-mono">
                    {(selectedQuestion.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-1">
                  Question Text
                </label>
                <div className="p-3 bg-stone-50/70 border border-stone-200 rounded text-xs text-stone-900 leading-relaxed whitespace-pre-line font-sans">
                  {selectedQuestion.question_text}
                </div>
              </div>

              {/* Embedded Diagram or Table Details (Section 3) */}
              {selectedQuestion.has_diagram_or_table && (
                <div className="p-3 bg-sky-50 border border-sky-200 rounded text-xs text-sky-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-3.5 h-3.5 text-sky-700" />
                    <span>Embedded Diagram / Structured Table Detected</span>
                  </div>
                  {selectedQuestion.diagram_description && (
                    <p className="text-sky-800 font-sans pl-5 leading-relaxed">
                      {selectedQuestion.diagram_description}
                    </p>
                  )}
                </div>
              )}

              {/* Options List */}
              {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                    Options ({selectedQuestion.options.length})
                  </label>
                  <div className="space-y-1.5">
                    {selectedQuestion.options.map((opt) => {
                      const isCorrect = selectedQuestion.answer?.key === opt.key;
                      return (
                        <div
                          key={opt.key}
                          className={`p-2.5 rounded border text-xs flex items-start gap-2.5 transition-colors ${
                            isCorrect
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                              : 'bg-white border-stone-200 text-stone-800'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-700 text-white'
                                : 'bg-stone-100 text-stone-700 border border-stone-300'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="pt-0.5 leading-relaxed flex-1">
                            {opt.text}
                          </span>
                          {isCorrect && (
                            <span className="text-xs text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-semibold shrink-0">
                              Correct Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Associated Answer Information (Section 4) */}
              <div>
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block mb-1.5">
                  Associated Answer &amp; Key Details (Section 4)
                </label>
                {selectedQuestion.answer ? (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-700">Answer:</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold font-mono text-xs">
                          {selectedQuestion.answer.key || 'Textual Solution'}
                        </span>
                        {selectedQuestion.answer.text && (
                          <span className="text-stone-800">
                            {selectedQuestion.answer.text}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-stone-500 font-mono">
                        <span>Source: {selectedQuestion.answer.source}</span>
                        <span>•</span>
                        <span>Key Conf: {(selectedQuestion.answer.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {selectedQuestion.answer.explanation && (
                      <div className="text-stone-600 pt-2 border-t border-stone-200 leading-relaxed font-sans">
                        <strong className="text-stone-700">Explanation:</strong>{' '}
                        {selectedQuestion.answer.explanation}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                    No answer key was located in the document for this question. It has been preserved without fabricating an answer.
                  </div>
                )}
              </div>

              {/* Confidence & Review Warnings (Section 6) */}
              {selectedQuestion.needs_review && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Flagged for Human Review:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-amber-800 font-sans">
                    {selectedQuestion.review_reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reviewer Status Audit */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-200 text-xs text-stone-500">
                <span>
                  Audit Status:{' '}
                  <strong className="text-stone-800 uppercase font-mono">
                    {selectedQuestion.reviewer_status}
                  </strong>
                </span>
                {selectedQuestion.reviewer_notes && (
                  <span className="italic text-stone-600">
                    "{selectedQuestion.reviewer_notes}"
                  </span>
                )}
              </div>

              {/* Inline Edit Form when Active */}
              {isEditing && (
                <div className="p-4 bg-stone-50 border border-stone-300 rounded-lg space-y-3 pt-3">
                  <h4 className="text-xs font-bold text-stone-900">
                    Human Review &amp; Correction Form
                  </h4>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Corrected Question Text
                    </label>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2 border border-stone-300 rounded bg-white text-stone-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Corrected Answer Key
                      </label>
                      <input
                        type="text"
                        value={editAnswerKey}
                        onChange={(e) => setEditAnswerKey(e.target.value)}
                        placeholder="e.g. B or 300.9s"
                        className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded bg-white text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Reviewer Audit Notes
                      </label>
                      <input
                        type="text"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="e.g. Corrected scan smudge"
                        className="w-full text-xs px-2.5 py-1.5 border border-stone-300 rounded bg-white text-stone-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-2.5 py-1 rounded text-xs text-stone-600 border border-stone-300 hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit('reject')}
                      className="px-2.5 py-1 rounded text-xs text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 font-medium"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleSaveEdit('modify')}
                      className="px-3 py-1 rounded text-xs text-white bg-stone-900 hover:bg-stone-800 font-semibold"
                    >
                      Save Modifications
                    </button>
                    <button
                      onClick={() => handleSaveEdit('approve')}
                      className="px-3 py-1 rounded text-xs text-white bg-emerald-700 hover:bg-emerald-800 font-semibold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve Question
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-lg p-12 text-center text-xs text-stone-500">
              Select a question on the left to view detailed options, answer key associations, confidence metrics, and human review status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

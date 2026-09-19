import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  XCircle,
  FileText,
  Clock,
  Check
} from 'lucide-react';
import { ReviewQueueItem } from '../types';
import { api } from '../api';

interface ReviewQueueViewProps {
  onReviewCompleted: () => void;
}

export const ReviewQueueView: React.FC<ReviewQueueViewProps> = ({
  onReviewCompleted
}) => {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchItems = () => {
    setLoading(true);
    api
      .getReviewQueue()
      .then((data) => {
        setItems(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleQuickApprove = async (questionId: string) => {
    setActingId(questionId);
    setError(null);
    try {
      await api.reviewQuestion(questionId, {
        action: 'approve',
        notes: 'Approved via Human Review Queue fast-action'
      });
      fetchItems();
      onReviewCompleted();
    } catch (err: any) {
      setError(err.message || 'Failed to approve item');
    } finally {
      setActingId(null);
    }
  };

  const handleQuickReject = async (questionId: string) => {
    setActingId(questionId);
    setError(null);
    try {
      await api.reviewQuestion(questionId, {
        action: 'reject',
        notes: 'Rejected due to severe illegibility'
      });
      fetchItems();
      onReviewCompleted();
    } catch (err: any) {
      setError(err.message || 'Failed to reject item');
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Human-in-the-Loop Review Queue (Section 6 &amp; 11)
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Questions flagged with low confidence (&lt; 0.80), missing numbers, OCR noise, or ambiguous options
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-stone-100 text-stone-700 px-3 py-1 rounded font-mono font-semibold border border-stone-200">
            {items.length} Pending Review Items
          </span>
        </div>
      </div>

      {/* Queue Items */}
      {loading ? (
        <div className="bg-white border border-stone-200 rounded-lg p-12 text-center text-xs text-stone-500">
          Loading review queue...
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-xs text-rose-800">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-lg p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-stone-900">Review Queue is Clear</h4>
          <p className="text-xs text-stone-500 mt-1">
            All extracted questions have passed confidence thresholds or have been audited.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const q = item.question;
            const isProcessing = actingId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Column: Metadata & Issue Reasons */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 font-mono bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        {q.question_number}
                      </span>
                      <span className="text-xs text-stone-600 font-medium">
                        {item.document_title}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium font-mono">
                        Conf: {(q.confidence * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-stone-500 font-mono">
                        Page {q.source_pages.join(', ')}
                      </span>
                    </div>

                    {/* Flagged reasons list */}
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-900">
                      <div className="font-bold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        Extraction Warnings:
                      </div>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {item.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Question snippet */}
                    <div className="text-xs text-stone-800 font-sans p-2.5 bg-stone-50 border border-stone-200 rounded">
                      <strong className="text-stone-700">Extracted Text:</strong>{' '}
                      {q.question_text}
                    </div>

                    {/* Options if present */}
                    {q.options && q.options.length > 0 && (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {q.options.map((opt) => (
                          <span
                            key={opt.key}
                            className="px-2 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200 font-mono"
                          >
                            <strong>{opt.key}:</strong> {opt.text}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Review Action Buttons */}
                  <div className="flex sm:flex-col items-center gap-2 shrink-0">
                    <button
                      id={`btn-approve-review-${q.id}`}
                      onClick={() => handleQuickApprove(q.id)}
                      disabled={isProcessing}
                      className="w-full px-3.5 py-1.5 rounded text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve &amp; Clear
                    </button>

                    <button
                      id={`btn-reject-review-${q.id}`}
                      onClick={() => handleQuickReject(q.id)}
                      disabled={isProcessing}
                      className="w-full px-3.5 py-1.5 rounded text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Item
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

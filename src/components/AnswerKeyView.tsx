import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Link2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DocumentRecord, AnswerKeySummary } from '../types';
import { api } from '../api';

interface AnswerKeyViewProps {
  documents: DocumentRecord[];
  currentDocId: string | null;
  onSelectDoc: (id: string) => void;
  onOpenAssociate: (id: string) => void;
}

export const AnswerKeyView: React.FC<AnswerKeyViewProps> = ({
  documents,
  currentDocId,
  onSelectDoc,
  onOpenAssociate
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(
    currentDocId || documents[0]?.id || ''
  );
  const [summary, setSummary] = useState<AnswerKeySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentDocId && currentDocId !== selectedDocId) {
      setSelectedDocId(currentDocId);
    }
  }, [currentDocId]);

  useEffect(() => {
    if (!selectedDocId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    api
      .getAnswerKey(selectedDocId)
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDocId]);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];
  const associatedDoc = selectedDoc?.related_document_ids?.[0]
    ? documents.find((d) => d.id === selectedDoc.related_document_ids[0])
    : null;

  if (documents.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-12 text-center">
        <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-stone-800">No documents available</p>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          Upload a question paper or answer key from the Documents tab to inspect answer key extraction and cross-document reconciliation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Selector & Association Status */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-stone-800" />
            Answer Key Detection &amp; Cross-Document Association
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Demonstrating Section 4 (Answer Key Identification) &amp; Section 8 (Linked Question Paper + Answer Key)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-stone-600 font-medium">Select Document:</label>
          <select
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              onSelectDoc(e.target.value);
            }}
            className="text-xs px-2.5 py-1.5 border border-stone-300 rounded bg-white text-stone-900 focus:outline-none focus:border-stone-800 font-sans"
          >
            {documents.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.document_role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Answer Key Topology Card */}
      {selectedDoc && (
        <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-3 border-b border-stone-200">
            <div>
              <div className="text-xs text-stone-500">Active Document Role:</div>
              <div className="text-xs font-bold text-stone-900 uppercase font-mono mt-0.5">
                {selectedDoc.document_role}
              </div>
            </div>

            {/* Association Status */}
            <div className="flex items-center gap-2">
              {associatedDoc ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-900">
                  <Link2 className="w-3.5 h-3.5 text-indigo-700" />
                  <span>
                    Linked with Answer Key Document:{' '}
                    <strong>{associatedDoc.title}</strong>
                  </span>
                </div>
              ) : (
                <button
                  id="btn-link-external-key"
                  onClick={() => onOpenAssociate(selectedDoc.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Associate Separate Answer Key (Section 8)
                </button>
              )}
            </div>
          </div>

          {/* Metric Badges */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3 bg-stone-50 border border-stone-200 rounded text-center">
                <div className="text-xs text-stone-500">Total Questions</div>
                <div className="text-lg font-bold text-stone-900 font-mono mt-0.5">
                  {summary.total_questions}
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-center">
                <div className="text-xs text-emerald-800">Reliably Matched</div>
                <div className="text-lg font-bold text-emerald-900 font-mono mt-0.5">
                  {summary.matched_count}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-center">
                <div className="text-xs text-amber-800">Uncertain / Inferred</div>
                <div className="text-lg font-bold text-amber-900 font-mono mt-0.5">
                  {summary.uncertain_count}
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-center">
                <div className="text-xs text-rose-800">Unmatched / Missing</div>
                <div className="text-lg font-bold text-rose-900 font-mono mt-0.5">
                  {summary.unmatched_count}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Answer Key Matrix Table */}
      <div className="bg-white border border-stone-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-200 bg-stone-50/50 flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Answer Key Reconciliation Matrix
          </h4>
          <span className="text-xs text-stone-500 font-mono">
            {summary?.keys.length || 0} Questions
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-stone-500">
            Loading answer key matrix...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-rose-700 bg-rose-50">
            {error}
          </div>
        ) : summary && summary.keys.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold font-mono">
                  <th className="p-3 w-16">Q#</th>
                  <th className="p-3 w-28">Matched Key</th>
                  <th className="p-3 w-32">Status</th>
                  <th className="p-3 w-36">Source Type</th>
                  <th className="p-3 w-24">Confidence</th>
                  <th className="p-3">Solution / Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {summary.keys.map((k) => (
                  <tr key={k.question_number} className="hover:bg-stone-50/60">
                    <td className="p-3 font-mono font-bold text-stone-900">
                      {k.question_number}
                    </td>
                    <td className="p-3">
                      <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                        {k.answer_key}
                      </span>
                    </td>
                    <td className="p-3">
                      {k.status === 'matched' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Matched
                        </span>
                      ) : k.status === 'uncertain' ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Uncertain
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-medium">
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-stone-600">
                      {k.source}
                    </td>
                    <td className="p-3 font-mono text-stone-700">
                      {(k.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="p-3 text-stone-600 max-w-md truncate">
                      {k.explanation || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-stone-500">
            No questions or answer key data found for this document.
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Code2, Play, Download, Check, Copy, Terminal, ExternalLink, Settings } from 'lucide-react';
import { api } from '../api';
import { DocumentRecord, ExtractedQuestion } from '../types';

export const ApiExplorerView: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('get_documents');
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [testDocId, setTestDocId] = useState<string>('');
  const [testQuestionId, setTestQuestionId] = useState<string>('');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseJson, setResponseJson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    api.getDocuments().then((docs) => {
      setDocuments(docs);
      if (docs.length > 0) {
        const firstId = docs[0].id;
        setTestDocId(firstId);
        api.getQuestions(firstId).then((qs) => {
          if (qs.length > 0) {
            setTestQuestionId(qs[0].id);
          }
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const effectiveDocId = testDocId || (documents[0]?.id || 'doc-sample');
  const effectiveQuestionId = testQuestionId || 'q-sample-1';

  const endpoints = [
    {
      id: 'get_documents',
      method: 'GET',
      path: '/api/documents',
      desc: 'List all documents with processing status and stats'
    },
    {
      id: 'get_document_by_id',
      method: 'GET',
      path: `/api/documents/${effectiveDocId}`,
      desc: 'Retrieve document processing status & metadata'
    },
    {
      id: 'get_document_questions',
      method: 'GET',
      path: `/api/documents/${effectiveDocId}/questions`,
      desc: 'Retrieve extracted questions with full options and confidence'
    },
    {
      id: 'get_single_question',
      method: 'GET',
      path: `/api/questions/${effectiveQuestionId}`,
      desc: 'Retrieve question detail with source page references'
    },
    {
      id: 'get_answer_key',
      method: 'GET',
      path: `/api/documents/${effectiveDocId}/answer-key`,
      desc: 'Retrieve associated answer key details and source mapping'
    },
    {
      id: 'get_review_queue',
      method: 'GET',
      path: `/api/documents/${effectiveDocId}/review-queue`,
      desc: 'Retrieve extraction warnings and low-confidence review items'
    },
    {
      id: 'post_associate',
      method: 'POST',
      path: `/api/documents/${effectiveDocId}/associate`,
      body: { related_document_id: documents[1]?.id || 'doc-related' },
      desc: 'Link related documents (Question Paper with separate Answer Key)'
    },
    {
      id: 'post_review',
      method: 'POST',
      path: `/api/questions/${effectiveQuestionId}/review`,
      body: { action: 'approve', notes: 'Verified by human reviewer' },
      desc: 'Submit human-in-the-loop review decision'
    },
    {
      id: 'get_openapi',
      method: 'GET',
      path: '/api/openapi.json',
      desc: 'Get raw OpenAPI 3.0 JSON specification'
    },
    {
      id: 'get_audit_logs',
      method: 'GET',
      path: '/api/audit-logs',
      desc: 'Inspect backend pipeline audit logs and execution trail'
    }
  ];

  const currentEp = endpoints.find((e) => e.id === selectedEndpoint) || endpoints[0];

  const handleExecute = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseJson(null);

    try {
      const options: RequestInit = {
        method: currentEp.method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (currentEp.method === 'POST' && (currentEp as any).body) {
        options.body = JSON.stringify((currentEp as any).body);
      }

      const res = await fetch(currentEp.path, options);
      setResponseStatus(res.status);
      const data = await res.json();
      setResponseJson(data);
    } catch (err: any) {
      setResponseStatus(500);
      setResponseJson({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCurl = () => {
    const curl = currentEp.method === 'GET'
      ? `curl -X GET "${window.location.origin}${currentEp.path}"`
      : `curl -X POST "${window.location.origin}${currentEp.path}" -H "Content-Type: application/json" -d '${JSON.stringify((currentEp as any).body)}'`;
    navigator.clipboard.writeText(curl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-stone-800" />
            OpenAPI &amp; REST Interactive Explorer (Section 11 &amp; 13)
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Test and inspect all required endpoints live against the running service
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
            Raw openapi.json
          </a>

          <a
            href="/api/export/postman"
            download="Pragati_DocIntel_Postman_Collection.json"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download Postman Collection
          </a>
        </div>
      </div>

      {/* Grid Layout: Endpoint Selector + Test Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Endpoints Menu */}
        <div className="lg:col-span-4 bg-white border border-stone-200 rounded-lg p-3 shadow-xs space-y-1.5">
          <div className="px-2 py-1 text-xs font-bold text-stone-500 uppercase tracking-wider">
            API Surface (Section 11)
          </div>
          {endpoints.map((ep) => {
            const isSelected = selectedEndpoint === ep.id;
            return (
              <button
                key={ep.id}
                id={`api-btn-${ep.id}`}
                onClick={() => {
                  setSelectedEndpoint(ep.id);
                  setResponseStatus(null);
                  setResponseJson(null);
                }}
                className={`w-full text-left p-2.5 rounded border text-xs transition-all ${
                  isSelected
                    ? 'border-stone-900 bg-stone-50 font-semibold'
                    : 'border-stone-100 hover:border-stone-300 hover:bg-stone-50/50 bg-white'
                }`}
              >
                <div className="flex items-center gap-2 font-mono">
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded font-bold ${
                      ep.method === 'GET'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-stone-800 truncate">{ep.path}</span>
                </div>
                <div className="text-xs text-stone-500 font-sans font-normal mt-1 line-clamp-1">
                  {ep.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Interactive Console */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-lg p-4 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  currentEp.method === 'GET'
                    ? 'bg-sky-50 text-sky-800 border border-sky-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {currentEp.method}
              </span>
              <span className="font-bold text-stone-900">{currentEp.path}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-curl"
                onClick={handleCopyCurl}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded text-stone-700 border border-stone-300 hover:bg-stone-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied cURL
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    Copy cURL
                  </>
                )}
              </button>

              <button
                id="btn-run-endpoint"
                onClick={handleExecute}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                {isLoading ? 'Executing...' : 'Execute Live'}
              </button>
            </div>
          </div>

          <p className="text-xs text-stone-600 font-sans">
            {currentEp.desc}
          </p>

          {/* Target Document Selector */}
          {documents.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 p-2.5 bg-stone-50 border border-stone-200 rounded text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-700">Target Document:</span>
                <select
                  value={testDocId}
                  onChange={(e) => {
                    setTestDocId(e.target.value);
                    api.getQuestions(e.target.value).then((qs) => {
                      if (qs.length > 0) setTestQuestionId(qs[0].id);
                    }).catch(() => {});
                  }}
                  className="px-2 py-1 border border-stone-300 rounded bg-white text-stone-800 text-xs font-mono"
                >
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Request Payload if POST */}
          {(currentEp as any).body && (
            <div>
              <div className="text-xs font-bold text-stone-600 uppercase mb-1">
                Request Payload (application/json)
              </div>
              <pre className="p-3 bg-stone-50 border border-stone-200 rounded text-xs font-mono text-stone-800 overflow-x-auto">
                {JSON.stringify((currentEp as any).body, null, 2)}
              </pre>
            </div>
          )}

          {/* Live Response Panel */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-bold text-stone-600 uppercase">
                Response Output
              </div>
              {responseStatus && (
                <span
                  className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                    responseStatus < 300
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  HTTP {responseStatus}
                </span>
              )}
            </div>

            {responseJson ? (
              <pre className="p-3 bg-stone-50 border border-stone-200 rounded text-xs font-mono text-stone-900 max-h-96 overflow-y-auto overflow-x-auto">
                {JSON.stringify(responseJson, null, 2)}
              </pre>
            ) : (
              <div className="p-8 text-center text-xs text-stone-400 border border-dashed border-stone-200 rounded">
                Click "Execute Live" above to trigger this API endpoint on the server.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

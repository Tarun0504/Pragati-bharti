import React, { useState, useEffect } from 'react';
import { BookOpen, Layers, ShieldCheck, Cpu, Database, Activity } from 'lucide-react';
import { api } from '../api';

export const ArchitectureDocView: React.FC = () => {
  const [doc, setDoc] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    api.getArchitectureDoc().then(setDoc);
    api.getAuditLogs().then(setAuditLogs);
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-stone-800" />
          <h2 className="text-base font-bold text-stone-900">
            System Architecture &amp; Engineering Decisions (Section 14 Deliverable)
          </h2>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
          Comprehensive technical documentation detailing the architecture, multimodal AI model selection, storage modeling, asynchronous queue orchestration, cross-document answer reconciliation, confidence heuristics, and security controls for Pragati Bharti.
        </p>
      </div>

      {/* Architecture Visual ASCII Diagram */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs">
        <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-stone-700" />
          System Pipeline Flow Diagram
        </h3>
        <pre className="p-4 bg-stone-50 border border-stone-200 rounded text-xs font-mono text-stone-800 overflow-x-auto leading-relaxed">
{`+-------------------------------------------------------------------------------------------------------+
|                                    CLIENT / LMS / EXAM PLATFORMS                                     |
+-------------------------------------------------------------------------------------------------------+
      |  1. POST /api/documents/upload (PDF/JPG/PNG)         ^  5. Polling / Webhook updates
      v                                                      |
+-------------------------------------------------------------------------------------------------------+
|                                 FASTAPI / EXPRESS INGESTION GATEWAY                                  |
|  - Magic-number file type validation                       - File size limits (25MB)                  |
|  - Creates document record (status: queued)                - Returns immediate HTTP 202 Accepted     |
+-------------------------------------------------------------------------------------------------------+
      |  2. Enqueues Extraction Task
      v
+-------------------------------------------------------------------------------------------------------+
|                                ASYNCHRONOUS PROCESSING QUEUE (REDIS)                                  |
|  Stages: [queued] -> [layout_analysis] -> [ocr_extraction] -> [answer_matching] -> [confidence_eval]   |
+-------------------------------------------------------------------------------------------------------+
      |  3. Worker Pool Ingestion
      v
+-------------------------------------------------------------------------------------------------------+
|                               MULTIMODAL AI & OCR EXTRACTION ENGINE                                   |
|  - Google Gemini Multimodal Flash (Direct PDF bytes / high-res raster ingestion)                      |
|  - Mathematical LaTeX reconstruction                       - Diagram & table description extraction   |
|  - Cross-page boundary question continuum                  - Option letter reconciliation             |
+-------------------------------------------------------------------------------------------------------+
      |  4. Answer Matching & Confidence Evaluation
      v
+------------------------------------+             +----------------------------------------------------+
|       CONFIDENCE VERIFICATION      |             |         CROSS-DOCUMENT ANSWER RECONCILIATION       |
|  - Score: 0.0 to 1.0               |             |  - Embedded key (end/beginning of document)        |
|  - Threshold: >= 0.80 -> Complete  |             |  - Linked separate document (POST /api/associate)  |
|  - If < 0.80 -> Routed to Review   |             |  - Fallback: Inferred solution with penalty        |
+------------------------------------+             +----------------------------------------------------+
      |                                                                 |
      v                                                                 v
+-------------------------------------------------------------------------------------------------------+
|                               POSTGRESQL PERSISTENCE & DATA CONTRACTS                                 |
|  - documents (metadata, progress, status, role, related_ids)                                          |
|  - questions (number, text, options, answer, source_pages, confidence, needs_review, reviewer_status) |
|  - audit_logs (traceability, reviewer modifications, timestamps)                                      |
+-------------------------------------------------------------------------------------------------------+`}
        </pre>
      </div>

      {/* Structured Sections */}
      {doc?.sections && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doc.sections.map((section: any, index: number) => (
            <div
              key={index}
              className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs space-y-2"
            >
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded bg-stone-100 border border-stone-300 flex items-center justify-center font-mono text-xs">
                  {index + 1}
                </span>
                {section.title}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line font-sans">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Live Audit Log Section */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-stone-700" />
            Live System Audit &amp; Event Trail
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            {auditLogs.length} Events Logged
          </span>
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto font-mono text-xs">
          {auditLogs.length === 0 ? (
            <div className="text-stone-400 py-4 text-center">No audit logs recorded yet.</div>
          ) : (
            auditLogs.map((log, i) => (
              <div
                key={i}
                className="p-2 rounded bg-stone-50 border border-stone-200 flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-stone-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="font-bold text-stone-800">{log.action}</span>
                </div>
                <span className="text-stone-500 text-xs truncate max-w-xs">
                  {JSON.stringify(log.details)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

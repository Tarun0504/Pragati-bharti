import {
  DocumentRecord,
  ExtractedQuestion,
  ProcessingJob,
  AnswerKeySummary,
  ReviewQueueItem
} from '../src/types';
import { DEMO_SCENARIOS } from './sampleDocs';

class DatabaseStore {
  private documents: Map<string, DocumentRecord> = new Map();
  private questions: Map<string, ExtractedQuestion> = new Map();
  private jobs: Map<string, ProcessingJob> = new Map();
  private auditLogs: Array<{ timestamp: string; action: string; details: any }> = [];

  constructor() {
    // Start with a clean, empty state without demo data
  }

  public seedDemoData() {
    this.documents.clear();
    this.questions.clear();
    this.jobs.clear();

    for (const scenario of DEMO_SCENARIOS) {
      this.documents.set(scenario.document.id, { ...scenario.document });
      for (const q of scenario.questions) {
        this.questions.set(q.id, { ...q });
      }

      if (scenario.associatedDoc) {
        this.documents.set(scenario.associatedDoc.document.id, {
          ...scenario.associatedDoc.document
        });
        for (const q of scenario.associatedDoc.questions) {
          this.questions.set(q.id, { ...q });
        }
      }
    }
    this.logAction('SEED_DATABASE', { scenario_count: DEMO_SCENARIOS.length });
  }

  public logAction(action: string, details: any) {
    this.auditLogs.unshift({
      timestamp: new Date().toISOString(),
      action,
      details
    });
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  public getAuditLogs() {
    return this.auditLogs;
  }

  public getDocuments(): DocumentRecord[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getDocument(id: string): DocumentRecord | undefined {
    return this.documents.get(id);
  }

  public saveDocument(doc: DocumentRecord): DocumentRecord {
    this.documents.set(doc.id, doc);
    return doc;
  }

  public deleteDocument(id: string): boolean {
    const doc = this.documents.get(id);
    if (!doc) return false;

    this.documents.delete(id);
    for (const [qId, q] of Array.from(this.questions.entries())) {
      if (q.document_id === id) {
        this.questions.delete(qId);
      }
    }

    // Clean up associated jobs
    for (const [jobId, job] of Array.from(this.jobs.entries())) {
      if (job.document_id === id) {
        this.jobs.delete(jobId);
      }
    }

    // Clean up relations in other documents
    for (const [otherId, otherDoc] of Array.from(this.documents.entries())) {
      if (otherDoc.related_document_ids && otherDoc.related_document_ids.includes(id)) {
        otherDoc.related_document_ids = otherDoc.related_document_ids.filter((rId) => rId !== id);
        this.documents.set(otherId, otherDoc);
      }
    }
    this.logAction('DELETE_DOCUMENT', { document_id: id, filename: doc.filename });
    return true;
  }

  public getQuestions(
    docId?: string,
    filters?: {
      needs_review?: boolean;
      min_confidence?: number;
      type?: string;
      reviewer_status?: string;
    }
  ): ExtractedQuestion[] {
    let result = Array.from(this.questions.values());

    if (docId) {
      result = result.filter((q) => q.document_id === docId);
    }

    if (filters?.needs_review !== undefined) {
      result = result.filter((q) => q.needs_review === filters.needs_review);
    }

    if (filters?.min_confidence !== undefined) {
      result = result.filter((q) => q.confidence >= filters.min_confidence!);
    }

    if (filters?.type) {
      result = result.filter((q) => q.question_type === filters.type);
    }

    if (filters?.reviewer_status) {
      result = result.filter((q) => q.reviewer_status === filters.reviewer_status);
    }

    return result.sort((a, b) => {
      // Natural sort by question number
      const numA = parseInt(a.question_number, 10);
      const numB = parseInt(b.question_number, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.question_number.localeCompare(b.question_number);
    });
  }

  public getQuestion(id: string): ExtractedQuestion | undefined {
    return this.questions.get(id);
  }

  public saveQuestion(question: ExtractedQuestion): ExtractedQuestion {
    this.questions.set(question.id, question);
    this.recalculateDocumentStats(question.document_id);
    return question;
  }

  public updateQuestion(
    id: string,
    updates: Partial<ExtractedQuestion>
  ): ExtractedQuestion | undefined {
    const existing = this.questions.get(id);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...updates
    };

    this.questions.set(id, updated);
    this.recalculateDocumentStats(updated.document_id);
    this.logAction('UPDATE_QUESTION', { question_id: id, updates });
    return updated;
  }

  public recalculateDocumentStats(docId: string) {
    const doc = this.documents.get(docId);
    if (!doc) return;

    const docQuestions = Array.from(this.questions.values()).filter(
      (q) => q.document_id === docId
    );

    doc.total_questions_extracted = docQuestions.length;
    doc.high_confidence_count = docQuestions.filter((q) => q.confidence >= 0.85).length;
    doc.review_required_count = docQuestions.filter((q) => q.needs_review).length;

    if (doc.status === 'completed' && doc.review_required_count > 0) {
      doc.status = 'requires_review';
    } else if (doc.status === 'requires_review' && doc.review_required_count === 0) {
      doc.status = 'completed';
    }

    this.documents.set(docId, doc);
  }

  public getAnswerKeySummary(docId: string): AnswerKeySummary {
    const doc = this.documents.get(docId);
    const questions = this.getQuestions(docId);

    const keys = questions.map((q) => {
      const hasAnswer = Boolean(q.answer?.key || q.answer?.text);
      const isCertain = (q.answer?.confidence ?? 0) >= 0.85;

      return {
        question_number: q.question_number,
        answer_key: q.answer?.key || q.answer?.text || 'N/A',
        explanation: q.answer?.explanation,
        confidence: q.answer?.confidence ?? 0,
        source: q.answer?.source || 'unmatched',
        status: !hasAnswer
          ? ('unmatched' as const)
          : isCertain
          ? ('matched' as const)
          : ('uncertain' as const)
      };
    });

    const matchedCount = keys.filter((k) => k.status === 'matched').length;
    const uncertainCount = keys.filter((k) => k.status === 'uncertain').length;
    const unmatchedCount = keys.filter((k) => k.status === 'unmatched').length;

    let sourceType: 'embedded' | 'linked_document' | 'inline' | 'none' = 'none';
    if (doc?.related_document_ids && doc.related_document_ids.length > 0) {
      sourceType = 'linked_document';
    } else if (questions.some((q) => q.answer?.source === 'embedded_key')) {
      sourceType = 'embedded';
    } else if (questions.some((q) => q.answer?.source === 'inline_solution')) {
      sourceType = 'inline';
    }

    return {
      document_id: docId,
      associated_document_id: doc?.related_document_ids?.[0],
      total_questions: questions.length,
      matched_count: matchedCount,
      uncertain_count: uncertainCount,
      unmatched_count: unmatchedCount,
      source_type: sourceType,
      keys
    };
  }

  public getReviewQueue(docId?: string): ReviewQueueItem[] {
    const questions = this.getQuestions(docId, { needs_review: true });

    return questions.map((q) => {
      const doc = this.documents.get(q.document_id);
      const severity: 'high' | 'medium' | 'low' =
        q.confidence < 0.6 ? 'high' : q.confidence < 0.75 ? 'medium' : 'low';

      return {
        question: q,
        document_title: doc?.title || 'Unknown Document',
        severity,
        reasons: q.review_reasons.length > 0 ? q.review_reasons : ['Low confidence extraction']
      };
    });
  }

  public associateDocuments(docId1: string, docId2: string): boolean {
    const doc1 = this.documents.get(docId1);
    const doc2 = this.documents.get(docId2);

    if (!doc1 || !doc2) return false;

    if (!doc1.related_document_ids.includes(docId2)) {
      doc1.related_document_ids.push(docId2);
    }
    if (!doc2.related_document_ids.includes(docId1)) {
      doc2.related_document_ids.push(docId1);
    }

    this.documents.set(docId1, doc1);
    this.documents.set(docId2, doc2);

    // Reconcile answers between associated documents if one has answers (e.g. answer key)
    const qDoc = (doc1.document_role === 'question_paper' || doc2.document_role === 'answer_key') ? doc1 : doc2;
    const keyDoc = qDoc.id === doc1.id ? doc2 : doc1;

    const keyQuestions = Array.from(this.questions.values()).filter((q) => q.document_id === keyDoc.id);
    const paperQuestions = Array.from(this.questions.values()).filter((q) => q.document_id === qDoc.id);

    if (keyQuestions.length > 0 && paperQuestions.length > 0) {
      for (const pQ of paperQuestions) {
        const match = keyQuestions.find((kQ) => kQ.question_number === pQ.question_number);
        if (match && match.answer) {
          pQ.answer = {
            key: match.answer.key,
            text: match.answer.text || match.answer.key,
            explanation: match.answer.explanation,
            source: 'separate_document',
            confidence: match.answer.confidence || 0.95
          };
          this.questions.set(pQ.id, pQ);
        }
      }
      this.recalculateDocumentStats(qDoc.id);
    }

    this.logAction('ASSOCIATE_DOCUMENTS', { docId1, docId2 });
    return true;
  }

  public getJob(jobId: string): ProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  public getJobByDocument(docId: string): ProcessingJob | undefined {
    for (const job of Array.from(this.jobs.values())) {
      if (job.document_id === docId) return job;
    }
    return undefined;
  }

  public saveJob(job: ProcessingJob): ProcessingJob {
    this.jobs.set(job.job_id, job);
    return job;
  }
}

export const db = new DatabaseStore();

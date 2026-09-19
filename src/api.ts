import {
  DocumentRecord,
  ExtractedQuestion,
  AnswerKeySummary,
  ReviewQueueItem
} from './types';

export const api = {
  async getDocuments(): Promise<DocumentRecord[]> {
    const res = await fetch('/api/documents');
    if (!res.ok) throw new Error('Failed to fetch documents');
    const data = await res.json();
    return data.documents || [];
  },

  async getDocument(id: string): Promise<{ document: DocumentRecord; job: any }> {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch document');
    return res.json();
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete document');
  },

  async getQuestions(
    docId: string,
    filters?: { needs_review?: boolean; min_confidence?: number; type?: string }
  ): Promise<ExtractedQuestion[]> {
    const params = new URLSearchParams();
    if (filters?.needs_review !== undefined) {
      params.set('needs_review', String(filters.needs_review));
    }
    if (filters?.min_confidence !== undefined) {
      params.set('min_confidence', String(filters.min_confidence));
    }
    if (filters?.type) {
      params.set('type', filters.type);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`/api/documents/${docId}/questions${query}`);
    if (!res.ok) throw new Error('Failed to fetch questions');
    const data = await res.json();
    return data.questions || [];
  },

  async getQuestion(id: string): Promise<{ question: ExtractedQuestion; document: any }> {
    const res = await fetch(`/api/questions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch question');
    return res.json();
  },

  async reviewQuestion(
    id: string,
    payload: {
      action: 'approve' | 'modify' | 'reject';
      notes?: string;
      corrected_answer?: string;
      corrected_question_text?: string;
    }
  ): Promise<ExtractedQuestion> {
    const res = await fetch(`/api/questions/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to submit review');
    const data = await res.json();
    return data.question;
  },

  async getAnswerKey(docId: string): Promise<AnswerKeySummary> {
    const res = await fetch(`/api/documents/${docId}/answer-key`);
    if (!res.ok) throw new Error('Failed to fetch answer key summary');
    return res.json();
  },

  async getReviewQueue(docId?: string): Promise<ReviewQueueItem[]> {
    const url = docId ? `/api/documents/${docId}/review-queue` : '/api/review-queue';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch review queue');
    const data = await res.json();
    return data.items || [];
  },

  async associateDocuments(docId1: string, docId2: string): Promise<void> {
    const res = await fetch(`/api/documents/${docId1}/associate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ related_document_id: docId2 })
    });
    if (!res.ok) throw new Error('Failed to associate documents');
  },

  async uploadDocument(
    file: File,
    title: string,
    documentRole: string,
    associateDocId?: string
  ): Promise<{ document_id: string; job_id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('document_role', documentRole);
    if (associateDocId) {
      formData.append('associate_with_document_id', associateDocId);
    }

    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to upload document');
    }

    return res.json();
  },

  async loadDemoScenario(scenarioId: string): Promise<void> {
    const res = await fetch(`/api/demo/load-scenario/${scenarioId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to load demo scenario');
  },

  async resetDemoData(): Promise<void> {
    const res = await fetch('/api/demo/seed', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
  },

  async getOpenApiSpec(): Promise<any> {
    const res = await fetch('/api/openapi.json');
    if (!res.ok) throw new Error('Failed to load OpenAPI spec');
    return res.json();
  },

  async getArchitectureDoc(): Promise<any> {
    const res = await fetch('/api/architecture');
    if (!res.ok) throw new Error('Failed to load architecture doc');
    return res.json();
  },

  async getAuditLogs(): Promise<any[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to load audit logs');
    const data = await res.json();
    return data.logs || [];
  }
};

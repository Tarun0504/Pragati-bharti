import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db } from './db';
import { jobQueue } from './jobQueue';
import { OPENAPI_SPEC, POSTMAN_COLLECTION } from './openapi';
import { ARCHITECTURE_DOCUMENTATION } from './architectureDoc';
import { DEMO_SCENARIOS } from './sampleDocs';
import { DocumentRecord } from '../src/types';

const router = Router();

// Configure multer for file uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    const fileName = (file.originalname || '').toLowerCase();
    const hasValidExt = fileName.endsWith('.pdf') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png');
    if (allowedMimes.includes(file.mimetype) || hasValidExt) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, JPG, PNG`));
    }
  }
});

// 1. Upload document (POST /api/documents/upload) -> returns 202 Accepted
router.post('/documents/upload', (req: Request, res: Response, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: 'Upload validation error',
        message: err.message
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: 'Missing file',
        message: 'A PDF or image file is required under the "file" form field.'
      });
    }

    const title = req.body.title || file.originalname.replace(/\.[^/.]+$/, '');
    const documentRole = req.body.document_role || 'composite';
    const associateWithDocId = req.body.associate_with_document_id;

    const fileType: DocumentRecord['file_type'] = file.mimetype === 'application/pdf'
      ? 'pdf'
      : file.mimetype === 'image/png'
      ? 'png'
      : 'jpeg';

    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newDoc: DocumentRecord = {
      id: documentId,
      title: String(title),
      filename: file.originalname,
      file_type: fileType,
      file_size: file.size,
      page_count: 1,
      status: 'queued',
      stage: 'queued',
      progress: 0,
      created_at: new Date().toISOString(),
      related_document_ids: associateWithDocId ? [associateWithDocId] : [],
      document_role: documentRole,
      total_questions_extracted: 0,
      high_confidence_count: 0,
      review_required_count: 0,
      warnings: [],
      is_demo: false
    };

    db.saveDocument(newDoc);

    if (associateWithDocId) {
      db.associateDocuments(documentId, associateWithDocId);
    }

    const job = jobQueue.enqueueDocument(newDoc, file.buffer, file.mimetype);

    return res.status(202).json({
      message: 'Document accepted for asynchronous processing',
      document_id: newDoc.id,
      job_id: job.job_id,
      status: 'queued',
      poll_url: `/api/documents/${newDoc.id}`,
      questions_url: `/api/documents/${newDoc.id}/questions`
    });
  });
});

// 2. List all documents (GET /api/documents)
router.get('/documents', (_req: Request, res: Response) => {
  const documents = db.getDocuments();
  res.json({
    count: documents.length,
    documents
  });
});

// 3. Get document details and processing status (GET /api/documents/:id)
router.get('/documents/:id', (req: Request, res: Response) => {
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const job = db.getJobByDocument(doc.id);

  res.json({
    document: doc,
    job: job || null,
    links: {
      questions: `/api/documents/${doc.id}/questions`,
      answer_key: `/api/documents/${doc.id}/answer-key`,
      review_queue: `/api/documents/${doc.id}/review-queue`
    }
  });
});

// 4. Delete document (DELETE /api/documents/:id)
router.delete('/documents/:id', (req: Request, res: Response) => {
  const success = db.deleteDocument(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json({ message: 'Document and extracted questions deleted successfully' });
});

// 5. Retrieve extracted questions (GET /api/documents/:id/questions)
router.get('/documents/:id/questions', (req: Request, res: Response) => {
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const needsReview = req.query.needs_review !== undefined
    ? req.query.needs_review === 'true'
    : undefined;

  const minConfidence = req.query.min_confidence
    ? parseFloat(String(req.query.min_confidence))
    : undefined;

  const type = req.query.type ? String(req.query.type) : undefined;
  const reviewerStatus = req.query.reviewer_status ? String(req.query.reviewer_status) : undefined;

  const questions = db.getQuestions(doc.id, {
    needs_review: needsReview,
    min_confidence: minConfidence,
    type,
    reviewer_status: reviewerStatus
  });

  res.json({
    document_id: doc.id,
    document_title: doc.title,
    total_count: questions.length,
    questions
  });
});

// 6. Retrieve individual question (GET /api/questions/:id)
router.get('/questions/:id', (req: Request, res: Response) => {
  const question = db.getQuestion(req.params.id);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const doc = db.getDocument(question.document_id);

  res.json({
    question,
    document: doc
      ? {
          id: doc.id,
          title: doc.title,
          filename: doc.filename,
          document_role: doc.document_role
        }
      : null
  });
});

// 7. Update question (PATCH /api/questions/:id)
router.patch('/questions/:id', (req: Request, res: Response) => {
  const question = db.getQuestion(req.params.id);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const updated = db.updateQuestion(req.params.id, req.body);
  res.json({ message: 'Question updated successfully', question: updated });
});

// 8. Human-in-the-loop review decision (POST /api/questions/:id/review)
router.post('/questions/:id/review', (req: Request, res: Response) => {
  const question = db.getQuestion(req.params.id);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const { action, notes, corrected_answer, corrected_question_text } = req.body;

  if (!['approve', 'modify', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action. Must be approve, modify, or reject.' });
  }

  const updates: Partial<typeof question> = {
    reviewer_status: action === 'approve' ? 'approved' : action === 'modify' ? 'modified' : 'rejected',
    reviewer_notes: notes || undefined,
    needs_review: false
  };

  if (corrected_answer) {
    updates.answer = {
      key: corrected_answer,
      text: question.answer?.text || corrected_answer,
      explanation: question.answer?.explanation,
      confidence: 1.0,
      source: 'inline_solution'
    };
  }

  if (corrected_question_text) {
    updates.question_text = corrected_question_text;
  }

  const updated = db.updateQuestion(req.params.id, updates);

  res.json({
    message: `Question marked as ${updates.reviewer_status}`,
    question: updated
  });
});

// 9. Retrieve answer key information (GET /api/documents/:id/answer-key)
router.get('/documents/:id/answer-key', (req: Request, res: Response) => {
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const summary = db.getAnswerKeySummary(doc.id);
  res.json(summary);
});

// 10. Retrieve extraction warnings and review queue (GET /api/documents/:id/review-queue)
router.get('/documents/:id/review-queue', (req: Request, res: Response) => {
  const doc = db.getDocument(req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const items = db.getReviewQueue(doc.id);
  res.json({
    document_id: doc.id,
    review_count: items.length,
    items
  });
});

// Global Review Queue
router.get('/review-queue', (_req: Request, res: Response) => {
  const items = db.getReviewQueue();
  res.json({
    total_review_items: items.length,
    items
  });
});

// 11. Associate related documents (POST /api/documents/:id/associate)
router.post('/documents/:id/associate', (req: Request, res: Response) => {
  const docId1 = req.params.id;
  const { related_document_id } = req.body;

  if (!related_document_id) {
    return res.status(400).json({ error: 'Missing related_document_id in body' });
  }

  const success = db.associateDocuments(docId1, related_document_id);
  if (!success) {
    return res.status(404).json({ error: 'One or both documents could not be found' });
  }

  const doc1 = db.getDocument(docId1);
  const doc2 = db.getDocument(related_document_id);

  res.json({
    message: 'Documents associated successfully',
    document_1: doc1,
    document_2: doc2
  });
});

// 12. Load Demonstration Scenarios (POST /api/demo/load-scenario/:id)
router.post('/demo/load-scenario/:id', (req: Request, res: Response) => {
  const scenario = DEMO_SCENARIOS.find((s) => s.id === req.params.id);
  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }

  // Add document and its questions to the database
  const newDocId = `doc-${Date.now()}`;
  db.saveDocument({ ...scenario.document, id: newDocId });

  for (const q of scenario.questions) {
    db.saveQuestion({
      ...q,
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      document_id: newDocId
    });
  }

  if (scenario.associatedDoc) {
    const assocDocId = `doc-assoc-${Date.now()}`;
    db.saveDocument({ ...scenario.associatedDoc.document, id: assocDocId });
    db.associateDocuments(newDocId, assocDocId);
  }

  res.json({
    message: `Demonstration scenario "${scenario.name}" loaded successfully`,
    scenario_id: scenario.id,
    created_document_id: newDocId
  });
});

// Seed/Reset database to default demo data
router.post('/demo/seed', (_req: Request, res: Response) => {
  db.seedDemoData();
  res.json({
    message: 'Database reset to default 6 demonstration scenarios',
    documents_count: db.getDocuments().length
  });
});

// 13. OpenAPI 3.0 specification endpoint (GET /api/openapi.json)
router.get('/openapi.json', (_req: Request, res: Response) => {
  res.json(OPENAPI_SPEC);
});

// 14. Postman collection export (GET /api/export/postman)
router.get('/export/postman', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="Pragati_DocIntel_Postman_Collection.json"');
  res.send(JSON.stringify(POSTMAN_COLLECTION, null, 2));
});

// 15. Architecture documentation (GET /api/architecture)
router.get('/architecture', (_req: Request, res: Response) => {
  res.json(ARCHITECTURE_DOCUMENTATION);
});

// 16. Audit Logs
router.get('/audit-logs', (_req: Request, res: Response) => {
  res.json({
    logs: db.getAuditLogs()
  });
});

export default router;

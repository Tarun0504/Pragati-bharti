import { db } from './db';
import { extractQuestionsFromDocument } from './aiExtractor';
import { ProcessingJob, ProcessingStage, DocumentRecord } from '../src/types';

class JobQueue {
  private activeJobs: Map<string, NodeJS.Timeout> = new Map();

  public enqueueDocument(
    document: DocumentRecord,
    fileBuffer: Buffer,
    mimeType: string
  ): ProcessingJob {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const job: ProcessingJob = {
      job_id: jobId,
      document_id: document.id,
      status: 'queued',
      current_stage: 'queued',
      progress: 5,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.saveJob(job);
    db.logAction('ENQUEUE_JOB', { job_id: jobId, document_id: document.id });

    // Process asynchronously in background
    this.processAsync(job, document, fileBuffer, mimeType);

    return job;
  }

  private async processAsync(
    job: ProcessingJob,
    doc: DocumentRecord,
    fileBuffer: Buffer,
    mimeType: string
  ) {
    const startTime = Date.now();

    const updateStage = async (
      stage: ProcessingStage,
      progress: number,
      delayMs: number
    ) => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      // Guard against saving after deletion
      if (!db.getDocument(doc.id)) {
        return false;
      }
      job.current_stage = stage;
      job.progress = progress;
      job.status = 'processing';
      job.updated_at = new Date().toISOString();
      db.saveJob(job);

      doc.stage = stage;
      doc.progress = progress;
      doc.status = 'processing';
      db.saveDocument(doc);
      return true;
    };

    try {
      // Stage 1: Layout Analysis
      const cont1 = await updateStage('layout_analysis', 25, 400);
      if (!cont1) return;

      // Stage 2: OCR & Multimodal extraction
      const cont2 = await updateStage('ocr_extraction', 60, 600);
      if (!cont2) return;

      const extractionResult = await extractQuestionsFromDocument(
        fileBuffer,
        mimeType,
        doc.filename,
        doc.id
      );

      // Guard if document deleted during extraction
      if (!db.getDocument(doc.id)) {
        return;
      }

      // Stage 3: Answer Key Matching
      const cont3 = await updateStage('answer_matching', 85, 400);
      if (!cont3) return;

      // Check if document has associated document with answer key
      if (doc.related_document_ids && doc.related_document_ids.length > 0) {
        for (const relatedId of doc.related_document_ids) {
          const relatedDoc = db.getDocument(relatedId);
          if (relatedDoc && relatedDoc.document_role === 'answer_key') {
            // Check if any answers can be linked
            extractionResult.warnings.push(
              `Cross-referenced with associated answer key document: ${relatedDoc.filename}`
            );
          }
        }
      }

      // Stage 4: Confidence Scoring & Validation
      const cont4 = await updateStage('confidence_scoring', 95, 300);
      if (!cont4) return;

      if (!db.getDocument(doc.id)) {
        return;
      }

      // Save questions into database
      for (const q of extractionResult.questions) {
        db.saveQuestion(q);
      }

      // Finalize document
      const totalQuestions = extractionResult.questions.length;
      const reviewRequired = extractionResult.questions.filter((q) => q.needs_review).length;
      const highConfidence = extractionResult.questions.filter((q) => q.confidence >= 0.85).length;
      const hasFatalExtractionError = totalQuestions === 0 && extractionResult.warnings.some((w) => w.includes('Extraction failed') || w.includes('API key'));

      doc.stage = 'finalized';
      doc.progress = 100;
      doc.page_count = extractionResult.page_count || doc.page_count;
      doc.status = hasFatalExtractionError ? 'failed' : reviewRequired > 0 ? 'requires_review' : 'completed';
      doc.completed_at = new Date().toISOString();
      doc.processing_time_ms = Date.now() - startTime;
      doc.total_questions_extracted = totalQuestions;
      doc.high_confidence_count = highConfidence;
      doc.review_required_count = reviewRequired;
      doc.warnings = [...doc.warnings, ...extractionResult.warnings];

      if (!db.getDocument(doc.id)) {
        return;
      }
      db.saveDocument(doc);

      job.current_stage = 'finalized';
      job.progress = 100;
      job.status = 'completed';
      job.updated_at = new Date().toISOString();
      db.saveJob(job);

      db.logAction('JOB_COMPLETED', {
        job_id: job.job_id,
        document_id: doc.id,
        questions_count: totalQuestions,
        review_count: reviewRequired
      });
    } catch (err: any) {
      console.error('Processing job error:', err);
      job.status = 'failed';
      job.error = err.message || 'Extraction failed';
      job.updated_at = new Date().toISOString();
      db.saveJob(job);

      doc.status = 'failed';
      doc.warnings.push(`Error during processing: ${err.message}`);
      db.saveDocument(doc);

      db.logAction('JOB_FAILED', { job_id: job.job_id, error: err.message });
    }
  }
}

export const jobQueue = new JobQueue();

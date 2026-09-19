export const ARCHITECTURE_DOCUMENTATION = {
  service_name: 'Pragati Bharti Document Intelligence & Question Extraction Service',
  version: '1.0.0',
  sections: [
    {
      title: '1. Overall System Architecture',
      content: `The system is architected as a modular, asynchronous Document Understanding Pipeline. The ingestion layer receives PDF documents or images (JPEG/PNG), performs strict file-header magic number verification and size constraint checks, persists metadata, and returns an immediate HTTP 202 Accepted with a trackable Job ID and polling URL.
An asynchronous worker pool (simulating Celery / Redis queue) consumes tasks, running multi-stage extraction: Layout Analysis -> Multimodal OCR & Semantic Extraction -> Answer Key Association -> Confidence & Risk Scoring -> Human Review Routing.`
    },
    {
      title: '2. Document Processing & Ingestion Approach',
      content: `Documents arrive as digital vector PDFs, scanned image PDFs, or single/multi-page raster photos. The ingestion pipeline does not depend on a single fixed document layout or presence of a selectable text layer. It accepts raw binary buffers, identifies multi-page documents, and maintains strict coordinate/page mapping for every extracted element to preserve traceability.`
    },
    {
      title: '3. OCR & AI Technology Choices',
      content: `We chose Google Gemini Multimodal Flash (gemini-3.8-flash) as the primary document extraction engine. Traditional pipeline approaches (Tesseract OCR + heuristic regexes) fail catastrophically on complex layouts, skewed scans, tables, and questions spanning page breaks. Gemini natively accepts PDF bytes and high-res image buffers directly, performing simultaneous visual text extraction, layout comprehension, diagram description, and LaTeX math notation reconstruction in a single pass.`
    },
    {
      title: '4. Storage Design & Database Schema',
      content: `For persistence, the system schema models:
- documents: id (UUID), title, filename, file_type, file_size, page_count, status (queued, processing, completed, requires_review, failed), document_role (question_paper, answer_key, composite), related_document_ids (UUID array), created_at, completed_at, processing_time_ms.
- questions: id (UUID), document_id (FK), question_number, question_text, question_type (MCQ, multi-select, true_false, numerical, descriptive), options (JSONB), answer (JSONB with key, text, source, confidence), source_pages (INT[]), confidence (DECIMAL), needs_review (BOOLEAN), review_reasons (TEXT[]), has_diagram_or_table (BOOLEAN), reviewer_status (ENUM).
- processing_jobs: job_id, document_id, status, current_stage, progress, error, started_at, updated_at.
- audit_logs: id, timestamp, action, actor_id, details (JSONB).`
    },
    {
      title: '5. Asynchronous Processing & Queue Design',
      content: `Document extraction is compute and I/O intensive. Blocking HTTP requests would lead to gateway timeouts on 10-page test papers. Therefore, the upload endpoint enqueues a job in a Redis-backed queue and returns HTTP 202. The client or downstream LMS periodically polls GET /api/documents/:id or subscribes to webhook events. The worker transitions through clear state-machine stages: layout_analysis -> ocr_extraction -> answer_matching -> confidence_scoring -> finalized.`
    },
    {
      title: '6. Question Extraction Strategy & Page Boundary Handling',
      content: `Questions frequently start at the foot of one page and terminate on the top of the next. The multimodal parser receives full document context with explicit multi-page markers. The system instructs the model to track question continuum across boundaries, stitching questions into single logical records while preserving source_pages: [1, 2] in metadata.`
    },
    {
      title: '7. Answer-Key Association',
      content: `The system handles 4 distinct answer-key topologies:
1. End-of-document key: Answer table or summary block placed on final pages.
2. Beginning-of-document / inline solutions: Solutions immediately below questions.
3. Inferred answers: AI derives answers when no key is present (flagged with lower confidence).
4. Separate external documents (Section 8): A Question Paper and separate Answer Key PDF are paired via the /api/documents/:id/associate endpoint or batch upload. The engine parses the external key and maps answers to question IDs by numbering.`
    },
    {
      title: '8. Confidence & Human-in-the-Loop Review Mechanism',
      content: `Every question receives a composite confidence score (0.0 to 1.0) factoring in:
- OCR character clarity and scan noise
- Option set completeness (e.g. missing option D drops confidence)
- Ambiguity in question numbering
- Answer key source reliability
Items with confidence < 0.80 or explicit anomalies are automatically routed to the Review Queue with actionable review reasons. Reviewers can approve, edit, or reject questions via PATCH /api/questions/:id or POST /api/questions/:id/review.`
    },
    {
      title: '9. Security & File Handling Considerations',
      content: `1. MIME-type & magic byte validation prevents file-extension spoofing.
2. Size limit enforcement (capped at 25MB).
3. Secure ephemeral storage with automated cleanup.
4. Environment-based configuration (secrets in environment variables, never committed).
5. Sanitization of extracted text against injection attacks.`
    },
    {
      title: '10. Scalability Considerations & Production Readiness',
      content: `1. Horizontal Worker Scaling: Multiple stateless extraction worker containers can consume from the central Redis queue.
2. Cloud Storage: Raw PDFs/images stored in Google Cloud Storage / S3 with signed short-lived URLs.
3. Read Replicas: PostgreSQL read replicas for fast querying of question banks by downstream examination systems.
4. Caching: Redis caches question responses for finalized documents.`
    }
  ]
};

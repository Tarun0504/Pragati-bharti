export type DocumentRole = 'question_paper' | 'answer_key' | 'composite';

export type DocumentProcessingStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'requires_review'
  | 'failed';

export type ProcessingStage =
  | 'queued'
  | 'layout_analysis'
  | 'ocr_extraction'
  | 'answer_matching'
  | 'confidence_scoring'
  | 'finalized';

export type QuestionType =
  | 'multiple_choice'
  | 'multi_select'
  | 'true_false'
  | 'numerical'
  | 'descriptive';

export type ReviewerStatus = 'pending' | 'approved' | 'modified' | 'rejected';

export interface QuestionOption {
  key: string;
  text: string;
}

export interface AssociatedAnswer {
  key?: string;
  text?: string;
  explanation?: string;
  source: 'embedded_key' | 'separate_document' | 'inline_solution' | 'inferred' | 'unmatched';
  confidence: number;
}

export interface ExtractedQuestion {
  id: string;
  document_id: string;
  question_number: string;
  question_text: string;
  question_type: QuestionType;
  options: QuestionOption[];
  answer: AssociatedAnswer | null;
  source_pages: number[];
  confidence: number; // 0.0 to 1.0
  needs_review: boolean;
  review_reasons: string[];
  has_diagram_or_table: boolean;
  diagram_description?: string;
  reviewer_status: ReviewerStatus;
  reviewer_notes?: string;
  extracted_at: string;
  raw_extracted_snippet?: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  filename: string;
  file_type: 'pdf' | 'jpeg' | 'png' | 'scanned_pdf';
  file_size: number;
  page_count: number;
  status: DocumentProcessingStatus;
  stage: ProcessingStage;
  progress: number; // 0 to 100
  created_at: string;
  completed_at?: string;
  processing_time_ms?: number;
  related_document_ids: string[];
  document_role: DocumentRole;
  total_questions_extracted: number;
  high_confidence_count: number;
  review_required_count: number;
  warnings: string[];
  is_demo?: boolean;
  sample_tag?: string;
}

export interface ProcessingJob {
  job_id: string;
  document_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  current_stage: ProcessingStage;
  progress: number;
  error?: string;
  started_at: string;
  updated_at: string;
}

export interface AnswerKeySummary {
  document_id: string;
  associated_document_id?: string;
  total_questions: number;
  matched_count: number;
  uncertain_count: number;
  unmatched_count: number;
  source_type: 'embedded' | 'linked_document' | 'inline' | 'none';
  keys: Array<{
    question_number: string;
    answer_key: string;
    explanation?: string;
    confidence: number;
    source: string;
    status: 'matched' | 'uncertain' | 'unmatched';
  }>;
}

export interface ReviewQueueItem {
  question: ExtractedQuestion;
  document_title: string;
  severity: 'high' | 'medium' | 'low';
  reasons: string[];
}

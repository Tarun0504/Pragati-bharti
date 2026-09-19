import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedQuestion, QuestionType } from '../src/types';
import crypto from 'crypto';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export interface ExtractionResult {
  questions: ExtractedQuestion[];
  warnings: string[];
  page_count: number;
  has_answer_key: boolean;
}

export async function extractQuestionsFromDocument(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string,
  documentId: string
): Promise<ExtractionResult> {
  const ai = getAIClient();

  if (ai) {
    try {
      const base64Data = fileBuffer.toString('base64');
      const prompt = `You are a high-accuracy Document Intelligence & Question Extraction Engine for the Pragati Bharti examination system.
Analyze the attached document (${fileName}, MIME: ${mimeType}).

Your mission:
1. Carefully inspect the attached document and extract EVERY ACTUAL question written on it.
   - Do NOT invent, assume, or hallucinate questions that are not present in the document.
   - Read the exact wording from the document pages.
   - For each question:
     * question_number: Exactly as labeled in the paper (e.g. "1", "12(a)", "Q3", or "1" if sequential unnumbered)
     * question_text: Complete, exact text. Join multi-line or split sentences faithfully.
     * question_type: Choose "multiple_choice", "multi_select", "true_false", "numerical", or "descriptive".
     * options: Array of { "key": "A", "text": "..." }. Empty array if numerical or descriptive.
     * answer: Object with { "key": "A", "text": "...", "explanation": "...", "source": "embedded_key" | "inline_solution" | "inferred", "confidence": float between 0.0 and 1.0 }, or null if no solution/key is found in the document.
     * source_pages: Array of page numbers where this question is found (e.g. [1]).
     * confidence: Number between 0.0 and 1.0 reflecting OCR clarity and legibility.
     * needs_review: true if the question text or options are smudged, torn, partial, or unclear; otherwise false.
     * review_reasons: Array of strings explaining why human review is required (if needs_review is true).
     * has_diagram_or_table: true if a chart, schematic, table, or diagram accompanies the question.
     * diagram_description: Brief description of the visual element if present.
2. If this document is purely an Answer Key (e.g. table of answers), extract each item as a question reference with its corresponding answer key.
3. If no clear questions are found on the document, return an empty questions array and a warning explaining what was observed.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType
                }
              },
              {
                text: prompt
              }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              page_count: { type: Type.INTEGER, description: 'Total pages detected in the document' },
              has_answer_key: { type: Type.BOOLEAN, description: 'Whether an answer key or solution list is present' },
              warnings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Observations such as scan blur, skew, or missing pages'
              },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question_number: { type: Type.STRING },
                    question_text: { type: Type.STRING },
                    question_type: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          key: { type: Type.STRING },
                          text: { type: Type.STRING }
                        },
                        required: ['key', 'text']
                      }
                    },
                    answer: {
                      type: Type.OBJECT,
                      properties: {
                        key: { type: Type.STRING },
                        text: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        source: { type: Type.STRING },
                        confidence: { type: Type.NUMBER }
                      }
                    },
                    source_pages: {
                      type: Type.ARRAY,
                      items: { type: Type.INTEGER }
                    },
                    confidence: { type: Type.NUMBER },
                    needs_review: { type: Type.BOOLEAN },
                    review_reasons: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    has_diagram_or_table: { type: Type.BOOLEAN },
                    diagram_description: { type: Type.STRING }
                  },
                  required: ['question_number', 'question_text', 'question_type']
                }
              }
            },
            required: ['page_count', 'has_answer_key', 'questions']
          }
        }
      });

      const responseText = response.text || '';
      let cleanJson = responseText.trim();
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanJson = jsonMatch[1].trim();
      } else {
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanJson = responseText.substring(firstBrace, lastBrace + 1).trim();
        }
      }
      const parsed = JSON.parse(cleanJson);

      const questions: ExtractedQuestion[] = (parsed.questions || []).map((q: any, idx: number) => ({
        id: `q-ext-${Date.now()}-${idx + 1}-${crypto.randomBytes(3).toString('hex')}`,
        document_id: documentId,
        question_number: String(q.question_number || idx + 1),
        question_text: String(q.question_text || ''),
        question_type: (['multiple_choice', 'multi_select', 'true_false', 'numerical', 'descriptive'].includes(q.question_type)
          ? q.question_type
          : 'multiple_choice') as QuestionType,
        options: Array.isArray(q.options) ? q.options : [],
        answer: q.answer
          ? {
              key: q.answer.key,
              text: q.answer.text,
              explanation: q.answer.explanation,
              source: q.answer.source || 'embedded_key',
              confidence: Number(q.answer.confidence || 0.8)
            }
          : null,
        source_pages: Array.isArray(q.source_pages) && q.source_pages.length > 0 ? q.source_pages : [1],
        confidence: Number(q.confidence !== undefined ? q.confidence : 0.85),
        needs_review: Boolean(q.needs_review || (q.confidence !== undefined && q.confidence < 0.75)),
        review_reasons: Array.isArray(q.review_reasons) ? q.review_reasons : [],
        has_diagram_or_table: Boolean(q.has_diagram_or_table),
        diagram_description: q.diagram_description || undefined,
        reviewer_status: 'pending',
        extracted_at: new Date().toISOString(),
        raw_extracted_snippet: q.question_text?.substring(0, 100)
      }));

      return {
        questions,
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        page_count: Number(parsed.page_count || 1),
        has_answer_key: Boolean(parsed.has_answer_key)
      };
    } catch (err: any) {
      console.error('Gemini multimodal extraction error:', err.message, err.stack);
      let userFriendlyMessage = err.message || 'Unknown error';
      try {
        const parsedErr = JSON.parse(err.message);
        if (parsedErr?.error?.message) {
          userFriendlyMessage = parsedErr.error.message;
        }
      } catch {
        // use raw message
      }

      return {
        questions: [],
        warnings: [
          `AI Document Extraction failed: ${userFriendlyMessage}. Please verify that the API key configured in Settings > Secrets has Generative Language API access enabled.`
        ],
        page_count: 1,
        has_answer_key: false
      };
    }
  }

  // When API key is not configured, inform the user clearly rather than hallucinating dummy physics questions
  return {
    questions: [],
    warnings: [
      'Gemini API key is not configured or unavailable in this environment. Please configure GEMINI_API_KEY in the Secrets panel to enable AI reading of questions from documents.'
    ],
    page_count: 1,
    has_answer_key: false
  };
}

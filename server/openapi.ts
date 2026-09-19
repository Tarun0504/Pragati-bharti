export const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'Pragati Bharti Document Intelligence & Question Extraction Service',
    description:
      'RESTful API for asynchronous extraction of structured examination questions from digital/scanned PDFs and images, with multimodal AI OCR, cross-document answer key association, and confidence verification.',
    version: '1.0.0',
    contact: {
      name: 'Pragati Bharti Engineering',
      email: 'engineering@pragatibharti.org'
    }
  },
  servers: [
    {
      url: '/api',
      description: 'Pragati Bharti API Server'
    }
  ],
  paths: {
    '/documents/upload': {
      post: {
        summary: 'Upload document for asynchronous question extraction',
        description:
          'Accepts multipart/form-data with a PDF or image file (JPG/JPEG, PNG). Enqueues an asynchronous extraction job and returns HTTP 202 with job tracking status.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'PDF or image file (max 25MB)'
                  },
                  title: {
                    type: 'string',
                    description: 'Descriptive title for the document'
                  },
                  document_role: {
                    type: 'string',
                    enum: ['question_paper', 'answer_key', 'composite'],
                    default: 'composite'
                  },
                  associate_with_document_id: {
                    type: 'string',
                    description: 'Optional ID of an existing related document (e.g. Answer Key)'
                  }
                },
                required: ['file']
              }
            }
          }
        },
        responses: {
          '202': {
            description: 'Document accepted for asynchronous extraction',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    document_id: { type: 'string' },
                    job_id: { type: 'string' },
                    status: { type: 'string', example: 'queued' },
                    poll_url: { type: 'string', example: '/api/documents/doc-123' },
                    questions_url: { type: 'string', example: '/api/documents/doc-123/questions' }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid file format or missing file' },
          '413': { description: 'Payload too large (exceeds size limit)' }
        }
      }
    },
    '/documents': {
      get: {
        summary: 'List all processed documents',
        description: 'Retrieves all document records, status, and extraction summary metrics.',
        responses: {
          '200': {
            description: 'Array of document summaries'
          }
        }
      }
    },
    '/documents/{id}': {
      get: {
        summary: 'Get document details and processing status',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': { description: 'Document record details' },
          '404': { description: 'Document not found' }
        }
      },
      delete: {
        summary: 'Delete document and associated extracted questions',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': { description: 'Document deleted successfully' }
        }
      }
    },
    '/documents/{id}/questions': {
      get: {
        summary: 'Retrieve extracted questions for a document',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'needs_review', in: 'query', schema: { type: 'boolean' } },
          { name: 'min_confidence', in: 'query', schema: { type: 'number' } },
          { name: 'type', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'List of structured questions' }
        }
      }
    },
    '/questions/{id}': {
      get: {
        summary: 'Retrieve individual question details with source audit',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Extracted question detail' }
        }
      },
      patch: {
        summary: 'Update or correct an extracted question',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  question_text: { type: 'string' },
                  question_number: { type: 'string' },
                  options: { type: 'array' },
                  answer: { type: 'object' },
                  reviewer_status: { type: 'string', enum: ['pending', 'approved', 'modified', 'rejected'] }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Updated question object' }
        }
      }
    },
    '/documents/{id}/answer-key': {
      get: {
        summary: 'Retrieve associated answer-key information',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Answer key matching summary and associations' }
        }
      }
    },
    '/documents/{id}/review-queue': {
      get: {
        summary: 'Retrieve extraction warnings and low-confidence review items',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          '200': { description: 'Items needing human review with severity and reasons' }
        }
      }
    },
    '/documents/{id}/associate': {
      post: {
        summary: 'Link related documents (e.g. Question Paper with Answer Key)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  related_document_id: { type: 'string' }
                },
                required: ['related_document_id']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Relationship established successfully' }
        }
      }
    },
    '/questions/{id}/review': {
      post: {
        summary: 'Human-in-the-loop review decision (Approve/Modify/Reject)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  action: { type: 'string', enum: ['approve', 'reject', 'modify'] },
                  notes: { type: 'string' },
                  corrected_answer: { type: 'string' }
                },
                required: ['action']
              }
            }
          }
        },
        responses: {
          '200': { description: 'Review status recorded' }
        }
      }
    }
  }
};

export const POSTMAN_COLLECTION = {
  info: {
    _postman_id: 'docintel-pragati-bharti',
    name: 'Pragati Bharti DocIntel Question Extraction Service API',
    description: 'Postman collection covering the full Document Processing & Question Extraction lifecycle.',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: [
    {
      name: '1. Documents - List All Documents',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{base_url}}/api/documents',
          host: ['{{base_url}}'],
          path: ['api', 'documents']
        }
      }
    },
    {
      name: '2. Documents - Upload New Document (Async 202)',
      request: {
        method: 'POST',
        header: [],
        body: {
          mode: 'formdata',
          formdata: [
            { key: 'file', type: 'file', src: 'exam_sample.pdf' },
            { key: 'title', value: 'Physics Midterm 2025', type: 'text' },
            { key: 'document_role', value: 'composite', type: 'text' }
          ]
        },
        url: {
          raw: '{{base_url}}/api/documents/upload',
          host: ['{{base_url}}'],
          path: ['api', 'documents', 'upload']
        }
      }
    },
    {
      name: '3. Documents - Get Processing Status',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{base_url}}/api/documents/doc-physics-101',
          host: ['{{base_url}}'],
          path: ['api', 'documents', 'doc-physics-101']
        }
      }
    },
    {
      name: '4. Questions - Retrieve Extracted Questions',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{base_url}}/api/documents/doc-physics-101/questions',
          host: ['{{base_url}}'],
          path: ['api', 'documents', 'doc-physics-101', 'questions']
        }
      }
    },
    {
      name: '5. Questions - Get Individual Question by ID',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{base_url}}/api/questions/q-phy-1',
          host: ['{{base_url}}'],
          path: ['api', 'questions', 'q-phy-1']
        }
      }
    },
    {
      name: '6. Answer Key - Retrieve Associated Key Details',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{base_url}}/api/documents/doc-neet-qp-01/answer-key',
          host: ['{{base_url}}'],
          path: ['api', 'documents', 'doc-neet-qp-01', 'answer-key']
        }
      }
    },
    {
      name: '7. Review Queue - Retrieve Low-Confidence Warnings',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{base_url}}/api/documents/doc-scanned-upsc-88/review-queue',
          host: ['{{base_url}}'],
          path: ['api', 'documents', 'doc-scanned-upsc-88', 'review-queue']
        }
      }
    },
    {
      name: '8. Association - Link Question Paper to Answer Key',
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify({ related_document_id: 'doc-neet-ak-02' }, null, 2)
        },
        url: {
          raw: '{{base_url}}/api/documents/doc-neet-qp-01/associate',
          host: ['{{base_url}}'],
          path: ['api', 'documents', 'doc-neet-qp-01', 'associate']
        }
      }
    },
    {
      name: '9. Human Review - Approve / Correct Question',
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify(
            {
              action: 'approve',
              notes: 'Verified against physical marking scheme.',
              corrected_answer: 'B'
            },
            null,
            2
          )
        },
        url: {
          raw: '{{base_url}}/api/questions/q-scan-2/review',
          host: ['{{base_url}}'],
          path: ['api', 'questions', 'q-scan-2', 'review']
        }
      }
    }
  ]
};

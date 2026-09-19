import { DocumentRecord, ExtractedQuestion } from '../src/types';

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  category: string;
  file_type: 'pdf' | 'jpeg' | 'png' | 'scanned_pdf';
  document: DocumentRecord;
  questions: ExtractedQuestion[];
  associatedDoc?: {
    document: DocumentRecord;
    questions: ExtractedQuestion[];
  };
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'demo-clean-pdf',
    name: '1. Clean Digital PDF (Physics Examination)',
    description: 'Digitally rendered PDF with clear 4-option MCQs and embedded answer key table on page 3.',
    category: 'Clean PDF',
    file_type: 'pdf',
    document: {
      id: 'doc-physics-101',
      title: 'CBSE Grade 12 Physics Term Examination 2025',
      filename: 'Physics_Grade12_TermExam_Clean.pdf',
      file_type: 'pdf',
      file_size: 482910,
      page_count: 3,
      status: 'completed',
      stage: 'finalized',
      progress: 100,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 2 + 3400).toISOString(),
      processing_time_ms: 3420,
      related_document_ids: [],
      document_role: 'composite',
      total_questions_extracted: 4,
      high_confidence_count: 4,
      review_required_count: 0,
      warnings: [],
      is_demo: true,
      sample_tag: 'clean_pdf'
    },
    questions: [
      {
        id: 'q-phy-1',
        document_id: 'doc-physics-101',
        question_number: '1',
        question_text: 'Two point charges +3 µC and -3 µC are placed at distance d apart in air. The electric dipole moment of this configuration is directed:',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: 'From +3 µC to -3 µC' },
          { key: 'B', text: 'From -3 µC to +3 µC' },
          { key: 'C', text: 'Perpendicular to the line joining charges' },
          { key: 'D', text: 'Radially outward in all directions' }
        ],
        answer: {
          key: 'B',
          text: 'From -3 µC to +3 µC',
          explanation: 'By convention, the electric dipole moment vector points from the negative charge to the positive charge.',
          source: 'embedded_key',
          confidence: 0.98
        },
        source_pages: [1],
        confidence: 0.97,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: false,
        reviewer_status: 'approved',
        extracted_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        raw_extracted_snippet: 'Q1. Two point charges +3 µC and -3 µC are placed at distance d apart in air. The electric dipole moment...'
      },
      {
        id: 'q-phy-2',
        document_id: 'doc-physics-101',
        question_number: '2',
        question_text: 'The magnetic flux linked with a coil of resistance 10 Ω varies as Φ = 6t² - 5t + 1. The induced current at t = 0.25 s is:',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: '0.2 A' },
          { key: 'B', text: '0.4 A' },
          { key: 'C', text: '0.6 A' },
          { key: 'D', text: '0.8 A' }
        ],
        answer: {
          key: 'A',
          text: '0.2 A',
          explanation: 'Induced EMF e = -dΦ/dt = -(12t - 5). At t = 0.25s, |e| = |12(0.25) - 5| = |-2| = 2V. Current I = e/R = 2/10 = 0.2 A.',
          source: 'embedded_key',
          confidence: 0.96
        },
        source_pages: [1],
        confidence: 0.95,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: false,
        reviewer_status: 'approved',
        extracted_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'q-phy-3',
        document_id: 'doc-physics-101',
        question_number: '3',
        question_text: 'In Young\'s double slit experiment, if the distance between the slits is halved and the distance between the slits and screen is doubled, the fringe width will:',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: 'Remain unchanged' },
          { key: 'B', text: 'Become half' },
          { key: 'C', text: 'Become four times' },
          { key: 'D', text: 'Become double' }
        ],
        answer: {
          key: 'C',
          text: 'Become four times',
          explanation: 'Fringe width β = λD/d. If D becomes 2D and d becomes d/2, β\' = λ(2D)/(d/2) = 4β.',
          source: 'embedded_key',
          confidence: 0.99
        },
        source_pages: [2],
        confidence: 0.98,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: false,
        reviewer_status: 'approved',
        extracted_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'q-phy-4',
        document_id: 'doc-physics-101',
        question_number: '4',
        question_text: 'Which semiconductor device operates in reverse bias condition under normal circuit operation?',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: 'Light Emitting Diode (LED)' },
          { key: 'B', text: 'Photodiode' },
          { key: 'C', text: 'Solar Cell' },
          { key: 'D', text: 'Standard Rectifier Diode' }
        ],
        answer: {
          key: 'B',
          text: 'Photodiode',
          explanation: 'A photodiode is operated under reverse bias to detect optical signals with higher fractional change in reverse saturation current.',
          source: 'embedded_key',
          confidence: 0.94
        },
        source_pages: [2],
        confidence: 0.93,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: false,
        reviewer_status: 'approved',
        extracted_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  },
  {
    id: 'demo-scanned-lowres',
    name: '2. Scanned / Low-Quality Document (OCR Challenges)',
    description: 'Imperfect scanned document with slight skew, noisy background, missing question label, and faint typography.',
    category: 'Scanned / Low-Res',
    file_type: 'scanned_pdf',
    document: {
      id: 'doc-scanned-upsc-88',
      title: 'General Studies Paper II (Old Scan - Skewed 4.2° & Noise)',
      filename: 'Scanned_Exam_Page_LowRes.pdf',
      file_type: 'scanned_pdf',
      file_size: 1845120,
      page_count: 2,
      status: 'requires_review',
      stage: 'finalized',
      progress: 100,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      completed_at: new Date(Date.now() - 1800000 + 4900).toISOString(),
      processing_time_ms: 4920,
      related_document_ids: [],
      document_role: 'question_paper',
      total_questions_extracted: 3,
      high_confidence_count: 1,
      review_required_count: 2,
      warnings: [
        'Document scan has low contrast and high noise levels in quadrant 2',
        'Question 2 missing standard option tag [D] in original scan',
        'Question 3 has ambiguous numerical subscript due to ink blot'
      ],
      is_demo: true,
      sample_tag: 'scanned_low_quality'
    },
    questions: [
      {
        id: 'q-scan-1',
        document_id: 'doc-scanned-upsc-88',
        question_number: '14',
        question_text: 'Under the Indian Constitution, the power to issue writs for the enforcement of Fundamental Rights is conferred upon:',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: 'Supreme Court only under Article 32' },
          { key: 'B', text: 'High Courts only under Article 226' },
          { key: 'C', text: 'Both Supreme Court and High Courts' },
          { key: 'D', text: 'District Courts upon state governor sanction' }
        ],
        answer: {
          key: 'C',
          text: 'Both Supreme Court and High Courts',
          explanation: 'Article 32 gives Supreme Court original jurisdiction and Article 226 empowers High Courts to issue writs.',
          source: 'inferred',
          confidence: 0.88
        },
        source_pages: [1],
        confidence: 0.85,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: false,
        reviewer_status: 'pending',
        extracted_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'q-scan-2',
        document_id: 'doc-scanned-upsc-88',
        question_number: '15',
        question_text: 'Which among the following wetlands of India is designated as a Montreux Record site? [Warning: Option D damaged on physical scan edge]',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: 'Chilika Lake (Odisha)' },
          { key: 'B', text: 'Keoladeo National Park (Rajasthan)' },
          { key: 'C', text: 'Wular Lake (Jammu & Kashmir)' },
          { key: 'D', text: '[Uncertain text due to scan border tear: "...Sunderbans / Loktak..."]' }
        ],
        answer: {
          key: 'B',
          text: 'Keoladeo National Park (Rajasthan)',
          explanation: 'Loktak Lake (Manipur) and Keoladeo National Park (Rajasthan) are in Montreux Record. Chilika was removed.',
          source: 'inferred',
          confidence: 0.65
        },
        source_pages: [1],
        confidence: 0.58,
        needs_review: true,
        review_reasons: [
          'Option D text truncated by physical scan tear on margin',
          'Low OCR character confidence score (0.58)'
        ],
        has_diagram_or_table: false,
        reviewer_status: 'pending',
        extracted_at: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'q-scan-3',
        document_id: 'doc-scanned-upsc-88',
        question_number: '[Unnumbered item]',
        question_text: 'The rate constant k for a first-order chemical reaction at 300 K is given by 2.303 x 10⁻³ s⁻¹. If activation energy is 54 kJ/mol, calculate half-life t_1/2.',
        question_type: 'numerical',
        options: [],
        answer: {
          text: '300.9 seconds (approx 301 s)',
          explanation: 'For first order: t_1/2 = 0.693 / k = 0.693 / (2.303 * 10^-3) = 300.9 s.',
          source: 'inferred',
          confidence: 0.68
        },
        source_pages: [2],
        confidence: 0.62,
        needs_review: true,
        review_reasons: [
          'Original item lacked explicit question number header',
          'Numerical exponent was faintly smudged, requires human verification'
        ],
        has_diagram_or_table: false,
        reviewer_status: 'pending',
        extracted_at: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  },
  {
    id: 'demo-diagram-table',
    name: '3. Questions with Diagram / Data Table',
    description: 'STEM examination containing embedded electrical circuit diagram and thermodynamic phase equilibrium table.',
    category: 'Diagrams & Tables',
    file_type: 'png',
    document: {
      id: 'doc-chem-diagram-404',
      title: 'JEE Advanced Engineering Sciences (Diagram & Table Questions)',
      filename: 'Engineering_Physics_Circuit_Diagram.png',
      file_type: 'png',
      file_size: 924300,
      page_count: 1,
      status: 'completed',
      stage: 'finalized',
      progress: 100,
      created_at: new Date(Date.now() - 900000).toISOString(),
      completed_at: new Date(Date.now() - 900000 + 3100).toISOString(),
      processing_time_ms: 3100,
      related_document_ids: [],
      document_role: 'composite',
      total_questions_extracted: 2,
      high_confidence_count: 2,
      review_required_count: 0,
      warnings: [],
      is_demo: true,
      sample_tag: 'diagram_table'
    },
    questions: [
      {
        id: 'q-dia-1',
        document_id: 'doc-chem-diagram-404',
        question_number: '7',
        question_text: 'In the given Wheatstone bridge circuit, resistors R1 = 4 Ω, R2 = 12 Ω, R3 = 8 Ω, and R4 = 24 Ω are connected across a 12V DC source with internal resistance 1 Ω. What is the current flowing through the galvanometer connected between nodes B and D?',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: '0 A (Bridge is balanced)' },
          { key: 'B', text: '0.45 A' },
          { key: 'C', text: '1.2 A' },
          { key: 'D', text: '2.5 A' }
        ],
        answer: {
          key: 'A',
          text: '0 A (Bridge is balanced)',
          explanation: 'Condition for balanced bridge is R1/R2 = R3/R4. Here 4/12 = 8/24 = 1/3. Therefore potential at B equals potential at D and galvanometer current is zero.',
          source: 'embedded_key',
          confidence: 0.98
        },
        source_pages: [1],
        confidence: 0.96,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: true,
        diagram_description: 'Diamond-shaped Wheatstone bridge circuit diagram showing 4 resistors labeled R1, R2, R3, R4 with galvanometer branch G between opposing junctions B and D connected to DC battery supply.',
        reviewer_status: 'approved',
        extracted_at: new Date(Date.now() - 900000).toISOString()
      },
      {
        id: 'q-dia-2',
        document_id: 'doc-chem-diagram-404',
        question_number: '8',
        question_text: 'Refer to the thermodynamic data table below for standard enthalpies of formation (ΔHf°) and standard molar entropies (S°):\n\n| Substance | ΔHf° (kJ/mol) | S° (J/mol·K) |\n|---|---|---|\n| CO(g) | -110.5 | 197.6 |\n| CO₂(g) | -393.5 | 213.7 |\n| O₂(g) | 0.0 | 205.1 |\n\nCalculate the standard Gibbs free energy change ΔG° for the reaction: 2CO(g) + O₂(g) → 2CO₂(g) at 298 K.',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: '-514.4 kJ' },
          { key: 'B', text: '-257.2 kJ' },
          { key: 'C', text: '+382.1 kJ' },
          { key: 'D', text: '-110.5 kJ' }
        ],
        answer: {
          key: 'A',
          text: '-514.4 kJ',
          explanation: 'ΔH° = 2(-393.5) - [2(-110.5) + 0] = -787.0 + 221.0 = -566.0 kJ. ΔS° = 2(213.7) - [2(197.6) + 205.1] = 427.4 - 600.3 = -172.9 J/K = -0.1729 kJ/K. ΔG° = ΔH° - TΔS° = -566.0 - 298(-0.1729) = -566.0 + 51.52 = -514.48 kJ.',
          source: 'embedded_key',
          confidence: 0.95
        },
        source_pages: [1],
        confidence: 0.94,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: true,
        diagram_description: '3x3 structured Markdown data table specifying enthalpy and entropy parameters for gaseous carbon compounds.',
        reviewer_status: 'approved',
        extracted_at: new Date(Date.now() - 900000).toISOString()
      }
    ]
  },
  {
    id: 'demo-multipage-split',
    name: '4. Multi-Page Question Split',
    description: 'A comprehensive algorithmic reasoning question where the scenario and premise begin on Page 1 and continuation/options are placed on Page 2.',
    category: 'Multi-Page Split',
    file_type: 'pdf',
    document: {
      id: 'doc-algo-multipage-22',
      title: 'GATE Computer Science - Algorithm Design (Split across Pages 1 & 2)',
      filename: 'GATE_CS_Algo_MultiPage_Split.pdf',
      file_type: 'pdf',
      file_size: 712000,
      page_count: 2,
      status: 'completed',
      stage: 'finalized',
      progress: 100,
      created_at: new Date(Date.now() - 600000).toISOString(),
      completed_at: new Date(Date.now() - 600000 + 3800).toISOString(),
      processing_time_ms: 3800,
      related_document_ids: [],
      document_role: 'question_paper',
      total_questions_extracted: 2,
      high_confidence_count: 2,
      review_required_count: 0,
      warnings: ['Question 21 detected as spanning across page boundary: Page 1 -> Page 2'],
      is_demo: true,
      sample_tag: 'multipage_split'
    },
    questions: [
      {
        id: 'q-multi-1',
        document_id: 'doc-algo-multipage-22',
        question_number: '20',
        question_text: 'What is the time complexity of building a Max-Heap from an unsorted array of n elements using the bottom-up Floyd\'s heap construction algorithm?',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: 'O(n log n)' },
          { key: 'B', text: 'O(n)' },
          { key: 'C', text: 'O(n²)' },
          { key: 'D', text: 'O(log n)' }
        ],
        answer: {
          key: 'B',
          text: 'O(n)',
          explanation: 'Sum of h/2^h over all levels converges to a constant, making total work asymptotically bounded by O(n).',
          source: 'inferred',
          confidence: 0.97
        },
        source_pages: [1],
        confidence: 0.98,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: false,
        reviewer_status: 'approved',
        extracted_at: new Date(Date.now() - 600000).toISOString()
      },
      {
        id: 'q-multi-2',
        document_id: 'doc-algo-multipage-22',
        question_number: '21',
        question_text: '[Spanning Pages 1-2]\nConsider a bipartite graph G = (V1 ∪ V2, E) where |V1| = m and |V2| = n. We wish to compute the maximum cardinality matching using the Ford-Fulkerson augmentation method on an equivalent flow network.\n\n--- [Page 1 Bottom / Page 2 Top Continuation] ---\n\nIf unit capacities are assigned from source S to each u ∈ V1, unit capacities from each v ∈ V2 to sink T, and capacity ∞ on every edge in E, what is the maximum number of augmenting paths required to reach optimality?',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: 'min(m, n)' },
          { key: 'B', text: 'm + n' },
          { key: 'C', text: 'm * n' },
          { key: 'D', text: '|E| / 2' }
        ],
        answer: {
          key: 'A',
          text: 'min(m, n)',
          explanation: 'Each augmentation path increases the flow by 1 unit. Since total flow cannot exceed min(|V1|, |V2|), at most min(m, n) paths are required.',
          source: 'inferred',
          confidence: 0.92
        },
        source_pages: [1, 2],
        confidence: 0.92,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: false,
        reviewer_status: 'approved',
        extracted_at: new Date(Date.now() - 600000).toISOString(),
        raw_extracted_snippet: 'Page 1: Consider a bipartite graph G = (V1 ∪ V2, E)... Page 2: If unit capacities are assigned...'
      }
    ]
  },
  {
    id: 'demo-cross-document',
    name: '5. Multi-Document Association (Question Paper + Answer Key)',
    description: 'Demonstrates Section 8 & 11: two separate uploaded files (NEET_Biology_QuestionPaper.pdf and NEET_Official_AnswerKey.pdf) linked together to automatically match questions with their external answers.',
    category: 'Multi-Document Association',
    file_type: 'pdf',
    document: {
      id: 'doc-neet-qp-01',
      title: 'NEET UG Biology Question Paper 2025 (Set A)',
      filename: 'NEET_Biology_QuestionPaper_SetA.pdf',
      file_type: 'pdf',
      file_size: 1420500,
      page_count: 4,
      status: 'completed',
      stage: 'finalized',
      progress: 100,
      created_at: new Date(Date.now() - 300000).toISOString(),
      completed_at: new Date(Date.now() - 300000 + 4200).toISOString(),
      processing_time_ms: 4200,
      related_document_ids: ['doc-neet-ak-02'],
      document_role: 'question_paper',
      total_questions_extracted: 3,
      high_confidence_count: 3,
      review_required_count: 0,
      warnings: ['Associated with external Answer Key: NEET_Official_AnswerKey_SetA.pdf'],
      is_demo: true,
      sample_tag: 'cross_document'
    },
    questions: [
      {
        id: 'q-neet-1',
        document_id: 'doc-neet-qp-01',
        question_number: '101',
        question_text: 'Which hormone triggers ovulation in humans by undergoing a rapid mid-cycle surge?',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: 'Follicle Stimulating Hormone (FSH)' },
          { key: 'B', text: 'Luteinizing Hormone (LH)' },
          { key: 'C', text: 'Progesterone' },
          { key: 'D', text: 'Human Chorionic Gonadotropin (hCG)' }
        ],
        answer: {
          key: 'B',
          text: 'Luteinizing Hormone (LH)',
          explanation: 'Matched from linked document NEET_Official_AnswerKey_SetA.pdf (Item 101 -> Key B). LH surge causes rupture of Graafian follicle.',
          source: 'separate_document',
          confidence: 0.99
        },
        source_pages: [1],
        confidence: 0.98,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: false,
        reviewer_status: 'approved',
        extracted_at: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 'q-neet-2',
        document_id: 'doc-neet-qp-01',
        question_number: '102',
        question_text: 'In Mendel\'s dihybrid cross between round yellow seeds (RRYY) and wrinkled green seeds (rryy), what proportion of the F2 generation displays recombinant phenotypes?',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: '9/16' },
          { key: 'B', text: '6/16 (or 3/8)' },
          { key: 'C', text: '1/16' },
          { key: 'D', text: '15/16' }
        ],
        answer: {
          key: 'B',
          text: '6/16 (or 3/8)',
          explanation: 'Matched from linked document NEET_Official_AnswerKey_SetA.pdf (Item 102 -> Key B). Recombinants are Round Green (3/16) and Wrinkled Yellow (3/16).',
          source: 'separate_document',
          confidence: 0.98
        },
        source_pages: [1],
        confidence: 0.96,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: false,
        reviewer_status: 'approved',
        extracted_at: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 'q-neet-3',
        document_id: 'doc-neet-qp-01',
        question_number: '103',
        question_text: 'The enzyme responsible for unwinding DNA double helix at the replication fork in E. coli is:',
        question_type: 'multiple_choice',
        options: [
          { key: 'A', text: 'DNA Topoisomerase' },
          { key: 'B', text: 'DNA Ligase' },
          { key: 'C', text: 'DNA Helicase (DnaB)' },
          { key: 'D', text: 'RNA Primase' }
        ],
        answer: {
          key: 'C',
          text: 'DNA Helicase (DnaB)',
          explanation: 'Matched from linked document NEET_Official_AnswerKey_SetA.pdf (Item 103 -> Key C). DnaB helicase unwinds parental duplex.',
          source: 'separate_document',
          confidence: 0.97
        },
        source_pages: [2],
        confidence: 0.97,
        needs_review: false,
        review_reasons: [],
        has_diagram_or_table: false,
        reviewer_status: 'approved',
        extracted_at: new Date(Date.now() - 300000).toISOString()
      }
    ],
    associatedDoc: {
      document: {
        id: 'doc-neet-ak-02',
        title: 'Official Answer Key - NEET UG Biology 2025 (Set A)',
        filename: 'NEET_Official_AnswerKey_SetA.pdf',
        file_type: 'pdf',
        file_size: 215000,
        page_count: 1,
        status: 'completed',
        stage: 'finalized',
        progress: 100,
        created_at: new Date(Date.now() - 300000).toISOString(),
        completed_at: new Date(Date.now() - 300000 + 1900).toISOString(),
        processing_time_ms: 1900,
        related_document_ids: ['doc-neet-qp-01'],
        document_role: 'answer_key',
        total_questions_extracted: 0,
        high_confidence_count: 0,
        review_required_count: 0,
        warnings: [],
        is_demo: true,
        sample_tag: 'official_answer_key'
      },
      questions: []
    }
  },
  {
    id: 'demo-low-confidence-review',
    name: '6. Uncertain / Low-Confidence Extraction & Human Review',
    description: 'Demonstrates Section 6: questions with ambiguous option numbering, handwriting artifacts, and missing answer key flagged for human review.',
    category: 'Review Queue',
    file_type: 'jpeg',
    document: {
      id: 'doc-mock-test-lowconf',
      title: 'Mock Test Class Notes (Handwritten & Unclear Answers)',
      filename: 'Class_Notes_Mock_Unclear.jpg',
      file_type: 'jpeg',
      file_size: 890400,
      page_count: 1,
      status: 'requires_review',
      stage: 'finalized',
      progress: 100,
      created_at: new Date(Date.now() - 120000).toISOString(),
      completed_at: new Date(Date.now() - 120000 + 2800).toISOString(),
      processing_time_ms: 2800,
      related_document_ids: [],
      document_role: 'question_paper',
      total_questions_extracted: 2,
      high_confidence_count: 0,
      review_required_count: 2,
      warnings: [
        'Document has handwritten annotations interfering with automated OCR',
        '2 questions flagged with confidence < 0.70 requiring human supervisor validation'
      ],
      is_demo: true,
      sample_tag: 'low_confidence'
    },
    questions: [
      {
        id: 'q-rev-1',
        document_id: 'doc-mock-test-lowconf',
        question_number: 'Q?',
        question_text: 'Evaluate integral ∫ (3x² + 2x) / √(x³ + x² + 1) dx over the interval [0, 1]. [Handwriting smudged at lower limit]',
        question_type: 'numerical',
        options: [],
        answer: {
          text: '2(√3 - 1)',
          explanation: 'Let u = x³ + x² + 1. du = (3x² + 2x)dx. Integral becomes ∫ u^(-1/2) du = 2√u.',
          source: 'inferred',
          confidence: 0.52
        },
        source_pages: [1],
        confidence: 0.52,
        needs_review: true,
        review_reasons: [
          'Handwritten marginal smudge obscuring lower integration limit',
          'Question number is ambiguous or missing in document header'
        ],
        has_diagram_or_table: false,
        reviewer_status: 'pending',
        extracted_at: new Date(Date.now() - 120000).toISOString()
      },
      {
        id: 'q-rev-2',
        document_id: 'doc-mock-test-lowconf',
        question_number: 'Q(b)',
        question_text: 'State whether the following claim is TRUE or FALSE: Any non-empty finite group of prime order is necessarily cyclic and abelian.',
        question_type: 'true_false',
        options: [
          { key: 'A', text: 'TRUE' },
          { key: 'B', text: 'FALSE' }
        ],
        answer: {
          key: 'A',
          text: 'TRUE',
          explanation: 'By Lagrange\'s Theorem, the order of any element divides the prime order p, generating the whole cyclic group.',
          source: 'inferred',
          confidence: 0.61
        },
        source_pages: [1],
        confidence: 0.61,
        needs_review: true,
        review_reasons: [
          'Answer key was not provided in document; answer inferred by AI reasoning only',
          'Confidence score below threshold of 0.75'
        ],
        has_diagram_or_table: false,
        reviewer_status: 'pending',
        extracted_at: new Date(Date.now() - 120000).toISOString()
      }
    ]
  }
];

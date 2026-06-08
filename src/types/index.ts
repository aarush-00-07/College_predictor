// ============================================================
// College Predictor — TypeScript Type Definitions
// ============================================================

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Exam {
  id: string;
  exam_name: string;
  created_at: string;
}

export interface College {
  id: string;
  college_name: string;
  state: string;
  college_type: CollegeType;
  created_at: string;
}

export type CollegeType =
  | 'Government'
  | 'Private'
  | 'Deemed'
  | 'IIT'
  | 'NIT'
  | 'IIIT'
  | 'Other';

export interface Branch {
  id: string;
  college_id: string;
  branch_name: string;
  created_at: string;
}

export interface Cutoff {
  id: string;
  exam_id: string;
  college_id: string;
  branch_id: string;
  category: string;
  gender: string;
  home_state: string | null;
  opening_rank: number;
  closing_rank: number;
  year: number;
  created_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  search_data: PredictionInput;
  results_count: number;
  created_at: string;
}

export interface EmailLog {
  id: string;
  user_id: string;
  email_type: string;
  email_status: 'sent' | 'failed' | 'pending';
  metadata: Record<string, unknown> | null;
  sent_at: string;
}

// ============================================================
// Prediction Types
// ============================================================

export interface PredictionInput {
  exam_id: string;
  branch_name?: string;
  national_rank: number;
  state_rank?: number;
  category: string;
  gender: string;
  home_state: string;
}

export type AdmissionProbability = 'High' | 'Medium' | 'Low';

export interface PredictionResult {
  college_name: string;
  branch_name: string;
  state: string;
  college_type: CollegeType;
  opening_rank: number;
  closing_rank: number;
  probability: AdmissionProbability;
  year: number;
}

// ============================================================
// API Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

// ============================================================
// Form Types
// ============================================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface CollegeForm {
  college_name: string;
  state: string;
  college_type: CollegeType;
}

export interface BranchForm {
  college_id: string;
  branch_name: string;
}

export interface ExamForm {
  exam_name: string;
}

export interface CutoffForm {
  exam_id: string;
  college_id: string;
  branch_id: string;
  category: string;
  gender: string;
  home_state: string;
  opening_rank: number;
  closing_rank: number;
  year: number;
}

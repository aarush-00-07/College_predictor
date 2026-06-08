// ============================================================
// College Predictor — Zod Validation Schemas
// ============================================================

import { z } from 'zod';
import { CATEGORIES, COLLEGE_TYPES, GENDERS, INDIAN_STATES } from './constants';

// ---- Auth ----

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

// ---- Prediction ----

export const predictionSchema = z.object({
  exam_id: z.string().uuid('Please select an examination'),
  branch_name: z.string().optional(),
  national_rank: z.number().int().positive('Rank must be a positive number'),
  state_rank: z.number().int().positive().optional(),
  category: z.enum(CATEGORIES, { message: 'Please select a category' }),
  gender: z.enum(GENDERS, { message: 'Please select gender' }),
  home_state: z.enum(INDIAN_STATES, { message: 'Please select your home state' }),
});

// ---- Admin: College ----

export const collegeSchema = z.object({
  college_name: z.string().min(2, 'College name is required').max(300),
  state: z.enum(INDIAN_STATES, { message: 'Please select a state' }),
  college_type: z.enum(COLLEGE_TYPES, { message: 'Please select college type' }),
});

// ---- Admin: Branch ----

export const branchSchema = z.object({
  college_id: z.string().uuid('Please select a college'),
  branch_name: z.string().min(2, 'Branch name is required').max(200),
});

// ---- Admin: Exam ----

export const examSchema = z.object({
  exam_name: z.string().min(2, 'Exam name is required').max(200),
});

// ---- Admin: Cutoff ----

export const cutoffSchema = z.object({
  exam_id: z.string().uuid(),
  college_id: z.string().uuid(),
  branch_id: z.string().uuid(),
  category: z.string().min(1),
  gender: z.string().min(1),
  home_state: z.string().optional(),
  opening_rank: z.number().int().positive(),
  closing_rank: z.number().int().positive(),
  year: z.number().int().min(2000).max(2100),
});

// ---- CSV Import Row ----

export const csvCutoffRowSchema = z.object({
  exam_name: z.string().min(1),
  college_name: z.string().min(1),
  branch_name: z.string().min(1),
  category: z.string().min(1),
  gender: z.string().min(1),
  home_state: z.string().optional(),
  opening_rank: z.coerce.number().int().positive(),
  closing_rank: z.coerce.number().int().positive(),
  year: z.coerce.number().int().min(2000).max(2100),
});

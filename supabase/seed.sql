-- ============================================================
-- College Predictor — Sample Seed Data
-- Run this AFTER the migration and AFTER creating the admin account
-- ============================================================

-- ============================================================
-- 1. Exams
-- ============================================================
INSERT INTO public.exams (exam_name) VALUES
  ('JEE Main 2025'),
  ('JEE Advanced 2025'),
  ('BITSAT 2025'),
  ('MHT CET 2025'),
  ('KCET 2025'),
  ('AP EAMCET 2025'),
  ('WBJEE 2025'),
  ('COMEDK UGET 2025'),
  ('VITEEE 2025'),
  ('SRMJEEE 2025')
ON CONFLICT (exam_name) DO NOTHING;

-- ============================================================
-- 2. Colleges
-- ============================================================
INSERT INTO public.colleges (college_name, state, college_type) VALUES
  ('IIT Bombay', 'Maharashtra', 'IIT'),
  ('IIT Delhi', 'Delhi', 'IIT'),
  ('IIT Madras', 'Tamil Nadu', 'IIT'),
  ('IIT Kanpur', 'Uttar Pradesh', 'IIT'),
  ('IIT Kharagpur', 'West Bengal', 'IIT'),
  ('IIT Roorkee', 'Uttarakhand', 'IIT'),
  ('IIT Guwahati', 'Assam', 'IIT'),
  ('IIT Hyderabad', 'Telangana', 'IIT'),
  ('NIT Trichy', 'Tamil Nadu', 'NIT'),
  ('NIT Warangal', 'Telangana', 'NIT'),
  ('NIT Surathkal', 'Karnataka', 'NIT'),
  ('NIT Calicut', 'Kerala', 'NIT'),
  ('NIT Rourkela', 'Odisha', 'NIT'),
  ('IIIT Hyderabad', 'Telangana', 'IIIT'),
  ('IIIT Bangalore', 'Karnataka', 'IIIT'),
  ('IIIT Allahabad', 'Uttar Pradesh', 'IIIT'),
  ('BITS Pilani', 'Rajasthan', 'Deemed'),
  ('BITS Goa', 'Goa', 'Deemed'),
  ('BITS Hyderabad', 'Telangana', 'Deemed'),
  ('VIT Vellore', 'Tamil Nadu', 'Private'),
  ('SRM Chennai', 'Tamil Nadu', 'Private'),
  ('Manipal Institute of Technology', 'Karnataka', 'Private'),
  ('College of Engineering Pune', 'Maharashtra', 'Government'),
  ('Jadavpur University', 'West Bengal', 'Government'),
  ('Anna University', 'Tamil Nadu', 'Government');

-- ============================================================
-- 3. Branches (for each college)
-- ============================================================
DO $$
DECLARE
  col_id UUID;
  branch TEXT;
  branches TEXT[] := ARRAY[
    'Computer Science and Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Electronics and Communication',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Mathematics and Computing',
    'Artificial Intelligence'
  ];
BEGIN
  FOR col_id IN SELECT id FROM public.colleges LOOP
    FOREACH branch IN ARRAY branches LOOP
      INSERT INTO public.branches (college_id, branch_name)
      VALUES (col_id, branch)
      ON CONFLICT (college_id, branch_name) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- 4. Sample Cutoff Data (JEE Advanced 2025 — IITs)
-- ============================================================
DO $$
DECLARE
  jee_adv_id UUID;
  col_record RECORD;
  br_record RECORD;
BEGIN
  SELECT id INTO jee_adv_id FROM public.exams WHERE exam_name = 'JEE Advanced 2025';

  FOR col_record IN SELECT id, college_name FROM public.colleges WHERE college_type = 'IIT' LOOP
    FOR br_record IN SELECT id, branch_name FROM public.branches WHERE college_id = col_record.id LIMIT 5 LOOP
      -- General Male
      INSERT INTO public.cutoffs (exam_id, college_id, branch_id, category, gender, home_state, opening_rank, closing_rank, year)
      VALUES (
        jee_adv_id,
        col_record.id,
        br_record.id,
        'General',
        'Male',
        NULL,
        FLOOR(RANDOM() * 100 + 1)::INT,
        FLOOR(RANDOM() * 2000 + 500)::INT,
        2025
      );

      -- General Female
      INSERT INTO public.cutoffs (exam_id, college_id, branch_id, category, gender, home_state, opening_rank, closing_rank, year)
      VALUES (
        jee_adv_id,
        col_record.id,
        br_record.id,
        'General',
        'Female',
        NULL,
        FLOOR(RANDOM() * 200 + 50)::INT,
        FLOOR(RANDOM() * 3000 + 1000)::INT,
        2025
      );

      -- OBC-NCL Male
      INSERT INTO public.cutoffs (exam_id, college_id, branch_id, category, gender, home_state, opening_rank, closing_rank, year)
      VALUES (
        jee_adv_id,
        col_record.id,
        br_record.id,
        'OBC-NCL',
        'Male',
        NULL,
        FLOOR(RANDOM() * 300 + 100)::INT,
        FLOOR(RANDOM() * 4000 + 1500)::INT,
        2025
      );

      -- SC Male
      INSERT INTO public.cutoffs (exam_id, college_id, branch_id, category, gender, home_state, opening_rank, closing_rank, year)
      VALUES (
        jee_adv_id,
        col_record.id,
        br_record.id,
        'SC',
        'Male',
        NULL,
        FLOOR(RANDOM() * 500 + 200)::INT,
        FLOOR(RANDOM() * 5000 + 2000)::INT,
        2025
      );
    END LOOP;
  END LOOP;
END $$;

-- ============================================================
-- 5. Sample Cutoff Data (JEE Main 2025 — NITs)
-- ============================================================
DO $$
DECLARE
  jee_main_id UUID;
  col_record RECORD;
  br_record RECORD;
BEGIN
  SELECT id INTO jee_main_id FROM public.exams WHERE exam_name = 'JEE Main 2025';

  FOR col_record IN SELECT id, college_name FROM public.colleges WHERE college_type = 'NIT' LOOP
    FOR br_record IN SELECT id, branch_name FROM public.branches WHERE college_id = col_record.id LIMIT 5 LOOP
      -- General Male
      INSERT INTO public.cutoffs (exam_id, college_id, branch_id, category, gender, home_state, opening_rank, closing_rank, year)
      VALUES (
        jee_main_id,
        col_record.id,
        br_record.id,
        'General',
        'Male',
        NULL,
        FLOOR(RANDOM() * 1000 + 100)::INT,
        FLOOR(RANDOM() * 15000 + 5000)::INT,
        2025
      );

      -- General Female
      INSERT INTO public.cutoffs (exam_id, college_id, branch_id, category, gender, home_state, opening_rank, closing_rank, year)
      VALUES (
        jee_main_id,
        col_record.id,
        br_record.id,
        'General',
        'Female',
        NULL,
        FLOOR(RANDOM() * 2000 + 500)::INT,
        FLOOR(RANDOM() * 20000 + 8000)::INT,
        2025
      );

      -- OBC-NCL Male
      INSERT INTO public.cutoffs (exam_id, college_id, branch_id, category, gender, home_state, opening_rank, closing_rank, year)
      VALUES (
        jee_main_id,
        col_record.id,
        br_record.id,
        'OBC-NCL',
        'Male',
        NULL,
        FLOOR(RANDOM() * 3000 + 1000)::INT,
        FLOOR(RANDOM() * 25000 + 10000)::INT,
        2025
      );

      -- EWS Male
      INSERT INTO public.cutoffs (exam_id, college_id, branch_id, category, gender, home_state, opening_rank, closing_rank, year)
      VALUES (
        jee_main_id,
        col_record.id,
        br_record.id,
        'EWS',
        'Male',
        NULL,
        FLOOR(RANDOM() * 2000 + 500)::INT,
        FLOOR(RANDOM() * 18000 + 7000)::INT,
        2025
      );
    END LOOP;
  END LOOP;
END $$;

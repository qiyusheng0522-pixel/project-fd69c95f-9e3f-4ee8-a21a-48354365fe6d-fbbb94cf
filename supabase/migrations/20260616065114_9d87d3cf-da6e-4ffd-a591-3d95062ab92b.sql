
-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  gender TEXT,
  birth_date DATE,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  blood_type TEXT,
  phone TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  allergies TEXT,
  family_history TEXT,
  chronic_conditions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- auto create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- medical records (OCR docs)
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL, -- 'medical_history' | 'lab_report' | 'admission' | 'surgery'
  title TEXT NOT NULL,
  image_path TEXT,
  ocr_text TEXT,
  structured_data JSONB,
  visit_date DATE,
  hospital TEXT,
  department TEXT,
  doctor TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending'|'processing'|'completed'|'failed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_records TO authenticated;
GRANT ALL ON public.medical_records TO service_role;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own records" ON public.medical_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_records_updated BEFORE UPDATE ON public.medical_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_records_user ON public.medical_records(user_id, created_at DESC);

-- questionnaires
CREATE TABLE public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questionnaire_type TEXT NOT NULL, -- 'basic' | 'heart_failure' | 'cad' | 'hypertension' ...
  title TEXT NOT NULL,
  answers JSONB NOT NULL,
  score NUMERIC,
  result_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questionnaire_responses TO authenticated;
GRANT ALL ON public.questionnaire_responses TO service_role;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own qs" ON public.questionnaire_responses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- health plans
CREATE TABLE public.health_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  risk_level TEXT, -- low|medium|high
  advice JSONB,    -- general health advice
  diet JSONB,      -- diet recommendations
  exercise JSONB,  -- exercise plan
  medication JSONB,
  monitoring JSONB,
  generated_by TEXT DEFAULT 'ai',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_plans TO authenticated;
GRANT ALL ON public.health_plans TO service_role;
ALTER TABLE public.health_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own plans" ON public.health_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_plans_user ON public.health_plans(user_id, created_at DESC);

-- medication reminders
CREATE TABLE public.medication_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT, -- e.g. "每日2次"
  times TEXT[], -- ['08:00','20:00']
  start_date DATE,
  end_date DATE,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medication_reminders TO authenticated;
GRANT ALL ON public.medication_reminders TO service_role;
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own meds" ON public.medication_reminders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_meds_updated BEFORE UPDATE ON public.medication_reminders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- follow-ups
CREATE TABLE public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  follow_up_type TEXT, -- 'revisit'|'lab_test'|'consultation'|'other'
  scheduled_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follow_ups TO authenticated;
GRANT ALL ON public.follow_ups TO service_role;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own follow_ups" ON public.follow_ups FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_followups_user ON public.follow_ups(user_id, scheduled_at);

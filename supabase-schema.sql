-- Rendvio Database Schema
-- Run this in Supabase SQL Editor

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  credit_balance INTEGER NOT NULL DEFAULT 3,
  plan_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Renders table
CREATE TABLE public.renders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mode TEXT NOT NULL,
  source_image_url TEXT NOT NULL,
  result_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  fal_request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('purchase', 'render', 'refund', 'signup_bonus')),
  payment_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Anonymous trials table
CREATE TABLE public.anonymous_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_hash TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_renders_user_id ON public.renders(user_id);
CREATE INDEX idx_renders_status ON public.renders(status);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_payment_session ON public.credit_transactions(payment_session_id);
CREATE INDEX idx_anonymous_trials_hash ON public.anonymous_trials(identifier_hash);
CREATE INDEX idx_anonymous_trials_created ON public.anonymous_trials(created_at);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credit_balance, plan_tier)
  VALUES (NEW.id, NEW.email, 3, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: users can read/update their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Renders: users can read their own, service role can insert
ALTER TABLE public.renders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own renders"
  ON public.renders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert renders"
  ON public.renders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own renders"
  ON public.renders FOR UPDATE
  USING (auth.uid() = user_id);

-- Credit transactions: only service role can insert
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (true);

-- Anonymous trials: service role can insert/read
ALTER TABLE public.anonymous_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage anonymous trials"
  ON public.anonymous_trials FOR ALL
  USING (true)
  WITH CHECK (true);

-- Storage bucket for uploaded images and renders
-- Create these via Supabase Dashboard or SQL:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('renders', 'renders', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('source-images', 'source-images', false);

-- Storage RLS: allow authenticated users to upload to their own folder
-- CREATE POLICY "Users can upload their own images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Users can read their own images"
--   ON storage.objects FOR SELECT
--   USING (auth.uid()::text = (storage.foldername(name))[1]);
--
-- CREATE POLICY "Public can read renders"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'renders');

-- Helper function: decrement_credit (create this in Supabase SQL editor)
CREATE OR REPLACE FUNCTION public.decrement_credit(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credit_balance = credit_balance - 1
  WHERE id = user_id AND credit_balance > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: add_credits (create this in Supabase SQL editor)
CREATE OR REPLACE FUNCTION public.add_credits(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credit_balance = credit_balance + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


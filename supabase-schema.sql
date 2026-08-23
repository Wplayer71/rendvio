-- ============================================================
-- Rendvio - Complete Supabase Schema
-- Paste this whole script into Supabase SQL Editor and run it once.
-- Safe to re-run: everything is idempotent.
-- ============================================================

-- ---------- 1. TABLES ----------

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  credit_balance INTEGER NOT NULL DEFAULT 3,
  plan_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.renders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mode TEXT NOT NULL,
  source_image_url TEXT NOT NULL,
  result_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  fal_request_id TEXT,
  prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- If the renders table already existed from an earlier run, make sure the prompt column exists
ALTER TABLE public.renders ADD COLUMN IF NOT EXISTS prompt TEXT;

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('purchase', 'render', 'refund', 'signup_bonus')),
  payment_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.anonymous_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier_hash TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- 2. INDEXES ----------

CREATE INDEX IF NOT EXISTS idx_renders_user_id ON public.renders(user_id);
CREATE INDEX IF NOT EXISTS idx_renders_status ON public.renders(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_payment_session ON public.credit_transactions(payment_session_id);
CREATE INDEX IF NOT EXISTS idx_anonymous_trials_hash ON public.anonymous_trials(identifier_hash);
CREATE INDEX IF NOT EXISTS idx_anonymous_trials_created ON public.anonymous_trials(created_at);

-- ---------- 3. AUTO-CREATE PROFILE ON SIGNUP ----------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credit_balance, plan_tier)
  VALUES (NEW.id, NEW.email, 3, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- 4. ROW LEVEL SECURITY ----------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

ALTER TABLE public.renders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own renders" ON public.renders;
CREATE POLICY "Users can read own renders"
  ON public.renders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert renders" ON public.renders;
CREATE POLICY "Service role can insert renders"
  ON public.renders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own renders" ON public.renders;
CREATE POLICY "Users can update own renders"
  ON public.renders FOR UPDATE
  USING (auth.uid() = user_id);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own transactions" ON public.credit_transactions;
CREATE POLICY "Users can read own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert transactions" ON public.credit_transactions;
CREATE POLICY "Service role can insert transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (true);

ALTER TABLE public.anonymous_trials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage anonymous trials" ON public.anonymous_trials;
CREATE POLICY "Service role can manage anonymous trials"
  ON public.anonymous_trials FOR ALL
  USING (true)
  WITH CHECK (true);

-- ---------- 5. STORAGE BUCKETS (source + result images) ----------

INSERT INTO storage.buckets (id, name, public)
VALUES ('source-images', 'source-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('renders', 'renders', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read source-images" ON storage.objects;
CREATE POLICY "Public read source-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'source-images');

DROP POLICY IF EXISTS "Public read renders" ON storage.objects;
CREATE POLICY "Public read renders"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'renders');

DROP POLICY IF EXISTS "Service role uploads source-images" ON storage.objects;
CREATE POLICY "Service role uploads source-images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'source-images');

DROP POLICY IF EXISTS "Service role uploads renders" ON storage.objects;
CREATE POLICY "Service role uploads renders"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'renders');

-- ---------- 6. HELPER FUNCTIONS ----------

CREATE OR REPLACE FUNCTION public.decrement_credit(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credit_balance = credit_balance - 1
  WHERE id = user_id AND credit_balance > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.add_credits(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credit_balance = credit_balance + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

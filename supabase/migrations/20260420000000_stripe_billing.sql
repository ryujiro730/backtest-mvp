-- ===========================================
--   S T R I P E   B I L L I N G
--   profiles + subscriptions + runs
--   冪等（何度実行しても安全）
-- ===========================================

-- ── profiles ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               text,
  plan                text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  stripe_customer_id  text UNIQUE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- カラムが存在しない場合のみ追加
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='plan') THEN
    ALTER TABLE profiles ADD COLUMN plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='stripe_customer_id') THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id text UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='created_at') THEN
    ALTER TABLE profiles ADD COLUMN created_at timestamptz NOT NULL DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='updated_at') THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_select_own') THEN
    CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='profiles_update_own') THEN
    CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
  END IF;
END $$;

-- 新規サインアップ時に profiles を自動作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_updated_at();

-- ── subscriptions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      text PRIMARY KEY,
  user_id                 uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id             text NOT NULL,
  plan                    text,
  status                  text NOT NULL DEFAULT 'active',
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean NOT NULL DEFAULT false,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- 既存テーブルにカラムが欠けている場合のみ追加
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='customer_id') THEN
    ALTER TABLE subscriptions ADD COLUMN customer_id text NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='plan') THEN
    ALTER TABLE subscriptions ADD COLUMN plan text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='current_period_start') THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_start timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='current_period_end') THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_end timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='cancel_at_period_end') THEN
    ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end boolean NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='updated_at') THEN
    ALTER TABLE subscriptions ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- customer_id カラムが存在するときだけインデックスを作成
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscriptions' AND column_name='customer_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename='subscriptions' AND indexname='idx_subscriptions_customer_id') THEN
      CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
    END IF;
  END IF;
END $$;

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='subscriptions' AND policyname='subscriptions_select_own') THEN
    CREATE POLICY "subscriptions_select_own" ON subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION subscriptions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION subscriptions_updated_at();

-- ── runs ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS runs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  anon_id     text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='runs' AND column_name='user_id') THEN
    ALTER TABLE runs ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='runs' AND column_name='anon_id') THEN
    ALTER TABLE runs ADD COLUMN anon_id text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_runs_user_id ON runs(user_id);
CREATE INDEX IF NOT EXISTS idx_runs_anon_id ON runs(anon_id);
CREATE INDEX IF NOT EXISTS idx_runs_created_at ON runs(created_at DESC);

ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='runs' AND policyname='runs_select_own') THEN
    CREATE POLICY "runs_select_own" ON runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='runs' AND policyname='runs_insert_any') THEN
    CREATE POLICY "runs_insert_any" ON runs FOR INSERT TO public WITH CHECK (true);
  END IF;
END $$;

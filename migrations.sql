-- ===========================================
--   R U N S    T A B L E   M I G R A T I O N
-- ===========================================

-- run_id が無ければ追加（PRIMARY KEY は後付けせず UNIQUE にする）
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS run_id uuid;
ALTER TABLE IF EXISTS runs ADD CONSTRAINT runs_run_id_key UNIQUE (run_id);

-- ベースとなるメタ情報
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS sid text;
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS seed integer;
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS code_hash text;
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS dataset_hash text;
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 作成時刻
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS started_at timestamp;
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS finished_at timestamp;

-- エラー関連
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS error text;
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS idem_key text UNIQUE;

-- Worker が更新する統計
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS pf double precision;
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS winrate double precision;
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS maxdd double precision;
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS trades integer;

-- 追加で使う可能性のある統計
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS expectancy double precision;
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS avg_win double precision;
ALTER TABLE IF EXISTS runs ADD COLUMN IF NOT EXISTS avg_loss double precision;

-- indexes
CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_sid ON runs(sid);
CREATE INDEX IF NOT EXISTS idx_runs_run_id ON runs(run_id);

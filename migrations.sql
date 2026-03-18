-- ===========================================
--   R U N S    T A B L E   M I G R A T I O N
--   冪等（何度実行しても安全）
-- ===========================================

CREATE TABLE IF NOT EXISTS runs (
    run_id      uuid        PRIMARY KEY,
    sid         text,
    seed        integer,
    code_hash   text,
    dataset_hash text,
    status      text        NOT NULL DEFAULT 'pending',
    created_at  timestamp   NOT NULL DEFAULT now(),
    started_at  timestamp,
    finished_at timestamp,
    error       text,
    idem_key    text        UNIQUE,
    pf          double precision,
    winrate     double precision,
    maxdd       double precision,
    trades      integer,
    expectancy  double precision,
    avg_win     double precision,
    avg_loss    double precision,
    -- Railway deployment: store results and strategy in DB (no shared filesystem)
    payload     jsonb,
    equity_data jsonb,
    trades_data jsonb
);

-- Idempotent column additions (for existing databases)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='runs' AND column_name='payload') THEN
        ALTER TABLE runs ADD COLUMN payload jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='runs' AND column_name='equity_data') THEN
        ALTER TABLE runs ADD COLUMN equity_data jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='runs' AND column_name='trades_data') THEN
        ALTER TABLE runs ADD COLUMN trades_data jsonb;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_runs_status   ON runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_sid      ON runs(sid);
CREATE INDEX IF NOT EXISTS idx_runs_run_id   ON runs(run_id);

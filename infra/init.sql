-- Delver standalone DB init (idempotent)

CREATE TABLE IF NOT EXISTS runs (
    run_id       uuid          PRIMARY KEY,
    sid          text,
    seed         integer,
    code_hash    text,
    dataset_hash text,
    status       text          NOT NULL DEFAULT 'pending',
    created_at   timestamp     NOT NULL DEFAULT now(),
    started_at   timestamp,
    finished_at  timestamp,
    error        text,
    idem_key     text          UNIQUE,
    pf           double precision,
    winrate      double precision,
    maxdd        double precision,
    trades       integer,
    expectancy   double precision,
    avg_win      double precision,
    avg_loss     double precision,
    payload      jsonb,
    equity_data  jsonb,
    trades_data  jsonb
);

CREATE INDEX IF NOT EXISTS idx_runs_status  ON runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_sid     ON runs(sid);
CREATE INDEX IF NOT EXISTS idx_runs_run_id  ON runs(run_id);

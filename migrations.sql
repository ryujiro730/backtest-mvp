-- error列とIdempotency-Key用の列を追加
alter table if exists runs add column if not exists error text;
alter table if exists runs add column if not exists idem_key text unique;

-- よく使うカラムにindex（任意）
create index if not exists idx_runs_status on runs(status);
create index if not exists idx_runs_sid on runs(sid);


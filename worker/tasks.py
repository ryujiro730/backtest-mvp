from worker.config import celery
from worker.engine.run_logic import run_backtest_logic

@celery.task(name="tasks.run_backtest", autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def run_backtest(run_id, sid, seed, code_hash, dataset_hash):
    return run_backtest_logic(run_id, sid, code_hash, seed, dataset_hash)

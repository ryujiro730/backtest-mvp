"use client";

export default function Error({ error, reset }) {
  return (
    <div className="p-6 text-red-600">
      <h2>エラーが発生しました</h2>
      <p>{String(error)}</p>
      <button onClick={() => reset()}>再試行</button>
    </div>
  );
}

'use client';

export default function AccountModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Delver</h2>
        <p className="text-sm text-zinc-600 mb-4">ローカル版 — 認証不要</p>
        <button
          onClick={onClose}
          className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}

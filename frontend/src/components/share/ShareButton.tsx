// src/components/share/ShareButton.tsx
'use client';
import { useCallback, useMemo, useState } from 'react';

export default function ShareButton({
  url,
  title = 'Delver — FXバックテスト',
  text = 'このバックテスト結果をDelverで検証した。',
}: { url: string; title?: string; text?: string }) {
  const [copied, setCopied] = useState(false);

  const tweetUrl = useMemo(() => {
    const t = encodeURIComponent(`${text}\n${url}`);
    return `https://twitter.com/intent/tweet?text=${t}`; // Xでも有効
  }, [text, url]);

  const onShare = useCallback(async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; } catch {}
    }
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
  }, [title, text, url, tweetUrl]);

  const onCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  };

return (
  <div className="flex items-center gap-2">
    <button
      onClick={onShare}
      className="rounded-xl px-3 py-2 border shadow-sm"
    >
      Share
    </button>
    <button onClick={onCopy} className="text-sm underline">
      {copied ? 'Copied' : 'Copy Link'}
    </button>
    <span className="text-sm text-gray-500">
      Each time you share your screen on X, you’ll get one free simulation!
      It’s a bit of a hassle, but please let us know at info@delvertrade.com each time 🙌
    </span>
  </div>
);
}
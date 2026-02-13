"use client";

import Script from "next/script";
import { useRef, useCallback } from "react";

const WIDGETS_URL = "https://platform.twitter.com/widgets.js";

type TwitterEmbedProps = {
  /** ツイートID（status/ の後の数字）例: 1188475606402383874 */
  tweetId: string;
  /** オプション: ツイートURL（指定しない場合は https://twitter.com/i/status/{tweetId} を使用） */
  tweetUrl?: string;
};

/**
 * X (Twitter) のツイートを埋め込むクライアントコンポーネント。
 * blockquote + script だけでは Next.js で widgets.js の実行タイミングが合わないため、
 * next/script で読み込み後に twttr.widgets.load() を呼ぶ。
 */
export function TwitterEmbed({ tweetId, tweetUrl }: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const url =
    tweetUrl ?? `https://twitter.com/i/status/${tweetId}`;

  const onLoad = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).twttr?.widgets?.load) {
      (window as any).twttr.widgets.load(containerRef.current ?? undefined);
    }
  }, []);

  return (
    <div ref={containerRef} className="my-6 [&_.twitter-tweet]:!mx-auto">
      <blockquote
        className="twitter-tweet"
        data-dnt="true"
        data-media-max-width="560"
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      </blockquote>
      <Script
        src={WIDGETS_URL}
        strategy="lazyOnload"
        onLoad={onLoad}
      />
    </div>
  );
}

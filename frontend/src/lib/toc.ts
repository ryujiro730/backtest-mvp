// src/lib/toc.ts（簡易: 見出しマークダウンから抽出する想定）
export type TocItem = { depth: 2|3; text: string; id: string };
export function extractTocFromMdx(raw: string): TocItem[] {
  // 極簡易: <H2>や<H3>の直書きを対象にするなら正規表現でもOK
  // ここは後で rehype-parse -> rehype-slug のパイプに差し替え可能
  const items: TocItem[] = [];
  const h2 = [...raw.matchAll(/<H2>([\s\S]*?)<\/H2>/g)];
  const h3 = [...raw.matchAll(/<H3>([\s\S]*?)<\/H3>/g)];
  h2.forEach((m) => items.push({ depth: 2, text: m[1].replace(/<[^>]+>/g,"").trim(), id: slugify(m[1]) }));
  h3.forEach((m) => items.push({ depth: 3, text: m[1].replace(/<[^>]+>/g,"").trim(), id: slugify(m[1]) }));
  return items;
}
function slugify(s: string){ return s.toLowerCase().replace(/\s+/g,"-").replace(/[^\w-]/g,""); }

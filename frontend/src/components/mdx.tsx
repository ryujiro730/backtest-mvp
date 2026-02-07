// src/components/mdx.tsx
import NextImage, { type ImageProps } from "next/image";
import Link from "next/link";
export { default as RunPreset } from "@/components/mdx/RunPreset";

export const mdxComponents = {
  Img: (props: ImageProps) => (
    <NextImage
      {...props}
      alt={props.alt ?? ""}
      width={props.width ?? 800}
      height={props.height ?? 500}
      sizes="(min-width:768px) 700px, 100vw"
    />
  ),
  a: (props: any) => (
    <Link
      {...props}
      className="underline decoration-zinc-300 underline-offset-4 hover:decoration-zinc-800"
    />
  ),
};


// 見出し（色・アンカー）
export function H2({ children }: { children: React.ReactNode }) {
  const id = String(children).replace(/\s+/g, "-").toLowerCase();
  return (
    <h2 id={id} className="group scroll-mt-20 text-2xl font-semibold text-zinc-900">
      <a href={`#${id}`} className="no-underline">
        <span className="mr-2 inline-block h-5 w-1 rounded bg-blue-500 align-middle" />
        <span className="align-middle">{children}</span>
        <span className="ml-2 opacity-0 group-hover:opacity-100 text-zinc-300">#</span>
      </a>
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  const id = String(children).replace(/\s+/g, "-").toLowerCase();
  return (
    <h3 id={id} className="group scroll-mt-20 text-xl font-semibold text-zinc-800">
      <a href={`#${id}`} className="no-underline">
        <span className="mr-2 inline-block h-4 w-1 rounded bg-sky-400 align-middle" />
        <span className="align-middle">{children}</span>
        <span className="ml-2 opacity-0 group-hover:opacity-100 text-zinc-300">#</span>
      </a>
    </h3>
  );
}

// 重要部分のマーカー（蛍光ペン風）
export function Mark({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded-sm bg-yellow-200/60 px-0.5 py-0.5 ring-1 ring-yellow-300/60">
      {children}
    </mark>
  );
}

// 情報ボックス（Note/Tip/Warn）
function Box({
  title, tone = "info", children
}: { title: string; tone?: "info" | "tip" | "warn"; children: React.ReactNode }) {
  const styles = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    tip: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900"
  }[tone];
  return (
    <div className={`my-4 rounded-xl border px-4 py-3 ${styles}`}>
      <p className="mb-1 font-semibold">{title}</p>
      <div className="[&>p]:m-0 [&>p+p]:mt-2">{children}</div>
    </div>
  );
}
export const Note = ({ children }: { children: React.ReactNode }) => (
  <Box title="Note" tone="info">{children}</Box>
);
export const Tip = ({ children }: { children: React.ReactNode }) => (
  <Box title="Pro Tip" tone="tip">{children}</Box>
);
export const Warn = ({ children }: { children: React.ReactNode }) => (
  <Box title="Warning" tone="warn">{children}</Box>
);

// src/components/mdx.tsx
export const Callout = ({ children }: { children: React.ReactNode }) => (
  <div className="my-6 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4 text-blue-900">
    {children}
  </div>
);
// src/components/mdx.tsx の末尾あたりに追加
export const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="code-block">{children}</pre>
);

const BLOCK_NAMES = new Set([
  "Callout","Note","Tip","Warn","CodeBlock","RunPreset"
]);

export function SafeP(props: React.HTMLAttributes<HTMLParagraphElement>) {
  const children = React.Children.toArray(props.children);
  const hasBlock = children.some((ch: any) => {
    const t = ch?.type;
    const name = t?.displayName || t?.name;
    return name && BLOCK_NAMES.has(name);
  });
  // ブロックが混じってたら <p> をやめる
  if (hasBlock) return <>{props.children}</>;
  return <p {...props} />;
}
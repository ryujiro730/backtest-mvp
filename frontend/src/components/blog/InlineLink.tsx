// src/components/blog/InlineLink.tsx
import Link from "next/link";

type Props = {
  href: string;
  children: React.ReactNode;
};

export function InlineLink({ href, children }: Props) {
  return (
    <Link
      href={href}
      className="text-blue-600 hover:text-blue-800 underline font-semibold"
    >
      {children}
    </Link>
  );
}

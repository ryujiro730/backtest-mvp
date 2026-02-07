// src/components/blog/NextLink.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

type Props = {
  href: string;
  title: string;
  image?: string;
};

export function NextLink({ href, title, image }: Props) {
  return (
    <div className="my-10">
      <Link href={href} className="block">
        <Card
          className="
            group
            border border-zinc-200
            bg-white
            transition-colors
            hover:border-zinc-300
          "
        >
          <div className="flex gap-4 p-4">
            {image && (
              <Image
                src={image}
                alt={title}
                width={240}
                height={140}
                className="rounded-md object-contain bg-white"
              />
            )}

            <div className="flex flex-1 items-center justify-between">
              <span className="text-sm font-semibold text-zinc-800 leading-relaxed">
                {title}
              </span>
              <ArrowRight
                className="
                  h-4 w-4
                  text-zinc-400
                  transition-transform
                  group-hover:translate-x-0.5
                "
              />
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}

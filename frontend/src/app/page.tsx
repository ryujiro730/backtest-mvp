// src/app/page.tsx
import {redirect} from "next/navigation";

export default function RootPage() {
  redirect("/ja"); // 必ず日本語LPに飛ばす
}


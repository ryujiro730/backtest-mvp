import { redirect } from "next/navigation";

/**
 * このファイルは Middleware がリダイレクトを処理するため、
 * 通常は実行されませんが、ビルドエラー回避とフォールバックのために配置します。
 */
export default function RootPage() {
  // 万が一 Middleware を抜けてここに来た場合、デフォルトの /ja に飛ばす
  redirect("/ja");
}
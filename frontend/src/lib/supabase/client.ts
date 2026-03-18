// src/lib/supabase/client.ts
"use client";
import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * createBrowserClient はセッションを cookie に保存するため、
 * ミドルウェア（サーバーサイド）がセッションを読み取れる。
 * createClient (supabase-js) は localStorage に保存するためミドルウェアから不可視。
 */
export const supabase = createBrowserClient(url, key);

// 後方互換エイリアス
export const supabaseBrowser = supabase;

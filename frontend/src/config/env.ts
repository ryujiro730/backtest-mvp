// src/config/env.ts
export const CDN =
  (process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL as string | undefined) ?? '';
export const API =
  (process.env.NEXT_PUBLIC_API_BASE as string | undefined) ?? '';

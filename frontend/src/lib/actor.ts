import 'server-only';
import { cookies, headers } from 'next/headers';

export async function getActor() {
  const cookieStore = await cookies();  // await 必須
  const anon_id = cookieStore.get('anon_id')?.value ?? null;

  const h = await headers();            // await 必須
  const ua = h.get('user-agent') ?? '';
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    '';

  return { anon_id, ip, ua };
}

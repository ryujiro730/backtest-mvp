import 'server-only';
import { cookies } from 'next/headers';

export async function getActor() {
  const cookieStore = await cookies();
  const anon_id = cookieStore.get('anon_id')?.value ?? null;
  return { anon_id };
}

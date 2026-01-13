// src/lib/session.ts
import { cookies } from 'next/headers';

const PREFIX = 'x_flow_';

export type FlowPayload = {
  verifier: string;
  userId?: string | null;
  resultId?: string | null;
};

export function saveFlowState(input: { state: string } & FlowPayload, maxAgeSec = 300) {
  const name = `${PREFIX}${input.state}`;
  const { state, ...payload } = input;
  cookies().set({
    name,
    value: JSON.stringify(payload),
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: maxAgeSec,
  });
}

export async function getFlowState(state: string): Promise<FlowPayload | null> {
  const name = `${PREFIX}${state}`;
  const raw = cookies().get(name)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FlowPayload;
  } catch {
    return null;
  }
}

export async function clearFlowState(state: string) {
  const name = `${PREFIX}${state}`;
  cookies().set({ name, value: '', path: '/', maxAge: 0 });
}

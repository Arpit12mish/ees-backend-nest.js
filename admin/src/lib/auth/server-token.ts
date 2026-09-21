import 'server-only';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME } from './token-cookie';

// Only ever import this from Server Components / Server Actions — the
// server-only guard makes an accidental client import fail the build loudly
// instead of shipping next/headers into a browser bundle.
export async function getServerToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value;
}

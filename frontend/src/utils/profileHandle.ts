/** Twitter-style @handle from email local part (fallback if missing). */
export function profileHandleFromEmail(email?: string | null, fallback = 'user'): string {
  const local = email?.split('@')[0]?.trim();
  const safe = local?.replace(/[^a-zA-Z0-9._-]/g, '') || fallback;
  return `@${safe}`;
}

/** Maps Firebase Auth / Google errors to short, readable copy (theme-neutral wording). */
export function formatAuthError(raw: string): string {
  const s = raw.trim();
  const lower = s.toLowerCase();

  if (lower.includes('wrong-password') || lower.includes('invalid-credential')) {
    return 'Incorrect email or password. Check your details and try again.';
  }
  if (lower.includes('user-not-found')) {
    return 'No account for this email yet. Create one or use Google sign-in.';
  }
  if (lower.includes('email-already-in-use')) {
    return 'This email is already registered. Sign in instead.';
  }
  if (lower.includes('weak-password')) {
    return 'Use a stronger password (at least 6 characters).';
  }
  if (lower.includes('invalid-email')) {
    return 'That email address does not look valid.';
  }
  if (lower.includes('too-many-requests')) {
    return 'Too many attempts. Wait a minute and try again.';
  }
  if (lower.includes('popup-closed-by-user') || lower.includes('cancelled-popup')) {
    return 'Sign-in was closed. Try again when you are ready.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network issue. Check your connection and try again.';
  }

  const stripped = s
    .replace(/^Firebase:\s*Error\s*\([^)]*\)\.\s*/i, '')
    .replace(/^Firebase:\s*/i, '')
    .replace(/\s*\(auth\/[^)]+\)\s*\.?$/i, '')
    .trim();

  return stripped || s;
}

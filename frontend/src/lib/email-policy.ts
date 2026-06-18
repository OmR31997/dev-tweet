import disposableDomains from 'disposable-email-domains';

const DISPOSABLE_DOMAINS = new Set<string>(disposableDomains);

/** Reserved / placeholder domains that are not real inboxes. */
const BLOCKED_SIGNUP_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'test.test',
  'localhost',
  'invalid',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'yopmail.com',
  'throwaway.email',
  'getnada.com',
  'sharklasers.com',
  'trashmail.com',
]);

const EMAIL_FORMAT =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

function domainIsBlocked(domain: string): boolean {
  if (BLOCKED_SIGNUP_DOMAINS.has(domain) || DISPOSABLE_DOMAINS.has(domain)) {
    return true;
  }

  const parts = domain.split('.');
  for (let index = 1; index < parts.length; index++) {
    const suffix = parts.slice(index).join('.');
    if (BLOCKED_SIGNUP_DOMAINS.has(suffix) || DISPOSABLE_DOMAINS.has(suffix)) {
      return true;
    }
  }

  return false;
}

export function normalizeSignupEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAllowedSignupEmail(email: string): boolean {
  const normalized = normalizeSignupEmail(email);
  if (!EMAIL_FORMAT.test(normalized)) {
    return false;
  }

  const domain = normalized.split('@').pop();
  if (!domain) {
    return false;
  }

  return !domainIsBlocked(domain);
}

export const SIGNUP_EMAIL_REJECTED_MESSAGE =
  'Please use a real, permanent email address. Temporary or disposable emails are not allowed.';

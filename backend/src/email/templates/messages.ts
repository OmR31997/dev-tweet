import { emailLayout } from './theme';

export function welcomeTemplate(displayName: string) {
  return emailLayout(
    'Welcome to DevTweet Hub',
    `
      <h2 style="margin:0 0 12px;">Welcome, ${displayName}!</h2>
      <p style="margin:0;color:#334155;">Your account has been created successfully. Start posting, messaging, and following developers.</p>
    `,
  );
}

export function forgotPasswordTemplate(displayName: string, resetUrl: string) {
  return emailLayout(
    'Reset your password',
    `
      <h2 style="margin:0 0 12px;">Password reset request</h2>
      <p style="margin:0 0 16px;color:#334155;">Hi ${displayName}, we received a request to reset your password.</p>
      <a href="${resetUrl}" style="display:inline-block;background:#facc15;color:#111827;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700;">Reset password</a>
      <p style="margin:16px 0 0;color:#64748b;font-size:13px;">This link expires in 30 minutes.</p>
    `,
  );
}

export function passwordChangedTemplate(displayName: string) {
  return emailLayout(
    'Password changed',
    `
      <h2 style="margin:0 0 12px;">Password updated</h2>
      <p style="margin:0;color:#334155;">Hi ${displayName}, your password has been changed successfully.</p>
    `,
  );
}

export function newFollowerTemplate(displayName: string, followerName: string) {
  return emailLayout(
    'You have a new follower',
    `
      <h2 style="margin:0 0 12px;">New follower alert</h2>
      <p style="margin:0;color:#334155;">Hi ${displayName}, <strong>${followerName}</strong> started following you.</p>
    `,
  );
}

export function dailyDigestTemplate(displayName: string, summary: string) {
  return emailLayout(
    'Your daily DevTweet Hub digest',
    `
      <h2 style="margin:0 0 12px;">Good day, ${displayName}</h2>
      <p style="margin:0;color:#334155;">${summary}</p>
    `,
  );
}

export function emailLayout(title: string, body: string) {
  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="background:#0f172a;padding:20px 24px;">
                <h1 style="margin:0;font-size:20px;color:#facc15;">DevTweet Hub</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;">
                Sent by DevTweet Hub notifications service.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

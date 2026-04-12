/**
 * MAISON — 6-Digit Verification Code Email
 *
 * Usage:
 *   import { renderVerificationCode } from './VerificationCodeEmail';
 *   const html = renderVerificationCode({ code: '482917', userName: 'Ahmed' });
 */

export interface VerificationCodeEmailProps {
  code: string;
  userName?: string;
  expiryMinutes?: number;
  purpose?: "login" | "signup" | "password_reset" | "email_change";
}

export function renderVerificationCode(props: VerificationCodeEmailProps): string {
  const {
    code,
    userName,
    expiryMinutes = 10,
    purpose = "login",
  } = props;

  const purposeMessages: Record<string, { title: string; desc: string }> = {
    login: {
      title: "Verify Your Login",
      desc: "Use the code below to complete your sign-in to MAISON.",
    },
    signup: {
      title: "Welcome to MAISON",
      desc: "Use the code below to verify your email and activate your account.",
    },
    password_reset: {
      title: "Reset Your Password",
      desc: "Use the code below to reset your MAISON account password.",
    },
    email_change: {
      title: "Confirm Email Change",
      desc: "Use the code below to confirm your new email address.",
    },
  };

  const msg = purposeMessages[purpose] || purposeMessages.login;

  const digits = code.split("").map(
    (d) => `
    <td style="padding:0 4px;">
      <div style="width:52px;height:64px;line-height:64px;text-align:center;font-family:'Georgia',serif;font-size:28px;font-weight:700;color:#1a1714;background:#faf8f5;border:2px solid #e8e4df;border-bottom:3px solid #c9a96e;border-radius:8px;letter-spacing:0;">
        ${d}
      </div>
    </td>`
  ).join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${msg.title} — MAISON</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f0eb;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;">

  <div style="display:none;max-height:0;overflow:hidden;">
    Your MAISON verification code is ${code}. Expires in ${expiryMinutes} minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table role="presentation" width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 16px rgba(26,23,20,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1714;padding:40px 40px 32px;text-align:center;">
              <h1 style="margin:0;font-family:'Georgia','Times New Roman',serif;font-size:32px;letter-spacing:10px;color:#c9a96e;font-weight:400;">
                MAISON
              </h1>
              <p style="margin:8px 0 0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#c4b8a8;text-transform:uppercase;">
                Modern Menswear
              </p>
            </td>
          </tr>

          <!-- Gold line -->
          <tr>
            <td style="background:linear-gradient(90deg,#c9a96e,#e2c992,#c9a96e);height:3px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:48px 40px 16px;text-align:center;">
              <!-- Lock icon -->
              <div style="width:56px;height:56px;margin:0 auto 24px;border-radius:50%;background:#1a1714;line-height:56px;text-align:center;">
                <span style="font-size:24px;color:#c9a96e;">🔐</span>
              </div>
              <h2 style="margin:0 0 12px;font-family:'Georgia',serif;font-size:22px;color:#1a1714;font-weight:400;">
                ${msg.title}
              </h2>
              <p style="margin:0;font-size:15px;color:#8a8279;line-height:1.6;">
                ${userName ? `Hi <strong style="color:#1a1714;">${userName}</strong>, ` : ""}${msg.desc}
              </p>
            </td>
          </tr>

          <!-- Code Display -->
          <tr>
            <td style="padding:32px 40px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                <tr>
                  ${digits}
                </tr>
              </table>
              <p style="margin:20px 0 0;font-size:12px;color:#8a8279;">
                This code expires in <strong style="color:#c9a96e;">${expiryMinutes} minutes</strong>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #e8e4df;"></div>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding:28px 40px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#8a8279;text-transform:uppercase;">Security Notice</p>
              <p style="margin:0;font-size:13px;color:#5a554e;line-height:1.7;">
                If you did not request this code, please ignore this email.<br/>
                Never share your code with anyone — MAISON staff will never ask for it.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1a1714;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-family:'Georgia',serif;font-size:16px;letter-spacing:4px;color:#c9a96e;">MAISON</p>
              <p style="margin:0;font-size:11px;color:#a8a29a;">
                © ${new Date().getFullYear()} MAISON. All rights reserved.<br/>
                <a href="#" style="color:#c9a96e;text-decoration:none;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

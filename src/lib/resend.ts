/**
 * Resend email client — server-side only
 */
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_to_pass_build');

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'noreply@dproductselling.com';
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'D Product Selling';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ── Email: Purchase Confirmation ───────────────────────────────────────────────

export async function sendPurchaseConfirmationEmail({
  to,
  customerName,
  productName,
  orderId,
  amount,
  currency,
  downloadUrl,
}: {
  to: string;
  customerName: string;
  productName: string;
  orderId: string;
  amount: number;
  currency: string;
  downloadUrl: string;
}) {
  const amountFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount / 100);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Purchase Confirmed — ${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f17;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f17;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.3);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px;text-align:center;">
              <div style="font-size:32px;margin-bottom:8px;">✅</div>
              <h1 style="color:#fff;margin:0;font-size:28px;font-weight:700;">Payment Confirmed!</h1>
              <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:16px;">Your purchase was successful</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#e2e8f0;font-size:16px;margin:0 0 24px;">Hi ${customerName},</p>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 32px;">
                Thank you for your purchase! Your order has been confirmed and your digital product is ready to download.
              </p>

              <!-- Order Summary Box -->
              <div style="background:#0f0f17;border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:24px;margin-bottom:32px;">
                <h3 style="color:#a78bfa;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Order Summary</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="color:#94a3b8;font-size:14px;padding:6px 0;">Product</td>
                    <td style="color:#e2e8f0;font-size:14px;font-weight:600;text-align:right;">${productName}</td>
                  </tr>
                  <tr>
                    <td style="color:#94a3b8;font-size:14px;padding:6px 0;">Order ID</td>
                    <td style="color:#e2e8f0;font-size:14px;font-family:monospace;text-align:right;">${orderId.slice(0, 8).toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="color:#94a3b8;font-size:14px;padding:6px 0;">Amount Paid</td>
                    <td style="color:#22c55e;font-size:16px;font-weight:700;text-align:right;">${amountFormatted}</td>
                  </tr>
                </table>
              </div>

              <!-- Download Button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${downloadUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                  ⬇️ Download Your Product
                </a>
                <p style="color:#64748b;font-size:12px;margin:12px 0 0;">Link expires in 7 days · Max 5 downloads</p>
              </div>

              <!-- Dashboard Link -->
              <p style="color:#94a3b8;font-size:14px;text-align:center;">
                You can also access all your purchases from your
                <a href="${APP_URL}/dashboard/purchases" style="color:#a78bfa;text-decoration:none;">dashboard</a>.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0f0f17;padding:24px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="color:#475569;font-size:12px;margin:0;">${APP_NAME} · Automated receipt · Do not reply to this email</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `✅ Your purchase of "${productName}" is confirmed — ${APP_NAME}`,
    html,
  });
}

// ── Email: Download Delivery ───────────────────────────────────────────────────

export async function sendDownloadEmail({
  to,
  customerName,
  productName,
  downloadUrl,
}: {
  to: string;
  customerName: string;
  productName: string;
  downloadUrl: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f0f17;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f17;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;overflow:hidden;border:1px solid rgba(139,92,246,0.3);">
          <tr>
            <td style="background:linear-gradient(135deg,#059669,#0d9488);padding:40px;text-align:center;">
              <div style="font-size:40px;margin-bottom:8px;">📦</div>
              <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;">Your Product is Ready!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#e2e8f0;font-size:16px;margin:0 0 16px;">Hi ${customerName},</p>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 32px;">
                Your digital product <strong style="color:#e2e8f0;">"${productName}"</strong> is ready to download.
              </p>
              <div style="text-align:center;">
                <a href="${downloadUrl}" style="display:inline-block;background:linear-gradient(135deg,#059669,#0d9488);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;">
                  ⬇️ Download Now
                </a>
                <p style="color:#64748b;font-size:12px;margin:12px 0 0;">Link valid for 7 days</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#0f0f17;padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="color:#475569;font-size:12px;margin:0;">${APP_NAME} — Digital Product Delivery</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `📦 Download your "${productName}" — ${APP_NAME}`,
    html,
  });
}

// ── Email: Failed Payment ──────────────────────────────────────────────────────

export async function sendFailedPaymentEmail({
  to,
  customerName,
  productName,
  retryUrl,
}: {
  to: string;
  customerName: string;
  productName: string;
  retryUrl: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f0f17;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f17;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:16px;overflow:hidden;border:1px solid rgba(239,68,68,0.3);">
          <tr>
            <td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:40px;text-align:center;">
              <div style="font-size:40px;margin-bottom:8px;">❌</div>
              <h1 style="color:#fff;margin:0;font-size:26px;font-weight:700;">Payment Failed</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="color:#e2e8f0;font-size:16px;margin:0 0 16px;">Hi ${customerName},</p>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 32px;">
                Unfortunately, your payment for <strong style="color:#e2e8f0;">"${productName}"</strong> could not be processed.
                No amount has been charged to your account.
              </p>
              <div style="text-align:center;">
                <a href="${retryUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#4f46e5);color:#fff;text-decoration:none;padding:16px 40px;border-radius:12px;font-size:16px;font-weight:700;">
                  🔄 Try Again
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#0f0f17;padding:20px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="color:#475569;font-size:12px;margin:0;">${APP_NAME} — Payment Support</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `❌ Payment failed for "${productName}" — ${APP_NAME}`,
    html,
  });
}

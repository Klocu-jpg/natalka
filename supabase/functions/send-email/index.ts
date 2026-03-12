import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "LoveApp <noreply@loveapp.pl>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  type?: string;
}

function buildConfirmationEmail(confirmationUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#e91e63,#f06292);padding:32px;text-align:center;">
          <span style="font-size:40px;">💕</span>
          <h1 style="color:#ffffff;margin:12px 0 0;font-size:24px;font-weight:700;">LoveApp</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 12px;">Potwierdź swój email</h2>
          <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Dziękujemy za rejestrację w LoveApp! Kliknij poniższy przycisk, aby potwierdzić swój adres email i aktywować konto.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${confirmationUrl}" style="display:inline-block;background:linear-gradient(135deg,#e91e63,#f06292);color:#ffffff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
                Potwierdź email ✨
              </a>
            </td></tr>
          </table>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;text-align:center;">
            Jeśli to nie Ty, zignoruj tę wiadomość.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #f3f4f6;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} LoveApp • Aplikacja dla par</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildPasswordResetEmail(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#e91e63,#f06292);padding:32px;text-align:center;">
          <span style="font-size:40px;">🔐</span>
          <h1 style="color:#ffffff;margin:12px 0 0;font-size:24px;font-weight:700;">LoveApp</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 12px;">Resetowanie hasła</h2>
          <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Otrzymaliśmy prośbę o zmianę hasła do Twojego konta. Kliknij poniższy przycisk, aby ustawić nowe hasło.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#e91e63,#f06292);color:#ffffff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
                Ustaw nowe hasło 🔑
              </a>
            </td></tr>
          </table>
          <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;text-align:center;">
            Link jest ważny przez 1 godzinę. Jeśli nie prosiłeś o reset, zignoruj tę wiadomość.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #f3f4f6;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} LoveApp • Aplikacja dla par</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildGenericEmail(subject: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#e91e63,#f06292);padding:32px;text-align:center;">
          <span style="font-size:40px;">💕</span>
          <h1 style="color:#ffffff;margin:12px 0 0;font-size:24px;font-weight:700;">LoveApp</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 12px;">${subject}</h2>
          <div style="color:#6b7280;font-size:15px;line-height:1.6;">${body}</div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #f3f4f6;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} LoveApp • Aplikacja dla par</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { to, subject, html, type } = payload;

    if (!to || !subject) {
      throw new Error("Missing required fields: to, subject");
    }

    const emailHtml = html || buildGenericEmail(subject, "");

    console.log(`[SEND-EMAIL] Sending ${type || 'generic'} email to ${to}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html: emailHtml,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`[SEND-EMAIL] Resend error:`, JSON.stringify(data));
      throw new Error(data.message || "Failed to send email");
    }

    console.log(`[SEND-EMAIL] Success:`, JSON.stringify(data));

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[SEND-EMAIL] ERROR: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Export template builders for use by other functions
export { buildConfirmationEmail, buildPasswordResetEmail, buildGenericEmail };

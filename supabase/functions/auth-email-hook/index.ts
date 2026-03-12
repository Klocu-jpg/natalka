import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "LoveApp <noreply@loveapp.pl>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function buildConfirmationEmail(confirmationUrl: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
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
</body></html>`;
}

function buildPasswordResetEmail(resetUrl: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
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
            Otrzymaliśmy prośbę o zmianę hasła. Kliknij poniższy przycisk, aby ustawić nowe hasło.
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
</body></html>`;
}

function buildMagicLinkEmail(magicLinkUrl: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#e91e63,#f06292);padding:32px;text-align:center;">
          <span style="font-size:40px;">✉️</span>
          <h1 style="color:#ffffff;margin:12px 0 0;font-size:24px;font-weight:700;">LoveApp</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 12px;">Logowanie</h2>
          <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Kliknij poniższy przycisk, aby zalogować się do LoveApp.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${magicLinkUrl}" style="display:inline-block;background:linear-gradient(135deg,#e91e63,#f06292);color:#ffffff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
                Zaloguj się 💕
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
</body></html>`;
}

function buildEmailChangeEmail(confirmationUrl: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
        <tr><td style="background:linear-gradient(135deg,#e91e63,#f06292);padding:32px;text-align:center;">
          <span style="font-size:40px;">📧</span>
          <h1 style="color:#ffffff;margin:12px 0 0;font-size:24px;font-weight:700;">LoveApp</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <h2 style="color:#1a1a2e;font-size:20px;margin:0 0 12px;">Zmiana adresu email</h2>
          <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
            Potwierdź zmianę adresu email klikając poniższy przycisk.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${confirmationUrl}" style="display:inline-block;background:linear-gradient(135deg,#e91e63,#f06292);color:#ffffff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:15px;">
                Potwierdź zmianę ✅
              </a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #f3f4f6;">
          <p style="color:#9ca3af;font-size:11px;margin:0;">© ${new Date().getFullYear()} LoveApp • Aplikacja dla par</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendViaResend(to: string, subject: string, html: string) {
  console.log(`[AUTH-EMAIL-HOOK] Sending email to ${to}, subject: ${subject}`);

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
      html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(`[AUTH-EMAIL-HOOK] Resend error:`, JSON.stringify(data));
    throw new Error(data.message || "Resend API error");
  }

  console.log(`[AUTH-EMAIL-HOOK] Email sent successfully, id: ${data.id}`);
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log(`[AUTH-EMAIL-HOOK] Received event:`, JSON.stringify(payload));

    // The payload from Supabase auth hook contains:
    // { user, email_data: { token, token_hash, redirect_to, email_action_type, site_url } }
    const { user, email_data } = payload;
    
    if (!user?.email || !email_data) {
      // Fallback: might be called directly with { to, type, confirmation_url }
      const { to, type, confirmation_url, reset_url } = payload;
      if (to && type) {
        let subject = "LoveApp";
        let html = "";
        
        switch (type) {
          case "signup":
          case "confirmation":
            subject = "Potwierdź swój email — LoveApp 💕";
            html = buildConfirmationEmail(confirmation_url || "");
            break;
          case "recovery":
          case "password_reset":
            subject = "Resetowanie hasła — LoveApp 🔐";
            html = buildPasswordResetEmail(reset_url || confirmation_url || "");
            break;
          case "magic_link":
            subject = "Link do logowania — LoveApp ✉️";
            html = buildMagicLinkEmail(confirmation_url || "");
            break;
          case "email_change":
            subject = "Potwierdź zmianę email — LoveApp 📧";
            html = buildEmailChangeEmail(confirmation_url || "");
            break;
          default:
            subject = "Wiadomość z LoveApp 💕";
            html = buildConfirmationEmail(confirmation_url || "");
        }
        
        await sendViaResend(to, subject, html);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("Invalid payload - missing user or email_data");
    }

    const email = user.email;
    const actionType = email_data.email_action_type;
    const siteUrl = email_data.site_url || email_data.redirect_to || "";
    const tokenHash = email_data.token_hash;

    // Build confirmation URL
    let confirmationUrl = "";
    if (tokenHash) {
      const type = actionType === "recovery" ? "recovery" : 
                   actionType === "signup" ? "signup" :
                   actionType === "email_change" ? "email_change" : "signup";
      confirmationUrl = `${siteUrl}/auth/confirm?token_hash=${tokenHash}&type=${type}`;
    }

    let subject: string;
    let html: string;

    switch (actionType) {
      case "signup":
        subject = "Potwierdź swój email — LoveApp 💕";
        html = buildConfirmationEmail(confirmationUrl);
        break;
      case "recovery":
        subject = "Resetowanie hasła — LoveApp 🔐";
        html = buildPasswordResetEmail(confirmationUrl);
        break;
      case "magic_link":
      case "magiclink":
        subject = "Link do logowania — LoveApp ✉️";
        html = buildMagicLinkEmail(confirmationUrl);
        break;
      case "email_change":
        subject = "Potwierdź zmianę email — LoveApp 📧";
        html = buildEmailChangeEmail(confirmationUrl);
        break;
      default:
        subject = "Wiadomość z LoveApp 💕";
        html = buildConfirmationEmail(confirmationUrl);
    }

    await sendViaResend(email, subject, html);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[AUTH-EMAIL-HOOK] ERROR: ${msg}`);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

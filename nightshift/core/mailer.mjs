/**
 * Puna Tech — Native SMTP Mailer
 * Handles outbound B2B email dispatch using nodemailer.
 * Operates at $0 USD SaaS cost using your own corporate/Google Workspace or custom SMTP.
 * 
 * Safely falls back to simulation mode when SMTP credentials are not configured
 * or when dry-run is requested.
 */

import nodemailer from "nodemailer";

export function getMailerConfig() {
  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.SMTP_FROM || (user ? `"Puna Tech" <${user}>` : '"Puna Tech" <contacto@puna-tech.com>');
  const replyTo = process.env.SMTP_REPLY_TO || from;

  const isConfigured = Boolean(host && user && pass);

  return { host, port, secure, user, pass, from, replyTo, isConfigured };
}

/**
 * Generates high-deliverability, clean HTML email body for Puna Tech outreach
 */
export function formatEmailHtml({ text, subject, demoUrl }) {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const formattedParagraphs = paragraphs
    .map((p) => {
      // If it's a URL or contains markdown link
      const lineWithLinks = p.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
        '<a href="$2" style="color: #c2410c; font-weight: 600; text-decoration: underline;">$1</a>'
      );
      return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #1c1917;">${lineWithLinks.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");

  const demoButtonHtml = demoUrl
    ? `
    <div style="margin: 24px 0 28px;">
      <a href="${demoUrl}" style="background-color: #c2410c; color: #ffffff; padding: 12px 22px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 650; display: inline-block;">
        🎯 Ver Simulación de ROI Personalizada →
      </a>
    </div>
  `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject || "Puna Tech"}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf9; margin: 0; padding: 24px 12px; color: #1c1917;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e7e5e4; border-radius: 6px; padding: 32px 28px;">
    <div style="border-bottom: 2px solid #c2410c; padding-bottom: 12px; margin-bottom: 24px;">
      <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #1c1917;">PUNA TECH</span>
      <span style="font-size: 12px; color: #78716c; margin-left: 8px;">| Software & AI Factory</span>
    </div>

    ${formattedParagraphs}

    ${demoButtonHtml}

    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f5f5f4; font-size: 13px; color: #78716c;">
      <p style="margin: 0 0 4px; font-weight: 600; color: #44403c;">Equipo de Ingeniería & Automatización — Puna Tech</p>
      <p style="margin: 0 0 12px;">
        <a href="https://www.puna-tech.com" style="color: #c2410c; text-decoration: none;">www.puna-tech.com</a> · 
        <a href="https://cal.com/punatech" style="color: #78716c; text-decoration: underline;">Agendar demo de 15 min</a>
      </p>
      <p style="margin: 12px 0 0; font-size: 11px; color: #a8a29e; line-height: 1.4;">
        Este análisis técnico fue enviado exclusivamente a tu empresa tras una evaluación de cuellos de botella operativos. 
        Si prefieres no recibir futuros análisis, responde "baja" y eliminamos tu correo inmediatamente.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Dispatches an outbound email via SMTP or simulates sending if not configured
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.text
 * @param {string} [options.html]
 * @param {string} [options.demoUrl]
 * @param {boolean} [options.dryRun]
 */
export async function sendOutboundEmail({
  to,
  subject,
  text,
  html = undefined,
  demoUrl = undefined,
  dryRun = false,
} = {}) {
  const config = getMailerConfig();

  if (dryRun || !config.isConfigured) {
    const mode = !config.isConfigured ? "SIMULADO (SMTP sin configurar)" : "DRY-RUN";
    console.log(`[Mailer] ✉️ [${mode}] Para: ${to} | Asunto: "${subject}"`);
    return {
      success: true,
      simulated: true,
      reason: !config.isConfigured ? "SMTP_NOT_CONFIGURED" : "DRY_RUN",
      messageId: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      to,
      subject,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const mailOptions = {
      from: config.from,
      to,
      replyTo: config.replyTo,
      subject,
      text,
      html: html || formatEmailHtml({ text, subject, demoUrl }),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Mailer] ✔ Correo enviado exitosamente a ${to} (ID: ${info.messageId})`);
    return {
      success: true,
      simulated: false,
      messageId: info.messageId,
      response: info.response,
      to,
      subject,
    };
  } catch (err) {
    console.error(`[Mailer] ✖ Error al enviar correo a ${to}:`, err.message);
    return {
      success: false,
      simulated: false,
      error: err.message,
      to,
      subject,
    };
  }
}

/**
 * Validates whether the configured SMTP server accepts connections
 */
export async function verifySmtpConnection() {
  const config = getMailerConfig();
  if (!config.isConfigured) {
    return {
      ok: false,
      reason: "SMTP_NOT_CONFIGURED",
      message: "Credenciales SMTP ausentes (SMTP_HOST, SMTP_USER, SMTP_PASS)",
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 5000,
    });

    await transporter.verify();
    return { ok: true, message: `Conexión SMTP exitosa con ${config.host}:${config.port}` };
  } catch (err) {
    return { ok: false, reason: "VERIFICATION_FAILED", message: err.message };
  }
}

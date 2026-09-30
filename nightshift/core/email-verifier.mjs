/**
 * Email Verifier & Domain Mail Server Checker
 * 100% native Node.js (RFC 5322 + DNS MX resolution + TCP SMTP Handshake with safe fallback).
 * Cost: $0 USD. No external API keys required.
 */

import { resolveMx } from "node:dns/promises";
import { createConnection } from "node:net";

const RFC_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates email string against standard RFC 5322 syntax.
 */
export function validateSyntax(email) {
  if (!email || typeof email !== "string") return false;
  return RFC_EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Resolves MX records for a domain sorted by priority (lowest number = highest priority).
 */
export async function resolveDomainMx(domain) {
  if (!domain) return [];
  const cleanDomain = domain.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].trim().toLowerCase();
  try {
    const records = await resolveMx(cleanDomain);
    if (!records || records.length === 0) return [];
    return records.sort((a, b) => a.priority - b.priority).map((r) => r.exchange);
  } catch (err) {
    return [];
  }
}

/**
 * Probes SMTP server via raw TCP socket on port 25 without sending an email.
 * Safe timeout of 3000ms. If port 25 is blocked by ISP/firewall/cloud, gracefully returns unreachable.
 */
export function checkSmtpSocket({ mxHost, email, timeoutMs = 3000 }) {
  return new Promise((resolve) => {
    let resolved = false;
    let step = 0; // 0 = await 220 greeting, 1 = sent HELO, 2 = sent MAIL FROM, 3 = sent RCPT TO
    let buffer = "";

    const finish = (result) => {
      if (resolved) return;
      resolved = true;
      try {
        socket.destroy();
      } catch {}
      resolve(result);
    };

    const timer = setTimeout(() => {
      finish({ reachable: false, code: null, status: "timeout", reason: "Connection timed out after " + timeoutMs + "ms" });
    }, timeoutMs);

    let socket;
    try {
      socket = createConnection({ host: mxHost, port: 25 }, () => {
        socket.setTimeout(timeoutMs);
      });
    } catch (err) {
      clearTimeout(timer);
      return finish({ reachable: false, code: null, status: "error", reason: err.message });
    }

    socket.on("error", (err) => {
      clearTimeout(timer);
      finish({ reachable: false, code: null, status: "error", reason: err.message });
    });

    socket.on("timeout", () => {
      clearTimeout(timer);
      finish({ reachable: false, code: null, status: "timeout", reason: "Socket timed out" });
    });

    socket.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\r\n");
      const lastLine = lines[lines.length - 2] || lines[lines.length - 1] || "";
      const statusCode = parseInt(lastLine.slice(0, 3), 10);

      if (isNaN(statusCode)) return;

      if (step === 0 && statusCode === 220) {
        step = 1;
        socket.write("HELO puna-tech.com\r\n");
      } else if (step === 1 && statusCode === 250) {
        step = 2;
        socket.write("MAIL FROM:<verify@puna-tech.com>\r\n");
      } else if (step === 2 && statusCode === 250) {
        step = 3;
        socket.write(`RCPT TO:<${email}>\r\n`);
      } else if (step === 3) {
        clearTimeout(timer);
        socket.write("QUIT\r\n");
        if (statusCode === 250) {
          finish({ reachable: true, code: 250, status: "valid", reason: "Mailbox exists (250 OK)" });
        } else if (statusCode === 550 || statusCode === 551 || statusCode === 552 || statusCode === 553) {
          finish({ reachable: true, code: statusCode, status: "invalid", reason: `Rejected by recipient server (${statusCode})` });
        } else {
          finish({ reachable: true, code: statusCode, status: "ambiguous", reason: `Server response code ${statusCode}` });
        }
      }
    });
  });
}

/**
 * Generates common corporate email permutations from first/last name and domain.
 */
export function generateEmailPermutations({ firstName = "", lastName = "", domain }) {
  if (!domain) return [];
  const cleanDomain = domain.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].trim().toLowerCase();
  const f = firstName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  const l = lastName.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");

  const list = [];
  if (f && l) {
    list.push(`${f}.${l}@${cleanDomain}`);
    list.push(`${f}${l}@${cleanDomain}`);
    list.push(`${f.charAt(0)}.${l}@${cleanDomain}`);
    list.push(`${f.charAt(0)}${l}@${cleanDomain}`);
    list.push(`${f}@${cleanDomain}`);
  } else if (f) {
    list.push(`${f}@${cleanDomain}`);
  }
  // Standard operational aliases
  list.push(`operaciones@${cleanDomain}`);
  list.push(`contacto@${cleanDomain}`);

  return Array.from(new Set(list));
}

/**
 * Full 3-layer email verification: Syntax -> DNS MX -> Socket Handshake (safe fallback).
 */
export async function verifyCorporateEmail(email, { checkSmtp = true } = {}) {
  const clean = (email || "").trim().toLowerCase();

  // 1. Syntax
  if (!validateSyntax(clean)) {
    return {
      email: clean,
      syntax_valid: false,
      mx_valid: false,
      mx_host: null,
      smtp_checked: false,
      smtp_code: null,
      status: "invalid",
      badge: "Sintaxis inválida",
    };
  }

  const domain = clean.split("@")[1];

  // 2. DNS MX records
  const mxHosts = await resolveDomainMx(domain);
  if (!mxHosts || mxHosts.length === 0) {
    return {
      email: clean,
      syntax_valid: true,
      mx_valid: false,
      mx_host: null,
      smtp_checked: false,
      smtp_code: null,
      status: "invalid",
      badge: "Sin servidores MX",
    };
  }

  const primaryMx = mxHosts[0];

  // 3. SMTP Socket check (optional / with fallback)
  if (!checkSmtp) {
    return {
      email: clean,
      syntax_valid: true,
      mx_valid: true,
      mx_host: primaryMx,
      smtp_checked: false,
      smtp_code: null,
      status: "mx_only",
      badge: "MX Verificado",
    };
  }

  const smtpRes = await checkSmtpSocket({ mxHost: primaryMx, email: clean, timeoutMs: 2500 });

  if (smtpRes.reachable && smtpRes.code === 250) {
    return {
      email: clean,
      syntax_valid: true,
      mx_valid: true,
      mx_host: primaryMx,
      smtp_checked: true,
      smtp_code: 250,
      status: "verified",
      badge: "SMTP 250 OK",
    };
  }

  if (smtpRes.reachable && smtpRes.status === "invalid") {
    return {
      email: clean,
      syntax_valid: true,
      mx_valid: true,
      mx_host: primaryMx,
      smtp_checked: true,
      smtp_code: smtpRes.code,
      status: "invalid",
      badge: `Rechazado (${smtpRes.code})`,
    };
  }

  // If port 25 timed out or connection was blocked, we fall back to MX Valid
  return {
    email: clean,
    syntax_valid: true,
    mx_valid: true,
    mx_host: primaryMx,
    smtp_checked: false,
    smtp_code: null,
    status: "mx_only",
    badge: "MX Verificado (DNS OK)",
  };
}

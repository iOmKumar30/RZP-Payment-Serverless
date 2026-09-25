import crypto from "crypto";
import jwt from "jsonwebtoken";

const ALLOWED_ORIGINS = new Set([
  "https://donate.relf.in",
  "https://rms.relf.in",
  "https://relf.in"
]);

const MAX_FIELD_LENGTH = 500;

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return String(value || req.headers["x-real-ip"] || "unknown")
    .split(",")[0]
    .trim();
}

export function hashIp(ip) {
  const secret = process.env.RATE_LIMIT_IP_HASH_SECRET;
  if (!secret) throw new Error("RATE_LIMIT_IP_HASH_SECRET is not configured");
  return crypto.createHmac("sha256", secret).update(ip).digest("hex");
}

export function enforceCors(req, res, methods = ["POST"]) {
  const origin = req.headers.origin;

  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    res.status(403).json({ error: "Request origin is not allowed" });
    return false;
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return false;
  }

  return true;
}

function normaliseText(value, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") return null;

  // Notes are rendered in receipts and exports. Strip tags and control
  // characters before persisting so markup cannot become executable content.
  const cleaned = value
    .replace(/<[^>]*>/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned && cleaned.length <= maxLength ? cleaned : null;
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
}

export function validateDonationOrder(input) {
  const amount = Number(input?.amount);
  const name = normaliseText(input?.name, 120);
  const address = normaliseText(input?.address, 300);
  const email = normaliseText(input?.email, 254)?.toLowerCase();
  const contact = String(input?.contact || "").replace(/\D/g, "");
  const reason = normaliseText(input?.reason, 150);
  const turnstileToken = normaliseText(input?.turnstileToken, 4096);
  const idempotencyKey = String(input?.idempotencyKey || "");

  if (!Number.isFinite(amount) || amount < 1 || amount > 1_000_000) {
    return { error: "Donation amount must be between ₹1 and ₹10,00,000" };
  }
  if (!name || !address || !email || !validEmail(email) || contact.length !== 10 || !reason) {
    return { error: "Please provide valid donor details" };
  }
  if (!turnstileToken) return { error: "Complete the security verification" };
  if (!/^[A-Za-z0-9_-]{16,32}$/.test(idempotencyKey)) {
    return { error: "Invalid payment attempt identifier" };
  }

  return {
    data: {
      amountInPaise: Math.round(amount * 100),
      name,
      address,
      email,
      contact,
      reason,
      turnstileToken,
      idempotencyKey,
    },
  };
}

export function validatePanUpdate(input) {
  const transactionId = normaliseText(input?.transactionId, 120);
  const pan = String(input?.pan || "").trim().toUpperCase();
  const gstno = input?.gstno ? String(input.gstno).trim().toUpperCase() : "N/A";

  if (!transactionId || !/^[A-Za-z0-9_]+$/.test(transactionId)) {
    return { error: "Invalid transaction identifier" };
  }
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
    return { error: "Invalid PAN number" };
  }
  if (gstno !== "N/A" && !/^[0-9A-Z]{15}$/.test(gstno)) {
    return { error: "Invalid GST number" };
  }

  return { data: { transactionId, pan, gstno } };
}

export async function verifyTurnstile(token, remoteIp) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) throw new Error("TURNSTILE_SECRET_KEY is not configured");

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) throw new Error("Turnstile verification request failed");

  const result = await response.json();
  return result.success === true;
}

function parseCookies(request) {
  return Object.fromEntries(
    String(request.headers.cookie || "")
      .split(";")
      .map((part) => part.trim().split(/=(.*)/s))
      .filter(([key]) => key)
      .map(([key, value]) => [key, decodeURIComponent(value || "")]),
  );
}

function adminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.DONATION_SSO_SECRET;
}

export function createAdminSession(payload) {
  const secret = adminSessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");

  return jwt.sign(
    { sub: payload.sub || payload.email || "admin", type: "relf-admin-session" },
    secret,
    { expiresIn: "15m", issuer: "donate.relf.in", audience: "donation-admin" },
  );
}

export function requireAdminSession(req, res) {
  const secret = adminSessionSecret();
  const token = parseCookies(req).relf_admin_session;
  if (!secret || !token) {
    res.status(401).json({ error: "Admin authentication required" });
    return false;
  }

  try {
    const session = jwt.verify(token, secret, {
      issuer: "donate.relf.in",
      audience: "donation-admin",
    });
    if (session.type !== "relf-admin-session") throw new Error("Invalid session");
    return true;
  } catch {
    res.status(401).json({ error: "Admin session has expired" });
    return false;
  }
}

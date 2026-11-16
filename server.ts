import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';
import fs from 'fs/promises';
import express, { type Request, type Response, type NextFunction } from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { CATALOG_PRICING, type ServerProductPricing } from './src/lib/catalogPricing.ts';
import { validateStudioDataState } from './src/lib/studioValidation.ts';
import type { StudioDataState, TierKey } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const STUDIO_EMAIL =
  process.env.STUDIO_EMAIL?.trim() ||
  process.env.CONTACT_TO_EMAIL?.trim() ||
  'mitsucrtnzz@gmail.com';
const rawWhatsappDigits = (
  process.env.STUDIO_WHATSAPP_NUMBER || '918617062980'
).replace(/[^\d]/g, '');
const STUDIO_WHATSAPP_NUMBER =
  rawWhatsappDigits.length === 10 ? `91${rawWhatsappDigits}` : rawWhatsappDigits;

const OWNER_EMAILS = (
  process.env.OWNER_EMAIL?.trim() || STUDIO_EMAIL
)
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter((e, idx, arr) => Boolean(e) && arr.indexOf(e) === idx);
const OWNER_PASSCODE = process.env.OWNER_PASSCODE?.trim() || '';
const SESSION_SECRET =
  process.env.OWNER_SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');
const OWNER_SESSION_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
const DATA_DIR = path.join(__dirname, 'data');
const CATALOG_FILE_PATH = path.join(DATA_DIR, 'studio-catalog.json');

interface PersistedCatalogFile {
  catalog: StudioDataState;
  updatedAt: string;
  updatedBy: string;
  auditLog: { timestamp: string; by: string; summary: string }[];
}

interface OwnerTokenPayload {
  email: string;
  jti: string;
  iat: number;
  exp: number;
}

const revokedTokenIds = new Set<string>();
const failedAuthTracker = new Map<string, { count: number; lockedUntil: number }>();
const pendingOtps = new Map<
  string,
  { hash: string; email: string; expiresAt: number; attempts: number }
>();

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = local.length <= 2 ? local[0] : `${local[0]}${'*'.repeat(Math.min(6, local.length - 2))}${local[local.length - 1]}`;
  return `${visible}@${domain}`;
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const rec = failedAuthTracker.get(key);
  if (!rec) return { allowed: true, retryAfterSeconds: 0 };
  const now = Date.now();
  if (rec.lockedUntil > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((rec.lockedUntil - now) / 1000) };
  }
  if (rec.lockedUntil > 0 && rec.lockedUntil <= now) {
    failedAuthTracker.delete(key);
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

function recordAuthFailure(key: string): number {
  const now = Date.now();
  const prev = failedAuthTracker.get(key);
  const count = (prev && prev.lockedUntil <= now ? prev.count : 0) + 1;
  const lockedUntil = count >= 5 ? now + 15 * 60 * 1000 : 0;
  failedAuthTracker.set(key, { count, lockedUntil });
  return Math.max(0, 5 - count);
}

function clearAuthFailures(key: string): void {
  failedAuthTracker.delete(key);
}

function sha256Buffer(value: string): Buffer {
  return crypto.createHash('sha256').update(value, 'utf8').digest();
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  return crypto.timingSafeEqual(sha256Buffer(a), sha256Buffer(b));
}

function signOwnerToken(email: string): { token: string; expiresAt: number } {
  const iat = Date.now();
  const exp = iat + OWNER_SESSION_TTL_MS;
  const payload: OwnerTokenPayload = {
    email,
    jti: crypto.randomUUID(),
    iat,
    exp,
  };
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return { token: `${encoded}.${sig}`, expiresAt: exp };
}

function verifyOwnerToken(token: string): { valid: true; payload: OwnerTokenPayload } | { valid: false; reason: string } {
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false, reason: 'Malformed session token.' };
  const [encoded, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  if (!timingSafeEqualStrings(sig, expectedSig)) {
    return { valid: false, reason: 'Invalid session signature.' };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as OwnerTokenPayload;
    if (
      !parsed ||
      typeof parsed.email !== 'string' ||
      typeof parsed.jti !== 'string' ||
      typeof parsed.exp !== 'number'
    ) {
      return { valid: false, reason: 'Invalid session claims.' };
    }
    if (Date.now() > parsed.exp) {
      return { valid: false, reason: 'Owner session expired. Please verify again.' };
    }
    if (revokedTokenIds.has(parsed.jti)) {
      return { valid: false, reason: 'Session has been signed out.' };
    }
    if (!OWNER_EMAILS.includes(parsed.email.toLowerCase())) {
      return { valid: false, reason: 'Account is not authorized as studio owner.' };
    }
    return { valid: true, payload: parsed };
  } catch {
    return { valid: false, reason: 'Unable to parse session token.' };
  }
}

interface AuthedRequest extends Request {
  ownerSession?: OwnerTokenPayload;
}

function requireOwnerAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({
      ok: false,
      error: 'Owner verification required. Only the verified studio owner can publish updates.',
    });
    return;
  }
  const verified = verifyOwnerToken(token);
  if (!verified.valid) {
    res.status(401).json({ ok: false, error: verified.reason });
    return;
  }
  req.ownerSession = verified.payload;
  next();
}

function isAutomatedEmailReady(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() ||
      (process.env.SMTP_HOST?.trim() &&
        process.env.SMTP_USER?.trim() &&
        process.env.SMTP_PASS?.trim())
  );
}

function isAutomatedWhatsappReady(): boolean {
  return Boolean(
    (process.env.WHATSAPP_ACCESS_TOKEN?.trim() &&
      process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()) ||
      (process.env.TWILIO_ACCOUNT_SID?.trim() &&
        process.env.TWILIO_AUTH_TOKEN?.trim() &&
        process.env.TWILIO_WHATSAPP_FROM?.trim())
  );
}

async function readPersistedCatalog(): Promise<PersistedCatalogFile | null> {
  try {
    const raw = await fs.readFile(CATALOG_FILE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as PersistedCatalogFile;
    if (parsed && parsed.catalog && Array.isArray(parsed.catalog.products)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

async function writePersistedCatalog(record: PersistedCatalogFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpPath = `${CATALOG_FILE_PATH}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(record, null, 2), 'utf8');
  await fs.rename(tmpPath, CATALOG_FILE_PATH);
}

async function getLiveCatalogPricing(): Promise<Record<string, ServerProductPricing>> {
  const persisted = await readPersistedCatalog();
  if (!persisted) return CATALOG_PRICING;
  const map: Record<string, ServerProductPricing> = {};
  for (const product of persisted.catalog.products) {
    const tierMap = {} as Record<TierKey, { label: string; price: number | null }>;
    for (const tier of product.tiers) {
      tierMap[tier.key] = { label: tier.label, price: tier.price };
    }
    map[product.slug] = {
      name: product.name,
      tiers: tierMap,
    };
  }
  return map;
}

interface DeliveryStatus {
  sent: boolean;
  provider: string;
  detail: string;
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function makeRef(prefix: string): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  const code = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${num}-${code}`;
}

async function dispatchEmail(params: {
  studioSubject: string;
  studioText: string;
  studioHtml: string;
  customerEmail?: string;
  customerSubject?: string;
  customerText?: string;
  customerHtml?: string;
}): Promise<DeliveryStatus> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const fromAddress =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    `MITSU Crntzz <${STUDIO_EMAIL}>`;

  if (resendKey) {
    try {
      const studioRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [STUDIO_EMAIL],
          reply_to: params.customerEmail || undefined,
          subject: params.studioSubject,
          html: params.studioHtml,
          text: params.studioText,
        }),
      });

      if (!studioRes.ok) {
        const errBody = await studioRes.text();
        return {
          sent: false,
          provider: 'resend',
          detail: `Email provider did not accept the request: ${errBody}`,
        };
      }

      if (params.customerEmail && params.customerSubject && params.customerHtml) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [params.customerEmail],
            reply_to: STUDIO_EMAIL,
            subject: params.customerSubject,
            html: params.customerHtml,
            text: params.customerText,
          }),
        }).catch(() => {});
      }

      return {
        sent: true,
        provider: 'resend',
        detail: `Delivered automatically to ${STUDIO_EMAIL}${params.customerEmail ? ` & ${params.customerEmail}` : ''}.`,
      };
    } catch (error) {
      return {
        sent: false,
        provider: 'resend',
        detail: error instanceof Error ? error.message : 'Resend delivery failed.',
      };
    }
  }

  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: fromAddress,
        to: STUDIO_EMAIL,
        replyTo: params.customerEmail || undefined,
        subject: params.studioSubject,
        text: params.studioText,
        html: params.studioHtml,
      });

      if (params.customerEmail && params.customerSubject && params.customerHtml) {
        await transporter
          .sendMail({
            from: fromAddress,
            to: params.customerEmail,
            replyTo: STUDIO_EMAIL,
            subject: params.customerSubject,
            text: params.customerText,
            html: params.customerHtml,
          })
          .catch(() => {});
      }

      return {
        sent: true,
        provider: 'smtp',
        detail: `Delivered automatically to ${STUDIO_EMAIL}${params.customerEmail ? ` & ${params.customerEmail}` : ''}.`,
      };
    } catch (error) {
      return {
        sent: false,
        provider: 'smtp',
        detail: error instanceof Error ? error.message : 'SMTP delivery failed.',
      };
    }
  }

  return {
    sent: false,
    provider: 'mailto-fallback',
    detail: `Automatic email is not connected yet. Use the "Send by email" button below to email ${STUDIO_EMAIL} directly.`,
  };
}

async function dispatchWhatsApp(messageBody: string): Promise<DeliveryStatus> {
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();

  if (waToken && waPhoneId && STUDIO_WHATSAPP_NUMBER) {
    try {
      const res = await fetch(`https://graph.facebook.com/v21.0/${waPhoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: STUDIO_WHATSAPP_NUMBER,
          type: 'text',
          text: { body: messageBody },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return {
          sent: false,
          provider: 'whatsapp-cloud',
          detail: `WhatsApp Cloud API error: ${errText}`,
        };
      }

      return {
        sent: true,
        provider: 'whatsapp-cloud',
        detail: 'Automated WhatsApp alert delivered to the studio.',
      };
    } catch (error) {
      return {
        sent: false,
        provider: 'whatsapp-cloud',
        detail: error instanceof Error ? error.message : 'WhatsApp Cloud delivery failed.',
      };
    }
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM?.trim();

  if (twilioSid && twilioToken && twilioFrom && STUDIO_WHATSAPP_NUMBER) {
    try {
      const toAddress = STUDIO_WHATSAPP_NUMBER.startsWith('whatsapp:')
        ? STUDIO_WHATSAPP_NUMBER
        : `whatsapp:+${STUDIO_WHATSAPP_NUMBER}`;
      const fromAddress = twilioFrom.startsWith('whatsapp:')
        ? twilioFrom
        : `whatsapp:${twilioFrom}`;

      const form = new URLSearchParams({
        To: toAddress,
        From: fromAddress,
        Body: messageBody,
      });

      const authHeader = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        return {
          sent: false,
          provider: 'twilio',
          detail: `Twilio WhatsApp error: ${errText}`,
        };
      }

      return {
        sent: true,
        provider: 'twilio',
        detail: 'Automated WhatsApp alert delivered via Twilio.',
      };
    } catch (error) {
      return {
        sent: false,
        provider: 'twilio',
        detail: error instanceof Error ? error.message : 'Twilio delivery failed.',
      };
    }
  }

  return {
    sent: false,
    provider: 'wa-me-link',
    detail:
      'Press "Open WhatsApp & press Send" below to send your pre-filled order message straight to the studio.',
  };
}

function buildWhatsAppLink(text: string): string {
  return `https://wa.me/${STUDIO_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

function buildMailtoLink(subject: string, body: string): string {
  return `mailto:${STUDIO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/public-config', (_req, res) => {
    res.json({
      studioEmail: STUDIO_EMAIL,
      studioWhatsappNumber: STUDIO_WHATSAPP_NUMBER,
      googleMapsApiKey:
        process.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ||
        process.env.GOOGLE_MAPS_API_KEY?.trim() ||
        '',
    });
  });

  // ----------------------------------------------------------------------------
  // Owner Verification & Protected Studio Catalog Routes
  // ----------------------------------------------------------------------------
  app.get('/api/owner/status', (_req, res) => {
    const emailOtpAvailable = isAutomatedEmailReady();
    const whatsappOtpAvailable = isAutomatedWhatsappReady();
    res.json({
      ok: true,
      configuredMethods: {
        passcode: OWNER_PASSCODE.length > 0,
        emailOtp: emailOtpAvailable,
        whatsappOtp: whatsappOtpAvailable,
      },
      ownerEmailHint: OWNER_EMAILS.length > 0 ? maskEmail(OWNER_EMAILS[0]) : '***',
    });
  });

  app.get('/api/owner/session', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      res.json({ ok: true, authenticated: false });
      return;
    }
    const verified = verifyOwnerToken(token);
    if (!verified.valid) {
      res.json({ ok: true, authenticated: false, reason: verified.reason });
      return;
    }
    res.json({
      ok: true,
      authenticated: true,
      email: verified.payload.email,
      expiresAt: verified.payload.exp,
    });
  });

  app.post('/api/owner/login', (req, res) => {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`login:${ip}`);
    if (!rate.allowed) {
      res.status(429).json({
        ok: false,
        error: `Too many failed verification attempts. Try again in ${Math.ceil(rate.retryAfterSeconds / 60)} minute(s).`,
        retryAfterSeconds: rate.retryAfterSeconds,
      });
      return;
    }

    if (OWNER_PASSCODE.length === 0) {
      res.status(503).json({
        ok: false,
        error:
          'Owner passcode is not configured on the server yet. Set OWNER_PASSCODE in your .env or hosting Secrets.',
      });
      return;
    }

    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode : '';

    if (!email || !passcode) {
      res.status(400).json({ ok: false, error: 'Owner email and studio passcode are required.' });
      return;
    }

    const emailMatches = OWNER_EMAILS.some((allowed) => timingSafeEqualStrings(email, allowed));
    const passcodeMatches = timingSafeEqualStrings(passcode, OWNER_PASSCODE);

    if (!emailMatches || !passcodeMatches) {
      const remaining = recordAuthFailure(`login:${ip}`);
      res.status(401).json({
        ok: false,
        error:
          remaining > 0
            ? `Owner verification failed. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary lockout.`
            : 'Too many failed attempts. Verification temporarily locked for 15 minutes.',
      });
      return;
    }

    clearAuthFailures(`login:${ip}`);
    const { token, expiresAt } = signOwnerToken(email);
    res.json({ ok: true, token, email, expiresAt });
  });

  app.post('/api/owner/request-otp', async (req, res) => {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`otp:${ip}`);
    if (!rate.allowed) {
      res.status(429).json({
        ok: false,
        error: `Too many OTP attempts. Try again in ${Math.ceil(rate.retryAfterSeconds / 60)} minute(s).`,
        retryAfterSeconds: rate.retryAfterSeconds,
      });
      return;
    }

    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email || !OWNER_EMAILS.some((allowed) => timingSafeEqualStrings(email, allowed))) {
      recordAuthFailure(`otp:${ip}`);
      res.status(403).json({
        ok: false,
        error: 'This email does not match the registered studio owner email.',
      });
      return;
    }

    const emailReady = isAutomatedEmailReady();
    const waReady = isAutomatedWhatsappReady();
    if (!emailReady && !waReady) {
      res.status(503).json({
        ok: false,
        error:
          'Automated Email (Resend/SMTP) or WhatsApp OTP delivery is not configured yet. Please verify with OWNER_PASSCODE or configure email/WhatsApp secrets.',
      });
      return;
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const otpHash = crypto.createHmac('sha256', SESSION_SECRET).update(`${email}:${otp}`).digest('hex');
    pendingOtps.set(email, {
      hash: otpHash,
      email,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    const text = `Your MITSU Crntzz Owner Verification Code is: ${otp}\n\nThis code expires in 5 minutes. Do not share it with anyone.`;
    const html = `
      <div style="font-family:Georgia,serif;background:#F8F0E4;color:#183923;padding:24px;max-width:480px;border:1px solid #B69A64;">
        <p style="font-style:italic;color:#CF6C87;margin:0 0 8px;">MITSU Crntzz Owner Security</p>
        <h2 style="margin:0 0 12px;font-weight:normal;">Studio Owner Verification Code</h2>
        <p style="font-family:monospace;font-size:28px;letter-spacing:6px;background:#FDF9F4;padding:12px 18px;border:1px dashed #CF6C87;display:inline-block;margin:8px 0;">${otp}</p>
        <p style="font-family:sans-serif;font-size:13px;color:#183923;">Valid for 5 minutes. Only use this if you are updating products, offers, or collections inside MITSU Crntzz.</p>
      </div>
    `;

    const deliveries = await Promise.all([
      emailReady
        ? dispatchEmail({
            studioSubject: 'MITSU Crntzz — Owner Verification Code',
            studioText: text,
            studioHtml: html,
            customerEmail: email !== STUDIO_EMAIL.toLowerCase() ? email : undefined,
            customerSubject: 'MITSU Crntzz — Owner Verification Code',
            customerText: text,
            customerHtml: html,
          })
        : Promise.resolve({ sent: false, provider: 'none', detail: '' }),
      waReady ? dispatchWhatsApp(text) : Promise.resolve({ sent: false, provider: 'none', detail: '' }),
    ]);

    if (!deliveries[0].sent && !deliveries[1].sent) {
      res.status(502).json({
        ok: false,
        error: 'Unable to deliver verification code via configured Email/WhatsApp providers.',
      });
      return;
    }

    const channels = [deliveries[0].sent ? 'Email' : null, deliveries[1].sent ? 'WhatsApp' : null]
      .filter(Boolean)
      .join(' & ');

    res.json({
      ok: true,
      detail: `A 6-digit verification code was sent to the verified owner via ${channels}.`,
    });
  });

  app.post('/api/owner/verify-otp', (req, res) => {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`otp:${ip}`);
    if (!rate.allowed) {
      res.status(429).json({
        ok: false,
        error: `Too many failed attempts. Try again in ${Math.ceil(rate.retryAfterSeconds / 60)} minute(s).`,
        retryAfterSeconds: rate.retryAfterSeconds,
      });
      return;
    }

    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';

    const record = pendingOtps.get(email);
    if (!record || Date.now() > record.expiresAt) {
      pendingOtps.delete(email);
      recordAuthFailure(`otp:${ip}`);
      res.status(401).json({
        ok: false,
        error: 'Verification code is invalid or expired. Request a new code.',
      });
      return;
    }

    record.attempts += 1;
    const expectedHash = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(`${email}:${code}`)
      .digest('hex');

    if (!timingSafeEqualStrings(expectedHash, record.hash)) {
      if (record.attempts >= 5) pendingOtps.delete(email);
      const remaining = recordAuthFailure(`otp:${ip}`);
      res.status(401).json({
        ok: false,
        error:
          remaining > 0
            ? `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
            : 'Too many failed attempts. Locked for 15 minutes.',
      });
      return;
    }

    pendingOtps.delete(email);
    clearAuthFailures(`otp:${ip}`);
    const { token, expiresAt } = signOwnerToken(email);
    res.json({ ok: true, token, email, expiresAt });
  });

  app.post('/api/owner/logout', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (token) {
      const verified = verifyOwnerToken(token);
      if (verified.valid) {
        revokedTokenIds.add(verified.payload.jti);
      }
    }
    res.json({ ok: true });
  });

  app.get('/api/studio/catalog', async (_req, res) => {
    const persisted = await readPersistedCatalog();
    if (!persisted) {
      res.json({ ok: true, customized: false, catalog: null });
      return;
    }
    res.json({
      ok: true,
      customized: true,
      catalog: persisted.catalog,
      updatedAt: persisted.updatedAt,
      updatedBy: maskEmail(persisted.updatedBy),
    });
  });

  app.put('/api/studio/catalog', requireOwnerAuth, async (req: AuthedRequest, res) => {
    const validation = validateStudioDataState(req.body?.catalog);
    if (!validation.valid) {
      res.status(400).json({
        ok: false,
        error: validation.errors[0] || 'Catalog validation failed.',
        validationErrors: validation.errors,
      });
      return;
    }

    const summary =
      typeof req.body?.summary === 'string' && req.body.summary.trim()
        ? req.body.summary.trim().slice(0, 140)
        : 'Updated studio catalog';

    const existing = await readPersistedCatalog();
    const updatedAt = new Date().toISOString();
    const ownerEmail = req.ownerSession!.email;
    const nextAudit = [
      { timestamp: updatedAt, by: ownerEmail, summary },
      ...(existing?.auditLog || []),
    ].slice(0, 25);

    await writePersistedCatalog({
      catalog: req.body.catalog as StudioDataState,
      updatedAt,
      updatedBy: ownerEmail,
      auditLog: nextAudit,
    });

    res.json({
      ok: true,
      updatedAt,
      updatedBy: ownerEmail,
      auditLog: nextAudit,
    });
  });

  app.post('/api/studio/catalog/reset', requireOwnerAuth, async (_req, res) => {
    try {
      await fs.unlink(CATALOG_FILE_PATH);
    } catch {
      // File may already be absent
    }
    res.json({ ok: true });
  });

  app.get('/api/owner/audit', requireOwnerAuth, async (_req, res) => {
    const persisted = await readPersistedCatalog();
    res.json({
      ok: true,
      updatedAt: persisted?.updatedAt || null,
      auditLog: persisted?.auditLog || [],
    });
  });

  // 1. Order Notification Route (Stateless, server-side INR re-pricing, NO database)
  app.post('/api/orders', async (req, res) => {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      deliveryMapUrl,
      notes,
      items,
    } = req.body || {};

    if (
      !customerName ||
      !customerPhone ||
      !shippingAddress ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(400).json({ ok: false, error: 'Missing required customer or bag fields.' });
      return;
    }

    const validatedLines: {
      slug: string;
      name: string;
      tier: TierKey;
      tierLabel: string;
      quantity: number;
      price: number | null;
      lineTotal: number;
    }[] = [];

    let subtotal = 0;
    let pricedCount = 0;
    let quotedCount = 0;
    let totalItems = 0;

    const livePricingMap = await getLiveCatalogPricing();

    for (const rawItem of items) {
      const slug = typeof rawItem?.slug === 'string' ? rawItem.slug : '';
      const tier = (
        ['basic', 'premium', 'customise'].includes(rawItem?.tier) ? rawItem.tier : null
      ) as TierKey | null;
      const quantity = Math.floor(Number(rawItem?.quantity));

      const authoritativeProduct = livePricingMap[slug];
      if (!authoritativeProduct || !tier || !Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
        res.status(400).json({ ok: false, error: 'Invalid product, tier, or quantity.' });
        return;
      }

      const tierInfo = authoritativeProduct.tiers[tier];
      if (!tierInfo) {
        res.status(400).json({ ok: false, error: 'Invalid tier selected.' });
        return;
      }

      const itemName = authoritativeProduct.name;
      const tierLabel = tierInfo.label;
      const tierPrice: number | null = tierInfo.price;

      const lineTotal = tierPrice === null ? 0 : tierPrice * quantity;
      if (tierPrice === null) {
        quotedCount += quantity;
      } else {
        pricedCount += quantity;
        subtotal += lineTotal;
      }
      totalItems += quantity;

      validatedLines.push({
        slug,
        name: itemName,
        tier,
        tierLabel,
        quantity,
        price: tierPrice,
        lineTotal,
      });
    }

    const reference = makeRef('MC');

    const itemLines = validatedLines
      .map((line) =>
        line.price === null
          ? `• ${line.name} — ${line.tierLabel} · Qty ${line.quantity} · price to be quoted`
          : `• ${line.name} — ${line.tierLabel} · Qty ${line.quantity} × ${formatINR(line.price)} = ${formatINR(line.lineTotal)}`
      )
      .join('\n');

    const summaryLines = [
      `Hello MITSU Crntzz ♡`,
      `Order Enquiry · Ref ${reference}`,
      ``,
      `Items:`,
      itemLines,
      ``,
      pricedCount > 0
        ? `Subtotal (${pricedCount} priced ${pricedCount === 1 ? 'item' : 'items'}): ${formatINR(subtotal)}`
        : null,
      quotedCount > 0 ? `Customise item to be quoted: ${quotedCount}` : null,
      `Delivery charges: to be confirmed on WhatsApp`,
      ``,
      `Customer Details:`,
      `Name: ${customerName}`,
      `WhatsApp: ${customerPhone}`,
      customerEmail ? `Email: ${customerEmail}` : null,
      `Address: ${shippingAddress}`,
      typeof deliveryMapUrl === 'string' && deliveryMapUrl.startsWith('https://')
        ? `Location Pin: ${deliveryMapUrl}`
        : null,
      notes ? `Notes: ${notes}` : null,
    ]
      .filter((l) => l !== null)
      .join('\n');

    const itemsHtml = validatedLines
      .map(
        (line) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #e6dccb;">
              ${escapeHtml(line.name)} <span style="color:#5b675e;">(${escapeHtml(line.tierLabel)})</span>
            </td>
            <td style="padding:8px 12px;border-bottom:1px solid #e6dccb;text-align:center;">${line.quantity}</td>
            <td style="padding:8px 0;border-bottom:1px solid #e6dccb;text-align:right;">
              ${line.price === null ? 'To be quoted' : formatINR(line.lineTotal)}
            </td>
          </tr>`
      )
      .join('');

    const htmlBody = `
      <div style="font-family:Georgia,serif;background:#F8F0E4;color:#183923;padding:28px;max-width:600px;margin:0 auto;border:1px solid #B69A64;">
        <p style="font-style:italic;color:#CF6C87;margin:0 0 6px;">MITSU Crntzz Studio</p>
        <h1 style="font-weight:normal;margin:0 0 18px;font-size:26px;">Order Enquiry · ${reference}</h1>
        <p style="font-family:sans-serif;font-size:14px;line-height:1.6;">
          <strong>Name:</strong> ${escapeHtml(customerName)}<br/>
          <strong>WhatsApp:</strong> ${escapeHtml(customerPhone)}<br/>
          ${customerEmail ? `<strong>Email:</strong> ${escapeHtml(customerEmail)}<br/>` : ''}
          <strong>Delivery Address:</strong> ${escapeHtml(shippingAddress)}
        </p>
        <table style="width:100%;border-collapse:collapse;font-family:sans-serif;font-size:14px;margin:18px 0;">
          <thead>
            <tr style="border-bottom:1px solid #B69A64;text-align:left;">
              <th style="padding:8px 0;">Piece</th>
              <th style="padding:8px 12px;text-align:center;">Qty</th>
              <th style="padding:8px 0;text-align:right;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p style="font-family:sans-serif;font-size:14px;text-align:right;margin:8px 0;">
          <strong>Subtotal (priced items): ${formatINR(subtotal)}</strong>
          ${quotedCount > 0 ? `<br/><span style="color:#5b675e;">+ ${quotedCount} Customise item(s) to be quoted</span>` : ''}
        </p>
        ${
          notes
            ? `<p style="font-family:sans-serif;font-size:13px;background:#EFE4D3;padding:12px;border:1px solid #B69A64;"><strong>Order Notes:</strong> ${escapeHtml(notes)}</p>`
            : ''
        }
      </div>
    `;

    const [emailStatus, whatsappStatus] = await Promise.all([
      dispatchEmail({
        studioSubject: `Order Enquiry ${reference} — ${customerName} (${formatINR(subtotal)})`,
        studioText: summaryLines,
        studioHtml: htmlBody,
        customerEmail: customerEmail || undefined,
        customerSubject: `MITSU Crntzz — Order Enquiry ${reference}`,
        customerText: `Thank you for your order enquiry with MITSU Crntzz.\n\n${summaryLines}`,
        customerHtml: htmlBody,
      }),
      dispatchWhatsApp(summaryLines),
    ]);

    res.json({
      ok: true,
      reference,
      subtotal,
      itemCount: totalItems,
      pricedCount,
      quotedCount,
      lines: validatedLines,
      message: summaryLines,
      emailStatus,
      whatsappStatus,
      whatsappUrl: buildWhatsAppLink(summaryLines),
      mailtoUrl: buildMailtoLink(`Order Enquiry ${reference} — ${customerName}`, summaryLines),
    });
  });

  // 2. Custom Creations Commission Enquiry Route (Stateless, NO database)
  app.post('/api/enquiries', async (req, res) => {
    const {
      clientName,
      clientEmail,
      clientPhone,
      creationType,
      occasion,
      timeline,
      budgetRange,
      description,
    } = req.body || {};

    if (!clientName || !clientPhone || !creationType || !description) {
      res.status(400).json({ ok: false, error: 'Missing required enquiry fields.' });
      return;
    }

    const reference = makeRef('INQ');
    const plainSummary = [
      `Hello MITSU Crntzz ♡`,
      `Custom Order Enquiry · Ref ${reference}`,
      ``,
      `Name: ${clientName}`,
      `WhatsApp: ${clientPhone}`,
      clientEmail ? `Email: ${clientEmail}` : null,
      `What I'd like made: ${creationType}`,
      occasion ? `Occasion: ${occasion}` : null,
      budgetRange ? `Budget: ${budgetRange}` : null,
      timeline ? `Needed by: ${timeline}` : null,
      ``,
      `Idea:`,
      description,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const htmlBody = `
      <div style="font-family:Georgia,serif;background:#F8F0E4;color:#183923;padding:28px;max-width:600px;margin:0 auto;border:1px solid #B69A64;">
        <p style="font-style:italic;color:#CF6C87;margin:0 0 6px;">MITSU Crntzz Custom Creations</p>
        <h1 style="font-weight:normal;margin:0 0 18px;font-size:26px;">Custom Enquiry · ${reference}</h1>
        <p style="font-family:sans-serif;font-size:14px;line-height:1.6;">
          <strong>Name:</strong> ${escapeHtml(clientName)}<br/>
          <strong>WhatsApp:</strong> ${escapeHtml(clientPhone)}<br/>
          ${clientEmail ? `<strong>Email:</strong> ${escapeHtml(clientEmail)}<br/>` : ''}
          <strong>Type:</strong> ${escapeHtml(creationType)}<br/>
          ${occasion ? `<strong>Occasion:</strong> ${escapeHtml(occasion)}<br/>` : ''}
          ${budgetRange ? `<strong>Budget:</strong> ${escapeHtml(budgetRange)}<br/>` : ''}
          ${timeline ? `<strong>Needed by:</strong> ${escapeHtml(timeline)}` : ''}
        </p>
        <div style="font-family:sans-serif;font-size:14px;line-height:1.6;background:#EFE4D3;padding:14px;border:1px solid #B69A64;">
          <strong>Idea:</strong><br/>
          ${escapeHtml(description).replace(/\n/g, '<br/>')}
        </div>
      </div>
    `;

    const [emailStatus, whatsappStatus] = await Promise.all([
      dispatchEmail({
        studioSubject: `Custom Enquiry ${reference} — ${creationType} (${clientName})`,
        studioText: plainSummary,
        studioHtml: htmlBody,
        customerEmail: clientEmail || undefined,
        customerSubject: `MITSU Crntzz — Custom Enquiry ${reference}`,
        customerText: `Thank you for sharing your custom idea with MITSU Crntzz.\n\n${plainSummary}`,
        customerHtml: htmlBody,
      }),
      dispatchWhatsApp(plainSummary),
    ]);

    res.json({
      ok: true,
      enquiryId: reference,
      message: plainSummary,
      emailStatus,
      whatsappStatus,
      whatsappUrl: buildWhatsAppLink(plainSummary),
      mailtoUrl: buildMailtoLink(`Custom Enquiry ${reference} — ${creationType}`, plainSummary),
    });
  });

  // 3. General Contact Correspondence Route (Stateless, NO database)
  app.post('/api/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body || {};

    if (!name || !email || !message) {
      res.status(400).json({ ok: false, error: 'Missing required contact fields.' });
      return;
    }

    const reference = makeRef('MSG');
    const plainSummary = [
      `Hello MITSU Crntzz ♡`,
      `Website Message · Ref ${reference}`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      `Subject: ${subject || 'Studio Enquiry'}`,
      ``,
      message,
    ]
      .filter((line) => line !== null)
      .join('\n');

    const htmlBody = `
      <div style="font-family:Georgia,serif;background:#F8F0E4;color:#183923;padding:28px;max-width:600px;margin:0 auto;border:1px solid #B69A64;">
        <p style="font-style:italic;color:#CF6C87;margin:0 0 6px;">MITSU Crntzz Correspondence</p>
        <h1 style="font-weight:normal;margin:0 0 18px;font-size:24px;">${escapeHtml(subject || 'Studio Message')}</h1>
        <p style="font-family:sans-serif;font-size:14px;">
          <strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})<br/>
          ${phone ? `<strong>Phone:</strong> ${escapeHtml(phone)}<br/>` : ''}
          <strong>Reference:</strong> ${reference}
        </p>
        <div style="font-family:sans-serif;font-size:14px;line-height:1.6;background:#EFE4D3;padding:14px;border:1px solid #B69A64;">
          ${escapeHtml(message).replace(/\n/g, '<br/>')}
        </div>
      </div>
    `;

    const [emailStatus, whatsappStatus] = await Promise.all([
      dispatchEmail({
        studioSubject: `[${reference}] ${subject || 'Studio Enquiry'} — ${name}`,
        studioText: plainSummary,
        studioHtml: htmlBody,
        customerEmail: email,
        customerSubject: `MITSU Crntzz — We received your note (${reference})`,
        customerText: `Thank you for writing to MITSU Crntzz.\n\n${plainSummary}`,
        customerHtml: htmlBody,
      }),
      dispatchWhatsApp(plainSummary),
    ]);

    res.json({
      ok: true,
      referenceId: reference,
      emailStatus,
      whatsappStatus,
      whatsappUrl: buildWhatsAppLink(plainSummary),
      mailtoUrl: buildMailtoLink(`Website enquiry ${reference} — ${subject}`, plainSummary),
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MITSU Crntzz server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

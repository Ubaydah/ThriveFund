import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../config/env';
import type { JwtPayload } from './auth.middleware';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

const SENSITIVE_FIELDS = new Set([
  'password',
  'current_password',
  'new_password',
  'refresh_token',
  'access_token',
  'password_hash',
]);
const SENSITIVE_PATH_PREFIXES = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/forgot-password',
];

type LogLevel = 'basic' | 'detailed' | 'debug';

const LIMITS: Record<LogLevel, number> = {
  basic: 0,
  detailed: 1200,
  debug: 4000,
};

function shouldLog(): boolean {
  if (env.LOG_HTTP === 'true') return true;
  if (env.LOG_HTTP === 'false') return false;
  return env.NODE_ENV === 'development';
}

function logLevel(): LogLevel {
  const level = env.LOG_HTTP_LEVEL;
  if (level === 'basic' || level === 'detailed' || level === 'debug') return level;
  return 'detailed';
}

function ts(): string {
  return new Date().toISOString().slice(11, 23);
}

function divider(char = '─') {
  console.log(char.repeat(72));
}

function sanitize(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(sanitize);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    out[key] = SENSITIVE_FIELDS.has(key) ? '[REDACTED]' : sanitize(value);
  }
  return out;
}

function isSensitivePath(url: string): boolean {
  const path = url.split('?')[0];
  return SENSITIVE_PATH_PREFIXES.some((p) => path.startsWith(p));
}

function formatJson(value: unknown, maxChars: number): string {
  if (maxChars === 0) return '[body omitted — LOG_HTTP_LEVEL=basic]';
  try {
    const safe = value;
    const pretty = JSON.stringify(safe, null, 2);
    if (pretty.length <= maxChars) return pretty;
    return `${pretty.slice(0, maxChars)}\n  … (+${pretty.length - maxChars} chars)`;
  } catch {
    return '[unserializable]';
  }
}

function summarizePayload(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;

  if (b.success === false && b.error && typeof b.error === 'object') {
    const err = b.error as Record<string, unknown>;
    const parts = [`code=${err.code}`, `message=${err.message}`];
    if (Array.isArray(err.details)) parts.push(`details=${err.details.length} item(s)`);
    return parts.join(' · ');
  }

  if (b.success === true) {
    const parts = ['success'];
    if (b.meta && typeof b.meta === 'object') {
      const m = b.meta as Record<string, unknown>;
      parts.push(`meta(page=${m.page}, total=${m.total})`);
    }
    if (Array.isArray(b.data)) {
      parts.push(`data=array[${b.data.length}]`);
      if (b.data[0] && typeof b.data[0] === 'object') {
        parts.push(`keys=${Object.keys(b.data[0] as object).slice(0, 6).join(',')}`);
      }
    } else if (b.data && typeof b.data === 'object') {
      parts.push(`data=object{${Object.keys(b.data as object).join(',')}}`);
    } else if (b.data !== undefined) {
      parts.push(`data=${typeof b.data}`);
    }
    return parts.join(' · ');
  }

  return null;
}

function clientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress ?? 'unknown';
}

function peekUser(req: Request): JwtPayload | undefined {
  if (req.user) return req.user;
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return undefined;
  try {
    const decoded = jwt.decode(header.slice(7));
    if (decoded && typeof decoded === 'object' && 'sub' in decoded) {
      return decoded as JwtPayload;
    }
  } catch {
    // ignore
  }
  return undefined;
}

function statusLabel(code: number): string {
  if (code >= 500) return 'ERROR';
  if (code >= 400) return 'FAIL';
  if (code >= 300) return 'REDIRECT';
  return 'OK';
}

/** Structured HTTP logging — request id, timing, user, body preview, response summary. */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  if (!shouldLog()) return next();

  const level = logLevel();
  const maxChars = LIMITS[level];
  const requestId = randomUUID().slice(0, 8);
  req.requestId = requestId;

  const start = process.hrtime.bigint();
  const { method, originalUrl, query, headers } = req;
  const pathOnly = originalUrl.split('?')[0];

  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  let responsePreview: unknown;
  let responseBytes = 0;

  res.json = function jsonOverride(body: unknown) {
    responsePreview = body;
    return originalJson(body);
  };

  res.send = function sendOverride(body: unknown) {
    if (responsePreview === undefined && body !== undefined) {
      const contentType = res.getHeader('Content-Type');
      if (typeof body === 'string') responseBytes = Buffer.byteLength(body);
      if (typeof contentType === 'string' && contentType.includes('json')) {
        try {
          responsePreview = typeof body === 'string' ? JSON.parse(body) : body;
        } catch {
          responsePreview = typeof body === 'string' ? body.slice(0, 200) : body;
        }
      } else if (typeof body === 'string' && body.length < 300) {
        responsePreview = body;
      } else if (typeof body === 'string') {
        responsePreview = { _binary: true, contentType, bytes: responseBytes };
      }
    }
    return originalSend(body);
  };

  // ── Request ──
  divider();
  console.log(`[${ts()}] ▶ REQUEST  ${requestId}`);
  console.log(`  ${method} ${pathOnly}`);
  if (originalUrl.includes('?')) console.log(`  query     ${originalUrl.split('?')[1]}`);
  else if (Object.keys(query).length > 0) {
    console.log(`  query     ${JSON.stringify(query)}`);
  }

  if (level !== 'basic') {
    console.log(`  client    ${clientIp(req)}`);
    const ua = headers['user-agent'];
    if (ua) console.log(`  agent     ${ua.length > 90 ? `${ua.slice(0, 90)}…` : ua}`);
    console.log(`  auth      ${headers.authorization ? 'Bearer ***' : 'none'}`);
    const user = peekUser(req);
    if (user) console.log(`  user      ${user.email} (${user.role}) · ${user.sub}`);
  }

  if (level === 'debug') {
    const interesting = ['content-type', 'origin', 'referer', 'accept'];
    for (const h of interesting) {
      const v = headers[h];
      if (v) console.log(`  hdr ${h.padEnd(12)} ${v}`);
    }
  }

  if (
    req.body &&
    typeof req.body === 'object' &&
    Object.keys(req.body).length > 0 &&
    method !== 'GET' &&
    level !== 'basic'
  ) {
    const bodyLog = isSensitivePath(originalUrl) ? sanitize(req.body) : req.body;
    console.log('  req body:');
    console.log(formatJson(bodyLog, maxChars).split('\n').map((l) => `    ${l}`).join('\n'));
  }

  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1_000_000;
    const status = res.statusCode;
    const user = req.user ?? peekUser(req);

    console.log(`[${ts()}] ◀ RESPONSE ${requestId}  ${statusLabel(status)} ${status}  ${ms.toFixed(1)}ms`);

    if (user && level !== 'basic') {
      console.log(`  user      ${user.email} (${user.role})`);
    }

    const contentType = res.getHeader('Content-Type');
    if (contentType) console.log(`  type      ${contentType}`);
    if (responseBytes > 0) console.log(`  size      ${responseBytes} bytes`);

    if (responsePreview !== undefined && level !== 'basic') {
      const preview = isSensitivePath(originalUrl) ? sanitize(responsePreview) : responsePreview;
      const summary = summarizePayload(preview);
      if (summary) console.log(`  summary   ${summary}`);

      console.log('  res body:');
      const formatted = formatJson(preview, maxChars);
      console.log(formatted.split('\n').map((l) => `    ${l}`).join('\n'));
    } else if (status === 204) {
      console.log('  res body: [204 no content]');
    } else if (level === 'basic') {
      const summary = responsePreview ? summarizePayload(responsePreview) : null;
      if (summary) console.log(`  ${summary}`);
    }

    divider();
    console.log('');
  });

  next();
}

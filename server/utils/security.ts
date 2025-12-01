import type { H3Event } from 'h3';

// Input sanitization
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  // Remove null bytes and trim
  let sanitized = input.replace(/\0/g, '').trim();
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized;
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required');
  }
  const sanitized = sanitizeString(email, 255).toLowerCase();
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  return sanitized;
}

export function sanitizePhone(phone: string): string {
  const sanitized = sanitizeString(phone, 20);
  // Allow only digits, spaces, hyphens, parentheses, and plus sign
  const phoneRegex = /^[0-9+()\-\s]{7,20}$/;
  if (!phoneRegex.test(sanitized)) {
    throw new Error('Invalid phone number format');
  }
  return sanitized;
}

export function sanitizeUrl(url: string): string | null {
  if (!url || url.trim() === '') {
    return null;
  }
  const sanitized = sanitizeString(url, 500);
  try {
    const urlObj = new URL(sanitized);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    return sanitized;
  } catch {
    throw new Error('Invalid URL format');
  }
}

export function sanitizePrice(price: string): string {
  const sanitized = sanitizeString(price, 20);
  // Allow digits, decimal point, and dollar sign
  const priceRegex = /^[\d.,$]+$/;
  if (!priceRegex.test(sanitized.replace(/\s/g, ''))) {
    throw new Error('Invalid price format');
  }
  return sanitized;
}

// Validate image data
export function validateImageData(base64Data: string, maxSizeMB: number = 5): void {
  // Check if it's a data URL
  if (!base64Data.startsWith('data:image/')) {
    throw new Error('Invalid image format');
  }

  // Extract base64 part
  const base64Part = base64Data.split(',')[1];
  if (!base64Part) {
    throw new Error('Invalid image data');
  }

  // Calculate size in bytes (approximate)
  const sizeInBytes = (base64Part.length * 3) / 4;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (sizeInBytes > maxSizeBytes) {
    throw new Error(`Image size exceeds ${maxSizeMB}MB limit`);
  }

  // Check for allowed image types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const mimeMatch = base64Data.match(/data:image\/([^;]+)/);
  if (mimeMatch && !allowedTypes.includes(`image/${mimeMatch[1]}`)) {
    throw new Error('Image type not allowed. Use JPEG, PNG, WebP, or GIF');
  }
}

// Rate limiting storage (in-memory, for production use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  event: H3Event,
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const key = identifier;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // Create new record
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Get client IP for rate limiting
export function getClientIP(event: H3Event): string {
  const headers = event.node.req.headers;
  // Check for forwarded IP (from proxy/load balancer)
  const forwarded = headers['x-forwarded-for'] || headers['x-real-ip'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
  }
  return event.node.req.socket?.remoteAddress || 'unknown';
}

// Security headers
export function setSecurityHeaders(event: H3Event): void {
  // Don't set headers if they're already set
  if (event.node.res.headersSent) {
    return;
  }

  try {
    // Content Security Policy (relaxed for development, can be tightened in production)
    // Note: CSP is set but not too restrictive to allow the app to function
    if (process.env.NODE_ENV === 'production') {
      event.node.res.setHeader(
        'Content-Security-Policy',
        [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          // Allow blob: for local file previews and data: for base64 images
          "img-src 'self' data: https: blob:",
          "font-src 'self' data:",
          "connect-src 'self' https:",
        ].join('; ') + ';'
      );
    }

    // XSS Protection
    event.node.res.setHeader('X-XSS-Protection', '1; mode=block');

    // Prevent MIME type sniffing
    event.node.res.setHeader('X-Content-Type-Options', 'nosniff');

    // Frame options
    event.node.res.setHeader('X-Frame-Options', 'DENY');

    // Referrer Policy
    event.node.res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    event.node.res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=()'
    );
  } catch (err) {
    // Silently fail if headers can't be set (e.g., response already sent)
    console.error('Failed to set security headers:', err);
  }
}

// Validate array of strings (for classes list)
export function validateStringArray(arr: string[], maxItems: number = 10, maxItemLength: number = 50): string[] {
  if (!Array.isArray(arr)) {
    throw new Error('Invalid array format');
  }
  if (arr.length > maxItems) {
    throw new Error(`Array exceeds maximum length of ${maxItems}`);
  }
  return arr
    .filter((item) => typeof item === 'string' && item.trim().length > 0)
    .map((item) => sanitizeString(item, maxItemLength))
    .filter((item) => item.length > 0);
}

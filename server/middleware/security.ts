import { setSecurityHeaders, getClientIP, rateLimit } from '../utils/security';

export default defineEventHandler(async (event) => {
  // Only apply security middleware in production
  // In development, skip to avoid blocking requests
  if (process.env.NODE_ENV === 'production') {
    try {
      // Set security headers for all requests
      setSecurityHeaders(event);

      // Rate limiting for API endpoints
      const url = event.node.req.url || '';
      if (url.startsWith('/api/')) {
        const clientIP = getClientIP(event);
        
        // Stricter rate limiting for auth endpoints
        if (url.startsWith('/api/auth/')) {
          const allowed = rateLimit(event, `auth:${clientIP}`, 10, 60000); // 10 requests per minute
          if (!allowed) {
            throw createError({
              statusCode: 429,
              statusMessage: 'Too many requests. Please try again later.',
            });
          }
        } else {
          // General API rate limiting
          const allowed = rateLimit(event, `api:${clientIP}`, 100, 60000); // 100 requests per minute
          if (!allowed) {
            throw createError({
              statusCode: 429,
              statusMessage: 'Too many requests. Please try again later.',
            });
          }
        }
      }
    } catch (err: any) {
      // If it's already an H3 error, re-throw it
      if (err.statusCode) {
        throw err;
      }
      // Log other errors but don't block the request
      console.error('Security middleware error:', err);
    }
  } else {
    // In development, only set basic security headers (no CSP, no rate limiting)
    try {
      event.node.res.setHeader('X-Content-Type-Options', 'nosniff');
    } catch (err) {
      // Ignore errors
    }
  }
});

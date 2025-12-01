# Security Guide

This document outlines the security measures implemented in the PH Legends Marketplace application.

## 🔒 Security Features

### 1. Input Validation & Sanitization
- All user inputs are sanitized and validated before processing
- String length limits to prevent buffer overflow attacks
- Email format validation
- Phone number format validation
- URL validation (only http/https allowed)
- Price format validation
- Array validation with limits

### 2. Authentication Security
- Passwords are hashed using bcrypt (10 salt rounds)
- Minimum password length: 8 characters
- Maximum password length: 128 characters
- Weak password detection
- Generic error messages to prevent user enumeration
- Rate limiting on authentication endpoints (5 requests per minute)

### 3. File Upload Security
- Image type validation (JPEG, PNG, WebP, GIF only)
- Maximum file size: 5MB per image
- Maximum 10 images per listing
- Base64 encoding validation
- MIME type verification

### 4. Rate Limiting
- Authentication endpoints: 5 requests per minute per IP
- General API endpoints: 100 requests per minute per IP
- Prevents brute force attacks and API abuse

### 5. Security Headers
- Content Security Policy (CSP)
- X-XSS-Protection
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy

### 6. Error Handling
- Generic error messages to prevent information leakage
- Internal errors are logged but not exposed to clients
- Proper HTTP status codes

### 7. Database Security
- Row Level Security (RLS) policies enabled
- Parameterized queries (via Supabase client)
- SQL injection prevention
- User data isolation

## 🚀 Production Deployment Checklist

### Environment Variables
Ensure these are set in your production environment:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
```

### HTTPS
- **REQUIRED**: Always use HTTPS in production
- Configure SSL/TLS certificates
- Redirect HTTP to HTTPS

### Database
- Review and test RLS policies
- Ensure admin users are properly configured
- Regular database backups
- Monitor database access logs

### Additional Recommendations

1. **Use Environment Variables**
   - Never commit `.env` files
   - Use secure secret management (e.g., Vercel, Railway secrets)

2. **Enable CORS Properly**
   - Configure CORS to only allow your domain
   - Don't use wildcard (`*`) in production

3. **Monitoring & Logging**
   - Set up error monitoring (e.g., Sentry)
   - Monitor rate limit violations
   - Log security events

4. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Apply security patches promptly

5. **Backup Strategy**
   - Regular database backups
   - Test backup restoration
   - Store backups securely

6. **Access Control**
   - Limit admin access
   - Use strong admin passwords
   - Consider 2FA for admin accounts

## ⚠️ Security Considerations

### Current Limitations
- Rate limiting uses in-memory storage (consider Redis for production)
- Session management uses localStorage (consider server-side sessions)
- No 2FA implementation
- No email verification

### Future Enhancements
- Implement JWT tokens for better session management
- Add email verification
- Implement 2FA for admin accounts
- Add CAPTCHA for registration/login
- Implement Redis for distributed rate limiting
- Add request signing for sensitive operations

## 📝 Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:
1. Do not open a public issue
2. Contact the maintainers privately
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before disclosure

# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env` file (or set in your hosting platform):
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=production
```

### 2. Database Setup
1. Run the SQL schema in Supabase SQL Editor (`database/schema.sql`)
2. Create an admin user:
   ```sql
   UPDATE users SET is_admin = TRUE WHERE email = 'your-admin@email.com';
   ```

### 3. Security Review
- ✅ All environment variables are set
- ✅ HTTPS is enabled
- ✅ Database RLS policies are active
- ✅ Admin accounts are secured
- ✅ Rate limiting is configured
- ✅ Security headers are enabled

## 📦 Deployment Platforms

### Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NODE_ENV=production`
4. Deploy!

### Netlify
1. Push code to GitHub
2. Create new site in Netlify
3. Add environment variables
4. Build command: `npm run build`
5. Publish directory: `.output/public`
6. Deploy!

### Railway / Render
1. Connect GitHub repository
2. Add environment variables
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Deploy!

## 🔒 Security Configuration

### HTTPS
- **REQUIRED**: Always use HTTPS in production
- Most platforms (Vercel, Netlify) provide HTTPS automatically
- For custom domains, ensure SSL certificates are configured

### CORS
If you need to configure CORS, add to `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  // ... existing config
  nitro: {
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': 'https://yourdomain.com',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        },
      },
    },
  },
});
```

### Rate Limiting
The application includes built-in rate limiting:
- Auth endpoints: 5 requests/minute per IP
- API endpoints: 100 requests/minute per IP

For production with high traffic, consider:
- Using Redis for distributed rate limiting
- Adjusting limits based on your needs

## 📊 Monitoring

### Recommended Tools
1. **Error Tracking**: Sentry, LogRocket
2. **Analytics**: Google Analytics, Plausible
3. **Uptime Monitoring**: UptimeRobot, Pingdom
4. **Database Monitoring**: Supabase Dashboard

### Logging
- Application errors are logged to console
- Set up log aggregation for production
- Monitor rate limit violations
- Track failed authentication attempts

## 🔄 Updates & Maintenance

### Regular Tasks
1. **Weekly**: Review error logs
2. **Monthly**: Update dependencies
3. **Quarterly**: Security audit
4. **As needed**: Database backups

### Updating the Application
1. Pull latest changes
2. Run `npm install` to update dependencies
3. Test locally
4. Deploy to staging (if available)
5. Deploy to production

## 🆘 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify network connectivity

**Rate Limiting Issues**
- Check if IP is being blocked
- Review rate limit configuration
- Consider increasing limits if legitimate traffic

**Image Upload Failures**
- Verify image size is under 5MB
- Check image format (JPEG, PNG, WebP, GIF)
- Review file upload limits

## 📝 Post-Deployment

1. Test all major features
2. Verify admin panel access
3. Test user registration/login
4. Test listing creation
5. Verify notifications work
6. Check mobile responsiveness
7. Test in different browsers

## 🔐 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong admin passwords**
3. **Regularly review admin access**
4. **Monitor for suspicious activity**
5. **Keep dependencies updated**
6. **Enable database backups**
7. **Use HTTPS everywhere**
8. **Review security logs regularly**

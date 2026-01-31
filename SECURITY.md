# 🔒 Security Documentation - Lyceum 64 Platform

## Overview

This document describes the security measures implemented in the Lyceum 64 preparation platform to protect against common web vulnerabilities and attacks.

## Implemented Security Features

### 1. HTTP Security Headers (Helmet)

**Protection:** XSS, Clickjacking, MIME-sniffing, etc.

All responses include security headers:
- `Content-Security-Policy` - Prevents XSS attacks
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME-sniffing
- `Strict-Transport-Security` - Enforces HTTPS in production
- `Referrer-Policy` - Controls referrer information

**Implementation:** `src/middlewares/security.ts` - `securityHeaders`

### 2. Rate Limiting

**Protection:** Brute force attacks, DDoS

Rate limits per endpoint:
- **General API**: 100 requests per 15 minutes per IP
- **Login**: 5 attempts per 15 minutes per IP
- **Registration**: 3 registrations per hour per IP
- **Admin endpoints**: 200 requests per 15 minutes per IP

**Implementation:** `src/middlewares/security.ts` - Various limiters

### 3. Account Lockout Protection

**Protection:** Brute force password attacks

After 5 failed login attempts for a specific email:
- Account is locked for 15 minutes
- All login attempts return error
- Attempt counter shows remaining tries

**Implementation:**
- `src/middlewares/security.ts` - `checkAccountLockout`, `recordFailedLogin`
- `src/controllers/authController.ts` - Login flow

### 4. XSS (Cross-Site Scripting) Protection

**Protection:** Injection of malicious scripts

All user input is sanitized:
- HTML entities are escaped
- Scripts tags are neutralized
- Recursive sanitization for nested objects

**Implementation:** `src/middlewares/security.ts` - `xssSanitizer`

### 5. SQL Injection Protection

**Protection:** Database manipulation attacks

Double protection:
1. Pattern detection for SQL keywords (SELECT, DROP, UNION, etc.)
2. Prisma ORM with parameterized queries

**Implementation:**
- `src/middlewares/security.ts` - `sqlInjectionProtection`
- Prisma ORM - All database queries

### 6. HTTP Parameter Pollution (HPP) Protection

**Protection:** Parameter pollution attacks

Prevents duplicate parameters from being exploited.

**Implementation:** `src/middlewares/security.ts` - `parameterPollutionProtection`

### 7. JWT Security

**Protection:** Token manipulation, algorithm confusion

Enhanced JWT implementation:
- Algorithm explicitly set to HS256
- Issuer claim verification
- Strong secret enforcement (min 32 chars)
- Separate error messages for expired vs invalid tokens
- Emergency random secret in production if not configured

**Implementation:** `src/utils/jwt.ts`

### 8. Input Validation

**Protection:** Invalid data, injection attacks

All endpoints validate input using Zod schemas:
- Email format validation
- Password strength requirements (8+ chars, uppercase, lowercase, digit)
- Enum validation for status, roles, directions
- Grade range validation (8-11)
- Strict mode rejects unknown fields

**Implementation:**
- `src/utils/validation.ts` - Zod schemas
- `src/routes/admin.ts` - Admin update validation

### 9. Security Audit Logging

**Protection:** Forensics, anomaly detection

All security events are logged:
- Login attempts (success/failure)
- Account lockouts
- Admin actions
- SQL injection attempts
- XSS attempts
- Rate limit violations
- Suspicious activity

**Implementation:** `src/utils/logger.ts`

Logs are written to:
- `logs/security-audit.log` - Security events
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs

### 10. IP Blacklist

**Protection:** Persistent attackers

Ability to permanently block IP addresses:
```typescript
addToBlacklist('1.2.3.4')
```

**Implementation:** `src/middlewares/security.ts` - `checkBlacklist`

### 11. CORS (Cross-Origin Resource Sharing)

**Protection:** Unauthorized cross-origin requests

Strict CORS policy:
- Development: localhost only
- Production: configured `FRONTEND_URL` only
- Credentials allowed for authenticated requests
- 24-hour preflight cache

**Implementation:** `src/index.ts` - CORS configuration

### 12. Request Size Limiting

**Protection:** DoS via large payloads

- General: 10MB max body size
- Login: 10KB max
- Registration: 50KB max

**Implementation:**
- `src/index.ts` - Express body parser
- `src/middlewares/security.ts` - `requestSizeLimiter`

## Security Checklist for Production

### Before Deployment

- [ ] Set strong `JWT_SECRET` (min 32 characters)
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- [ ] Configure `FRONTEND_URL` in `.env`
- [ ] Ensure `NODE_ENV=production`
- [ ] Review all `.env` files are in `.gitignore`
- [ ] Enable HTTPS/TLS certificates
- [ ] Set up database backups
- [ ] Review all admin credentials
- [ ] Check `npm audit` for vulnerabilities

### Regular Maintenance

- [ ] Update dependencies monthly (`npm update`)
- [ ] Run security audit weekly (`npm audit`)
- [ ] Review security logs (`logs/security-audit.log`)
- [ ] Monitor rate limit violations
- [ ] Check for blocked IPs
- [ ] Rotate JWT secret every 90 days (invalidates all tokens)

## Environment Variables

### Critical Security Variables

```bash
# REQUIRED in production
JWT_SECRET=<strong-random-secret-min-32-chars>
FRONTEND_URL=https://yourdomain.com

# Optional security overrides
NODE_ENV=production
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
```

## Threat Model

### Protected Against

✅ SQL Injection
✅ XSS (Cross-Site Scripting)
✅ CSRF (Cross-Site Request Forgery) - via SameSite cookies
✅ Clickjacking
✅ Brute Force Attacks
✅ DDoS (Basic rate limiting)
✅ Session Hijacking (HTTPS + secure cookies)
✅ Parameter Pollution
✅ MIME-sniffing
✅ Information Disclosure (error handling)

### Additional Measures Recommended

⚠️ **Production Deployment:**
- Use reverse proxy (Nginx/Apache) with additional security
- Enable HTTPS/TLS with valid certificates
- Use Redis for distributed rate limiting
- Implement CDN with DDoS protection
- Set up monitoring/alerting (Sentry, DataDog, etc.)
- Database encryption at rest
- Regular backups with encryption
- Implement CSP reporting endpoint

⚠️ **Advanced Features:**
- Two-Factor Authentication (2FA)
- Password reset with secure tokens
- Email verification
- Session management with Redis
- IP geolocation blocking
- CAPTCHA on sensitive endpoints
- Webhook signature verification

## Incident Response

If you discover a security vulnerability:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: [your-security-email]
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

## Security Logs

### Log Locations

```
logs/
├── combined.log          # All logs
├── error.log            # Errors only
└── security-audit.log   # Security events
```

### Log Retention

- Development: 7 days
- Production: 90 days (recommended)
- Security audit logs: 1 year (recommended)

### Monitoring Alerts

Set up alerts for:
- Multiple failed login attempts (>3 in 5 minutes)
- SQL injection patterns detected
- XSS attempts
- Rate limit exceeded (>5 times per hour from same IP)
- Admin actions (DELETE, role changes)
- Account lockouts

## Testing Security

### Manual Testing

```bash
# Test rate limiting
for i in {1..10}; do curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'; done

# Test SQL injection protection
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin; DROP TABLE users;--","password":"test"}'

# Test XSS protection
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>@test.com","password":"test"}'

# Check security headers
curl -I http://localhost:3001/api/health
```

### Automated Security Scanning

```bash
# NPM audit
npm audit

# Dependency check
npm outdated

# OWASP Dependency Check (install separately)
dependency-check --project "Lyceum64" --scan .
```

## Compliance

This application implements security measures aligned with:
- OWASP Top 10 (2021)
- CWE Top 25 Most Dangerous Software Weaknesses
- NIST Cybersecurity Framework
- GDPR principles (data minimization, encryption)

## Updates

Last updated: 2026-01-31
Security review: Quarterly
Next review: 2026-04-30

---

**Remember:** Security is a continuous process, not a one-time implementation. Stay vigilant, keep dependencies updated, and monitor logs regularly.

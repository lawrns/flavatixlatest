# Security Implementation Deployment Checklist

**Date:** January 15, 2026
**Target:** Production Deployment
**Status:** Ready for Staging Deployment

---

## Implementation Complete ✅

All security features have been implemented and are ready for deployment. This checklist guides you through the deployment process.

---

## Pre-Deployment Tasks

### 1. Environment Variables

Add these required environment variables to your production environment:

```bash
# Required for CSRF protection (generate a secure random string)
CSRF_SECRET=your-secure-random-secret-here

# Required for JWT token signing (if not already set)
JWT_SECRET=your-jwt-secret-here

# Application URL for CORS configuration
NEXT_PUBLIC_APP_URL=https://flavatix.com

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Sentry (already configured)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

**Generate secure secrets:**
```bash
# CSRF_SECRET (32 bytes = 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_SECRET (32 bytes = 64 hex characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 2. Database Schema Updates

Run these SQL migrations in your Supabase database:

**user_roles table:**
```sql
-- Create user_roles table for RBAC
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- Grant admin role to initial admin user (replace with your user ID)
INSERT INTO user_roles (user_id, role, granted_by)
VALUES ('YOUR_USER_ID_HERE', 'super_admin', 'YOUR_USER_ID_HERE')
ON CONFLICT (user_id) DO NOTHING;
```

**audit_logs table:**
```sql
-- Create audit_logs table for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
```

**Row Level Security (RLS):**
```sql
-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('super_admin', 'admin')
    )
  );

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Only super_admins can manage roles
CREATE POLICY "Super admins can manage roles" ON user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'super_admin'
    )
  );

-- Users can view their own role
CREATE POLICY "Users can view own role" ON user_roles
  FOR SELECT
  USING (user_id = auth.uid());
```

---

### 3. Code Integration

**Add Cookie Consent to _app.tsx:**

```tsx
// pages/_app.tsx
import CookieConsent from '@/components/ui/CookieConsent';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Your existing app structure */}
      <Component {...pageProps} />

      {/* Add Cookie Consent Banner */}
      <CookieConsent />
    </>
  );
}

export default MyApp;
```

---

### 4. Install Development Tools

**Install Husky (if not already installed):**
```bash
npm install husky --save-dev
npx husky install
```

**Install gitleaks for secret scanning:**

**macOS:**
```bash
brew install gitleaks
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install gitleaks

# Or download from GitHub releases
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz
tar -xzf gitleaks_8.18.1_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

**Windows:**
```bash
choco install gitleaks
```

---

### 5. Update Dependencies

```bash
# Fix security vulnerabilities
npm audit fix

# Update Next.js (already done)
# npm update next

# Install any missing dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint
```

---

## Deployment Steps

### Stage 1: Deploy to Staging

1. **Merge to staging branch:**
   ```bash
   git checkout develop
   git merge feat/security-hardening
   git push origin develop
   ```

2. **Deploy to staging environment:**
   - Vercel/Netlify will auto-deploy from develop branch
   - Or manually deploy: `npm run build && npm start`

3. **Verify deployment:**
   - Check build logs for errors
   - Verify app starts successfully
   - Check environment variables are set

---

### Stage 2: Staging Testing

**Critical Tests:**

1. **Security Headers**
   ```bash
   # Test with curl
   curl -I https://staging.flavatix.com

   # Look for:
   # - Strict-Transport-Security
   # - Content-Security-Policy
   # - X-Frame-Options: DENY
   # - X-Content-Type-Options: nosniff
   ```

   **Automated Test:**
   - Visit: https://securityheaders.com/?q=staging.flavatix.com
   - Target: A+ rating

2. **CSRF Protection**
   - Create a test account
   - Attempt API requests without CSRF token (should fail with 403)
   - Verify middleware is generating CSRF tokens

3. **Password Policy**
   - Try registering with weak password (should fail)
   - Try registering with strong password (should succeed)
   - Verify all validation rules work

4. **Cookie Consent**
   - Visit homepage
   - Verify cookie banner appears
   - Test "Accept All" button
   - Test "Reject All" button
   - Test "Customize" with granular controls
   - Verify cookies are deleted when rejected

5. **GDPR APIs**

   **Data Export:**
   ```bash
   TOKEN="your_staging_token"

   curl -X POST https://staging.flavatix.com/api/user/export-data \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json"
   ```
   - Verify returns complete user data in JSON
   - Check audit log was created

   **Account Deletion:**
   ```bash
   curl -X DELETE https://staging.flavatix.com/api/user/delete-account \
     -H "Authorization: Bearer $TOKEN" \
     -H "X-CSRF-Token: $CSRF_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "password": "TestPassword123!",
       "confirmText": "DELETE"
     }'
   ```
   - Verify 30-day grace period message
   - Check account is marked for deletion
   - Verify audit log created

6. **Admin RBAC**
   - Grant admin role to test user in database
   - Access admin endpoint: `/api/admin/ai-usage-stats`
   - Verify access works for admin
   - Remove admin role
   - Verify access denied (403) for non-admin
   - Check audit logs for admin actions

7. **Privacy & Terms Pages**
   - Visit: https://staging.flavatix.com/privacy
   - Visit: https://staging.flavatix.com/terms
   - Verify content loads correctly
   - Check links work
   - Verify mobile responsive

8. **Pre-commit Hooks**
   ```bash
   # Test locally
   echo "const api_key = 'test_secret_123456789'" > test-file.js
   git add test-file.js
   git commit -m "Test secret detection"

   # Should be blocked by gitleaks
   # Clean up
   rm test-file.js
   git reset HEAD test-file.js
   ```

---

### Stage 3: Production Deployment

**ONLY proceed if all staging tests pass ✅**

1. **Create production PR:**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

2. **Update production environment variables:**
   - Set `CSRF_SECRET` (new secure value for production)
   - Set `JWT_SECRET` (existing or new secure value)
   - Set `NEXT_PUBLIC_APP_URL=https://flavatix.com`
   - Verify all other env vars are correct

3. **Run database migrations:**
   - Execute `user_roles` table creation
   - Execute `audit_logs` table creation
   - Grant initial admin roles
   - Verify RLS policies applied

4. **Deploy to production:**
   - Vercel/Netlify auto-deploy from main
   - Or manual: `npm run build && npm start`

5. **Monitor deployment:**
   - Watch build logs
   - Check Sentry for errors
   - Monitor user traffic
   - Review audit logs

---

### Stage 4: Post-Deployment Validation

**Production Tests (within 1 hour):**

1. **Security Header Check**
   - https://securityheaders.com/?q=flavatix.com
   - Target: A+ rating

2. **SSL/TLS Check**
   - https://www.ssllabs.com/ssltest/analyze.html?d=flavatix.com
   - Target: A+ rating

3. **CSRF Protection**
   - Create test account
   - Verify CSRF protection on sensitive endpoints

4. **Smoke Tests**
   - User registration with strong password
   - User login
   - Create tasting session
   - Access privacy policy
   - Cookie consent banner

5. **Admin Access**
   - Admin login
   - Access admin dashboard
   - Verify audit logs
   - Check permissions

6. **Monitoring**
   - Sentry: No new errors
   - Server logs: No security warnings
   - Database: Audit logs populating
   - Analytics: Normal traffic patterns

---

## Rollback Plan

If critical issues found in production:

1. **Immediate Rollback:**
   ```bash
   # Revert to previous deployment
   git revert <commit-hash>
   git push origin main
   ```

2. **Or manual rollback:**
   - Vercel/Netlify: Rollback to previous deployment in dashboard
   - Restore previous build

3. **Investigate:**
   - Check Sentry errors
   - Review server logs
   - Check database logs
   - User reports

4. **Fix and redeploy:**
   - Fix issues in develop branch
   - Re-test in staging
   - Deploy fix to production

---

## Post-Deployment Tasks

### Week 1

- [x] ✅ Deploy to staging
- [ ] Monitor Sentry for security issues
- [ ] Review audit logs daily
- [ ] Check user feedback
- [ ] Run security scans
- [ ] Deploy to production
- [ ] Monitor production closely

### Month 1

- [ ] Full penetration test
- [ ] Security header validation
- [ ] GDPR compliance audit
- [ ] User communication about privacy policy
- [ ] Bug bounty program consideration
- [ ] Review and update documentation

### Quarter 1

- [ ] Third-party security audit
- [ ] SOC 2 Type II preparation
- [ ] Implement MFA/2FA
- [ ] Password breach detection (HIBP)
- [ ] Enhanced rate limiting
- [ ] Account lockout policies

---

## Support & Escalation

### Security Issues

**Critical (Production Down / Data Breach):**
- Contact: security-emergency@flavatix.com
- Response Time: 1 hour
- Escalation: Luke Tenbosch (direct contact)

**High (Security Vulnerability):**
- Contact: security@flavatix.com
- Response Time: 4 hours

**Medium/Low:**
- Contact: security@flavatix.com
- Response Time: 24-72 hours

### Development Support

**Questions about implementation:**
- Review: `/SECURITY_IMPLEMENTATION_SUMMARY.md`
- Code comments in implemented files
- Slack channel: #security (if available)

---

## Success Criteria

Deployment is successful when ALL of these are ✅:

- [ ] Staging deployment successful
- [ ] All staging tests pass
- [ ] Security headers: A+ rating
- [ ] CSRF protection validated
- [ ] Password policy enforced
- [ ] Admin RBAC working
- [ ] Cookie consent functional
- [ ] GDPR APIs tested
- [ ] Privacy/Terms pages live
- [ ] Database schema updated
- [ ] Environment variables set
- [ ] No errors in Sentry
- [ ] Audit logs populating
- [ ] Production deployment successful
- [ ] Production tests pass
- [ ] Security scan: A+ rating
- [ ] User communication sent
- [ ] Team trained on new features

---

## Files Implemented

### New Files Created

**Pages:**
- `/pages/privacy.tsx` - GDPR privacy policy
- `/pages/terms.tsx` - Terms of service

**Components:**
- `/components/ui/CookieConsent.tsx` - Cookie consent banner

**API Endpoints:**
- `/pages/api/user/export-data.ts` - GDPR data export
- `/pages/api/user/delete-account.ts` - GDPR account deletion

**Library:**
- `/lib/admin/rbac.ts` - Role-based access control

**Configuration:**
- `/middleware.ts` - Edge middleware for CSRF protection
- `/.github/dependabot.yml` - Dependency scanning
- `/.github/workflows/security-scan.yml` - Security CI/CD
- `/.husky/pre-commit` - Pre-commit security hooks
- `/.huskyrc` - Husky configuration
- `/.gitleaksignore` - Gitleaks ignore patterns

**Documentation:**
- `/SECURITY_IMPLEMENTATION_SUMMARY.md` - Complete implementation guide
- `/SECURITY_DEPLOYMENT_CHECKLIST.md` - This file

### Files Modified

- `/next.config.js` - Added comprehensive security headers
- `/lib/api/middleware.ts` - Enhanced CSRF protection
- `/components/auth/AuthSection.tsx` - Enhanced password policy
- `/pages/api/admin/ai-usage-stats.ts` - Hardened with RBAC
- `/package.json` - Updated Next.js dependency

---

## Quick Reference

**Start deployment:**
```bash
# 1. Ensure on correct branch
git checkout develop

# 2. Pull latest changes
git pull origin develop

# 3. Install dependencies
npm install

# 4. Run tests
npm test && npm run lint

# 5. Deploy to staging (auto-deploy on push)
git push origin develop

# 6. After staging tests pass, deploy to production
git checkout main
git merge develop
git push origin main
```

**Environment variable template:**
```bash
# Copy to .env.production
CSRF_SECRET=<generate-with-crypto>
JWT_SECRET=<generate-with-crypto>
NEXT_PUBLIC_APP_URL=https://flavatix.com
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
NEXT_PUBLIC_SENTRY_DSN=<your-dsn>
```

**Database migrations:**
```bash
# Run in Supabase SQL editor
# 1. user_roles table
# 2. audit_logs table
# 3. RLS policies
# 4. Grant initial admin role
```

---

**Ready for Deployment:** ✅
**Last Updated:** January 15, 2026
**Prepared By:** Claude Sonnet 4.5 (Security Implementation)

# Security Policy

## Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please report it by creating a private security advisory or contacting the maintainers directly. **Do not** create a public issue for security vulnerabilities.

## Security Best Practices

### Environment Variables

1. **Never commit `.env` files** containing real credentials to version control
2. **Use `.env.example`** files as templates with placeholder values only
3. **Generate strong secrets** for JWT tokens using cryptographically secure methods:
   ```bash
   # Generate a secure JWT secret
   openssl rand -base64 32
   ```
4. **Rotate secrets regularly**, especially after team member changes
5. **Use different credentials** for development, staging, and production environments

### Password Security

- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password length: 6 characters
- Passwords should contain uppercase, lowercase, and numeric characters
- Never log or display passwords in plain text

### JWT Token Security

- Tokens expire after 7 days by default (configurable via `JWT_EXPIRE`)
- Tokens are stored in HTTP-only cookies to prevent XSS attacks
- Tokens use `sameSite: 'strict'` for CSRF protection
- Secure flag is enabled in production environments

### API Security

- **Rate Limiting**: 100 requests per 15 minutes per IP address
- **Helmet.js**: Security headers are configured
- **CORS**: Configured to allow specific origins only
- **Input Validation**: All user inputs are validated using express-validator
- **MongoDB Injection Protection**: Mongoose escapes queries automatically

### Database Security

1. **Use MongoDB Atlas** or secure MongoDB deployment
2. **Enable authentication** on MongoDB
3. **Use connection string with credentials** stored in environment variables
4. **Restrict database user permissions** to minimum required
5. **Enable network access restrictions** (IP whitelisting)
6. **Keep MongoDB drivers updated**

### Frontend Security

1. **API URLs** should be configured via environment variables
2. **Tokens stored in localStorage** are cleared on logout or 401 errors
3. **Protected routes** require authentication
4. **No sensitive data** should be stored in client-side code

### Deployment Security Checklist

#### Backend Deployment
- [ ] Set `NODE_ENV=production`
- [ ] Use strong, unique JWT_SECRET
- [ ] Configure MongoDB with strong credentials
- [ ] Enable CORS for your frontend domain only
- [ ] Set up HTTPS/TLS certificates
- [ ] Configure rate limiting appropriately for your use case
- [ ] Enable security logging and monitoring
- [ ] Keep dependencies updated

#### Frontend Deployment
- [ ] Set `VITE_API_URL` to production backend URL
- [ ] Build with production optimizations
- [ ] Serve over HTTPS
- [ ] Configure CSP (Content Security Policy) headers
- [ ] Enable HSTS (HTTP Strict Transport Security)

### Dependency Security

1. **Regularly update dependencies**:
   ```bash
   npm audit
   npm audit fix
   ```
2. **Monitor for known vulnerabilities** using tools like Snyk or Dependabot
3. **Review dependency licenses** for compliance
4. **Avoid using deprecated packages**

### Git Security

1. **Never commit secrets** to version control
2. **Review commits** before pushing to ensure no sensitive data is included
3. **Use `.gitignore`** to exclude sensitive files
4. **Scan git history** for accidentally committed secrets:
   ```bash
   # Check for potential secrets in git history
   git log -p | grep -i "password\|secret\|token\|key"
   ```
5. **If secrets are committed**, rotate them immediately and remove from history

### Common Security Anti-Patterns to Avoid

❌ **Don't:**
- Commit `.env` files with real credentials
- Use default or weak JWT secrets in production
- Store passwords in plain text
- Expose stack traces in production error messages
- Use `console.log()` for sensitive data
- Hardcode API URLs or credentials in source code
- Skip input validation
- Use outdated dependencies with known vulnerabilities

✅ **Do:**
- Use environment variables for all sensitive configuration
- Implement proper error handling
- Validate and sanitize all user inputs
- Keep dependencies updated
- Use HTTPS in production
- Implement rate limiting and request throttling
- Log security events for monitoring
- Follow the principle of least privilege

## Security Testing

### Manual Security Checks

1. **Environment Variable Leak Check**:
   ```bash
   # Search for potential hardcoded secrets
   grep -r "mongodb+srv://" --exclude-dir=node_modules --exclude-dir=.git .
   grep -r "jwt.*=" --exclude-dir=node_modules --exclude-dir=.git .
   ```

2. **Git History Check**:
   ```bash
   # Check for committed .env files
   git log --all --full-history -- "*.env"
   ```

3. **Dependency Audit**:
   ```bash
   cd backend && npm audit
   cd frontend && npm audit
   ```

### Automated Security Scanning

Consider integrating these tools into your CI/CD pipeline:
- **npm audit**: Built-in dependency vulnerability scanning
- **Snyk**: Comprehensive security scanning for dependencies
- **GitGuardian**: Secret detection in repositories
- **SonarQube**: Code quality and security analysis
- **OWASP ZAP**: Web application security testing

## Incident Response

If a security breach occurs:

1. **Immediately rotate all credentials** (JWT secrets, database passwords, API keys)
2. **Audit access logs** to determine the scope of the breach
3. **Notify affected users** if personal data was compromised
4. **Document the incident** and steps taken
5. **Review and improve** security measures to prevent recurrence

## Contact

For security concerns, please contact the repository maintainers.

---

**Last Updated**: 2024
**Version**: 1.0

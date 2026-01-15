# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@spectrumlynk.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Features

SpectXEngine has security built-in by design:

### Authentication & Authorization
- **Mandatory MFA** - No bypass allowed
- **RBAC** - Deny-by-default authorization
- **JWT** - Stateless with 15-minute expiry
- **WebAuthn** - Passkey support

### Data Protection
- **Input Validation** - Zod schemas everywhere
- **Output Sanitization** - Automatic
- **No Secrets in Code** - Environment variables only
- **Audit Logging** - Immutable activity tracking

### Infrastructure
- **Rate Limiting** - Adaptive throttling
- **Security Headers** - HSTS, CSP, X-Frame-Options, etc.
- **HTTPS Only** - Enforced in production
- **Dependency Scanning** - GitHub Dependabot enabled

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release patches as soon as possible

## Comments on This Policy

If you have suggestions on how this process could be improved, please submit a pull request.

# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | ✅ Currently supported |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT** open a public GitHub issue.
2. Email **nilesh.verma@cloudframe.com** with a detailed description of the vulnerability.
3. Include steps to reproduce, potential impact, and any suggested fixes.
4. You will receive an acknowledgment within **48 hours**.
5. We will work with you to understand the issue and coordinate a fix.

## Security Measures

This project implements the following security best practices:

- **Security headers** via `vercel.json` (X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy)
- **Dependency auditing** via `npm audit` in CI
- **No sensitive data** stored client-side — this is a fully static/client-side simulation
- **Strict TypeScript** configuration to prevent common bugs

## Disclosure Policy

We follow a coordinated disclosure process. Once a fix is available, we will:

1. Release a patched version
2. Publish a security advisory on GitHub
3. Credit the reporter (unless anonymity is requested)

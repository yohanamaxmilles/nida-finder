# NIDA Finder

A privacy-first identity verification service interface for Tanzania.

## Current implementation
- Responsive React + Vite frontend
- Express API scaffold with request validation, rate limiting, Helmet security headers, and CORS
- Consent-required verification request placeholder
- No NIDA records are queried, inferred, or stored
- Payment checkout is intentionally disabled until a merchant provider is selected and configured

## Run locally
Requires Node.js 20 or later.

```bash
npm install
cp .env.example .env
npm run dev:full
```

Frontend: http://localhost:5173  
Backend health: http://localhost:4000/api/health

## Important production requirements
1. Obtain written authorization and API documentation from NIDA or an authorized identity-verification provider.
2. Implement provider-side identity proofing, consent records, server-side authentication, access controls, audit logs, retention limits, and security review.
3. Choose a supported payment provider and implement verified server-side callbacks/webhooks before selling credits.
4. Do not put API keys, payment secrets, or personal identity records in frontend code or Git.
5. Make this repository private before adding confidential integration details.

The current verification endpoint only acknowledges a consented request with a reference ID. It does not return a person's name or NIDA number.

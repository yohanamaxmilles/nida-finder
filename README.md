# NIDA Finder

A privacy-first identity verification service interface for Tanzania.

## Current status
This repository contains the initial frontend scaffold. It does **not** access NIDA records or look up a person's identity from a phone number.

## Planned capabilities
- Phone-number entry and input validation
- Consent and identity verification flow
- Results display only after an authorized verification provider confirms the user's identity
- Copy verified details with clear user consent
- Wallet, prepaid credits, and payment-provider integration
- Admin dashboard, audit logs, and rate limiting

## Technology
- React
- Vite
- Plain CSS

## Run locally
```bash
npm install
npm run dev
```

## Required before production
1. Obtain written authorization and API documentation from NIDA or an authorized identity-verification provider.
2. Implement server-side authentication, consent capture, access controls, audit logging, and data minimization.
3. Integrate a supported payment provider. Never store payment credentials or API secrets in frontend code.
4. Move this repository to private before adding confidential configuration or production integration details.

All lookup and payment actions are placeholders until the relevant authorized services are configured.

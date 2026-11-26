# Privacy and data handling baseline

NIDA Finder is not currently connected to NIDA or an identity-verification provider.

## Data minimization
- Do not accept phone-number searches to discover another person's NIDA identity.
- A future identity check must be initiated by the person being verified or by a party with documented lawful authority.
- Use an authorized provider's identity-proofing and consent flow.
- Do not store NIDA numbers, identity-document images, or raw provider payloads unless explicitly required, approved, and protected under a documented retention policy.
- Mask phone numbers in logs and user-facing support tools.

## Security controls required before launch
- Verified account authentication and multi-factor protection for administrators.
- TLS in transit and encryption at rest.
- Least-privilege access and audited administrative actions.
- Rate limiting, abuse monitoring, secure secret management, backups, and incident response.
- Explicit consent versioning and a process to withdraw consent where applicable.
- A documented retention and deletion schedule.
- Payment webhook signature verification and idempotent crediting.

## Payment integrity
A wallet balance must only increase after the payment provider's signed server-to-server confirmation is verified. Never credit a wallet from a browser redirect or a client-supplied success flag.

## Current limitation
The current API is a development scaffold. It does not authenticate users, persist wallet balances, accept payments, or retrieve identity records. Do not use it for production transactions.

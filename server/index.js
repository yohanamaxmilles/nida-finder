import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: '10kb' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ ok: true, verificationProviderConfigured: false, paymentsConfigured: false }));

const schema = z.object({ phone: z.string().regex(/^(0[67]\\d{8}|\\+255[67]\\d{8}|255[67]\\d{8})$/), consent: z.literal(true) });
app.post('/api/verification/start', (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Namba si sahihi au ridhaa haijatolewa.' });
  // No NIDA lookup or identity data storage occurs in this scaffold.
  return res.status(202).json({ requestId: randomUUID(), status: 'pending_authorized_provider', message: 'Ombi limepokelewa; API rasmi ya uthibitishaji bado hajaunganishwa.' });
});

app.post('/api/payments/checkout', (_req, res) => res.status(503).json({ error: 'Mtoa huduma wa malipo bado hajaunganishwa. Hakuna malipo yaliyopokelewa.' }));
app.use((err, _req, res, _next) => { console.error('API error:', err?.message || 'Unknown error'); res.status(500).json({ error: 'Hitilafu ya ndani ya mfumo.' }); });
app.listen(port, () => console.log('NIDA Finder API listening on port ' + port));

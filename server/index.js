import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { z } from 'zod';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 4000);
const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined }) : null;
const jwtSecret = process.env.JWT_SECRET;
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use('/api', rateLimit({ windowMs: 900000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false }));

function requireConfig(_req, res, next) {
  if (!pool) return res.status(503).json({ error: 'Database haijaunganishwa. Weka DATABASE_URL kwenye seva.' });
  if (!jwtSecret || jwtSecret.length < 32) return res.status(503).json({ error: 'JWT_SECRET salama haijawekwa.' });
  next();
}
function setSession(res, user) {
  const token = jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '7d', issuer: 'nida-finder' });
  res.cookie('nf_session', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 604800000 });
}
async function auth(req, res, next) {
  try {
    const payload = jwt.verify(req.cookies?.nf_session || '', jwtSecret, { issuer: 'nida-finder' });
    const result = await pool.query('SELECT id, display_name, email, phone_e164, phone_verified_at, created_at FROM app_users WHERE id=$1', [payload.sub]);
    if (!result.rowCount) return res.status(401).json({ error: 'Akaunti haijapatikana.' });
    req.user = result.rows[0];
    next();
  } catch { res.status(401).json({ error: 'Tafadhali ingia tena.' }); }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, databaseConfigured: Boolean(pool), authConfigured: Boolean(jwtSecret && jwtSecret.length >= 32), verificationProviderConfigured: false, paymentsConfigured: false }));

app.post('/api/auth/register', requireConfig, async (req, res, next) => {
  try {
    const p = z.object({ displayName: z.string().trim().min(2).max(80), email: z.string().trim().email().max(254), password: z.string().min(10).max(72) }).safeParse(req.body);
    if (!p.success) return res.status(400).json({ error: 'Jina, barua pepe au nenosiri si sahihi. Nenosiri liwe na angalau herufi 10.' });
    const hash = await bcrypt.hash(p.data.password, 12);
    const q = await pool.query('INSERT INTO app_users(display_name,email,password_hash) VALUES($1,$2,$3) RETURNING id,display_name,email,created_at', [p.data.displayName,p.data.email.toLowerCase(),hash]);
    await pool.query('INSERT INTO wallets(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING', [q.rows[0].id]);
    setSession(res, q.rows[0]);
    res.status(201).json({ user: q.rows[0] });
  } catch(e) { if(e.code==='23505') return res.status(409).json({error:'Barua pepe hii tayari imesajiliwa.'}); next(e); }
});

app.post('/api/auth/login', requireConfig, async (req, res, next) => {
  try {
    const p = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(72) }).safeParse(req.body);
    if(!p.success) return res.status(400).json({error:'Weka barua pepe na nenosiri.'});
    const q=await pool.query('SELECT id,display_name,email,password_hash FROM app_users WHERE lower(email)=lower($1)',[p.data.email]);
    if(!q.rowCount || !(await bcrypt.compare(p.data.password,q.rows[0].password_hash))) return res.status(401).json({error:'Barua pepe au nenosiri si sahihi.'});
    setSession(res,q.rows[0]);
    const {password_hash,...user}=q.rows[0];
    res.json({user});
  } catch(e){next(e);}
});
app.post('/api/auth/logout',(_req,res)=>{res.clearCookie('nf_session',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'});res.json({ok:true});});
app.get('/api/auth/me',requireConfig,auth,(req,res)=>res.json({user:req.user}));

app.get('/api/wallet',requireConfig,auth,async(req,res,next)=>{
  try{
    const w=await pool.query('SELECT balance_credits FROM wallets WHERE user_id=$1',[req.user.id]);
    const t=await pool.query('SELECT id,entry_type,credits_delta,description,created_at FROM wallet_ledger WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',[req.user.id]);
    res.json({balanceCredits:Number(w.rows[0]?.balance_credits||0),transactions:t.rows});
  }catch(e){next(e);}
});

const phoneSchema=z.object({phone:z.string().regex(/^(0[67]\d{8}|\+255[67]\d{8}|255[67]\d{8})$/),consent:z.literal(true)});
app.post('/api/verification/start',(req,res)=>{const p=phoneSchema.safeParse(req.body);if(!p.success)return res.status(400).json({error:'Namba si sahihi au ridhaa haijatolewa.'});res.status(503).json({error:'Uthibitishaji unasubiri kibali na API rasmi ya mtoa huduma.'});});
app.post('/api/payments/checkout',(_req,res)=>res.status(503).json({error:'Malipo hayajawezeshwa. Hakuna fedha zilizochakatwa.'}));
app.use((e,_req,res,_next)=>{console.error('API error:',e?.message||'Unknown');res.status(500).json({error:'Hitilafu ya ndani ya mfumo.'});});
app.listen(port,()=>console.log('NIDA Finder API listening on '+port));

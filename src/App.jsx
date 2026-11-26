import { useEffect, useState } from 'react';
import { Search, Copy, Wallet, ShieldCheck, Phone, Info, CheckCircle2, Clock3, UserRound, LogOut, History, LockKeyhole, Mail, X } from 'lucide-react';

export default function App() {
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [copied, setCopied] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState({ balanceCredits: 0, transactions: [] });
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ displayName: '', email: '', password: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);

  const normalizedPhone = phone.replace(/\s+/g, '');
  const validPhone = /^(0[67]\d{8}|\+255[67]\d{8}|255[67]\d{8})$/.test(normalizedPhone);

  async function loadWallet() {
    const response = await fetch('/api/wallet', { credentials: 'include' });
    if (response.ok) setWallet(await response.json());
  }

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async response => response.ok ? response.json() : null)
      .then(data => { if (data?.user) { setUser(data.user); loadWallet(); } })
      .catch(() => {});
  }, []);

  async function handleSearch(event) {
    event.preventDefault();
    if (!validPhone || !consent) return;
    setStatus('loading');
    setCopied(false);
    setRequestId('');
    try {
      const response = await fetch('/api/verification/start', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizedPhone, consent })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Huduma haijawezeshwa.');
      setRequestId(data.requestId || '');
      setStatus('pending');
    } catch (error) {
      setAuthMessage(error.message);
      setStatus('unavailable');
    }
  }

  async function submitAuth(event) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage('');
    try {
      const response = await fetch('/api/auth/' + (authMode === 'register' ? 'register' : 'login'), {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Imeshindikana. Jaribu tena.');
      setUser(data.user);
      setAuthOpen(false);
      setAuthForm({ displayName: '', email: '', password: '' });
      await loadWallet();
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    setWallet({ balanceCredits: 0, transactions: [] });
    setWalletOpen(false);
  }

  async function copyText() {
    await navigator.clipboard.writeText(phone);
    setCopied(true);
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="NIDA Finder home">
          <span className="brand-mark"><ShieldCheck size={25} /></span>
          <span><strong>NIDA FINDER</strong><small>IDENTITY VERIFICATION</small></span>
        </a>
        <div className="top-actions">
          <button className="wallet wallet-click" type="button" onClick={() => user ? setWalletOpen(!walletOpen) : (setAuthMode('login'), setAuthOpen(true))}>
            <span className="wallet-icon"><Wallet size={18} /></span>
            <span><small>{user ? 'Credits zako' : 'Wallet'}</small><strong>{user ? wallet.balanceCredits + ' credits' : 'Ingia kwanza'}</strong></span>
          </button>
          {user ? <button className="account-button" type="button" onClick={logout}><LogOut size={16}/> Toka</button> : <button className="topup" type="button" onClick={() => { setAuthMode('register'); setAuthOpen(true); }}>Fungua akaunti</button>}
        </div>
      </header>

      {walletOpen && user && <section className="wallet-drawer">
        <div className="drawer-heading"><div><strong>Wallet yangu</strong><p>Salio na miamala ya mwisho</p></div><button className="icon-button" onClick={() => setWalletOpen(false)}><X size={18}/></button></div>
        <div className="balance-card"><small>Salio la credits</small><strong>{wallet.balanceCredits}</strong><span>Bei ya kifurushi itawekwa baadaye.</span></div>
        <div className="transactions-title"><History size={16}/> Historia ya miamala</div>
        {wallet.transactions.length ? wallet.transactions.map(item => <div className="transaction" key={item.id}><span><b>{item.description}</b><small>{new Date(item.created_at).toLocaleString('sw-TZ')}</small></span><strong className={item.credits_delta > 0 ? 'positive' : ''}>{item.credits_delta > 0 ? '+' : ''}{item.credits_delta}</strong></div>) : <p className="empty-transactions">Bado hakuna miamala.</p>}
        <p className="wallet-note">Kununua credits kutafunguliwa baada ya kuunganisha mtoa huduma wa malipo.</p>
      </section>}

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="live-dot" /> HUDUMA YA UTHIBITISHAJI</span>
          <h1>Thibitisha utambulisho<br /><span>kwa njia salama.</span></h1>
          <p>Weka namba yako ya simu ili kuanza mchakato wa uthibitishaji kupitia huduma iliyoidhinishwa.</p>
          <div className="trust-line"><ShieldCheck size={17} /> Taarifa zako zinapaswa kulindwa na kutumika kwa ridhaa yako.</div>
        </div>
        <div className="hero-art"><div className="art-ring ring-one" /><div className="art-ring ring-two" /><div className="art-card"><ShieldCheck size={55} /><span>VERIFIED</span><small>SECURE IDENTITY</small></div></div>
      </section>

      <section className="search-panel">
        <div className="section-heading">
          <div><span className="step">01</span><div><h2>Anza uthibitishaji</h2><p>Ingiza namba yako ya simu kuanza mchakato.</p></div></div>
          <span className="secure-label"><ShieldCheck size={15} /> Salama</span>
        </div>
        <form onSubmit={handleSearch}>
          <label htmlFor="phone">Namba ya simu</label>
          <div className="input-row">
            <div className="phone-input"><Phone size={19} /><span className="country-code">TZ</span><input id="phone" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" value={phone} onChange={e => { setPhone(e.target.value); setStatus('idle'); }} /></div>
            <button className="search-button" type="submit" disabled={!validPhone || !consent || status === 'loading'}><Search size={19} /> Endelea</button>
          </div>
          <p className="hint">Mfano: 0712 345 678</p>
          <label className="consent-row"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>Nathibitisha kuwa mimi ndiye mtumiaji wa namba hii au nina mamlaka halali, na nakubali taarifa zangu zithibitishwe kupitia mtoa huduma aliyeidhinishwa.</span></label>
        </form>
        {status === 'loading' && <div className="notice"><Clock3 size={19} /><div><strong>Inatuma ombi...</strong><p>Tafadhali subiri.</p></div></div>}
        {status === 'pending' && <div className="notice"><Clock3 size={19} /><div><strong>Ombi limepokelewa</strong><p>Namba ya ombi: {requestId}. Uthibitishaji halisi bado haujawezeshwa.</p></div></div>}
        {status === 'unavailable' && <div className="notice"><Info size={19} /><div><strong>Huduma haijawezeshwa</strong><p>{authMessage || 'API rasmi ya uthibitishaji bado haijaunganishwa.'}</p></div></div>}
      </section>

      <section className="result-panel">
        <div className="result-head"><div><span className="step">02</span><div><h2>Matokeo ya uthibitishaji</h2><p>Taarifa zitaonekana baada ya uthibitishaji rasmi.</p></div></div><span className="pending"><Clock3 size={14} /> Inasubiri</span></div>
        <div className="empty-result"><div className="empty-icon"><ShieldCheck size={29} /></div><strong>Hakuna matokeo bado</strong><p>Hatutaonyesha taarifa ambazo hazijathibitishwa na mtoa huduma aliyeidhinishwa.</p></div>
        <div className="result-footer"><span><CheckCircle2 size={15} /> Uthibitishaji wenye ridhaa</span><button type="button" className="copy-button" onClick={copyText} disabled={!phone}><Copy size={16} /> {copied ? 'Namba imenakiliwa' : 'Nakili namba uliyoingiza'}</button></div>
      </section>

      <footer><span>© {new Date().getFullYear()} NIDA Finder</span><span>Faragha kwanza · Uthibitishaji salama</span></footer>

      {authOpen && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAuthOpen(false); }}>
        <section className="auth-modal">
          <button className="modal-close" onClick={() => { setAuthOpen(false); setAuthMessage(''); }}><X size={19}/></button>
          <div className="auth-icon"><UserRound size={24}/></div>
          <h2>{authMode === 'register' ? 'Fungua akaunti' : 'Karibu tena'}</h2>
          <p>{authMode === 'register' ? 'Tengeneza akaunti yako ya NIDA Finder.' : 'Ingia ili kuona wallet na historia yako.'}</p>
          <form onSubmit={submitAuth} className="auth-form">
            {authMode === 'register' && <label>Jina kamili<input required minLength="2" maxLength="80" value={authForm.displayName} onChange={e => setAuthForm({...authForm, displayName:e.target.value})} placeholder="Jina lako"/></label>}
            <label><Mail size={15}/> Barua pepe<input required type="email" autoComplete="email" value={authForm.email} onChange={e => setAuthForm({...authForm,email:e.target.value})} placeholder="you@example.com"/></label>
            <label><LockKeyhole size={15}/> Nenosiri<input required type="password" minLength="10" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} value={authForm.password} onChange={e => setAuthForm({...authForm,password:e.target.value})} placeholder="Angalau herufi 10"/></label>
            {authMessage && <div className="auth-error">{authMessage}</div>}
            <button className="search-button auth-submit" type="submit" disabled={authBusy}>{authBusy ? 'Subiri...' : authMode === 'register' ? 'Jisajili' : 'Ingia'}</button>
          </form>
          <button className="switch-auth" onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setAuthMessage(''); }}>{authMode === 'register' ? 'Tayari una akaunti? Ingia' : 'Huna akaunti? Jisajili'}</button>
          <small className="auth-footnote">Akaunti zinatumia barua pepe na nenosiri kwa sasa. Uthibitishaji wa simu kwa OTP utaongezwa baada ya kuunganisha huduma ya SMS.</small>
        </section>
      </div>}
    </main>
  );
}

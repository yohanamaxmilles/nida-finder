import { useState } from 'react';
import { Search, Copy, Wallet, ShieldCheck, Phone, Info, CheckCircle2, Clock3 } from 'lucide-react';

export default function App() {
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState('idle');
  const [copied, setCopied] = useState(false);

  const normalizedPhone = phone.replace(/\s+/g, '');
  const validPhone = /^(0[67]\d{8}|\+255[67]\d{8}|255[67]\d{8})$/.test(normalizedPhone);

  function handleSearch(event) {
    event.preventDefault();
    if (!validPhone || !consent) return;
    setStatus('unavailable');
    setCopied(false);
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
        <div className="wallet">
          <span className="wallet-icon"><Wallet size={18} /></span>
          <span><small>Salio lako</small><strong>TSh 0.00</strong></span>
          <button className="topup" type="button" onClick={() => setStatus('payment-pending')}>Nunua vocha</button>
        </div>
      </header>

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
          <div><span className="step">01</span><div><h2>Anza uthibitishaji</h2><p>Ingiza namba ya simu inayohusishwa na utambulisho wako.</p></div></div>
          <span className="secure-label"><ShieldCheck size={15} /> Salama</span>
        </div>
        <form onSubmit={handleSearch}>
          <label htmlFor="phone">Namba ya simu</label>
          <div className="input-row">
            <div className="phone-input"><Phone size={19} /><span className="country-code">TZ</span><input id="phone" inputMode="tel" autoComplete="tel" placeholder="07XX XXX XXX" value={phone} onChange={e => { setPhone(e.target.value); setStatus('idle'); }} /></div>
            <button className="search-button" type="submit" disabled={!validPhone || !consent}><Search size={19} /> Endelea</button>
          </div>
          <p className="hint">Mfano: 0712 345 678</p>
          <label className="consent-row"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>Nathibitisha kuwa mimi ndiye mtumiaji wa namba hii au nina mamlaka halali, na nakubali taarifa zangu zithibitishwe kupitia mtoa huduma aliyeidhinishwa.</span></label>
        </form>

        {status === 'unavailable' && <div className="notice"><Info size={19} /><div><strong>Muunganisho rasmi unahitajika</strong><p>Utafutaji wa taarifa haujawashwa. Mfumo utaweza kuthibitisha utambulisho baada ya kuunganishwa na API rasmi ya NIDA au mtoa huduma aliyeidhinishwa.</p></div></div>}
        {status === 'payment-pending' && <div className="notice"><Clock3 size={19} /><div><strong>Malipo bado hayajaunganishwa</strong><p>Vocha zitawezeshwa baada ya kuchagua na kuunganisha mtoa huduma wa malipo.</p></div></div>}
      </section>

      <section className="result-panel">
        <div className="result-head"><div><span className="step">02</span><div><h2>Matokeo ya uthibitishaji</h2><p>Taarifa zitaonekana hapa baada ya uthibitishaji rasmi.</p></div></div><span className="pending"><Clock3 size={14} /> Inasubiri</span></div>
        <div className="empty-result"><div className="empty-icon"><ShieldCheck size={29} /></div><strong>Hakuna matokeo bado</strong><p>Ukiwa tayari, anza mchakato wa uthibitishaji hapo juu. Hatutaonyesha taarifa ambazo hazijathibitishwa.</p></div>
        <div className="result-footer"><span><CheckCircle2 size={15} /> Uthibitishaji wenye ridhaa</span><button type="button" className="copy-button" onClick={copyText} disabled={!phone}><Copy size={16} /> {copied ? 'Namba imenakiliwa' : 'Nakili namba uliyoingiza'}</button></div>
      </section>

      <footer><span>© {new Date().getFullYear()} NIDA Finder</span><span>Faragha kwanza · Uthibitishaji salama</span></footer>
    </main>
  );
}

import { useState } from 'react';
import { Download, KeyRound, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api.js';
import { DEFAULT_WHATSAPP_NUMBER, TYPE_LABELS, formatDate, priceLabel, whatsappUrl } from '../../utils/format.js';

export default function ProductDetails({ book, settings }) {
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  const fetchPdf = async (accessCode) => {
    setBusy(true);
    try {
      const { url } = await api.get(`/books/${book.id}/download`, accessCode ? { headers: { 'X-Access-Code': accessCode } } : undefined);
      window.location.assign(url);
      toast.success('Your download is starting');
    } catch (e) {
      toast.error(e.userMessage);
    } finally { setBusy(false); }
  };

  const facts = [
    ['Type', TYPE_LABELS[book.productType]],
    ['Pages', book.pageCount],
    ['Language', book.language],
    ['File format', book.fileFormat],
    ['Published', formatDate(book.publishedAt)],
    ['Availability', book.availability],
  ].filter(([, v]) => v);

  const wa = settings?.whatsappNumber || DEFAULT_WHATSAPP_NUMBER;

  return (
    <div>
      <p className="text-sm text-blood">{book.category?.name}</p>
      <h1 className="mt-1 font-serif text-4xl font-semibold leading-tight sm:text-5xl">{book.title}</h1>
      <p className="mt-4 font-serif text-3xl">{priceLabel(book)}</p>
      {book.shortDescription && <p className="mt-4 max-w-prose text-lg text-charcoal">{book.shortDescription}</p>}

      <div className="mt-6 space-y-3">
        {book.isFree && book.hasPdf && (
          <button className="btn-primary w-full sm:w-auto" onClick={() => fetchPdf()} disabled={busy}><Download size={16} aria-hidden="true" /> {busy ? 'Preparing…' : 'Get PDF'}</button>
        )}
        {book.isFree && !book.hasPdf && <p className="text-sm text-muted">The PDF for this free book is not available yet.</p>}
        {!book.isFree && (
          <>
            {wa ? (
              <a href={whatsappUrl(wa, book)} target="_blank" rel="noopener noreferrer" className="btn-primary w-full sm:w-auto"><MessageCircle size={16} aria-hidden="true" /> Purchase via WhatsApp</a>
            ) : (
              <p className="text-sm text-muted">Purchasing is not set up yet. Please use the contact page.</p>
            )}
            <p className="max-w-prose text-xs text-muted">We confirm your payment manually, then send you an access code for the PDF.</p>
            {book.hasPdf && (
              <div>
                <button className="inline-flex items-center gap-1.5 text-sm text-charcoal underline underline-offset-4 hover:text-blood" onClick={() => setShowCode((s) => !s)} aria-expanded={showCode}><KeyRound size={14} aria-hidden="true" /> I already have an access code</button>
                {showCode && (
                  <form className="mt-3 flex max-w-sm gap-2" onSubmit={(e) => { e.preventDefault(); if (code.trim()) fetchPdf(code.trim()); }}>
                    <label htmlFor="code" className="sr-only">Access code</label>
                    <input id="code" className="field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Access code" autoComplete="off" />
                    <button className="btn-outline" disabled={busy || !code.trim()}>Download</button>
                  </form>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-6 text-sm sm:grid-cols-3">
        {facts.map(([k, v]) => (<div key={k}><dt className="text-muted">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>))}
      </dl>

      {book.description && (
        <section className="mt-8" aria-labelledby="about-book">
          <h2 id="about-book" className="text-2xl font-semibold">About this book</h2>
          <div className="prose-dm mt-3 max-w-prose whitespace-pre-line leading-relaxed text-charcoal">{book.description}</div>
        </section>
      )}
      {book.tags?.length > 0 && (
        <section className="mt-8" aria-labelledby="hl">
          <h2 id="hl" className="text-2xl font-semibold">Highlights</h2>
          <ul className="mt-3 flex flex-wrap gap-2">{book.tags.map((t) => <li key={t} className="border border-line bg-white px-3 py-1 text-sm">{t}</li>)}</ul>
        </section>
      )}
    </div>
  );
}

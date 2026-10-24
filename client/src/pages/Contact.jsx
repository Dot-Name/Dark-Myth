import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import useSeo from '../hooks/useSeo.js';
import { DEFAULT_CONTACT_PHONE } from '../utils/format.js';
import hero2 from '../assets/hero2.jpg';
import hero4 from '../assets/hero4.jpg';

const empty = { name: '', email: '', subject: '', message: '', website: '' };

export default function Contact() {
  useSeo({ title: 'Contact', description: 'Get in touch with Dark Myth about books, orders and collaborations.' });
  const { data: s } = useFetch(() => api.get('/settings'), []);
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await api.post('/enquiries', f); setSent(true); setF(empty); }
    catch (x) { setErr(x.userMessage); toast.error('Your message was not sent'); }
    finally { setBusy(false); }
  };

  return (
    <div className="container-page grid gap-12 py-14 sm:py-20 lg:grid-cols-[1fr_1.2fr]">
      <div className="contact-info">
        <h1 className="heading-xl !text-5xl">Contact</h1>
        <p className="mt-4 max-w-md text-muted">Questions about a book, an order or a collaboration? Send a message and we will read it.</p>
        <dl className="mt-8 space-y-4 text-sm">
          {s?.contactEmail && <div><dt className="text-muted">Email</dt><dd><a className="underline" href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></dd></div>}
          <div><dt className="text-muted">Phone</dt><dd>{s?.contactPhone || DEFAULT_CONTACT_PHONE}</dd></div>
          {s?.address && <div><dt className="text-muted">Address</dt><dd className="whitespace-pre-line">{s.address}</dd></div>}
        </dl>
        <div className="contact-scenes mt-9 grid grid-cols-2 gap-2 sm:max-w-md" aria-label="Dark Myth story scenes">
          <figure className="contact-scene contact-scene--first"><img src={hero2} alt="An ancient stepwell descending into darkness" className="h-36 w-full object-cover sm:h-48" loading="lazy" /><figcaption>Below the surface</figcaption></figure>
          <figure className="contact-scene contact-scene--second"><img src={hero4} alt="A moonlit palace corridor" className="h-36 w-full object-cover sm:h-48" loading="lazy" /><figcaption>Where echoes linger</figcaption></figure>
        </div>
      </div>
      {sent ? (
        <div role="status" className="contact-form self-start border border-line bg-white p-8">
          <h2 className="text-3xl font-semibold">Message saved</h2>
          <p className="mt-2 text-charcoal">Your message has been stored and will be reviewed by our team. We will reply to the email address you gave.</p>
          <button className="btn-outline mt-6" onClick={() => setSent(false)}>Send another message</button>
        </div>
      ) : (
        <form onSubmit={submit} className="contact-form space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <div><label className="label" htmlFor="name">Name</label><input id="name" className="field" value={f.name} onChange={set('name')} required minLength={2} autoComplete="name" /></div>
            <div><label className="label" htmlFor="email">Email</label><input id="email" type="email" className="field" value={f.email} onChange={set('email')} required autoComplete="email" /></div>
          </div>
          <div><label className="label" htmlFor="subject">Subject</label><input id="subject" className="field" value={f.subject} onChange={set('subject')} required /></div>
          <div><label className="label" htmlFor="message">Message</label><textarea id="message" rows={6} className="field" value={f.message} onChange={set('message')} required minLength={10} /></div>
          <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} /></label></div>
          {err && <p role="alert" className="text-sm text-blood">{err}</p>}
          <button className="btn-primary" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
        </form>
      )}
    </div>
  );
}

import { useEffect } from 'react';

const set = (sel, attr, key, value) => {
  let el = document.head.querySelector(sel);
  if (!el) { el = document.createElement(sel.startsWith('link') ? 'link' : 'meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute(sel.startsWith('link') ? 'href' : 'content', value);
};

export default function useSeo({ title, description, image, noindex } = {}) {
  useEffect(() => {
    const full = title ? `${title} | Dark Myth` : 'Dark Myth | Indian horror books and folklore';
    document.title = full;
    const desc = description || 'Dark Myth is a catalogue of Indian horror books, haunted places, folklore and atmospheric colouring books.';
    set('meta[name="description"]', 'name', 'description', desc);
    set('meta[property="og:title"]', 'property', 'og:title', full);
    set('meta[property="og:description"]', 'property', 'og:description', desc);
    set('meta[property="og:type"]', 'property', 'og:type', 'website');
    set('meta[property="og:url"]', 'property', 'og:url', window.location.href);
    if (image) set('meta[property="og:image"]', 'property', 'og:image', image);
    set('link[rel="canonical"]', 'rel', 'canonical', window.location.origin + window.location.pathname);
    set('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
  }, [title, description, image, noindex]);
}

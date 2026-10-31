import { useEffect } from 'react';
import defaultImage from '../assets/logo.png';

const set = (sel, attr, key, value) => {
  let el = document.head.querySelector(sel);
  if (!el) { el = document.createElement(sel.startsWith('link') ? 'link' : 'meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute(sel.startsWith('link') ? 'href' : 'content', value);
};

export default function useSeo({ title, description, image, noindex, canonical, type = 'website', jsonLd, ogTitle, ogDescription, twitterTitle, twitterDescription, twitterImage } = {}) {
  useEffect(() => {
    const full = title || 'Dark Myth | Horror Coloring Books & Dark Art';
    document.title = full;
    const desc = description || 'Explore eerie horror coloring books, haunting illustrations, dark fantasy artwork, and mysterious worlds at Dark Myth.';
    set('meta[name="description"]', 'name', 'description', desc);
    set('meta[property="og:title"]', 'property', 'og:title', ogTitle || full);
    set('meta[property="og:description"]', 'property', 'og:description', ogDescription || desc);
    set('meta[property="og:type"]', 'property', 'og:type', type);
    const siteOrigin = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');
    const url = canonical || `${siteOrigin}${window.location.pathname}`;
    set('meta[property="og:url"]', 'property', 'og:url', url);
    const shareImage = image || new URL(defaultImage, window.location.href).href;
    set('meta[property="og:image"]', 'property', 'og:image', shareImage);
    set('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    set('meta[name="twitter:title"]', 'name', 'twitter:title', twitterTitle || ogTitle || full);
    set('meta[name="twitter:description"]', 'name', 'twitter:description', twitterDescription || ogDescription || desc);
    set('meta[name="twitter:image"]', 'name', 'twitter:image', twitterImage || shareImage);
    set('link[rel="canonical"]', 'rel', 'canonical', url);
    set('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
    const prior = document.getElementById('page-jsonld');
    prior?.remove();
    if (jsonLd) {
      const script = document.createElement('script'); script.id = 'page-jsonld'; script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd); document.head.appendChild(script);
    }
    return () => document.getElementById('page-jsonld')?.remove();
  }, [title, description, image, noindex, canonical, type, jsonLd, ogTitle, ogDescription, twitterTitle, twitterDescription, twitterImage]);
}

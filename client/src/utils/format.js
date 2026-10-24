export const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
export const priceLabel = (b) => (b.isFree ? 'Free' : formatPrice(b.price));
export const TYPE_LABELS = { pdf: 'PDF book', colouring_book: 'Colouring book', digital_collection: 'Digital collection', other: 'Other' };
export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '');

// Insert Cloudinary delivery transforms for optimised, responsive images.
export const img = (url, w = 600) => (url && url.includes('/upload/') ? url.replace('/upload/', `/upload/f_auto,q_auto,w_${w}/`) : url);

export const slugify = (s) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Public business contact. The WhatsApp value includes India's country code.
export const DEFAULT_CONTACT_PHONE = '+91 92056 03718';
export const DEFAULT_WHATSAPP_NUMBER = '919205603718';

export const whatsappUrl = (number, book) => {
  const msg = `Hello Dark Myth, I would like to purchase "${book.title}" (${book.slug}) listed at ${formatPrice(book.price)}.`;
  return `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
};

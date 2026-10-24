import { Link } from 'react-router-dom';
import { TYPE_LABELS, img, priceLabel } from '../../utils/format.js';

export default function BookCard({ book }) {
  return (
    <Link to={`/catalogue/${book.slug}`} className="group block" aria-label={`${book.title}, ${priceLabel(book)}`}>
      <div className="relative aspect-[3/4] overflow-hidden border border-line bg-stone/40 shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:border-taupe">
        {book.cover?.url ? (
          <img src={img(book.cover.url, 500)} alt={`Cover of ${book.title}`} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-charcoal p-4 text-center font-serif text-xl text-ivory">{book.title}</div>
        )}
        {book.status === 'draft' && <span className="absolute left-2 top-2 bg-blood px-2 py-0.5 text-xs text-white">Draft</span>}
      </div>
      <div className="mt-3">
        <p className="text-xs text-blood">{book.category?.name}</p>
        <h3 className="mt-0.5 font-serif text-xl font-semibold leading-snug group-hover:text-blood">{book.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{book.shortDescription}</p>
        <p className="mt-2 flex items-center justify-between text-sm">
          <span className="font-semibold">{priceLabel(book)}</span>
          <span className="text-xs text-muted">{TYPE_LABELS[book.productType]} · {book.availability}</span>
        </p>
      </div>
    </Link>
  );
}

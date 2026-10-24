import { useState } from 'react';
import { img } from '../../utils/format.js';

export default function ProductGallery({ book }) {
  const images = [book.cover, ...(book.gallery || [])].filter(Boolean);
  const [i, setI] = useState(0);
  const current = images[i];
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <ul className="flex gap-2 sm:flex-col">
          {images.map((im, n) => (
            <li key={im.publicId || n}>
              <button onClick={() => setI(n)} aria-label={`Show image ${n + 1}`} aria-current={n === i} className={`block h-20 w-16 overflow-hidden border ${n === i ? 'border-blood' : 'border-line'}`}>
                <img src={img(im.url, 160)} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex-1 border border-line bg-stone/40 shadow-soft">
        {current ? <img src={img(current.url, 900)} alt={i === 0 ? `Cover of ${book.title}` : `${book.title}, image ${i + 1}`} className="aspect-[3/4] w-full object-cover" /> : <div className="flex aspect-[3/4] items-center justify-center bg-charcoal p-6 text-center font-serif text-3xl text-ivory">{book.title}</div>}
      </div>
    </div>
  );
}

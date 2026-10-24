import { Search } from 'lucide-react';

export default function BookSearch({ value, onChange }) {
  return (
    <div role="search" className="relative">
      <label htmlFor="cat-search" className="sr-only">Search by title, description, tag or category</label>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
      <input id="cat-search" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search titles, tags, categories" className="field pl-9" />
    </div>
  );
}

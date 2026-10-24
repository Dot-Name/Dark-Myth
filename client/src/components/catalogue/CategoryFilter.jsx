export default function CategoryFilter({ categories, value, onChange }) {
  const pill = (active) => `shrink-0 border px-4 py-1.5 text-sm transition-colors ${active ? 'border-ink bg-ink text-ivory' : 'border-line bg-white text-charcoal hover:border-blood hover:text-blood'}`;
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0" role="group" aria-label="Filter by category">
      <div className="flex gap-2 pb-1">
        <button className={pill(!value)} aria-pressed={!value} onClick={() => onChange('')}>All</button>
        {categories.map((c) => <button key={c.id} className={pill(value === c.slug)} aria-pressed={value === c.slug} onClick={() => onChange(c.slug)}>{c.name}</button>)}
      </div>
    </div>
  );
}

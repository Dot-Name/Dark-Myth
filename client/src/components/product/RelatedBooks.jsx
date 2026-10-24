import BookGrid from '../catalogue/BookGrid.jsx';

export default function RelatedBooks({ books }) {
  if (!books?.length) return null;
  return (
    <section className="mt-20 border-t border-line pt-12" aria-labelledby="related">
      <h2 id="related" className="heading-lg mb-8">More from this category</h2>
      <BookGrid books={books} />
    </section>
  );
}

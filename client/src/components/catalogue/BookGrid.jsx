import BookCard from './BookCard.jsx';

export default function BookGrid({ books, cols = 'lg:grid-cols-4' }) {
  return (
    <div className={`grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:gap-x-6 ${cols}`}>
      {books.map((b) => <BookCard key={b.id} book={b} />)}
    </div>
  );
}

export default function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages, total } = pagination;
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between border-t border-line pt-5 text-sm">
      <span className="text-muted">Page {page} of {pages} · {total} results</span>
      <div className="flex gap-2">
        <button className="btn-outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
        <button className="btn-outline" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </nav>
  );
}

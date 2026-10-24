export default function DataTable({ columns, rows, empty = 'Nothing here yet.' }) {
  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line bg-ivory text-muted">
          <tr>{columns.map((c) => <th key={c.key} scope="col" className={`px-4 py-3 font-medium ${c.className || ''}`}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-muted">{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={r.id || r._id || i} className="border-b border-line last:border-0">
              {columns.map((c) => <td key={c.key} className={`px-4 py-3 align-middle ${c.className || ''}`}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

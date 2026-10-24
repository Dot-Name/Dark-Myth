export default function EmptyState({ title, children, action }) {
  return (
    <div className="mx-auto max-w-md border border-dashed border-taupe/60 px-6 py-14 text-center">
      <h3 className="text-2xl font-semibold">{title}</h3>
      {children && <p className="mt-2 text-sm text-muted">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

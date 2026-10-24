import { useEffect, useRef } from 'react';

export default function ConfirmationDialog({ open, title, message, confirmLabel = 'Delete', busy, confirmDisabled = false, onConfirm, onCancel, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={onCancel}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-ivory p-6 shadow-soft">
        <h2 id="dlg-title" className="text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-charcoal">{message}</p>
        {children}
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={busy || confirmDisabled}>{busy ? 'Working…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef } from 'react';
import { Upload, X } from 'lucide-react';

// Controlled file picker. `files` is an array of File objects; `existing` shows already-stored images.
export default function FileUploader({ label, accept, multiple = false, files, onChange, hint, preview = true, id }) {
  const input = useRef(null);
  const urls = useMemo(() => (preview ? files.map((f) => URL.createObjectURL(f)) : []), [files, preview]);
  useEffect(() => () => urls.forEach(URL.revokeObjectURL), [urls]);

  const pick = (e) => {
    const picked = Array.from(e.target.files || []);
    onChange(multiple ? [...files, ...picked] : picked.slice(0, 1));
    e.target.value = '';
  };

  return (
    <div>
      <span className="label">{label}</span>
      <button type="button" onClick={() => input.current?.click()} id={id} className="flex w-full items-center justify-center gap-2 border border-dashed border-taupe bg-white px-4 py-5 text-sm text-charcoal hover:border-blood hover:text-blood">
        <Upload size={16} aria-hidden="true" /> {multiple ? 'Choose files' : 'Choose a file'}
      </button>
      <input ref={input} type="file" accept={accept} multiple={multiple} onChange={pick} className="sr-only" tabIndex={-1} aria-label={label} />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {files.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="relative">
              {preview ? <img src={urls[i]} alt="" className="h-20 w-16 border border-line object-cover" /> : <span className="block border border-line bg-white px-3 py-2 text-xs">{f.name}</span>}
              <button type="button" aria-label={`Remove ${f.name}`} onClick={() => onChange(files.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 rounded-full bg-ink p-1 text-ivory hover:bg-blood"><X size={12} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

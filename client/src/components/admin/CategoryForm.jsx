import { useState } from 'react';
import FileUploader from '../common/FileUploader.jsx';
import { img, slugify } from '../../utils/format.js';

export default function CategoryForm({ initial, onSubmit, onCancel, busy }) {
  const [f, setF] = useState({
    name: initial?.name || '', slug: initial?.slug || '', description: initial?.description || '',
    displayOrder: initial?.displayOrder ?? 0, isActive: initial?.isActive ?? true,
  });
  const [touched, setTouched] = useState(Boolean(initial));
  const [file, setFile] = useState([]);
  const [removeImage, setRemoveImage] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit({ ...f, image: file[0], removeImage }); }}>
      <div><label className="label" htmlFor="cn">Name</label>
        <input id="cn" className="field" required minLength={2} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value, ...(touched ? {} : { slug: slugify(e.target.value) }) })} /></div>
      <div><label className="label" htmlFor="cs">Slug</label>
        <input id="cs" className="field" value={f.slug} onChange={(e) => { setTouched(true); setF({ ...f, slug: e.target.value }); }} /></div>
      <div><label className="label" htmlFor="cd">Description</label><textarea id="cd" rows={3} maxLength={500} className="field" value={f.description} onChange={set('description')} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="label" htmlFor="co">Display order</label><input id="co" type="number" min={0} className="field" value={f.displayOrder} onChange={set('displayOrder')} /></div>
        <label className="flex items-end gap-2 pb-2.5 text-sm"><input type="checkbox" checked={f.isActive} onChange={set('isActive')} /> Active (visible on the site)</label>
      </div>
      {initial?.image?.url && !removeImage && file.length === 0 && (
        <div className="flex items-center gap-3"><img src={img(initial.image.url, 160)} alt="" className="h-16 w-16 border border-line object-cover" />
          <button type="button" className="text-sm underline" onClick={() => setRemoveImage(true)}>Remove image</button></div>
      )}
      <FileUploader label="Cover image" accept="image/jpeg,image/png,image/webp" files={file} onChange={setFile} hint="JPEG, PNG or WebP" />
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : 'Create category'}</button>
      </div>
    </form>
  );
}

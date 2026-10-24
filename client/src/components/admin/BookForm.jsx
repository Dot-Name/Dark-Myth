import { useState } from 'react';
import FileUploader from '../common/FileUploader.jsx';
import { TYPE_LABELS, img, slugify } from '../../utils/format.js';

const blank = { title: '', slug: '', shortDescription: '', description: '', category: '', tags: '', productType: 'pdf', price: 0, isFree: false, language: 'English', pageCount: '', fileFormat: 'PDF', publishedAt: '', isFeatured: false, status: 'draft', seoTitle: '', seoDescription: '' };

export default function BookForm({ initial, categories, onSubmit, busy, error }) {
  const [f, setF] = useState(() => initial ? { ...blank, ...initial, tags: (initial.tags || []).join(', '), pageCount: initial.pageCount ?? '', publishedAt: initial.publishedAt ? initial.publishedAt.slice(0, 10) : '' } : blank);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [cover, setCover] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [pdf, setPdf] = useState([]);
  const [removeIds, setRemoveIds] = useState([]);
  const [removePdf, setRemovePdf] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const { id, cover: _c, gallery: _g, pdf: _p, hasPdf, availability, createdAt, updatedAt, ...fields } = f;
    onSubmit({ ...fields, price: f.isFree ? 0 : f.price, cover: cover[0], gallery, pdf: pdf[0], removeGalleryIds: removeIds, removePdf });
  };
  const existingGallery = (initial?.gallery || []).filter((g) => !removeIds.includes(g.publicId));
  const box = 'space-y-5 border border-line bg-white p-5 sm:p-6';

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <section className={box}>
          <h2 className="text-2xl font-semibold">Details</h2>
          <div><label className="label" htmlFor="title">Title</label><input id="title" className="field" required minLength={2} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) })} /></div>
          <div><label className="label" htmlFor="slug">Slug</label><input id="slug" className="field" value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: e.target.value }); }} />
            <p className="mt-1 text-xs text-muted">Used in the book's web address. Lowercase letters, numbers and hyphens.</p></div>
          <div><label className="label" htmlFor="sd">Short description</label><textarea id="sd" rows={2} maxLength={300} className="field" value={f.shortDescription} onChange={set('shortDescription')} /></div>
          <div><label className="label" htmlFor="d">Full description</label><textarea id="d" rows={8} className="field" value={f.description} onChange={set('description')} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="cat">Category</label>
              <select id="cat" className="field" required value={f.category} onChange={set('category')}><option value="">Select a category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}{c.isActive ? '' : ' (inactive)'}</option>)}</select></div>
            <div><label className="label" htmlFor="tags">Tags</label><input id="tags" className="field" placeholder="fort, rajasthan, ghost" value={f.tags} onChange={set('tags')} /></div>
          </div>
        </section>

        <section className={box}>
          <h2 className="text-2xl font-semibold">Product information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="pt">Product type</label><select id="pt" className="field" value={f.productType} onChange={set('productType')}>{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="label" htmlFor="lang">Language</label><input id="lang" className="field" value={f.language} onChange={set('language')} /></div>
            <div><label className="label" htmlFor="pc">Number of pages</label><input id="pc" type="number" min={1} className="field" value={f.pageCount} onChange={set('pageCount')} /></div>
            <div><label className="label" htmlFor="ff">File format</label><input id="ff" className="field" value={f.fileFormat} onChange={set('fileFormat')} /></div>
            <div><label className="label" htmlFor="price">Price (₹)</label><input id="price" type="number" min={0} step="1" className="field disabled:bg-ivory" disabled={f.isFree} value={f.isFree ? 0 : f.price} onChange={set('price')} /></div>
            <div><label className="label" htmlFor="pa">Publication date</label><input id="pa" type="date" className="field" value={f.publishedAt} onChange={set('publishedAt')} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isFree} onChange={set('isFree')} /> This book is free (visitors can download the PDF)</label>
        </section>

        <section className={box}>
          <h2 className="text-2xl font-semibold">Search appearance</h2>
          <div><label className="label" htmlFor="st">SEO title</label><input id="st" maxLength={70} className="field" value={f.seoTitle} onChange={set('seoTitle')} /></div>
          <div><label className="label" htmlFor="sdd">SEO description</label><textarea id="sdd" rows={2} maxLength={170} className="field" value={f.seoDescription} onChange={set('seoDescription')} /></div>
        </section>
      </div>

      <div className="space-y-6">
        <section className={box}>
          <h2 className="text-2xl font-semibold">Publishing</h2>
          <div><label className="label" htmlFor="status">Status</label><select id="status" className="field" value={f.status} onChange={set('status')}><option value="draft">Draft</option><option value="published">Published</option></select></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.isFeatured} onChange={set('isFeatured')} /> Feature on the home page</label>
          {error && <p role="alert" className="text-sm text-blood">{error}</p>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save changes' : 'Create book'}</button>
        </section>

        <section className={box}>
          <h2 className="text-2xl font-semibold">Images</h2>
          {initial?.cover?.url && cover.length === 0 && <img src={img(initial.cover.url, 240)} alt="Current cover" className="h-40 border border-line object-cover" />}
          <FileUploader label="Main cover" accept="image/jpeg,image/png,image/webp" files={cover} onChange={setCover} hint="Required to publish. Portrait works best (3:4)." />
          {existingGallery.length > 0 && (
            <ul className="flex flex-wrap gap-3">{existingGallery.map((g) => (
              <li key={g.publicId} className="text-center"><img src={img(g.url, 120)} alt="" className="h-20 w-16 border border-line object-cover" />
                <button type="button" className="mt-1 text-xs underline" onClick={() => setRemoveIds([...removeIds, g.publicId])}>Remove</button></li>))}</ul>
          )}
          <FileUploader label="Gallery images" multiple accept="image/jpeg,image/png,image/webp" files={gallery} onChange={setGallery} hint="Up to 8 in total." />
        </section>

        <section className={box}>
          <h2 className="text-2xl font-semibold">Protected PDF</h2>
          {initial?.pdf && !removePdf && pdf.length === 0 && (
            <p className="text-sm text-charcoal">Current file: {initial.pdf.originalName} ({(initial.pdf.bytes / 1048576).toFixed(1)} MB). <button type="button" className="underline" onClick={() => setRemovePdf(true)}>Remove</button></p>
          )}
          {removePdf && <p className="text-sm text-blood">The PDF will be removed when you save.</p>}
          <FileUploader label="PDF file" accept="application/pdf" preview={false} files={pdf} onChange={setPdf} hint="Stored privately. Never available through a public link." />
        </section>
      </div>
    </form>
  );
}

import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import { Bold, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Underline as UnderlineIcon, Undo2 } from 'lucide-react';

function cleanPastedHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script,style,object,embed,form,svg,math').forEach((el) => el.remove());
  doc.querySelectorAll('*').forEach((el) => {
    [...el.attributes].forEach((a) => {
      const key = a.name.toLowerCase(); const value = a.value.trim();
      const safe = (el.tagName === 'A' && key === 'href' && /^(https?:|mailto:|\/|#)/i.test(value)) || (el.tagName === 'IMG' && ['src','alt','title'].includes(key) && (key !== 'src' || /^https:\/\//i.test(value))) || (el.tagName === 'IFRAME' && key === 'src' && /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]+$/.test(value));
      if (!safe) el.removeAttribute(a.name);
    });
    if (el.tagName === 'IFRAME' && !el.hasAttribute('src')) el.remove();
  });
  return doc.body.innerHTML;
}
const safeLink = (value) => /^(https?:\/\/|mailto:|\/|#)/i.test(value.trim());

export default function BlogEditor({ content, onChange, onUploadImage, disabled = false }) {
  const [imageBusy, setImageBusy] = useState(false);
  const editor = useEditor({
    editable: !disabled,
    content: content || '',
    extensions: [
      StarterKit.configure({ heading: { levels: [1,2,3,4,5,6] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, isAllowedUri: safeLink }),
      Image.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ nocookie: true, controls: true, modestBranding: true, width: 800, height: 450 }),
      Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
    ],
    editorProps: { attributes: { class: 'blog-editor min-h-[480px] max-w-none p-2 text-base leading-8 focus:outline-none', 'aria-label': 'Blog article content' }, transformPastedHTML: cleanPastedHtml },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });
  useEffect(() => { if (editor && content !== editor.getHTML()) editor.commands.setContent(content || '', { emitUpdate: false }); }, [editor, content]);
  useEffect(() => { editor?.setEditable(!disabled); }, [editor, disabled]);
  if (!editor) return <div className="skeleton min-h-[480px]"/>;
  const action = (label, Icon, run, active = false) => <button key={label} type="button" title={label} aria-label={label} disabled={disabled} aria-pressed={active} className={`site-icon-button border ${active?'border-line bg-stone/50':'border-transparent hover:border-line'}`} onClick={run}><Icon size={16}/></button>;
  const addImage = async (file) => {
    if (!file || !onUploadImage) return;
    setImageBusy(true);
    try {
      const fallback = file.name.replace(/\.[^.]+$/,'');
      const alt = window.prompt('Describe this image for screen readers', fallback);
      if (alt === null) return;
      const caption = window.prompt('Image caption (optional)', '') ?? '';
      const item = await onUploadImage(file, { alt, caption });
      if (item?.url) editor.chain().focus().insertContent([{ type:'image', attrs:{ src:item.url, alt:item.alt||alt, title:item.caption||caption } }, ...(caption ? [{ type:'paragraph', content:[{type:'text',text:caption}] }] : [])]).run();
    } finally { setImageBusy(false); }
  };
  const addLink = () => { const href = window.prompt('Enter a link URL'); if (href && safeLink(href)) editor.chain().focus().extendMarkRange('link').setLink({href}).run(); };
  const addVideo = () => {
    const raw = window.prompt('Paste a YouTube URL'); if (!raw) return;
    try { const u = new URL(raw); const id = u.hostname.endsWith('youtu.be') ? u.pathname.slice(1) : u.searchParams.get('v') || u.pathname.match(/\/embed\/([\w-]+)/)?.[1]; if (!/^[\w-]{6,}$/.test(id||'')) throw new Error(); editor.commands.setYoutubeVideo({src:`https://www.youtube-nocookie.com/embed/${id}`}); }
    catch { window.alert('Enter a valid YouTube video link.'); }
  };
  return <div className="border border-line"><div className="flex flex-wrap items-center gap-1 border-b border-line bg-stone/25 p-2">
    {action('Bold',Bold,()=>editor.chain().focus().toggleBold().run(),editor.isActive('bold'))}{action('Italic',Italic,()=>editor.chain().focus().toggleItalic().run(),editor.isActive('italic'))}{action('Underline',UnderlineIcon,()=>editor.chain().focus().toggleUnderline().run(),editor.isActive('underline'))}{action('Strikethrough',Strikethrough,()=>editor.chain().focus().toggleStrike().run(),editor.isActive('strike'))}
    <label className="sr-only" htmlFor="editor-heading">Text style</label><select id="editor-heading" className="field w-auto py-2" disabled={disabled} defaultValue="p" onChange={e=>{const v=e.target.value;if(v==='p')editor.chain().focus().setParagraph().run();else editor.chain().focus().toggleHeading({level:Number(v)}).run();e.target.value='p';}}><option value="p">Paragraph</option>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>Heading {n}</option>)}</select>
    {action('Bulleted list',List,()=>editor.chain().focus().toggleBulletList().run(),editor.isActive('bulletList'))}{action('Numbered list',ListOrdered,()=>editor.chain().focus().toggleOrderedList().run(),editor.isActive('orderedList'))}{action('Blockquote',Quote,()=>editor.chain().focus().toggleBlockquote().run(),editor.isActive('blockquote'))}{action('Insert link',Link2,addLink,editor.isActive('link'))}{action('Horizontal rule',Minus,()=>editor.chain().focus().setHorizontalRule().run())}
    <button type="button" className="btn-outline !px-2 !py-1.5 text-xs" disabled={disabled} onClick={()=>editor.chain().focus().insertTable({rows:3,cols:3,withHeaderRow:true}).run()}>Table</button><button type="button" className="btn-outline !px-2 !py-1.5 text-xs" disabled={disabled} onClick={addVideo}>YouTube</button>
    <label className={`site-icon-button cursor-pointer border border-transparent hover:border-line ${imageBusy?'opacity-50':''}`} title="Upload inline image"><ImagePlus size={16}/><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled||imageBusy} onChange={e=>{addImage(e.target.files?.[0]);e.target.value='';}}/></label>
    {action('Undo',Undo2,()=>editor.chain().focus().undo().run())}{action('Redo',Redo2,()=>editor.chain().focus().redo().run())}
  </div><EditorContent editor={editor}/></div>;
}

import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import api from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import useSeo from '../hooks/useSeo.js';
import ProductGallery from '../components/product/ProductGallery.jsx';
import ProductDetails from '../components/product/ProductDetails.jsx';
import RelatedBooks from '../components/product/RelatedBooks.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import { img } from '../utils/format.js';

export default function ProductPage() {
  const { slug } = useParams();
  const [sp] = useSearchParams();
  const { data, loading, error, reload } = useFetch(() => api.get(`/books/${slug}`), [slug]);
  const { data: settings } = useFetch(() => api.get('/settings'), []);
  const book = data?.book;
  const preview = sp.get('preview') === '1' || book?.status === 'draft';

  const productUrl = `${(import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')}/catalogue/${slug}`;
  useSeo({ title: book ? `${book.seoTitle || book.title} | Dark Myth` : 'Horror coloring books | Dark Myth', description: book?.seoDescription || book?.shortDescription || 'Explore horror coloring books and dark art at Dark Myth.', image: book?.cover?.url && img(book.cover.url, 1200), canonical: productUrl, noindex: preview, jsonLd: book ? { '@context': 'https://schema.org', '@graph': [{ '@type': 'Product', name: book.title, description: book.description || book.shortDescription, image: book.cover?.url ? [book.cover.url] : undefined, sku: book.slug, url: productUrl, offers: { '@type': 'Offer', priceCurrency: 'INR', price: book.isFree ? 0 : book.price } }, { '@type':'BreadcrumbList', itemListElement:[{ '@type':'ListItem',position:1,name:'Home',item:`${window.location.origin}/`},{'@type':'ListItem',position:2,name:'Catalogue',item:`${window.location.origin}/catalogue`},{'@type':'ListItem',position:3,name:book.title,item:productUrl}] }] } : undefined });

  if (loading) return <div className="container-page py-16"><div className="skeleton h-96 w-full" /></div>;
  if (error?.response?.status === 404) return <div className="container-page py-20"><ErrorState error={{ userMessage: 'This book could not be found. It may have been unpublished.' }} /><p className="mt-6 text-center"><Link className="underline" to="/catalogue">Back to the catalogue</Link></p></div>;
  if (error) return <div className="container-page py-20"><ErrorState error={error} onRetry={reload} /></div>;

  return (
    <div className="container-page py-8 sm:py-12">
      {book.status === 'draft' && <p role="status" className="mb-6 border border-blood/40 bg-white px-4 py-3 text-sm text-blood">Draft preview. Visitors cannot see this book until you publish it.</p>}
      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link to="/catalogue" className="inline-flex items-center gap-1 hover:text-blood"><ChevronLeft size={14} aria-hidden="true" /> Back to catalogue</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/catalogue?category=${book.category?.slug}`} className="hover:text-blood">{book.category?.name}</Link>
        <span aria-hidden="true">/</span>
        <span className="text-ink" aria-current="page">{book.title}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <ProductGallery book={book} />
        <ProductDetails book={book} settings={settings} />
      </div>
      <RelatedBooks books={data.related} />
    </div>
  );
}

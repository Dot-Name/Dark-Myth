import { useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import useFetch from '../hooks/useFetch.js';
import useSeo from '../hooks/useSeo.js';
import BookGrid from '../components/catalogue/BookGrid.jsx';
import LoadingSkeleton from '../components/common/LoadingSkeleton.jsx';
import HeroTileAnimation from '../components/home/HeroTileAnimation.jsx';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Library, Palette } from 'lucide-react';
import heroImage from '../assets/hero.webp';
import logo from '../assets/logo.png';
import fortScene from '../assets/hero1.jpg';
import stepwellScene from '../assets/hero2.jpg';
import villageScene from '../assets/hero3.jpg';
import palaceScene from '../assets/hero4.jpg';
import { img, priceLabel } from '../utils/format.js';

const HERO_WORDS = 'Some Legends Never Die.'.split(' ');
const HERO_SCENES = {
  fort: fortScene,
  stepwell: stepwellScene,
  village: villageScene,
  palace: palaceScene,
};

function Section({ title, link, children }) {
  return (
    <section className="container-page mt-20 sm:mt-28">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="heading-lg">{title}</h2>
        {link && <Link to={link.to} className="text-sm underline underline-offset-4 hover:text-blood">{link.label}</Link>}
      </div>
      {children}
    </section>
  );
}

export default function Home() {
  const heroMediaRef = useRef(null);
  useSeo({ title: 'Dark Myth | Horror Coloring Books & Dark Art', description: 'Explore eerie horror coloring books, haunting illustrations, dark fantasy artwork, and mysterious worlds at Dark Myth.', jsonLd: { '@context': 'https://schema.org', '@graph': [{ '@type': 'Organization', name: 'Dark Myth', url: `${window.location.origin}/`, logo: new URL(logo, window.location.href).href }, { '@type': 'WebSite', name: 'Dark Myth', url: `${window.location.origin}/`, description: 'Horror coloring books, dark art, and folklore.' }] } });
  const featured = useFetch(() => api.get('/books/featured'), []);
  const fresh = useFetch(() => api.get('/books', { params: { sort: 'newest', limit: 4 } }), []);
  const cats = useFetch(() => api.get('/categories'), []);
  const c = cats.data?.items || [];
  const featuredBook = featured.data?.items?.[0];

  const moveHero = (event) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !heroMediaRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const strength = window.innerWidth >= 1280 ? 4 : 2;
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * strength;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * strength;
    heroMediaRef.current.style.setProperty('--hero-x', `${-x}px`);
    heroMediaRef.current.style.setProperty('--hero-y', `${-y}px`);
  };

  const resetHero = () => {
    heroMediaRef.current?.style.setProperty('--hero-x', '0px');
    heroMediaRef.current?.style.setProperty('--hero-y', '0px');
  };

  return (
    <>
      <section className="hero-entry relative overflow-hidden border-b border-line" onPointerMove={moveHero} onPointerLeave={resetHero}>
        <div className="mist absolute inset-0" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div className="max-w-2xl">
            <p className="hero-copy-reveal mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-blood"><span className="h-px w-8 bg-blood" />Indian folklore · horror · the unexplained</p>
            <h1 className="heading-xl max-w-[12ch]">
              <span className="sr-only">Some Legends Never Die.</span>
              <span aria-hidden="true">{HERO_WORDS.map((word, index, words) => <span key={`${word}-${index}`} className="hero-word" style={{ animationDelay: `${index * 85}ms` }}>{word}{index < words.length - 1 ? ' ' : ''}</span>)}</span>
            </h1>
            <p className="hero-copy-reveal mt-6 max-w-lg text-base leading-8 text-charcoal sm:text-lg">Enter India’s haunted forts, forgotten villages and restless legends through eerie stories and atmospheric colouring books.</p>
            <div className="hero-actions mt-9 flex flex-wrap gap-3">
              <Link to="/catalogue" className="btn-primary group">Explore the Books <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" /></Link>
              <Link to="/about" className="btn-outline group">Enter the Archive <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
            </div>
            <a href="#explore" className="hero-copy-reveal mt-10 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted transition-colors hover:text-blood">
              Find your next read <ArrowDown size={14} aria-hidden="true" />
            </a>
          </div>
          <div className="mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative grain rounded-sm border border-ink/80 bg-gradient-to-b from-charcoal via-ink to-ink p-2 shadow-soft sm:p-2.5">
              <div className="hero-media relative aspect-[4/3] rounded-sm border border-taupe/50 bg-ink sm:aspect-[16/10] lg:aspect-[4/3]">
                <HeroTileAnimation primaryImage={heroImage} scenes={HERO_SCENES} alt="A moonlit haveli emerging through the mist" parallaxRef={heroMediaRef} />
                <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-ink/95 via-ink/15 to-ink/10" aria-hidden="true" />
                {featuredBook?.cover?.url ? (
                  <Link to={`/catalogue/${featuredBook.slug}`} aria-label={`View ${featuredBook.title}, ${priceLabel(featuredBook)}`} className="group absolute inset-x-4 bottom-4 z-[3] flex items-end gap-3 border border-ivory/25 bg-ink/90 p-2.5 text-ivory shadow-soft transition-colors hover:border-ivory/60 sm:inset-x-6 sm:bottom-6 sm:gap-4 sm:p-3">
                    <img src={img(featuredBook.cover.url, 220)} alt="" loading="eager" decoding="async" className="aspect-[3/4] w-14 shrink-0 border border-ivory/20 object-cover sm:w-[4.5rem]" />
                    <span className="min-w-0 flex-1 pb-1">
                      <span className="block text-[9px] uppercase tracking-[0.2em] text-stone">Featured from the archive</span>
                      <span className="mt-1 block line-clamp-2 font-serif text-lg leading-tight sm:text-xl">{featuredBook.title}</span>
                      <span className="mt-1 block text-xs text-stone">{priceLabel(featuredBook)}</span>
                    </span>
                    <ArrowUpRight size={18} className="mb-2 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                ) : (
                  <div className="absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between p-6 text-ivory sm:p-8">
                    <div><p className="text-[10px] uppercase tracking-[0.24em] text-stone">The Dark Archive · Vol. 01</p><p className="mt-2 font-serif text-2xl">Stories from the shadows</p></div>
                    <span className="mb-1 border border-ivory/40 px-2 py-1 text-[10px] tracking-[0.2em]">DM · 01</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="explore" className="container-page pt-14 sm:pt-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blood">Choose your way in</p><h2 className="heading-lg">What are you looking for?</h2></div>
          <Link to="/catalogue" className="hidden items-center gap-1 text-sm underline underline-offset-4 hover:text-blood sm:inline-flex">Browse everything <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { title: 'Read the stories', description: 'Open a book of eerie tales and forgotten folklore.', type: 'pdf', icon: BookOpen, number: '01' },
            { title: 'Colour the shadows', description: 'Find atmospheric colouring books for a darker kind of quiet.', type: 'colouring_book', icon: Palette, number: '02' },
            { title: 'Explore collections', description: 'Gather more legends in one digital collection.', type: 'digital_collection', icon: Library, number: '03' },
          ].map(({ title, description, type, icon: Icon, number }) => (
            <Link key={type} to={`/catalogue?type=${type}`} className="group relative flex min-h-52 flex-col justify-between overflow-hidden border border-line bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-ink hover:shadow-soft sm:p-7">
              <span className="absolute right-5 top-4 font-serif text-5xl text-line transition-colors group-hover:text-stone" aria-hidden="true">{number}</span>
              <Icon size={22} strokeWidth={1.5} className="text-blood" aria-hidden="true" />
              <div className="mt-8 flex items-end justify-between gap-4">
                <div><h3 className="font-serif text-2xl font-semibold">{title}</h3><p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{description}</p></div>
                <ArrowUpRight size={18} className="mb-1 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
        <Link to="/catalogue" className="mt-5 inline-flex items-center gap-1 text-sm underline underline-offset-4 hover:text-blood sm:hidden">Browse everything <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </section>

      {(featured.loading || featured.data?.items.length > 0) && (
        <Section title="Featured books" link={{ to: '/catalogue', label: 'View all' }}>
          {featured.loading ? <LoadingSkeleton count={4} /> : <BookGrid books={featured.data.items} />}
        </Section>
      )}

      {c.length > 0 && (
        <Section title="Browse by category">
          <ul className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {c.map((cat) => (
              <li key={cat.id} className="bg-ivory">
                <Link to={`/catalogue?category=${cat.slug}`} className="group flex h-full flex-col justify-between p-6 transition-colors hover:bg-white">
                  <div>
                    <h3 className="text-2xl font-semibold group-hover:text-blood">{cat.name}</h3>
                    {cat.description && <p className="mt-2 line-clamp-3 text-sm text-muted">{cat.description}</p>}
                  </div>
                  <p className="mt-6 text-sm text-charcoal">{cat.productCount} {cat.productCount === 1 ? 'book' : 'books'}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(fresh.loading || fresh.data?.items.length > 0) && (
        <Section title="New arrivals" link={{ to: '/catalogue?sort=newest', label: 'See the newest' }}>
          {fresh.loading ? <LoadingSkeleton count={4} /> : <BookGrid books={fresh.data.items} />}
        </Section>
      )}

      <section className="container-page mt-20 sm:mt-28">
        <div className="grid gap-8 border-y border-line py-14 lg:grid-cols-2 lg:gap-16">
          <h2 className="heading-lg max-w-md">Stories that were told in the dark.</h2>
          <div className="prose-dm max-w-xl">
            <p>Dark Myth is inspired by the stories India tells after sunset: the empty haveli at the edge of town, the road nobody drives at night, the fort whose walls remember more than they should.</p>
            <p>We make atmospheric books around Indian folklore and the supernatural, in a quiet, editorial style that lets the stories do the frightening.</p>
            <Link to="/about" className="underline underline-offset-4 hover:text-blood">Read about Dark Myth</Link>
          </div>
        </div>
      </section>
    </>
  );
}

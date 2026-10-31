import useSeo from '../hooks/useSeo.js';
import hero1 from '../assets/hero1.jpg';
import hero3 from '../assets/hero3.jpg';
import hero5 from '../assets/hero5.jpg';

export default function About() {
  useSeo({ title: 'About Dark Myth | Explore the World of Dark Art', description: 'Discover Dark Myth, a world of horror-inspired coloring books, gothic illustrations, dark imagination, and mysterious creativity.' });
  return (
    <div className="container-page py-14 sm:py-20">
      <h1 className="heading-xl max-w-3xl">Quiet books for restless nights.</h1>
      <div className="about-scene-strip mt-9 grid h-56 grid-cols-3 gap-2 sm:h-80 sm:gap-3" aria-label="Scenes from Dark Myth stories">
        {[
          { image: hero1, alt: 'An old Indian fort beneath a stormy night sky', title: 'The lost fort' },
          { image: hero3, alt: 'A deserted village street after dark', title: 'The village after dusk' },
          { image: hero5, alt: 'An ancient palace in a shadowy landscape', title: 'Palace of whispers' },
        ].map(({ image, alt, title }, index) => (
          <figure key={title} className="about-scene group relative overflow-hidden rounded-sm border border-ink/15 bg-ink" style={{ '--scene-delay': `${index * 130}ms` }}>
            <img src={image} alt={alt} className="about-scene-image h-full w-full object-cover" loading="lazy" />
            <div className="about-scene-shade" aria-hidden="true" />
            <figcaption className="about-scene-caption">{title}</figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <p className="font-serif text-2xl leading-snug text-charcoal">Dark Myth is a home for Indian horror literature, haunted folklore and the supernatural.</p>
        <div className="prose-dm max-w-prose text-lg">
          <p>Every region has its own ghosts. Some live in crumbling forts and palaces, some on highways and village paths, and some in the older stories that were never written down.</p>
          <p>Dark Myth collects these legends and presents them as carefully designed books: PDF editions to read, and colouring books with atmospheric illustrations to bring the stories to life at your own pace.</p>
          <h2 className="!mt-10 text-3xl font-semibold">What we aim for</h2>
          <p>Unsettling rather than gory. Atmospheric rather than loud. We want a Dark Myth book to feel like a well-made edition you would be glad to keep, with folklore treated with curiosity and respect.</p>
        </div>
      </div>
    </div>
  );
}

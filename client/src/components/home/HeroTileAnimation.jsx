const SCENE_POSITIONS = [
  { name: 'fort', className: 'hero-scene-tile--fort', rotation: '-5deg', fromX: '-22px', fromY: '-18px' },
  { name: 'palace', className: 'hero-scene-tile--palace', rotation: '4deg', fromX: '20px', fromY: '-18px' },
  { name: 'stepwell', className: 'hero-scene-tile--stepwell', rotation: '4deg', fromX: '-20px', fromY: '18px' },
  { name: 'village', className: 'hero-scene-tile--village', rotation: '-4deg', fromX: '22px', fromY: '18px' },
];

export default function HeroTileAnimation({ primaryImage, scenes = {}, alt, parallaxRef }) {
  const tiltHero = (event) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty('--hero-tilt-x', `${-y * 7}deg`);
    event.currentTarget.style.setProperty('--hero-tilt-y', `${x * 7}deg`);
    event.currentTarget.style.setProperty('--scene-parallax-x', `${-x * 3}px`);
    event.currentTarget.style.setProperty('--scene-parallax-y', `${-y * 3}px`);
  };

  const resetHero = (event) => {
    event.currentTarget.style.removeProperty('--hero-tilt-x');
    event.currentTarget.style.removeProperty('--hero-tilt-y');
    event.currentTarget.style.removeProperty('--scene-parallax-x');
    event.currentTarget.style.removeProperty('--scene-parallax-y');
  };

  return (
    <div
      ref={parallaxRef}
      className="hero-parallax pointer-events-none absolute inset-0 z-[2]"
      onPointerMove={tiltHero}
      onPointerLeave={resetHero}
    >
      <img src={primaryImage} alt={alt} loading="eager" fetchPriority="high" decoding="async" className="hero-image pointer-events-auto h-full w-full object-cover object-[58%_center] opacity-90" />
      <div className="hero-scene-glow" aria-hidden="true" />
      {SCENE_POSITIONS.map((scene, index) => (
        <img
          key={scene.name}
          src={scenes[scene.name]}
          alt=""
          aria-hidden="true"
          className={`hero-scene-tile ${scene.className}`}
          style={{
            '--tile-rotation': scene.rotation,
            '--tile-from-x': scene.fromX,
            '--tile-from-y': scene.fromY,
            '--tile-delay': `${index * 75}ms`,
          }}
          loading="eager"
          decoding="async"
        />
      ))}
      <span className="hero-fog" aria-hidden="true" />
      <span className="hero-dust" aria-hidden="true" />
    </div>
  );
}

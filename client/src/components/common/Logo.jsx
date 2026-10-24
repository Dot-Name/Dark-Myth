import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function Logo({ light = false, className = '' }) {
  return (
    <Link to="/" aria-label="Dark Myth home" className={`inline-flex items-center gap-2.5 font-serif text-2xl font-bold tracking-[0.18em] sm:text-3xl ${light ? 'text-ivory' : 'text-ink'} ${className}`}>
      <span className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full sm:h-11 sm:w-11 ${light ? 'bg-ink' : 'bg-ivory'}`} aria-hidden="true">
        <img src={logo} alt="" className={`absolute inset-0 h-full w-full scale-[1.35] object-cover ${light ? 'brightness-0 invert' : 'mix-blend-multiply'}`} />
      </span>
      <span>DARK MYTH</span>
    </Link>
  );
}

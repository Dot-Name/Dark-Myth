import { Link } from 'react-router-dom';
import useSeo from '../hooks/useSeo.js';

export default function NotFound() {
  useSeo({ title: 'Page not found', noindex: true });
  return (
    <div className="container-page py-28 text-center">
      <h1 className="heading-xl !text-5xl">This page has vanished.</h1>
      <p className="mt-4 text-muted">The link may be broken or the page may have been removed.</p>
      <Link to="/catalogue" className="btn-primary mt-8">Go to the catalogue</Link>
    </div>
  );
}

export default function ErrorState({ error, onRetry }) {
  return (
    <div role="alert" className="mx-auto max-w-md border border-blood/30 bg-white px-6 py-12 text-center">
      <h3 className="text-2xl font-semibold">We couldn't load this</h3>
      <p className="mt-2 text-sm text-muted">{error?.userMessage || 'Something went wrong.'}</p>
      {onRetry && <button onClick={onRetry} className="btn-primary mt-6">Try again</button>}
    </div>
  );
}

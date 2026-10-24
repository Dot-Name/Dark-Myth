export function CardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton aspect-[3/4] w-full rounded-sm" />
      <div className="skeleton mt-3 h-3 w-1/3 rounded-sm" />
      <div className="skeleton mt-2 h-5 w-4/5 rounded-sm" />
      <div className="skeleton mt-2 h-3 w-full rounded-sm" />
    </div>
  );
}

export default function LoadingSkeleton({ count = 8 }) {
  return (
    <div role="status" aria-label="Loading" className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

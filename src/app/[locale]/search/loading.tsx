export default function SearchLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 md:px-8 py-8">
      {/* Search bar skeleton */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
      </div>

      {/* Results skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((card) => (
          <div key={card} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}

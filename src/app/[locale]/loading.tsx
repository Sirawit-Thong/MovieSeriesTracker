export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero skeleton */}
      <section className="flex flex-col items-center justify-center py-24 px-4">
        <div className="h-12 w-80 bg-muted animate-pulse rounded-lg mb-4" />
        <div className="h-6 w-96 bg-muted animate-pulse rounded-lg mb-8" />
        <div className="flex gap-4">
          <div className="h-12 w-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-12 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
      </section>

      {/* Content skeleton */}
      <div className="px-4 md:px-8 pb-16 space-y-12">
        {[1, 2, 3].map((section) => (
          <div key={section}>
            <div className="h-8 w-48 bg-muted animate-pulse rounded-lg mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((card) => (
                <div key={card} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

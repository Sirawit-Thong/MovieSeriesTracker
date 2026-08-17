'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & {digest?: string};
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-[#ededed]">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="text-[#ededed]/60 mb-8 max-w-md mx-auto">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#e50914] hover:bg-[#b20710] text-white font-medium rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

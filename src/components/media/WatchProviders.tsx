'use client';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

type Provider = {
  providerId: number;
  providerName: string;
  logoPath: string;
  displayPriority: number;
};

type WatchProviderEntry = {
  providerId: number;
  providerType: string | null;
  provider: Provider;
};

type WatchProvidersProps = {
  providers: WatchProviderEntry[];
};

/** Human-readable labels for TMDB provider types. */
const PROVIDER_TYPE_LABELS: Record<string, string> = {
  flatrate: 'Stream',
  rent: 'Rent',
  buy: 'Buy',
  free: 'Free',
  ads: 'Free with Ads',
};

/** Provider type ordering priority. */
const PROVIDER_TYPE_ORDER = ['flatrate', 'free', 'ads', 'rent', 'buy'];

/**
 * Displays watch providers grouped by type (stream, rent, buy, etc.).
 * Each provider shows its logo and name.
 */
export default function WatchProviders({providers}: WatchProvidersProps) {
  if (!providers || providers.length === 0) return null;

  // Group by provider type
  const grouped = providers.reduce<Record<string, WatchProviderEntry[]>>((acc, entry) => {
    const type = entry.providerType ?? 'flatrate';
    if (!acc[type]) acc[type] = [];
    acc[type].push(entry);
    return acc;
  }, {});

  // Sort types by predefined order
  const sortedTypes = Object.keys(grouped).sort(
    (a, b) =>
      (PROVIDER_TYPE_ORDER.indexOf(a) === -1 ? 99 : PROVIDER_TYPE_ORDER.indexOf(a)) -
      (PROVIDER_TYPE_ORDER.indexOf(b) === -1 ? 99 : PROVIDER_TYPE_ORDER.indexOf(b))
  );

  return (
    <div className="space-y-4">
      {sortedTypes.map((type) => {
        const entries = grouped[type];
        if (!entries || entries.length === 0) return null;
        return (
          <div key={type}>
            <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
              {PROVIDER_TYPE_LABELS[type] ?? type}
            </h4>
            <div className="flex flex-wrap gap-3">
              {entries.map((entry) => (
                <div
                  key={entry.providerId}
                  className="flex items-center gap-2 bg-surface/50 rounded-lg px-3 py-2 border border-border hover:bg-surface-hover transition-colors"
                  title={entry.provider.providerName}
                >
                  <img
                    src={`${TMDB_IMAGE_BASE}/w45${entry.provider.logoPath}`}
                    alt={entry.provider.providerName}
                    className="w-8 h-8 rounded object-contain"
                    loading="lazy"
                  />
                  <span className="text-xs text-foreground/70">
                    {entry.provider.providerName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import TmdbImage from '@/components/ui/TmdbImage';
import {Link} from '@/i18n/navigation';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type CastMember = {
  id: number;
  tmdbId: number;
  name: string;
  profilePath: string | null;
  character?: string;
  order?: number;
  creditId?: string | number;
};

type CastListProps = {
  items: CastMember[];
};

/**
 * Horizontal scrollable list of cast members.
 * Each card shows profile image, actor name, character name, and billing order.
 * Links to person detail page.
 */
export default function CastList({items}: CastListProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-3 min-w-max pb-2">
        {items.map((member) => {
          const profileSrc = member.profilePath
            ? `${TMDB_IMAGE_BASE}/w185${member.profilePath}`
            : null;

          return (
            <Link
              key={member.creditId ?? `person-${member.id}-${member.order ?? 0}`}
              href={`/person/${member.tmdbId}`}
              className="group w-[120px] md:w-[140px] flex-shrink-0 bg-surface hover:bg-surface-hover rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:scale-[1.03]"
            >
              {/* Profile image */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
                {profileSrc ? (
<TmdbImage 
                    src={profileSrc}
                    alt={member.name}
                    fill
                    sizes="140px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-foreground/20 font-bold">
                    {member.name.charAt(0)}
                  </div>
                )}

                {/* Order badge */}
                {member.order !== undefined && member.order !== null && (
                  <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm text-[10px] font-semibold text-foreground/60 w-5 h-5 rounded-full flex items-center justify-center">
                    {member.order + 1}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-xs font-medium text-foreground/90 group-hover:text-white line-clamp-1 transition-colors">
                  {member.name}
                </p>
                {member.character && (
                  <p className="text-[11px] text-foreground/50 line-clamp-1 mt-0.5">
                    {member.character}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

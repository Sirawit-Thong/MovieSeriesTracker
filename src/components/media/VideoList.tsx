type VideoEntry = {
  id: number;
  key: string;
  name: string;
  site: string;
  type: string | null;
  language: string | null;
  official: boolean | null;
};

type VideoListProps = {
  videos: VideoEntry[];
};

/**
 * Horizontal scrollable list of YouTube video thumbnails.
 * Each card shows a thumbnail with play button overlay and video name.
 * Clicking opens the video on YouTube in a new tab.
 */
export default function VideoList({videos}: VideoListProps) {
  if (videos.length === 0) return null;

  const youtubeVideos = videos.filter((v) => v.site === 'YouTube');

  if (youtubeVideos.length === 0) return null;

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-4 min-w-max pb-2">
        {youtubeVideos.map((video) => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.key}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex-shrink-0 w-[280px] md:w-[320px]"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all bg-muted">
              <img
                src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                alt={video.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-red-600/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <svg
                    className="w-5 h-5 text-white ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Video type badge */}
              {video.type && (
                <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold bg-black/70 backdrop-blur-sm text-white/80 rounded">
                  {video.type}
                </div>
              )}
            </div>
            <p className="text-sm text-foreground/80 group-hover:text-white mt-2 line-clamp-2 transition-colors">
              {video.name}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

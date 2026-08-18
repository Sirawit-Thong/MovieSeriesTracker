import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth/config';
import {prisma} from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  // Get all movie/TV IDs from user's annotations + watchlists
  const [annotations, watchlistItems] = await Promise.all([
    prisma.userAnnotation.findMany({
      where: {userId: session.user.id},
      select: {entityType: true, entityId: true},
    }),
    prisma.watchlistItem.findMany({
      where: {watchlist: {userId: session.user.id}},
      select: {entityType: true, entityId: true},
    }),
  ]);

  const allItems = [...annotations, ...watchlistItems];
  const movieIds = allItems
    .filter((a) => a.entityType === 'MOVIE')
    .map((a) => a.entityId);
  const tvIds = allItems
    .filter((a) => a.entityType === 'TV')
    .map((a) => a.entityId);

  const uniqueMovieIds = [...new Set(movieIds)];
  const uniqueTvIds = [...new Set(tvIds)];

  // Fetch production countries for user's items
  const [movieCountries, tvCountries] = await Promise.all([
    uniqueMovieIds.length > 0
      ? prisma.movieProductionCountry.findMany({
          where: {movieId: {in: uniqueMovieIds}},
          select: {iso31661: true},
        })
      : [],
    uniqueTvIds.length > 0
      ? prisma.tvSeriesProductionCountry.findMany({
          where: {tvSeriesId: {in: uniqueTvIds}},
          select: {iso31661: true},
        })
      : [],
  ]);

  // Count per country
  const countMap = new Map<string, {movieCount: number; tvCount: number}>();
  for (const mc of movieCountries) {
    const entry = countMap.get(mc.iso31661) ?? {movieCount: 0, tvCount: 0};
    entry.movieCount++;
    countMap.set(mc.iso31661, entry);
  }
  for (const tc of tvCountries) {
    const entry = countMap.get(tc.iso31661) ?? {movieCount: 0, tvCount: 0};
    entry.tvCount++;
    countMap.set(tc.iso31661, entry);
  }

  if (countMap.size === 0) {
    return NextResponse.json([]);
  }

  // Fetch country names
  const codes = [...countMap.keys()];
  const countryNames = await prisma.productionCountry.findMany({
    where: {iso31661: {in: codes}},
    select: {iso31661: true, name: true},
  });
  const nameMap = new Map(countryNames.map((c) => [c.iso31661, c.name]));

  const result = codes
    .map((code) => {
      const counts = countMap.get(code)!;
      return {
        iso31661: code,
        name: nameMap.get(code) ?? code,
        movieCount: counts.movieCount,
        tvCount: counts.tvCount,
        totalCount: counts.movieCount + counts.tvCount,
      };
    })
    .sort((a, b) => b.totalCount - a.totalCount);

  return NextResponse.json(result);
}

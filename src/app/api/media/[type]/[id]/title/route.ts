import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getLocalizedField } from '@/lib/ingestion/translation-sync';

type RouteParams = {
  params: Promise<{ type: string; id: string }>;
};

// Shape of the media row we use: movie rows expose `title`, tv rows expose `name`.
type MediaTitleRow = {
  id: number;
  title?: string;
  name?: string;
};

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  const { type, id } = await params;
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';

  if (type !== 'movie' && type !== 'tv') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const tmdbId = parseInt(id, 10);
  if (isNaN(tmdbId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    // Find the media in our database
    const media = type === 'movie'
      ? await prisma.movie.findUnique({ where: { tmdbId }, select: { id: true, title: true } })
      : await prisma.tvSeries.findUnique({ where: { tmdbId }, select: { id: true, name: true } });

    if (!media) {
      return NextResponse.json({ title: null });
    }

    // Get translations
    const translations = await prisma.translation.findMany({
      where: { entityType: type, entityId: media.id },
    });

    const mediaTitle = media as MediaTitleRow;
    const baseTitle = type === 'movie' ? mediaTitle.title ?? null : mediaTitle.name ?? null;
    const title = getLocalizedField(translations, locale, 'name', baseTitle);

    return NextResponse.json({ title });
  } catch (error) {
    console.error('[media-title-api] Error:', error);
    return NextResponse.json({ title: null });
  }
}

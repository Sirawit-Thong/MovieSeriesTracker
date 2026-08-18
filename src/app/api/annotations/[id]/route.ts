// Single Annotation API Route
// GET    /api/annotations/[id]  — get annotation by ID
// PUT    /api/annotations/[id]  — update annotation by ID
// DELETE /api/annotations/[id]  — delete annotation by ID

import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db';
import {deleteAnnotation} from '@/lib/db/user-queries';
import type {WatchStatus} from '../../../../../generated/prisma/client';

const VALID_ENTITY_TYPES = ['MOVIE', 'TV', 'PERSON'] as const;
const VALID_WATCH_STATUSES: readonly WatchStatus[] = [
  'WATCHED',
  'WATCHING',
  'WANT_TO_WATCH',
  'DROPPED',
] as const;

// ── GET ──────────────────────────────────────────────────────

export async function GET(
  _request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const {id: idStr} = await params;
  const id = Number(idStr);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      {error: 'Invalid annotation ID'},
      {status: 400}
    );
  }

  const annotation = await prisma.userAnnotation.findUnique({where: {id}});

  if (!annotation) {
    return NextResponse.json(
      {error: 'Annotation not found'},
      {status: 404}
    );
  }

  return NextResponse.json(annotation);
}

// ── PUT ──────────────────────────────────────────────────────

export async function PUT(
  request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const {id: idStr} = await params;
  const id = Number(idStr);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      {error: 'Invalid annotation ID'},
      {status: 400}
    );
  }

  // Ensure the annotation exists
  const existing = await prisma.userAnnotation.findUnique({where: {id}});
  if (!existing) {
    return NextResponse.json(
      {error: 'Annotation not found'},
      {status: 404}
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({error: 'Invalid JSON body'}, {status: 400});
  }

  const {watchStatus, personalRating, notes, watchDate, entityType, entityId, currentEpisode, totalEpisodes} = body;

  // Build update data with validation
  const updateData: Record<string, unknown> = {};

  if (entityType !== undefined) {
    if (!VALID_ENTITY_TYPES.includes(entityType as typeof VALID_ENTITY_TYPES[number])) {
      return NextResponse.json(
        {error: `Invalid entityType: ${entityType}`},
        {status: 400}
      );
    }
    updateData.entityType = entityType;
  }

  if (entityId !== undefined) {
    if (typeof entityId !== 'number' || !Number.isInteger(entityId) || entityId <= 0) {
      return NextResponse.json(
        {error: 'entityId must be a positive integer'},
        {status: 400}
      );
    }
    updateData.entityId = entityId;
  }

  if (watchStatus !== undefined) {
    if (watchStatus !== null && !VALID_WATCH_STATUSES.includes(watchStatus as WatchStatus)) {
      return NextResponse.json(
        {error: `Invalid watchStatus: ${watchStatus}`},
        {status: 400}
      );
    }
    updateData.watchStatus = watchStatus;
  }

  if (personalRating !== undefined) {
    if (personalRating !== null && (typeof personalRating !== 'number' || !Number.isInteger(personalRating) || personalRating < 1 || personalRating > 10)) {
      return NextResponse.json(
        {error: 'personalRating must be an integer between 1 and 10, or null'},
        {status: 400}
      );
    }
    updateData.personalRating = personalRating;
  }

  if (notes !== undefined) {
    if (notes !== null && typeof notes !== 'string') {
      return NextResponse.json(
        {error: 'notes must be a string or null'},
        {status: 400}
      );
    }
    updateData.notes = notes;
  }

  if (watchDate !== undefined) {
    if (watchDate !== null) {
      const parsed = new Date(watchDate as string);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          {error: 'watchDate must be a valid ISO 8601 date string'},
          {status: 400}
        );
      }
      updateData.watchDate = parsed;
    } else {
      updateData.watchDate = null;
    }
  }

  if (currentEpisode !== undefined) {
    if (currentEpisode !== null && (typeof currentEpisode !== 'number' || !Number.isInteger(currentEpisode) || currentEpisode < 0)) {
      return NextResponse.json(
        {error: 'currentEpisode must be a non-negative integer or null'},
        {status: 400}
      );
    }
    updateData.currentEpisode = currentEpisode;
  }

  if (totalEpisodes !== undefined) {
    if (totalEpisodes !== null && (typeof totalEpisodes !== 'number' || !Number.isInteger(totalEpisodes) || totalEpisodes < 0)) {
      return NextResponse.json(
        {error: 'totalEpisodes must be a non-negative integer or null'},
        {status: 400}
      );
    }
    updateData.totalEpisodes = totalEpisodes;
  }

  try {
    const updated = await prisma.userAnnotation.update({
      where: {id},
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    // Handle unique constraint violation when entityType/entityId are changed
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        {error: 'An annotation already exists for this entity'},
        {status: 409}
      );
    }
    throw error;
  }
}

// ── DELETE ───────────────────────────────────────────────────

export async function DELETE(
  _request: Request,
  {params}: {params: Promise<{id: string}>}
) {
  const {id: idStr} = await params;
  const id = Number(idStr);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json(
      {error: 'Invalid annotation ID'},
      {status: 400}
    );
  }

  try {
    await deleteAnnotation(id);
    return NextResponse.json({success: true});
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        {error: 'Annotation not found'},
        {status: 404}
      );
    }
    throw error;
  }
}

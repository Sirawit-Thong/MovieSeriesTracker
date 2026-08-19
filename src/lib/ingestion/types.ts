// Ingestion Types
// Common types shared across all ingestion services (movie, TV, person sync).

// ============================================================
// Sync Progress
// ============================================================

export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface SyncProgress {
  /** Number of items processed so far */
  current: number;
  /** Total number of items to process */
  total: number;
  /** Entity type being synced (e.g. "movie", "tv", "person") */
  entity: string;
  /** Current sync status */
  status: SyncStatus;
  /** Current sync phase */
  phase?: string;
  /** Human-readable progress message */
  message?: string;
}

// ============================================================
// Sync Result
// ============================================================

export interface SyncResult {
  /** Whether the overall sync completed successfully */
  success: boolean;
  /** List of errors encountered during sync (non-fatal per-item errors) */
  errors: SyncError[];
  /** Total sync duration in milliseconds */
  duration: number;
  /** Number of items processed (movies or TV series) */
  moviesProcessed?: number;
  /** True when the sync was stopped by a cancellation request */
  cancelled?: boolean;
}

export interface SyncError {
  /** TMDB ID of the entity that failed */
  tmdbId: number;
  /** Entity type (e.g. "movie") */
  entity: string;
  /** Error message */
  message: string;
  /** When the error occurred */
  timestamp: Date;
  /** Type alias used in some sync services */
  type?: string;
}

// ============================================================
// Sync Options
// ============================================================

export interface SyncOptions {
  /** Maximum number of items to sync (0 = unlimited) */
  limit: number;
  /** Language for TMDB API responses */
  language: string;
  /** Full sync: re-fetch all movies; false = incremental */
  fullSync: boolean;
  /** Maximum pages to fetch from TMDB (for list endpoints) */
  maxPages?: number;
  /** Called between batches; return true to stop the sync early */
  shouldStop?: () => Promise<boolean>;
}

export const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  limit: 0,
  language: 'en-US',
  fullSync: true,
};

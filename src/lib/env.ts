const DEV_AUTH_SECRET = 'dev-secret-change-in-production';

export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const problems: string[] = [];
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET === DEV_AUTH_SECRET) {
    problems.push('AUTH_SECRET must be set to a random value (openssl rand -base64 32) in production');
  }
  if (!process.env.TMDB_API_KEY) {
    problems.push('TMDB_API_KEY must be set in production');
  }
  if (problems.length > 0) {
    throw new Error(`Invalid production environment:\n- ${problems.join('\n- ')}`);
  }
}

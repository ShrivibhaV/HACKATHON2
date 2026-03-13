/**
 * lib/db.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Singleton PostgreSQL connection pool using the `pg` package.
 * Works with any standard PostgreSQL installation — pgAdmin, local Postgres, etc.
 *
 * Connection details come from .env.local:
 *   PG_HOST, PG_PORT, PG_DATABASE, PG_USER, PG_PASSWORD
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Pool } from 'pg';

// Re-use the same pool across all API calls (Next.js keeps the module in memory)
const pool = new Pool({
  host: process.env.PG_HOST ?? 'localhost',
  port: parseInt(process.env.PG_PORT ?? '5432', 10),
  database: process.env.PG_DATABASE ?? 'HACKATHON2',
  user: process.env.PG_USER ?? 'postgres',
  password: process.env.PG_PASSWORD ?? '98765',
  // Keep a small pool — this is a Next.js dev/production server
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

export default pool;

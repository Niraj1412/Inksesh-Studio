import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to connect to Postgres.");
}

const globalForDb = globalThis;

const isLocalConnection =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1") ||
  connectionString.includes("0.0.0.0");

const sslDisabled =
  process.env.DATABASE_SSL === "false" ||
  process.env.DATABASE_SSL === "0" ||
  process.env.PGSSLMODE === "disable" ||
  connectionString.includes("sslmode=disable");

const sslEnabled =
  !sslDisabled &&
  (process.env.DATABASE_SSL === "true" ||
    process.env.DATABASE_SSL === "1" ||
    process.env.PGSSLMODE === "require" ||
    connectionString.includes("sslmode=require") ||
    connectionString.includes("ssl=true") ||
    !isLocalConnection);

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  });

if (!globalForDb.pgPool) {
  globalForDb.pgPool = pool;
}

async function ensureSchema() {
  if (globalForDb.pgSchemaReady) {
    return globalForDb.pgSchemaReady;
  }

  const schemaPromise = (async () => {
    await pool.query(`
      create table if not exists studios (
        id text primary key,
        name text not null,
        area text,
        specialties text,
        created_at timestamptz not null default now()
      );
    `);

    await pool.query(`
      create table if not exists artists (
        id uuid primary key,
        studio_id text not null,
        name text not null,
        role text,
        created_at timestamptz not null default now()
      );
    `);

    await pool.query(`
      create table if not exists assets (
        id uuid primary key,
        studio_id text not null,
        type text not null,
        original_filename text,
        mime_type text,
        storage_prefix text not null,
        variants jsonb not null,
        created_at timestamptz not null default now()
      );
    `);
  })();

  globalForDb.pgSchemaReady = schemaPromise;

  try {
    await schemaPromise;
    return schemaPromise;
  } catch (error) {
    delete globalForDb.pgSchemaReady;
    throw error;
  }
}

export async function query(text, params) {
  await ensureSchema();
  return pool.query(text, params);
}

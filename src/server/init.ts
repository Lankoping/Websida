// Server initialization - runs when the server starts
import { purgeExpiredRequestMetadata } from './functions/logs'
import { getDb } from './db/runtime'
import { sql } from 'drizzle-orm'

let initialized = false
let purgeInterval: ReturnType<typeof setInterval> | null = null

async function runRetentionPurge() {
  try {
    const updated = await purgeExpiredRequestMetadata(7)
    if (updated > 0) {
      console.log(`🧹 Purged request metadata from ${updated} activity log entries (older than 7 days)`)
    }
  } catch (error) {
    console.error('⚠️  Failed to run activity log retention purge', error)
  }
}

async function dropUnusedTables() {
  try {
    const db = await getDb()
    await db.execute(sql`DROP TABLE IF EXISTS avgangs_requests CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS stadgar CASCADE`)
    await db.execute(sql`DROP TABLE IF EXISTS organization_members CASCADE`)
    console.log('🧹 Dropped unused tables (avgangs_requests, stadgar, organization_members)')
  } catch (error) {
    console.error('⚠️  Failed to drop unused tables', error)
  }
}

async function ensureRequiredTables() {
  try {
    const db = await getDb()
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `)
    console.log('✅ Ensured required tables exist')
  } catch (error) {
    console.error('⚠️  Failed to ensure required tables', error)
  }
}

export async function initializeServer() {
  if (initialized) {
    console.log('⚠️  Server already initialized, skipping...')
    return
  }

  console.log('\n╔══════════════════════════════════════════════════════════════════════════════╗')
  console.log('║          🚀 Lankoping.se Server Starting...              ║')
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n')

  initialized = true

  await dropUnusedTables()
  await ensureRequiredTables()
  await runRetentionPurge()

  if (!purgeInterval) {
    purgeInterval = setInterval(() => {
      void runRetentionPurge()
    }, 6 * 60 * 60 * 1000)
  }

  console.log('✅ Server initialization complete\n')
}

// Auto-initialize on import in production
if (process.env.NODE_ENV === 'production' || process.env.AUTO_INIT === 'true') {
  void initializeServer()
}

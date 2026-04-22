// Server initialization - runs when the server starts
import { purgeExpiredRequestMetadata } from './functions/logs'
import { getDb } from './db/runtime'
import { sql, lt, and, eq } from 'drizzle-orm'
import { tickets, events } from './db/schema'

let initialized = false
let purgeInterval: ReturnType<typeof setInterval> | null = null
let ticketCleanupInterval: ReturnType<typeof setInterval> | null = null

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

async function runTicketCleanup() {
  try {
    const db = await getDb()
    
    // Anonymize tickets 30 days after the event has ended AND the event is marked as finished
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const oldEvents = await db.select({ id: events.id })
      .from(events)
      .where(and(eq(events.finished, true), lt(events.date, thirtyDaysAgo)))
      
    const oldEventIds = oldEvents.map(e => e.id)

    if (oldEventIds.length > 0) {
      const eventIdsList = oldEventIds.join(',')
      const result = await db.execute(sql`
        UPDATE tickets 
        SET participant_name = 'Anonymized', participant_email = 'anonymized@example.com'
        WHERE event_id IN (${sql.raw(eventIdsList)}) 
        AND participant_name != 'Anonymized'
        RETURNING id
      `)
      
      if (result.length > 0) {
        console.log(`🧹 Anonymized ${result.length} old tickets (30 days post-event for finished events)`)
      }
    }
  } catch (error) {
    console.error('⚠️  Failed to run ticket cleanup', error)
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
  await runTicketCleanup()

  if (!purgeInterval) {
    purgeInterval = setInterval(() => {
      void runRetentionPurge()
    }, 6 * 60 * 60 * 1000)
  }

  if (!ticketCleanupInterval) {
    // Run ticket cleanup every 24 hours
    ticketCleanupInterval = setInterval(() => {
      void runTicketCleanup()
    }, 24 * 60 * 60 * 1000)
  }

  console.log('✅ Server initialization complete\n')
}

// Auto-initialize on import in production
if (process.env.NODE_ENV === 'production' || process.env.AUTO_INIT === 'true') {
  void initializeServer()
}

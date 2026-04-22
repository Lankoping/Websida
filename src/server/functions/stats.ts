'use server'
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../db/runtime'
import { sql } from 'drizzle-orm'
import { requireOrganizerUser } from '../lib/access'

export const getDbStatsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireOrganizerUser()
    const db = await getDb()
    
    try {
      // Get row counts for all tables
      const tables = ['users', 'events', 'tickets', 'ticket_types', 'activity_logs', 'password_reset_tokens']
      let totalRows = 0
      const tableStats: Record<string, number> = {}

      for (const table of tables) {
        const result = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`))
        const count = parseInt(result[0]?.count as string || '0', 10)
        tableStats[table] = count
        totalRows += count
      }

      // Check migration status (basic check if __drizzle_migrations exists and has entries)
      let migrationsCount = 0
      let outOfSync = false
      try {
        const migResult = await db.execute(sql`SELECT COUNT(*) as count FROM __drizzle_migrations`)
        migrationsCount = parseInt(migResult[0]?.count as string || '0', 10)
        // If we have 0 migrations but tables exist, something might be out of sync
        if (migrationsCount === 0 && totalRows > 0) {
          outOfSync = true
        }
      } catch (e) {
        // Table might not exist yet
        outOfSync = true
      }

      return {
        success: true,
        totalRows,
        tableStats,
        migrationsCount,
        outOfSync
      }
    } catch (error) {
      console.error('Failed to get DB stats:', error)
      return {
        success: false,
        totalRows: 0,
        tableStats: {},
        migrationsCount: 0,
        outOfSync: true,
        error: 'Kunde inte hämta databasstatistik'
      }
    }
  })

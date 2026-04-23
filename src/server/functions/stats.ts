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
        try {
          const result = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`))
          // Handle different result formats (e.g., postgres returns { rows: [...] })
          const rows = (result as any).rows || result
          const count = parseInt(rows[0]?.count as string || '0', 10)
          tableStats[table] = count
          totalRows += count
        } catch (e) {
          tableStats[table] = 0
        }
      }

      // Check migration status (basic check if __drizzle_migrations exists and has entries)
      let migrationsCount = 0
      let outOfSync = false
      try {
        const migResult = await db.execute(sql`SELECT COUNT(*) as count FROM __drizzle_migrations`)
        const rows = (migResult as any).rows || migResult
        migrationsCount = parseInt(rows[0]?.count as string || '0', 10)
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
        error: 'Kund inte hämta databasstatistik'
      }
    }
  })

export const runDeepScanFn = createServerFn({ method: 'POST' })
  .handler(async () => {
    await requireOrganizerUser()
    const db = await getDb()
    
    try {
      const expectedTables = ['users', 'events', 'tickets', 'ticket_types', 'activity_logs', 'password_reset_tokens']
      const missingTables: string[] = []
      
      for (const table of expectedTables) {
        try {
          // Just try to select 1 row to see if the table exists
          await db.execute(sql.raw(`SELECT 1 FROM ${table} LIMIT 1`))
        } catch (e) {
          missingTables.push(table)
        }
      }
      
      // Also check if the finished column exists on events
      let missingFinishedColumn = false
      try {
        await db.execute(sql`SELECT finished FROM events LIMIT 1`)
      } catch (e) {
        missingFinishedColumn = true
      }

      const isOutOfSync = missingTables.length > 0 || missingFinishedColumn

      return {
        success: true,
        isOutOfSync,
        missingTables,
        missingFinishedColumn,
        message: isOutOfSync 
          ? `Databasen är ur synk. Saknade tabeller: ${missingTables.join(', ') || 'Inga'}. Saknar 'finished' kolumn: ${missingFinishedColumn ? 'Ja' : 'Nej'}`
          : 'Databasen är helt synkroniserad med schemat.'
      }
    } catch (error) {
      console.error('Deep scan failed:', error)
      throw new Error('Kund inte genomföra djupskanning av databasen.')
    }
  })

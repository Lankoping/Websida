'use server'
import { createServerFn } from '@tanstack/react-start'
import { sql } from 'drizzle-orm'
import { getDb } from '../db/runtime'
import { requireOrganizerUser } from '../lib/access'

export const getDatabaseStatsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireOrganizerUser()
    const db = await getDb()

    try {
      // Get database size
      const dbSizeResult = await db.execute(sql`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size,
               pg_database_size(current_database()) as bytes
      `)
      const dbSize = dbSizeResult.rows[0]?.size as string || 'Unknown'
      const dbBytes = Number(dbSizeResult.rows[0]?.bytes) || 0

      // Get total rows across main tables
      const tables = ['users', 'posts', 'events', 'tickets', 'activity_logs']
      let totalRows = 0
      
      for (const table of tables) {
        const countResult = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM ${table}`))
        totalRows += Number(countResult.rows[0]?.count) || 0
      }

      // Get user count for averages
      const userCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`)
      const userCount = Number(userCountResult.rows[0]?.count) || 1 // Prevent division by zero

      const avgRowsPerUser = Math.round(totalRows / userCount)

      // Server health is assumed healthy if we can run these queries
      const serverHealth = 'Healthy'

      return {
        dbSize,
        dbBytes,
        totalRows,
        userCount,
        avgRowsPerUser,
        serverHealth
      }
    } catch (error) {
      console.error('Failed to fetch database stats', error)
      return {
        dbSize: 'Error',
        dbBytes: 0,
        totalRows: 0,
        userCount: 0,
        avgRowsPerUser: 0,
        serverHealth: 'Degraded'
      }
    }
  })

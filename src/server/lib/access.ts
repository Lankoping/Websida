import { getCookie } from '@tanstack/react-start/server'
import { eq } from 'drizzle-orm'
import { db } from '../db/index'
import { users } from '../db/schema'

export type StaffRole = 'organizer' | 'volunteer'

export function isOrganizer(role: string | null | undefined): role is 'organizer' {
  return role === 'organizer'
}

export async function requireStaffUser() {
  const userId = getCookie('session')
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const result = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1)
  const user = result[0]
  if (!user || user.active === false || (user.role !== 'organizer' && user.role !== 'volunteer')) {
    throw new Error('Forbidden')
  }

  return user
}

export async function requireOrganizerUser() {
  const user = await requireStaffUser()
  if (user.role !== 'organizer') {
    throw new Error('Forbidden')
  }
  return user
}
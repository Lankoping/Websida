"use server"
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../db/runtime'
import { buyerProfiles, events, tickets } from '../db/schema'
import { requireOrganizerUser } from '../lib/access'

function formatDayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function startOfDay(date: Date) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export const getAnalyticsDashboardFn = createServerFn({ method: 'GET' }).handler(async () => {
  await requireOrganizerUser()
  const db = await getDb()

  const [eventRows, ticketRows, profileRows] = await Promise.all([
    db.select().from(events),
    db.select().from(tickets),
    db.select().from(buyerProfiles),
  ])

  const totalRevenue = ticketRows.reduce((sum, ticket) => sum + (ticket.pricePaid ?? 0), 0)
  const totalTickets = ticketRows.length
  const usedTickets = ticketRows.filter((ticket) => ticket.status === 'used').length
  const cancelledTickets = ticketRows.filter((ticket) => ticket.status === 'cancelled').length
  const validTickets = ticketRows.filter((ticket) => ticket.status === 'valid').length

  const now = new Date()
  const dayBuckets = new Map<string, { day: string; tickets: number; revenue: number }>()
  for (let i = 13; i >= 0; i -= 1) {
    const day = startOfDay(new Date(now))
    day.setDate(day.getDate() - i)
    dayBuckets.set(formatDayKey(day), { day: formatDayKey(day), tickets: 0, revenue: 0 })
  }

  for (const ticket of ticketRows) {
    const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : null
    if (!createdAt) continue
    const key = formatDayKey(createdAt)
    const bucket = dayBuckets.get(key)
    if (!bucket) continue
    bucket.tickets += 1
    bucket.revenue += ticket.pricePaid ?? 0
  }

  const ticketCountsByEvent = new Map<number, typeof ticketRows>()
  for (const ticket of ticketRows) {
    const rows = ticketCountsByEvent.get(ticket.eventId) ?? []
    rows.push(ticket)
    ticketCountsByEvent.set(ticket.eventId, rows)
  }

  const eventSummaries = eventRows
    .map((event) => {
      const rows = ticketCountsByEvent.get(event.id) ?? []
      const revenue = rows.reduce((sum, ticket) => sum + (ticket.pricePaid ?? 0), 0)
      const used = rows.filter((ticket) => ticket.status === 'used').length
      return {
        id: event.id,
        title: event.title,
        date: event.date,
        published: event.published,
        finished: event.finished,
        sold: rows.length,
        used,
        revenue,
        checkedInRate: rows.length > 0 ? Math.round((used / rows.length) * 100) : 0,
      }
    })
    .sort((left, right) => right.sold - left.sold || right.revenue - left.revenue)

  const topMembers = profileRows
    .map((profile) => {
      const matchingTickets = profile.email
        ? ticketRows.filter((ticket) => ticket.participantEmail?.trim().toLowerCase() === profile.email?.trim().toLowerCase())
        : []
      const revenue = matchingTickets.reduce((sum, ticket) => sum + (ticket.pricePaid ?? 0), 0)
      const lastPurchaseAt = matchingTickets
        .slice()
        .sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime())[0]?.createdAt ?? null

      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        ticketCount: matchingTickets.length,
        revenue,
        lastPurchaseAt,
      }
    })
    .filter((profile) => profile.ticketCount > 0)
    .sort((left, right) => right.ticketCount - left.ticketCount || right.revenue - left.revenue)
    .slice(0, 8)

  return {
    summary: {
      totalEvents: eventRows.length,
      publishedEvents: eventRows.filter((event) => event.published).length,
      totalTickets,
      usedTickets,
      validTickets,
      cancelledTickets,
      totalRevenue,
      averageTicketValue: totalTickets > 0 ? Math.round(totalRevenue / totalTickets) : 0,
      memberProfiles: profileRows.length,
      linkedMemberProfiles: profileRows.filter((profile) =>
        ticketRows.some((ticket) => ticket.participantEmail?.trim().toLowerCase() === profile.email?.trim().toLowerCase()),
      ).length,
    },
    dailySales: Array.from(dayBuckets.values()),
    topEvents: eventSummaries.slice(0, 8),
    topMembers,
  }
})
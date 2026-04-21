import { createServerFn } from '@tanstack/start'
import { db } from '../db'
import { tickets, events, ticketTypes } from '../db/schema'
import { eq, desc, and, ilike, or } from 'drizzle-orm'
import { requireAuth } from './auth'
import { logActivity } from './logs'

export const getTicketsFn = createServerFn({ method: 'GET' })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown> | undefined
    return {
      search: typeof d?.search === 'string' ? d.search : undefined,
      status: typeof d?.status === 'string' ? d.status : undefined,
      eventId: typeof d?.eventId === 'number' ? d.eventId : undefined
    }
  })
  .handler(async ({ data }) => {
    await requireAuth()
    
    let query = db
      .select({
        ticket: tickets,
        event: events
      })
      .from(tickets)
      .leftJoin(events, eq(tickets.eventId, events.id))
      .orderBy(desc(tickets.createdAt))
    
    const conditions = []
    
    if (data.search) {
      conditions.push(
        or(
          ilike(tickets.participantName, `%${data.search}%`),
          ilike(tickets.participantEmail, `%${data.search}%`),
          ilike(tickets.ticketCode, `%${data.search}%`)
        )
      )
    }
    
    if (data.status && data.status !== 'all') {
      conditions.push(eq(tickets.status, data.status))
    }
    
    if (data.eventId && data.eventId !== 0) {
      conditions.push(eq(tickets.eventId, data.eventId))
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }
    
    const results = await query
    
    return results.map(r => ({
      ...r.ticket,
      event: r.event
    }))
  })

export const issueTicketFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown>
    return {
      eventId: Number(d.eventId),
      participantName: String(d.participantName),
      participantEmail: String(d.participantEmail),
      ticketType: String(d.ticketType),
      pricePaid: Number(d.pricePaid)
    }
  })
  .handler(async ({ data }) => {
    const session = await requireAuth()
    
    // Generate a unique 6-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars like I, 1, O, 0
    let ticketCode = ''
    for (let i = 0; i < 6; i++) {
      ticketCode += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    
    const [ticket] = await db.insert(tickets).values({
      ...data,
      ticketCode,
      status: 'valid',
      issuedBy: session.id
    }).returning()
    
    await logActivity(
      session.id,
      session.role,
      'ISSUE_TICKET',
      'ticket',
      ticket.id,
      `Issued ticket ${ticketCode} to ${data.participantName}`
    )
    
    return ticket
  })

export const verifyTicketByCodeFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown>
    return {
      code: String(d.code),
      markAsUsed: Boolean(d.markAsUsed)
    }
  })
  .handler(async ({ data }) => {
    const session = await requireAuth().catch(() => null) // Optional auth for public viewing
    
    const [result] = await db
      .select({
        ticket: tickets,
        event: events
      })
      .from(tickets)
      .leftJoin(events, eq(tickets.eventId, events.id))
      .where(eq(tickets.ticketCode, data.code))
    
    if (!result || !result.ticket) {
      return { success: false, message: 'Biljetten hittades inte' }
    }
    
    const { ticket, event } = result
    
    // If just viewing (markAsUsed = false), return the ticket info
    if (!data.markAsUsed) {
      return { 
        success: true, 
        ticket,
        event
      }
    }
    
    // If trying to mark as used, require auth
    if (!session) {
      throw new Error('Unauthorized to scan tickets')
    }
    
    if (ticket.status === 'used') {
      return { 
        success: false, 
        message: 'Biljetten är redan använd',
        ticket,
        event,
        checkingIn: false
      }
    }
    
    if (ticket.status === 'cancelled') {
      return { 
        success: false, 
        message: 'Biljetten är ogiltig/makulerad',
        ticket,
        event,
        checkingIn: false
      }
    }
    
    // Mark as used
    const [updatedTicket] = await db
      .update(tickets)
      .set({ 
        status: 'used',
        scannedAt: new Date(),
        scannedBy: session.id,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, ticket.id))
      .returning()
      
    await logActivity(
      session.id,
      session.role,
      'SCAN_TICKET',
      'ticket',
      ticket.id,
      `Scanned and checked in ticket ${ticket.ticketCode}`
    )
      
    return { 
      success: true, 
      message: 'Incheckning lyckades',
      ticket: updatedTicket,
      event,
      checkingIn: true
    }
  })

export const getEventsForTicketsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAuth()
    return db.select().from(events).orderBy(desc(events.date))
  })

export const getTicketTypesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAuth()
    return db.select().from(ticketTypes).orderBy(desc(ticketTypes.createdAt))
  })

export const createTicketTypeFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown>
    return {
      name: String(d.name),
      price: Number(d.price),
      description: d.description ? String(d.description) : undefined
    }
  })
  .handler(async ({ data }) => {
    const session = await requireAuth()
    if (session.role !== 'organizer') throw new Error('Unauthorized')
    
    const [type] = await db.insert(ticketTypes).values(data).returning()
    
    await logActivity(
      session.id,
      session.role,
      'CREATE_TICKET_TYPE',
      'ticketType',
      type.id,
      `Created ticket type ${type.name}`
    )
    
    return type
  })

export const deleteTicketTypeFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return Number(data)
  })
  .handler(async ({ data }) => {
    const session = await requireAuth()
    if (session.role !== 'organizer') throw new Error('Unauthorized')
    
    await db.delete(ticketTypes).where(eq(ticketTypes.id, data))
    
    await logActivity(
      session.id,
      session.role,
      'DELETE_TICKET_TYPE',
      'ticketType',
      data,
      `Deleted ticket type ${data}`
    )
    
    return { success: true }
  })

export const getEventsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireAuth()
    return db.select().from(events).orderBy(desc(events.date))
  })

export const createEventFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown>
    return {
      title: String(d.title),
      description: d.description ? String(d.description) : undefined,
      date: new Date(String(d.date)),
      location: d.location ? String(d.location) : undefined,
      image: d.image ? String(d.image) : undefined,
      published: Boolean(d.published)
    }
  })
  .handler(async ({ data }) => {
    const session = await requireAuth()
    if (session.role !== 'organizer') throw new Error('Unauthorized')
    
    const [event] = await db.insert(events).values(data).returning()
    
    await logActivity(
      session.id,
      session.role,
      'CREATE_EVENT',
      'event',
      event.id,
      `Created event ${event.title}`
    )
    
    return event
  })

export const deleteEventFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return Number(data)
  })
  .handler(async ({ data }) => {
    const session = await requireAuth()
    if (session.role !== 'organizer') throw new Error('Unauthorized')
    
    await db.delete(events).where(eq(events.id, data))
    
    await logActivity(
      session.id,
      session.role,
      'DELETE_EVENT',
      'event',
      data,
      `Deleted event ${data}`
    )
    
    return { success: true }
  })

export const updateTicketStatusFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    const d = data as Record<string, unknown>
    return {
      id: Number(d.id),
      status: String(d.status) as 'valid' | 'used' | 'cancelled'
    }
  })
  .handler(async ({ data }) => {
    const session = await requireAuth()
    if (session.role !== 'organizer' && session.role !== 'volunteer') throw new Error('Unauthorized')
    
    const [ticket] = await db.update(tickets)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(tickets.id, data.id))
      .returning()
      
    if (!ticket) throw new Error('Ticket not found')
    
    await logActivity(
      session.id,
      session.role,
      'UPDATE_TICKET_STATUS',
      'ticket',
      ticket.id,
      `Updated ticket ${ticket.ticketCode} status to ${data.status}`
    )
    
    return ticket
  })

export const deleteTicketFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return Number(data)
  })
  .handler(async ({ data }) => {
    const session = await requireAuth()
    if (session.role !== 'organizer') throw new Error('Unauthorized')
    
    const [ticket] = await db.delete(tickets).where(eq(tickets.id, data)).returning()
    
    if (!ticket) throw new Error('Ticket not found')
    
    await logActivity(
      session.id,
      session.role,
      'DELETE_TICKET',
      'ticket',
      data,
      `Deleted ticket ${ticket.ticketCode}`
    )
    
    return { success: true }
  })

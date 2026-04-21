import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { tickets, events, ticketTypes } from '../db/schema'
import { eq, desc, and, ilike, or } from 'drizzle-orm'
import { requireOrganizerUser, requireStaffUser } from '../lib/access'
import { writeActivityLog } from './logs'

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
    await requireStaffUser()
    
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
    const session = await requireStaffUser()
    
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
    
    await writeActivityLog({
      actorUserId: session.id,
      actorRole: session.role,
      action: 'ISSUE_TICKET',
      entityType: 'ticket',
      entityId: ticket.id,
      details: { message: `Issued ticket ${ticketCode} to ${data.participantName}` }
    })
    
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
    const session = await requireStaffUser().catch(() => null) // Optional auth for public viewing
    
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
      
    await writeActivityLog({
      actorUserId: session.id,
      actorRole: session.role,
      action: 'SCAN_TICKET',
      entityType: 'ticket',
      entityId: ticket.id,
      details: { message: `Scanned and checked in ticket ${ticket.ticketCode}` }
    })
      
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
    await requireStaffUser()
    return db.select().from(events).orderBy(desc(events.date))
  })

export const getTicketTypesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireStaffUser()
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
    const session = await requireOrganizerUser()
    
    const [type] = await db.insert(ticketTypes).values(data).returning()
    
    await writeActivityLog({
      actorUserId: session.id,
      actorRole: session.role,
      action: 'CREATE_TICKET_TYPE',
      entityType: 'ticketType',
      entityId: type.id,
      details: { message: `Created ticket type ${type.name}` }
    })
    
    return type
  })

export const deleteTicketTypeFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return Number(data)
  })
  .handler(async ({ data }) => {
    const session = await requireOrganizerUser()
    
    await db.delete(ticketTypes).where(eq(ticketTypes.id, data))
    
    await writeActivityLog({
      actorUserId: session.id,
      actorRole: session.role,
      action: 'DELETE_TICKET_TYPE',
      entityType: 'ticketType',
      entityId: data,
      details: { message: `Deleted ticket type ${data}` }
    })
    
    return { success: true }
  })

export const getEventsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    await requireStaffUser()
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
    const session = await requireOrganizerUser()
    
    const [event] = await db.insert(events).values(data).returning()
    
    await writeActivityLog({
      actorUserId: session.id,
      actorRole: session.role,
      action: 'CREATE_EVENT',
      entityType: 'event',
      entityId: event.id,
      details: { message: `Created event ${event.title}` }
    })
    
    return event
  })

export const deleteEventFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return Number(data)
  })
  .handler(async ({ data }) => {
    const session = await requireOrganizerUser()
    
    await db.delete(events).where(eq(events.id, data))
    
    await writeActivityLog({
      actorUserId: session.id,
      actorRole: session.role,
      action: 'DELETE_EVENT',
      entityType: 'event',
      entityId: data,
      details: { message: `Deleted event ${data}` }
    })
    
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
    const session = await requireStaffUser()
    
    const [ticket] = await db.update(tickets)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(tickets.id, data.id))
      .returning()
      
    if (!ticket) throw new Error('Ticket not found')
    
    await writeActivityLog({
      actorUserId: session.id,
      actorRole: session.role,
      action: 'UPDATE_TICKET_STATUS',
      entityType: 'ticket',
      entityId: ticket.id,
      details: { message: `Updated ticket ${ticket.ticketCode} status to ${data.status}` }
    })
    
    return ticket
  })

export const deleteTicketFn = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return Number(data)
  })
  .handler(async ({ data }) => {
    const session = await requireOrganizerUser()
    
    const [ticket] = await db.delete(tickets).where(eq(tickets.id, data)).returning()
    
    if (!ticket) throw new Error('Ticket not found')
    
    await writeActivityLog({
      actorUserId: session.id,
      actorRole: session.role,
      action: 'DELETE_TICKET',
      entityType: 'ticket',
      entityId: data,
      details: { message: `Deleted ticket ${ticket.ticketCode}` }
    })
    
    return { success: true }
  })

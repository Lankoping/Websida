import { pgTable, text, serial, timestamp, boolean, integer } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name'),
  role: text('role', { enum: ['organizer', 'volunteer'] }).default('volunteer').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: timestamp('date').notNull(),
  location: text('location'),
  image: text('image'),
  published: boolean('published').default(false).notNull(),
  finished: boolean('finished').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const ticketTypes = pgTable('ticket_types', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').default(0).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const tickets = pgTable('tickets', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id),
  participantName: text('participant_name').notNull(),
  participantEmail: text('participant_email').notNull(),
  ticketType: text('ticket_type').default('standard').notNull(),
  pricePaid: integer('price_paid').default(0).notNull(),
  ticketCode: text('ticket_code').notNull().unique(),
  status: text('status', { enum: ['valid', 'used', 'cancelled'] }).default('valid').notNull(),
  scannedAt: timestamp('scanned_at'),
  scannedBy: integer('scanned_by').references(() => users.id),
  issuedBy: integer('issued_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  actorUserId: integer('actor_user_id').references(() => users.id).notNull(),
  actorRole: text('actor_role', { enum: ['organizer', 'volunteer'] }).notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: integer('entity_id'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

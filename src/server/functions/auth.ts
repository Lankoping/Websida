'use server'
import { createServerFn } from '@tanstack/react-start'
import { getDb } from '../db/runtime'
import { users, activityLogs, tickets, passwordResetTokens } from '../db/schema'
import { eq, inArray, and, gte, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { setCookie, getCookie, deleteCookie } from '@tanstack/start/server'
import { randomBytes } from 'node:crypto'
import {
  enforceDemoOwnUserScope,
  getDemoAccountEmails,
  isDemoTesterUser,
  requireOrganizerUser,
  requireStaffUser,
} from '../lib/access'
import { hashPassword, isHashedPassword, verifyPassword } from '../lib/password'
import { writeActivityLog, deleteActivityLogsForUser } from './logs'
import { sendEmail } from '../lib/email'

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ email: z.string(), passwordHash: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const db = await getDb()

    const user = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
    if (!user || user.length === 0) {
      throw new Error('User not found')
    }

    if (user[0].role !== 'organizer' && user[0].role !== 'volunteer') {
      throw new Error('Account type not allowed')
    }

    if (user[0].active === false) {
      throw new Error('Account is locked')
    }

    if (!verifyPassword(data.passwordHash, user[0].passwordHash)) {
      throw new Error('Invalid password') 
    }

    if (!isHashedPassword(user[0].passwordHash)) {
      await db
        .update(users)
        .set({ passwordHash: hashPassword(data.passwordHash) })
        .where(eq(users.id, user[0].id))
    }

    setCookie('session', user[0].id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    await writeActivityLog({
      actorUserId: user[0].id,
      actorRole: user[0].role,
      action: 'auth.login',
      entityType: 'session',
      details: { email: user[0].email },
    })

    return { success: true, user: user[0] }
  })

export const logoutFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({}).parse(data ?? {}))
  .handler(async () => {
    const userId = getCookie('session')
    if (userId) {
      const db = await getDb()
      const user = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1)
      if (user[0]) {
        await writeActivityLog({
          actorUserId: user[0].id,
          actorRole: user[0].role,
          action: 'auth.logout',
          entityType: 'session',
        })
      }
    }

    deleteCookie('session', { path: '/' })
    return { success: true }
  })

export const getSessionFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const userId = getCookie('session')
    if (!userId) return null

    const db = await getDb()
    const user = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1)
    if (!user[0] || (user[0].role !== 'organizer' && user[0].role !== 'volunteer') || user[0].active === false) return null
    return {
      ...user[0],
      isDemoTester: isDemoTesterUser(user[0]),
    }
  })

export const getUsersFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(currentUser)) {
      return [currentUser]
    }

    return await db.select().from(users)
  })

export const createUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().optional(),
        name: z.string().optional(),
        role: z.enum(['organizer', 'volunteer']).default('volunteer'),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(currentUser)) {
      throw new Error('Forbidden in demo mode')
    }

    const existing = await db.select().from(users).where(eq(users.email, data.email)).limit(1)
    if (existing.length > 0) {
      throw new Error('Email already exists')
    }

    const initialPassword = data.password || randomBytes(16).toString('hex')

    const created = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: hashPassword(initialPassword),
        name: data.name,
        role: data.role,
        active: true,
      })
      .returning()

    let resetToken = null
    let emailSent = false
    let emailError = null
    if (!data.password) {
      resetToken = randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      await db.insert(passwordResetTokens).values({
        userId: created[0].id,
        token: resetToken,
        expiresAt,
      })

      const baseUrl = process.env.BASE_URL || 'https://lankoping.se'
      const resetLink = `${baseUrl}/login?userid=${created[0].id}&token=${resetToken}&makepassword=true`
      
      const userName = data.name || 'Användare'
      const adminName = currentUser.name || 'En administratör'
      
      const emailText = `Hej! ${userName}\n${adminName} har begärt att du skapar ett Linköping-konto.\n\nGå till följande länk för att skapa ditt lösenord:\n${resetLink}`
      
      const emailHtml = `
      <div style="font-family: sans-serif; max-w-xl mx-auto; background-color: #100E0C; color: #F0E8D8; padding: 2rem; border-radius: 8px; border: 1px solid rgba(192, 74, 42, 0.2);">
        <h2 style="color: #C04A2A; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; margin-bottom: 1rem;">Lankoping Admin</h2>
        <h1 style="font-size: 24px; margin-bottom: 1.5rem;">Välkommen till Lankoping!</h1>
        <p style="margin-bottom: 1rem;">Hej <strong>${userName}</strong>,</p>
        <p style="margin-bottom: 1.5rem;">${adminName} har skapat ett konto åt dig på Lankoping.se. För att komma igång behöver du skapa ett lösenord.</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #C04A2A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.5rem;">Skapa lösenord</a>
        <p style="font-size: 12px; color: rgba(240, 232, 216, 0.6); margin-bottom: 0.5rem;">Om knappen inte fungerar, kopiera och klistra in denna länk i din webbläsare:</p>
        <p style="font-size: 12px; color: #C04A2A; word-break: break-all;">${resetLink}</p>
      </div>`

      try {
        emailSent = await sendEmail({
          to: data.email,
          subject: 'Ditt Lankoping-konto',
          text: emailText,
          html: emailHtml,
        })
        if (!emailSent) {
          emailError = 'Misslyckades att skicka e-post. Kontrollera SMTP-inställningarna.'
        }
      } catch (e: any) {
        emailSent = false
        emailError = e.message || 'Ett okänt fel inträffade vid e-postutskick.'
      }
    }

    await writeActivityLog({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      action: 'user.create',
      entityType: 'user',
      entityId: created[0].id,
      details: {
        email: created[0].email,
        role: created[0].role,
        generatedPassword: !data.password,
        emailSent,
        emailError,
      },
    })

    return {
      user: created[0],
      resetToken,
      emailSent,
      emailError,
    }
  })

export const sendResetLinkFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      userId: z.number(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(currentUser)) {
      throw new Error('Forbidden in demo mode')
    }

    const targetUser = await db.select().from(users).where(eq(users.id, data.userId)).limit(1)
    if (!targetUser[0]) {
      throw new Error('User not found')
    }

    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, data.userId))

    const resetToken = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await db.insert(passwordResetTokens).values({
      userId: targetUser[0].id,
      token: resetToken,
      expiresAt,
    })

    const baseUrl = process.env.BASE_URL || 'https://lankoping.se'
    const resetLink = `${baseUrl}/login?userid=${targetUser[0].id}&token=${resetToken}&makepassword=true`
    
    const userName = targetUser[0].name || 'Användare'
    const adminName = currentUser.name || 'En administratör'
    
    const emailText = `Hej! ${userName}\n${adminName} har begärt att du sätter ett nytt lösenord för ditt Linköping-konto.\n\nGå till följande länk för att skapa ditt lösenord:\n${resetLink}`
    
    const emailHtml = `
      <div style="font-family: sans-serif; max-w-xl mx-auto; background-color: #100E0C; color: #F0E8D8; padding: 2rem; border-radius: 8px; border: 1px solid rgba(192, 74, 42, 0.2);">
        <h2 style="color: #C04A2A; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; margin-bottom: 1rem;">Lankoping Admin</h2>
        <h1 style="font-size: 24px; margin-bottom: 1.5rem;">Återställ Lösenord</h1>
        <p style="margin-bottom: 1rem;">Hej <strong>${userName}</strong>,</p>
        <p style="margin-bottom: 1.5rem;">${adminName} har begärt att du sätter ett nytt lösenord för ditt Lankoping-konto.</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #C04A2A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1.5rem;">Sätt nytt lösenord</a>
        <p style="font-size: 12px; color: rgba(240, 232, 216, 0.6); margin-bottom: 0.5rem;">Om knappen inte fungerar, kopiera och klistra in denna länk i din webbläsare:</p>
        <p style="font-size: 12px; color: #C04A2A; word-break: break-all;">${resetLink}</p>
      </div>`

    let emailSent = false
    let emailError = null

    try {
      emailSent = await sendEmail({
        to: targetUser[0].email,
        subject: 'Återställ ditt lösenord för Lankoping.se',
        text: emailText,
        html: emailHtml,
      })
      if (!emailSent) {
        emailError = 'Misslyckades att skicka e-post. Kontrollera SMTP-inställningarna.'
      }
    } catch (e: any) {
      emailSent = false
      emailError = e.message || 'Ett okänt fel inträffade vid e-postutskick.'
    }

    await writeActivityLog({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      action: 'user.password_reset_link_sent',
      entityType: 'user',
      entityId: targetUser[0].id,
      details: {
        email: targetUser[0].email,
        emailSent,
        emailError,
      },
    })

    if (!emailSent) {
      throw new Error(emailError || 'Failed to send email')
    }

    return { success: true, resetLink }
  })

export const resetPasswordWithTokenFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      userId: z.number(),
      token: z.string(),
      newPassword: z.string().min(1),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const db = await getDb()

    const tokenRecord = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, data.userId),
          eq(passwordResetTokens.token, data.token),
          gte(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1)

    if (!tokenRecord[0]) {
      throw new Error('Ogiltig eller utgången länk. Vänligen begär en ny länk.')
    }

    await db
      .update(users)
      .set({ passwordHash: hashPassword(data.newPassword) })
      .where(eq(users.id, data.userId))

    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.userId, data.userId))

    await writeActivityLog({
      actorUserId: data.userId,
      actorRole: 'volunteer',
      action: 'user.password.reset_with_token',
      entityType: 'user',
      entityId: data.userId,
    })

    return { success: true }
  })

export const changePasswordFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      userId: z.number(),
      newPassword: z.string().min(1),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const currentUser = await requireStaffUser()
    const db = await getDb()

    enforceDemoOwnUserScope(currentUser, data.userId)

    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1)

    if (!targetUser[0]) {
      throw new Error('User not found')
    }

    if (currentUser.role !== 'organizer' && currentUser.id !== targetUser[0].id) {
      throw new Error('Forbidden: Cannot change another account password')
    }

    await db
      .update(users)
      .set({ passwordHash: hashPassword(data.newPassword) })
      .where(eq(users.id, data.userId))

    await writeActivityLog({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      action: 'user.password.change',
      entityType: 'user',
      entityId: data.userId,
      details: {
        selfService: currentUser.id === data.userId,
      },
    })

    return { success: true }
  })

export const deleteUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      userId: z.number(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(currentUser)) {
      throw new Error('Forbidden in demo mode')
    }

    if (currentUser.id === data.userId) {
      throw new Error('Forbidden: Cannot delete yourself')
    }

    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId))
      .limit(1)

    if (!targetUser[0]) {
      throw new Error('User not found')
    }

    try {
      await db.update(tickets)
        .set({ 
          participantName: 'Anonymized', 
          participantEmail: 'anonymized@example.com',
          issuedBy: null 
        })
        .where(eq(tickets.issuedBy, data.userId))
      
      await db.update(tickets)
        .set({ scannedBy: null })
        .where(eq(tickets.scannedBy, data.userId))

      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, data.userId))

      try {
        await db.execute(sql`UPDATE avgangs_requests SET reviewed_by = NULL WHERE reviewed_by = ${data.userId}`)
      } catch (e) {}
      
      try {
        await db.execute(sql`UPDATE stadgar SET updated_by = NULL WHERE updated_by = ${data.userId}`)
      } catch (e) {}

      try {
        await db.execute(sql`DELETE FROM organization_members WHERE user_id = ${data.userId}`)
      } catch (e) {}

      try {
        await db.execute(sql`DELETE FROM agreements WHERE created_by = ${data.userId}`)
      } catch (e) {}

      await deleteActivityLogsForUser(data.userId)

      await db
        .delete(users)
        .where(eq(users.id, data.userId))

      await writeActivityLog({
        actorUserId: currentUser.id,
        actorRole: currentUser.role,
        action: 'user.delete',
        entityType: 'user',
        entityId: data.userId,
        details: {
          email: targetUser[0]?.email ?? null,
        },
      })

      return { success: true }
    } catch (error) {
      console.error(`Failed to delete user where user ID ${data.userId}`, error)
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })

export const lockUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      userId: z.number(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(currentUser)) {
      throw new Error('Forbidden in demo mode')
    }

    if (currentUser.id === data.userId) throw new Error('Forbidden: Cannot lock yourself')

    await db.update(users).set({ active: false }).where(eq(users.id, data.userId))

    await writeActivityLog({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      action: 'user.lock',
      entityType: 'user',
      entityId: data.userId,
    })

    return { success: true }
  })

export const updateProfileFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      name: z.string().min(1).max(120),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const currentUser = await requireStaffUser()
    const db = await getDb()
    const updated = await db
      .update(users)
      .set({ name: data.name })
      .where(eq(users.id, currentUser.id))
      .returning()

    await writeActivityLog({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      action: 'profile.update',
      entityType: 'user',
      entityId: currentUser.id,
      details: { name: data.name },
    })

    return updated[0]
  })

export const updateUserFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) =>
    z.object({
      userId: z.number(),
      name: z.string().min(1).max(120),
      role: z.enum(['organizer', 'volunteer']),
      active: z.boolean(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(currentUser)) {
      enforceDemoOwnUserScope(currentUser, data.userId)
      throw new Error('Forbidden in demo mode')
    }

    if (currentUser.id === data.userId && data.role !== 'organizer') {
      throw new Error('You cannot remove your own organizer access')
    }

    const updated = await db
      .update(users)
      .set({
        name: data.name,
        role: data.role,
        active: data.active,
      })
      .where(eq(users.id, data.userId))
      .returning()

    await writeActivityLog({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      action: 'user.update',
      entityType: 'user',
      entityId: data.userId,
      details: {
        role: data.role,
        active: data.active,
      },
    })

    return updated[0]
  })

export const getDemoAccountsFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(currentUser)) {
      return [currentUser]
    }

    const demoEmails = getDemoAccountEmails()
    if (demoEmails.length === 0) {
      return []
    }

    return await db.select().from(users).where(inArray(users.email, demoEmails))
  })

export const setDemoAccountsActiveFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => z.object({ active: z.boolean() }).parse(data))
  .handler(async ({ data }) => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(currentUser)) {
      throw new Error('Forbidden in demo mode')
    }

    const demoEmails = getDemoAccountEmails()
    if (demoEmails.length === 0) {
      return { success: true, updatedCount: 0 }
    }

    const updated = await db
      .update(users)
      .set({ active: data.active })
      .where(inArray(users.email, demoEmails))
      .returning()

    await writeActivityLog({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      action: data.active ? 'demo_accounts.enable' : 'demo_accounts.disable',
      entityType: 'user',
      details: {
        emails: demoEmails,
        count: updated.length,
      },
    })

    return {
      success: true,
      updatedCount: updated.length,
      demoAccounts: updated,
    }
  })

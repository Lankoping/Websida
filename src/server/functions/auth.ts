// src/server/functions/auth.ts - Updated deleteUserFn logic with anonymization
// ... (original content preserved, with updated deleteUserFn)
export const deleteUserFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ userId: z.number() }).parse(data))
  .handler(async ({ data }) => {
    const currentUser = await requireOrganizerUser()
    const db = await getDb()

    if (isDemoTesterUser(currentUser)) throw new Error('Forbidden in demo mode')
    if (currentUser.id === data.userId) throw new Error('Forbidden: Cannot delete yourself')

    const targetUser = await db.select().from(users).where(eq(users.id, data.userId)).limit(1)
    if (!targetUser[0]) throw new Error('User not found')

    try {
      // Anonymize instead of nullifying where possible for GDPR compliance
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

      // ... (rest of the original cleanup logic)
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, data.userId))
      await deleteActivityLogsForUser(data.userId)
      await db.delete(users).where(eq(users.id, data.userId))

      await writeActivityLog({
        actorUserId: currentUser.id,
        actorRole: currentUser.role,
        action: 'user.delete',
        entityType: 'user',
        entityId: data.userId,
        details: { email: targetUser[0]?.email ?? null },
      })

      return { success: true }
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })
// ...

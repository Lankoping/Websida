// src/server/functions/tickets.ts - Added cleanupOldTicketsFn
// ... (original content preserved, with new cleanupOldTicketsFn)
export const cleanupOldTicketsFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const admin = await requireStaffUser()
    const db = await getDb()
    
    // Anonymize tickets older than 1 year
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    await db.update(tickets)
      .set({ 
        participantName: 'Anonymized', 
        participantEmail: 'anonymized@example.com' 
      })
      .where(and(eq(tickets.status, 'used'), lt(tickets.createdAt, oneYearAgo)))
      
    await writeActivityLog({
      actorUserId: admin.id,
      actorRole: admin.role,
      action: 'ticket.cleanup.anonymize',
      entityType: 'ticket',
    })
      
    return { success: true }
  })
// ...

// New function to clean up old ticket data
export const cleanupOldTicketsFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const admin = await checkAdmin()
    const db = await getDb()
    
    // Example: Anonymize tickets older than 1 year
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    await db.update(tickets)
      .set({ 
        participantName: 'Anonymized', 
        participantEmail: 'anonymized@example.com' 
      })
      .where(lt(tickets.createdAt, oneYearAgo))
      
    return { success: true }
  })

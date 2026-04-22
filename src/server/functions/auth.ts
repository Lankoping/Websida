// src/server/functions/auth.ts - Updated deleteUserFn logic (partial snippet)
// ...
      // Tickets issued or scanned by this user
      await db.update(tickets).set({ issuedBy: null }).where(eq(tickets.issuedBy, data.userId))
      await db.update(tickets).set({ scannedBy: null }).where(eq(tickets.scannedBy, data.userId))

      // Anonymize participant data for tickets associated with this user if necessary
      // (This is a placeholder for the logic to anonymize participant data)
// ...

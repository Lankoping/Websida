// Added debug log to loader
export const Route = createFileRoute('/admin/tickets/')({
  loader: async () => {
    console.log('Loading tickets overview...')
    const [tickets, events] = await Promise.all([getTicketsFn(), getEventsForTicketsFn()])
    console.log('Tickets loaded:', tickets)
    return { tickets, events }
  },
  component: TicketsAdmin,
})
// ... (rest of the file)

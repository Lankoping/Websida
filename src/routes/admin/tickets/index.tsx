// ... (rest of the file content)
  const { tickets, events } = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<(typeof tickets)[0] | null>(null)
  // ... (rest of the component)

  const filteredTickets = (tickets || []).filter((ticket) => {
    const searchLower = searchQuery.toLowerCase()
    const eventTitle = getEventTitle(ticket.eventId).toLowerCase()
    return (
      ticket.participantName.toLowerCase().includes(searchLower) ||
      ticket.participantEmail.toLowerCase().includes(searchLower) ||
      ticket.ticketCode.toLowerCase().includes(searchLower) ||
      eventTitle.includes(searchLower)
    )
  })
// ... (rest of the file content)

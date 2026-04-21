import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getEventsFn, getEventTicketsFn, getTicketTypesFn, createTicketTypeFn, updateTicketTypeFn, deleteTicketTypeFn, issueTicketFn, getScannerEventsFn } from '@/server/functions/tickets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Ticket, Users, QrCode, Search, Trash2, Edit, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'

export const Route = createFileRoute('/admin/tickets/')({
  component: AdminTicketsPage,
})

function AdminTicketsPage() {
  const [activeTab, setActiveTab] = useState('events')
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  
  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biljetthantering</h1>
          <p className="text-muted-foreground mt-1">Hantera event, biljettyper och utfärdade biljetter</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/verify/scan', '_blank')}>
            <QrCode className="mr-2 h-4 w-4" />
            Öppna Scanner
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="events">Event & Typer</TabsTrigger>
          <TabsTrigger value="tickets">Utfärdade Biljetter</TabsTrigger>
          <TabsTrigger value="issue">Utfärda Manuell</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <EventsList 
                selectedEventId={selectedEventId} 
                onSelectEvent={setSelectedEventId} 
              />
            </div>
            <div className="md:col-span-2">
              {selectedEventId ? (
                <TicketTypesList eventId={selectedEventId} />
              ) : (
                <Card className="h-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Ticket className="h-12 w-12 mb-4 opacity-20" />
                  <p>Välj ett event i listan för att hantera dess biljettyper</p>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <TicketsList eventId={selectedEventId} onSelectEvent={setSelectedEventId} />
        </TabsContent>

        <TabsContent value="issue">
          <IssueTicketForm eventId={selectedEventId} onSelectEvent={setSelectedEventId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EventsList({ selectedEventId, onSelectEvent }: { selectedEventId: string | null, onSelectEvent: (id: string) => void }) {
  const { data: events, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const result = await getScannerEventsFn()
      if (result.error) throw new Error(result.error)
      return result.data
    }
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Event</CardTitle>
        <CardDescription>Välj event för att hantera biljetter</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="divide-y border-t">
          {events?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Inga event hittades
            </div>
          ) : (
            events?.map(event => (
              <button
                key={event.id}
                onClick={() => onSelectEvent(event.id)}
                className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between ${
                  selectedEventId === event.id ? 'bg-muted border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div>
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {format(new Date(event.date), 'd MMM yyyy', { locale: sv })}
                  </div>
                </div>
                <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                  {event.status === 'published' ? 'Aktiv' : 'Utkast'}
                </Badge>
              </button>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function TicketTypesList({ eventId }: { eventId: string }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingType, setEditingType] = useState<any>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('0')
  const [capacity, setCapacity] = useState('')
  
  const { data: ticketTypes, isLoading } = useQuery({
    queryKey: ['ticket-types', eventId],
    queryFn: async () => {
      const result = await getTicketTypesFn({ data: { eventId } })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!eventId
  })

  const createMutation = useMutation({
    mutationFn: async () => {
      const result = await createTicketTypeFn({
        data: {
          eventId,
          name,
          description: description || undefined,
          price: parseInt(price) || 0,
          capacity: capacity ? parseInt(capacity) : undefined
        }
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types', eventId] })
      setIsCreateOpen(false)
      resetForm()
      toast({ title: 'Biljettyp skapad', description: 'Den nya biljettypen har lagts till.' })
    },
    onError: (error: Error) => {
      toast({ title: 'Ett fel uppstod', description: error.message, variant: 'destructive' })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      const result = await updateTicketTypeFn({
        data: {
          id: editingType.id,
          name,
          description: description || undefined,
          price: parseInt(price) || 0,
          capacity: capacity ? parseInt(capacity) : undefined,
          isActive: editingType.isActive
        }
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types', eventId] })
      setIsEditOpen(false)
      resetForm()
      toast({ title: 'Biljettyp uppdaterad', description: 'Ändringarna har sparats.' })
    },
    onError: (error: Error) => {
      toast({ title: 'Ett fel uppstod', description: error.message, variant: 'destructive' })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteTicketTypeFn({ data: { id } })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types', eventId] })
      toast({ title: 'Biljettyp borttagen' })
    },
    onError: (error: Error) => {
      toast({ title: 'Kunde inte ta bort', description: error.message, variant: 'destructive' })
    }
  })

  const resetForm = () => {
    setName('')
    setDescription('')
    setPrice('0')
    setCapacity('')
    setEditingType(null)
  }

  const openEdit = (type: any) => {
    setEditingType(type)
    setName(type.name)
    setDescription(type.description || '')
    setPrice(type.price.toString())
    setCapacity(type.capacity?.toString() || '')
    setIsEditOpen(true)
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Biljettyper</CardTitle>
          <CardDescription>Hantera tillgängliga biljettyper för detta event</CardDescription>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Ny biljettyp
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Skapa ny biljettyp</DialogTitle>
              <DialogDescription>
                Lägg till en ny biljettyp som användare kan boka eller köpa.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Namn *</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="t.ex. Standardbiljett, VIP" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Beskrivning</Label>
                <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Kort beskrivning av vad som ingår" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Pris (SEK) *</Label>
                  <Input id="price" type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Kapacitet (frivilligt)</Label>
                  <Input id="capacity" type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="Obegränsad" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Avbryt</Button>
              <Button onClick={() => createMutation.mutate()} disabled={!name || createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Skapa biljettyp
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-1">
        {ticketTypes?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-slate-50/50">
            <Ticket className="h-10 w-10 mx-auto mb-3 text-slate-300" />
            <p>Inga biljettyper har skapats för detta event ännu.</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)} className="mt-2">
              Skapa den första biljettypen
            </Button>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Pris</TableHead>
                  <TableHead>Kapacitet</TableHead>
                  <TableHead className="text-right">Åtgärder</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketTypes?.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      <div className="font-medium">{type.name}</div>
                      {type.description && <div className="text-xs text-muted-foreground">{type.description}</div>}
                    </TableCell>
                    <TableCell>{type.price === 0 ? 'Gratis' : `${type.price} kr`}</TableCell>
                    <TableCell>
                      {type.capacity ? (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{type.capacity}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Obegränsad</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(type)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (confirm('Är du säker på att du vill ta bort denna biljettyp? Redan utfärdade biljetter påverkas inte.')) {
                              deleteMutation.mutate(type.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => {
        setIsEditOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redigera biljettyp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Namn *</Label>
              <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Beskrivning</Label>
              <Input id="edit-description" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Pris (SEK) *</Label>
                <Input id="edit-price" type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Kapacitet (frivilligt)</Label>
                <Input id="edit-capacity" type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="Obegränsad" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Avbryt</Button>
            <Button onClick={() => updateMutation.mutate()} disabled={!name || updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Spara ändringar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

function TicketsList({ eventId, onSelectEvent }: { eventId: string | null, onSelectEvent: (id: string) => void }) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: events } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const result = await getScannerEventsFn()
      if (result.error) throw new Error(result.error)
      return result.data
    }
  })

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['event-tickets', eventId],
    queryFn: async () => {
      if (!eventId) return []
      const result = await getEventTicketsFn({ data: { eventId } })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!eventId
  })

  const filteredTickets = tickets?.filter(ticket => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      ticket.code.toLowerCase().includes(term) ||
      ticket.user?.name?.toLowerCase().includes(term) ||
      ticket.user?.email?.toLowerCase().includes(term) ||
      ticket.ticketType.name.toLowerCase().includes(term)
    )
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utfärdade Biljetter</CardTitle>
        <CardDescription>Se alla biljetter som utfärdats för ett event</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="w-full sm:w-1/3">
            <Label htmlFor="event-select" className="mb-2 block">Välj event</Label>
            <Select value={eventId || ''} onValueChange={onSelectEvent}>
              <SelectTrigger id="event-select">
                <SelectValue placeholder="Välj ett event..." />
              </SelectTrigger>
              <SelectContent>
                {events?.map(event => (
                  <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-2/3">
            <Label htmlFor="search-tickets" className="mb-2 block">Sök biljetter</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-tickets"
                placeholder="Sök på namn, e-post, biljettkod..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!eventId}
              />
            </div>
          </div>
        </div>

        {!eventId ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-slate-50/50">
            <p>Välj ett event ovan för att se dess biljetter.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTickets?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-slate-50/50">
            {searchTerm ? 'Inga biljetter matchade din sökning.' : 'Inga biljetter har utfärdats för detta event ännu.'}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Kod</TableHead>
                  <TableHead>Användare</TableHead>
                  <TableHead>Biljettyp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Utfärdad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets?.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-xs">{ticket.code}</TableCell>
                    <TableCell>
                      {ticket.user ? (
                        <div>
                          <div className="font-medium">{ticket.user.name}</div>
                          <div className="text-xs text-muted-foreground">{ticket.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Gästanvändare</span>
                      )}
                    </TableCell>
                    <TableCell>{ticket.ticketType.name}</TableCell>
                    <TableCell>
                      {ticket.status === 'valid' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Giltig
                        </Badge>
                      ) : ticket.status === 'used' ? (
                        <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                          <Clock className="mr-1 h-3 w-3" /> Använd
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <XCircle className="mr-1 h-3 w-3" /> Makulerad
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(ticket.createdAt), 'd MMM yyyy, HH:mm', { locale: sv })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function IssueTicketForm({ eventId, onSelectEvent }: { eventId: string | null, onSelectEvent: (id: string) => void }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [selectedTypeId, setSelectedTypeId] = useState<string>('')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [notes, setNotes] = useState('')

  const { data: events } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const result = await getScannerEventsFn()
      if (result.error) throw new Error(result.error)
      return result.data
    }
  })

  const { data: ticketTypes } = useQuery({
    queryKey: ['ticket-types', eventId],
    queryFn: async () => {
      if (!eventId) return []
      const result = await getTicketTypesFn({ data: { eventId } })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!eventId
  })

  const issueMutation = useMutation({
    mutationFn: async () => {
      const result = await issueTicketFn({
        data: {
          eventId: eventId!,
          ticketTypeId: selectedTypeId,
          userEmail: userEmail || undefined,
          userName: userName || undefined,
          notes: notes || undefined
        }
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['event-tickets', eventId] })
      toast({ 
        title: 'Biljett utfärdad!', 
        description: `Biljettkod: ${data.code}`,
      })
      setUserEmail('')
      setUserName('')
      setNotes('')
    },
    onError: (error: Error) => {
      toast({ title: 'Ett fel uppstod', description: error.message, variant: 'destructive' })
    }
  })

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Utfärda biljett manuellt</CardTitle>
        <CardDescription>
          Skapa en biljett direkt i systemet. Användbart för VIP, gäster eller manuell försäljning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue-event">Event *</Label>
            <Select value={eventId || ''} onValueChange={(val) => {
              onSelectEvent(val)
              setSelectedTypeId('')
            }}>
              <SelectTrigger id="issue-event">
                <SelectValue placeholder="Välj ett event..." />
              </SelectTrigger>
              <SelectContent>
                {events?.map(event => (
                  <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue-type">Biljettyp *</Label>
            <Select value={selectedTypeId} onValueChange={setSelectedTypeId} disabled={!eventId || !ticketTypes?.length}>
              <SelectTrigger id="issue-type">
                <SelectValue placeholder={!eventId ? "Välj event först" : ticketTypes?.length ? "Välj biljettyp..." : "Inga biljettyper finns"} />
              </SelectTrigger>
              <SelectContent>
                {ticketTypes?.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} ({type.price === 0 ? 'Gratis' : `${type.price} kr`})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="issue-name">Mottagarens namn</Label>
              <Input 
                id="issue-name" 
                value={userName} 
                onChange={e => setUserName(e.target.value)} 
                placeholder="Frivilligt" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-email">Mottagarens e-post</Label>
              <Input 
                id="issue-email" 
                type="email" 
                value={userEmail} 
                onChange={e => setUserEmail(e.target.value)} 
                placeholder="Frivilligt (för att koppla till konto)" 
              />
              <p className="text-xs text-muted-foreground">
                Om e-posten matchar ett befintligt konto kopplas biljetten dit.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue-notes">Interna anteckningar</Label>
            <Input 
              id="issue-notes" 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="T.ex. VIP-gäst, Betald via Swish, etc." 
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-6">
        <Button variant="outline" onClick={() => {
          setSelectedTypeId('')
          setUserEmail('')
          setUserName('')
          setNotes('')
        }}>
          Rensa formulär
        </Button>
        <Button 
          onClick={() => issueMutation.mutate()} 
          disabled={!eventId || !selectedTypeId || issueMutation.isPending}
        >
          {issueMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Utfärda biljett
        </Button>
      </CardFooter>
    </Card>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useMutation, useQuery } from '@tanstack/react-query'
import { verifyTicketByCodeFn, getEventsForTicketsFn } from '@/server/functions/tickets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle, Camera, QrCode, RefreshCcw, LogOut, Ticket, Calendar, User, Clock } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const Route = createFileRoute('/verify/$code')({
  component: VerifyTicketPage,
})

function VerifyTicketPage() {
  const { code } = Route.useParams()
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const { user, logout } = useAuth()

  // Fetch events for the scanner to select from
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['scanner-events'],
    queryFn: async () => {
      const result = await getEventsForTicketsFn()
      return result
    },
    enabled: !!user,
  })

  // Automatically select the first active event if none is selected
  useEffect(() => {
    if (events && events.length > 0 && selectedEventId === 'all') {
      const activeEvent = events.find(e => e.published === true)
      if (activeEvent) {
        setSelectedEventId(activeEvent.id.toString())
      } else {
        setSelectedEventId(events[0].id.toString())
      }
    }
  }, [events, selectedEventId])

  // Fetch ticket details if we have a code
  const { data: ticketDetails, isLoading: isLoadingTicket, refetch: refetchTicket } = useQuery({
    queryKey: ['ticket', code],
    queryFn: async () => {
      if (!code || code === 'scan') return null
      const result = await verifyTicketByCodeFn({ data: { code, markAsUsed: false } })
      if (!result.success) throw new Error(result.message)
      return result
    },
    enabled: !!code && code !== 'scan' && !!user,
    retry: false,
  })

  // Verify ticket mutation
  const verifyMutation = useMutation({
    mutationFn: async (ticketCode: string) => {
      const result = await verifyTicketByCodeFn({ 
        data: { 
          code: ticketCode,
          markAsUsed: true
        } 
      })
      if (!result.success) throw new Error(result.message)
      return result
    },
    onSuccess: () => {
      setScanResult('success')
      refetchTicket()
    },
    onError: (error: Error) => {
      setScanResult('error')
      setErrorMessage(error.message || 'Kunde inte verifiera biljetten')
    },
  })

  // Initialize scanner
  useEffect(() => {
    if (code === 'scan' && isScanning && user) {
      const scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )

      scanner.render(
        (decodedText) => {
          // Extract code from URL if it's a full URL
          let ticketCode = decodedText
          try {
            const url = new URL(decodedText)
            const pathParts = url.pathname.split('/')
            ticketCode = pathParts[pathParts.length - 1]
          } catch (e) {
            // Not a URL, use as is
          }

          scanner.clear()
          setIsScanning(false)
          
          // Navigate to the verification page for this code
          window.location.href = `/verify/${ticketCode}`
        },
        (error) => {
          // Ignore scanning errors (happens constantly while looking for QR)
        }
      )

      return () => {
        scanner.clear().catch(console.error)
      }
    }
  }, [code, isScanning, user])

  // Auto-verify when landing on a specific code page
  useEffect(() => {
    if (code && code !== 'scan' && ticketDetails && ticketDetails.ticket?.status === 'valid' && !verifyMutation.isPending && !scanResult) {
      verifyMutation.mutate(code)
    }
  }, [code, ticketDetails, verifyMutation, scanResult])

  // Require login
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Logga in krävs</CardTitle>
            <CardDescription>
              Du måste vara inloggad för att scanna biljetter.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => window.location.href = '/login?redirect=/verify/scan'}>
              Gå till inloggning
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Scanning mode
  if (code === 'scan') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            Scanna Biljett
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 hidden sm:inline-block">Inloggad som {user.name}</span>
            <Button variant="ghost" size="icon" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="w-full max-w-md mx-auto flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Biljettscanner</CardTitle>
            <CardDescription>
              Rikta kameran mot biljettens QR-kod
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 block">Välj event att scanna för:</label>
              {isLoadingEvents ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Laddar event...
                </div>
              ) : (
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Välj event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alla event (Automatisk matchning)</SelectItem>
                    {events?.map(event => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.title} {!event.published ? '(Inaktivt)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {isScanning ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div id="reader" className="w-full max-w-sm rounded-lg overflow-hidden border-2 border-primary/20"></div>
                <Button 
                  variant="outline" 
                  className="mt-6 w-full"
                  onClick={() => setIsScanning(false)}
                >
                  Avbryt scanning
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="h-48 w-48 bg-slate-100 rounded-xl flex items-center justify-center mb-6 border-2 border-dashed border-slate-300">
                  <Camera className="h-16 w-16 text-slate-400" />
                </div>
                <Button 
                  size="lg" 
                  className="w-full text-lg h-14"
                  onClick={() => setIsScanning(true)}
                >
                  <Camera className="mr-2 h-5 w-5" /> Starta Kameran
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Verification result mode
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4">
      <div className="flex justify-between items-center mb-6 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="h-6 w-6 text-primary" />
          Verifiering
        </h1>
        <Button variant="outline" size="sm" onClick={() => window.location.href = '/verify/scan'}>
          <Camera className="mr-2 h-4 w-4" /> Ny scan
        </Button>
      </div>

      <div className="w-full max-w-md mx-auto space-y-4">
        {isLoadingTicket || verifyMutation.isPending ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium text-slate-600">
                {verifyMutation.isPending ? 'Verifierar biljett...' : 'Hämtar biljettinformation...'}
              </p>
            </CardContent>
          </Card>
        ) : scanResult === 'success' ? (
          <Card className="border-green-500 shadow-lg shadow-green-100">
            <div className="bg-green-500 text-white p-6 text-center rounded-t-lg">
              <CheckCircle2 className="h-20 w-20 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Godkänd!</h2>
              <p className="text-green-100 text-lg">Biljetten är giltig och har nu markerats som använd.</p>
            </div>
            <CardContent className="pt-6">
              {ticketDetails && ticketDetails.ticket && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Biljettinformation</h3>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
                      <div className="flex items-start gap-3">
                        <Ticket className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-900">{ticketDetails.ticket.ticketType}</p>
                          <p className="text-sm text-slate-500">Kod: {ticketDetails.ticket.ticketCode}</p>
                        </div>
                      </div>
                      
                      {ticketDetails.event && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-slate-900">{ticketDetails.event.title}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(ticketDetails.event.date).toLocaleDateString('sv-SE', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-900">{ticketDetails.ticket.participantName}</p>
                          <p className="text-sm text-slate-500">{ticketDetails.ticket.participantEmail}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <Button 
                className="w-full mt-8 h-14 text-lg" 
                size="lg"
                onClick={() => window.location.href = '/verify/scan'}
              >
                <Camera className="mr-2 h-5 w-5" /> Scanna nästa biljett
              </Button>
            </CardContent>
          </Card>
        ) : scanResult === 'error' || (ticketDetails && ticketDetails.ticket?.status !== 'valid') ? (
          <Card className="border-red-500 shadow-lg shadow-red-100">
            <div className="bg-red-500 text-white p-6 text-center rounded-t-lg">
              <XCircle className="h-20 w-20 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Nekad</h2>
              <p className="text-red-100 text-lg">
                {errorMessage || (ticketDetails?.ticket?.status === 'used' ? 'Biljetten är redan använd' : 'Ogiltig biljett')}
              </p>
            </div>
            <CardContent className="pt-6">
              {ticketDetails && ticketDetails.ticket && (
                <div className="space-y-6">
                  <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                    <AlertTitle className="font-bold flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Status: {ticketDetails.ticket.status === 'used' ? 'Redan använd' : 'Makulerad'}
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      {ticketDetails.ticket.status === 'used' && ticketDetails.ticket.scannedAt && (
                        <span>
                          Denna biljett scannades <strong>{new Date(ticketDetails.ticket.scannedAt).toLocaleString('sv-SE')}</strong>.
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Biljettinformation</h3>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100">
                      <div className="flex items-start gap-3">
                        <Ticket className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-900">{ticketDetails.ticket.ticketType}</p>
                          <p className="text-sm text-slate-500">Kod: {ticketDetails.ticket.ticketCode}</p>
                        </div>
                      </div>
                      
                      {ticketDetails.event && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-slate-900">{ticketDetails.event.title}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-slate-900">{ticketDetails.ticket.participantName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 mt-8">
                <Button 
                  className="flex-1 h-12" 
                  variant="outline"
                  onClick={() => window.location.href = '/verify/scan'}
                >
                  <Camera className="mr-2 h-4 w-4" /> Ny scan
                </Button>
                {ticketDetails && ticketDetails.ticket?.status === 'valid' && (
                  <Button 
                    className="flex-1 h-12" 
                    onClick={() => verifyMutation.mutate(code)}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" /> Försök igen
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <XCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Biljetten hittades inte</h2>
              <p className="text-slate-500 text-center mb-6">
                Koden "{code}" matchar ingen biljett i systemet.
              </p>
              <Button onClick={() => window.location.href = '/verify/scan'}>
                <Camera className="mr-2 h-4 w-4" /> Tillbaka till scanner
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

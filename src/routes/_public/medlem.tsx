import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { 
  registerMemberProfileFn, 
  processMembershipPaymentFn, 
  getMemberSessionFn, 
  loginMemberFn, 
  logoutMemberFn,
  getMemberTicketsFn,
  loginWithTicketFn
} from '@/server/functions/buyerProfiles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle2, 
  Loader2, 
  CreditCard, 
  UserPlus, 
  ArrowRight, 
  LogIn, 
  LogOut, 
  Ticket, 
  Star, 
  Calendar,
  ShieldCheck,
  Gift,
  QrCode
} from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_public/medlem')({
  component: MembershipPage,
})

function MembershipPage() {
  const router = useRouter()
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'payment' | 'dashboard' | 'guest'>('landing')
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  })

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  const [guestData, setGuestData] = useState({
    email: '',
    ticketCode: '',
  })

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const session = await getMemberSessionFn()
      if (session) {
        setMember(session)
        const tix = await getMemberTicketsFn()
        setTickets(tix)
        setView('dashboard')
      }
    } catch (err) {
      console.error('Session check failed', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await registerMemberProfileFn({ data: formData })
      if (result.success) {
        setMember(result.profile)
        setView('payment')
        toast.success('Konto skapat!')
      } else {
        toast.error(result.error || 'Något gick fel')
      }
    } catch (err: any) {
      toast.error(err.message || 'Ett fel uppstod')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await loginMemberFn({ data: loginData })
      if (result.success) {
        setMember(result.profile)
        const tix = await getMemberTicketsFn()
        setTickets(tix)
        setView('dashboard')
        toast.success('Välkommen tillbaka!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Inloggningen misslyckades')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await loginWithTicketFn({ data: guestData })
      if (result.success) {
        setMember(result.profile)
        const tix = await getMemberTicketsFn()
        setTickets(tix)
        setView('dashboard')
        toast.success('Inloggad med biljett!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Kunde inte hitta biljett')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logoutMemberFn()
    setMember(null)
    setTickets([])
    setView('landing')
    toast.success('Utloggad')
  }

  const handlePayment = async () => {
    if (!member) return
    setLoading(true)
    try {
      const result = await processMembershipPaymentFn({ data: { profileId: member.id } })
      if (result.success) {
        const updated = await getMemberSessionFn()
        setMember(updated)
        setView('dashboard')
        toast.success('Medlemskap aktiverat!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Betalningen misslyckades')
    } finally {
      setLoading(false)
    }
  }

  if (loading && view === 'landing') {
    return (
      <div className="min-h-screen flex items-center justify-center text-primary italic uppercase font-black">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Laddar Hubben...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* LANDING VIEW */}
        {view === 'landing' && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-2">Medlemshub</h1>
              <p className="text-xl text-muted-foreground italic max-w-2xl mx-auto">
                Hantera dina biljetter, se dina förmåner och stötta föreningen. Allt på ett ställe.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 text-left mt-12">
              <BenefitCard 
                icon={<Ticket className="w-6 h-6 text-primary" />}
                title="Dina Biljetter"
                description="Se och hantera dina bokningar även om du inte är medlem."
              />
              <BenefitCard 
                icon={<Star className="w-6 h-6 text-primary" />}
                title="Exklusiva förmåner"
                description="Rabatter hos partners och unika badges på event för medlemmar."
              />
              <BenefitCard 
                icon={<ShieldCheck className="w-6 h-6 text-primary" />}
                title="Stötta föreningen"
                description="Hjälp oss arrangera fler och bättre LAN-event i Östergötland."
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
              <Button size="lg" className="font-bold uppercase italic px-8 py-6 text-lg shadow-xl shadow-primary/20" onClick={() => setView('register')}>
                Skapa Konto
              </Button>
              <Button size="lg" variant="outline" className="font-bold uppercase italic px-8 py-6 text-lg border-2" onClick={() => setView('login')}>
                <LogIn className="w-5 h-5 mr-2" />
                Logga in
              </Button>
            </div>

            <div className="mt-4 flex flex-col items-center gap-2">
              <Button variant="link" className="text-primary font-bold italic underline" onClick={() => setView('login')}>
                Jag är redan medlem, ta mig till login-sidan!
              </Button>
              <Button variant="link" className="text-muted-foreground italic text-xs" onClick={() => setView('guest')}>
                Har du redan en biljett? Hitta den här
              </Button>
            </div>
          </div>
        )}

        {/* GUEST VIEW */}
        {view === 'guest' && (
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  Hitta mina biljetter
                </CardTitle>
                <CardDescription>Ange din e-post och en biljettkod för att komma in i hubben.</CardDescription>
              </CardHeader>
              <form onSubmit={handleGuestLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-email">E-post</Label>
                    <Input 
                      id="guest-email" 
                      type="email" 
                      required 
                      value={guestData.email}
                      onChange={e => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="E-post använd vid köp"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guest-ticket">Biljettkod</Label>
                    <Input 
                      id="guest-ticket" 
                      required 
                      value={guestData.ticketCode}
                      onChange={e => setGuestData(prev => ({ ...prev, ticketCode: e.target.value }))}
                      placeholder="T.ex. ABCD-1234"
                      className="bg-background"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full font-bold uppercase italic" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Visa biljetter'}
                  </Button>
                  <Button variant="link" className="text-xs" onClick={() => setView('landing')}>
                    Tillbaka till start
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-primary" />
                  Logga in
                </CardTitle>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-post</Label>
                    <Input 
                      id="login-email" 
                      type="email" 
                      required 
                      value={loginData.email}
                      onChange={e => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Lösenord</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      required 
                      value={loginData.password}
                      onChange={e => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-background"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full font-bold uppercase italic" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Logga in'}
                  </Button>
                  <Button variant="link" className="text-xs" onClick={() => setView('register')}>
                    Inget konto? Registrera dig här
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" />
                  Skapa konto
                </CardTitle>
                <CardDescription>Bli en del av Lankoping.se Communityn.</CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Namn *</Label>
                    <Input 
                      id="name" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="För- och efternamn"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-post *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      required 
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="din@epost.se"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Välj lösenord *</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      minLength={6}
                      value={formData.password}
                      onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Minst 6 tecken"
                      className="bg-background"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full font-bold uppercase italic" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Skapa konto'}
                  </Button>
                  <Button variant="link" className="text-xs" onClick={() => setView('login')}>
                    Har du redan ett konto? Logga in
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        )}

        {/* PAYMENT VIEW */}
        {view === 'payment' && (
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Aktivera Medlemskap
                </CardTitle>
                <CardDescription>Stötta föreningen för 100 kr per år.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-primary/5 rounded border border-primary/10 text-center">
                  <p className="text-sm font-medium mb-1 italic">Välkommen {member?.name}!</p>
                  <p className="text-2xl font-black italic">100 kr / år</p>
                </div>
                
                <div className="text-center p-4 border-2 border-dashed border-border rounded-lg bg-background/50">
                  <p className="text-sm text-muted-foreground mb-4 italic">Kortbetalning via Stripe kommer här.</p>
                  <div className="flex justify-center gap-4 opacity-30">
                    <div className="w-10 h-6 bg-foreground/20 rounded"></div>
                    <div className="w-10 h-6 bg-foreground/20 rounded"></div>
                    <div className="w-10 h-6 bg-foreground/20 rounded"></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button onClick={handlePayment} className="w-full font-bold uppercase italic" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Betala & Aktivera (MOCK)'}
                </Button>
                <Button variant="ghost" className="w-full text-xs italic" onClick={() => setView('dashboard')}>
                  Fortsätt utan medlemskap just nu
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && member && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">Medlemshub</h1>
                <p className="text-muted-foreground italic">Inloggad som {member.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 text-[10px] font-bold uppercase italic border ${
                  member.membershipStatus === 'active' 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                }`}>
                  {member.membershipStatus === 'active' ? 'Aktiv Medlem' : 'Gäst / Icke-medlem'}
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logga ut
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column: Profile & Status */}
              <div className="md:col-span-1 space-y-6">
                <Card className="bg-card/50 border-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg uppercase italic font-black tracking-tight">Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">E-post</Label>
                      <p className="text-sm font-medium">{member.email}</p>
                    </div>
                    {member.membershipExpiresAt && (
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-widest">Giltigt till</Label>
                        <p className="text-sm font-medium">
                          {new Date(member.membershipExpiresAt).toLocaleDateString('sv-SE')}
                        </p>
                      </div>
                    )}
                    {member.membershipStatus !== 'active' && (
                      <Button className="w-full mt-4 font-bold italic uppercase shadow-lg shadow-primary/10" onClick={() => setView('payment')}>
                        Bli Medlem (100kr)
                      </Button>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg uppercase italic font-black tracking-tight text-primary">Förmåner</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <BenefitItem icon={<Gift className="w-4 h-4" />} text="10% rabatt i kiosken" active={member.membershipStatus === 'active'} />
                    <BenefitItem icon={<Calendar className="w-4 h-4" />} text="Förtur på LAN-bokningar" active={member.membershipStatus === 'active'} />
                    <BenefitItem icon={<Star className="w-4 h-4" />} text="Unik Discord-roll" active={member.membershipStatus === 'active'} />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Main Content (Tickets/Events) */}
              <div className="md:col-span-2 space-y-6">
                <Card className="bg-card/50 border-primary/5">
                  <CardHeader>
                    <CardTitle className="text-xl uppercase italic font-black tracking-tight">Mina Biljetter</CardTitle>
                    <CardDescription className="italic font-medium">Här finns dina bokade platser och inträdeskoder.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {tickets.length > 0 ? (
                      <div className="space-y-4">
                        {tickets.map((ticket) => (
                          <div key={ticket.id} className="p-4 border border-border bg-background/50 rounded-lg hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-lg uppercase italic tracking-tight">{ticket.eventTitle}</h4>
                                <span className={`text-[10px] px-2 py-0.5 border font-bold uppercase italic ${
                                  ticket.status === 'valid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-muted/10 text-muted-foreground border-muted/20'
                                }`}>
                                  {ticket.status === 'valid' ? 'Giltig' : ticket.status}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground italic font-medium">
                                {new Date(ticket.eventDate).toLocaleDateString('sv-SE')} · {ticket.eventLocation}
                              </p>
                              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded font-mono text-xs text-primary font-bold">
                                <QrCode className="w-3 h-3" />
                                {ticket.ticketCode}
                              </div>
                            </div>
                            <Button size="sm" variant="secondary" className="font-bold italic uppercase border">
                              Visa QR-Kod
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4 opacity-50">
                          <Ticket className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground italic font-medium">Du har inga aktiva biljetter kopplade till {member.email}.</p>
                        <p className="text-[10px] text-muted-foreground uppercase mt-2">Köp en biljett för att se den här</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border-primary/5">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl uppercase italic font-black tracking-tight">Nästa Event</CardTitle>
                      <CardDescription className="italic font-medium text-primary">Medlemmar har förtur på bokningar.</CardDescription>
                    </div>
                    <Calendar className="w-8 h-8 text-primary opacity-20" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-border bg-background/50 rounded-lg hover:border-primary/50 transition-all group">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-black italic border border-primary/20 group-hover:bg-primary group-hover:text-white transition-colors">
                            LAN
                          </div>
                          <div>
                            <h4 className="font-bold uppercase italic tracking-tight">Lankoping Summer 2026</h4>
                            <p className="text-xs text-muted-foreground italic font-medium">15-17 Juni · Linköping Arena</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="font-bold italic uppercase border-2 group-hover:bg-primary group-hover:text-white transition-all">
                          Boka Plats
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-all group cursor-default">
      <CardHeader>
        <div className="mb-4 group-hover:scale-110 transition-transform">{icon}</div>
        <CardTitle className="text-lg font-black uppercase italic tracking-tight">{title}</CardTitle>
        <CardDescription className="italic font-medium">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function BenefitItem({ icon, text, active }: { icon: React.ReactNode, text: string, active: boolean }) {
  return (
    <div className={`flex items-center gap-3 text-sm ${active ? 'text-foreground font-medium' : 'text-muted-foreground opacity-50 line-through'}`}>
      <span className={active ? 'text-primary' : ''}>{icon}</span>
      <span className="italic">{text}</span>
    </div>
  )
}

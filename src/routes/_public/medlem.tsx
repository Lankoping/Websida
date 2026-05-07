import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { registerMemberProfileFn, processMembershipPaymentFn } from '@/server/functions/buyerProfiles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Loader2, CreditCard, UserPlus, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export const Route = createFileRoute('/_public/medlem')({
  component: MembershipPage,
})

function MembershipPage() {
  const [step, setStep] = useState<'register' | 'payment' | 'success'>('register')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await registerMemberProfileFn({ data: formData })
      if (result.success) {
        setProfile(result.profile)
        setStep('payment')
        toast.success('Profil skapad!')
      } else {
        toast.error(result.error || 'Något gick fel')
      }
    } catch (err: any) {
      toast.error(err.message || 'Ett fel uppstod')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!profile) return
    setLoading(true)
    try {
      const result = await processMembershipPaymentFn({ data: { profileId: profile.id } })
      if (result.success) {
        setStep('success')
        toast.success('Betalning genomförd!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Betalningen misslyckades')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Bli Medlem</h1>
          <p className="text-muted-foreground italic">Stötta Lankoping.se och få tillgång till exklusiva förmåner.</p>
        </div>

        {step === 'register' && (
          <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Registrera profil
              </CardTitle>
              <CardDescription>Fyll i dina uppgifter för att skapa ditt medlemskap.</CardDescription>
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
                    placeholder="Ditt för- och efternamn"
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
                    placeholder="namn@exempel.se"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="070-123 45 67"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adress</Label>
                  <Input 
                    id="address" 
                    value={formData.address}
                    onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Gatunamn 12, 123 45 Stad"
                    className="bg-background"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full font-bold uppercase italic" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
                  Fortsätt till betalning
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {step === 'payment' && (
          <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Medlemsavgift
              </CardTitle>
              <CardDescription>Ditt medlemskap kostar 100 kr per år.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-primary/5 rounded border border-primary/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Medlemskap (1 år)</span>
                  <span className="font-bold">100 kr</span>
                </div>
                <p className="text-xs text-muted-foreground italic">Gäller för {profile?.name}</p>
              </div>
              
              <div className="text-center p-4 border-2 border-dashed border-border rounded-lg bg-background/50">
                <p className="text-sm text-muted-foreground mb-4 italic">Här kommer Stripe-integrationen sitta.</p>
                <div className="flex justify-center gap-4 opacity-30">
                  <div className="w-10 h-6 bg-foreground/20 rounded"></div>
                  <div className="w-10 h-6 bg-foreground/20 rounded"></div>
                  <div className="w-10 h-6 bg-foreground/20 rounded"></div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handlePayment} className="w-full font-bold uppercase italic" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                Betala 100 kr (Simulering)
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 'success' && (
          <Card className="border-2 border-green-500/20 bg-card/50 backdrop-blur-sm text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-black uppercase italic tracking-tight">Välkommen till Communityn!</CardTitle>
              <CardDescription>
                Ditt medlemskap är nu aktivt. Tack för att du stöttar Lankoping.se!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                Ett kvitto har skickats till {profile?.email}.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full font-bold uppercase italic">
                <a href="/">Tillbaka till start</a>
              </Button>
            </CardFooter>
          </Card>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground italic">
            Genom att bli medlem godkänner du våra <a href="/terms" className="underline hover:text-primary">medlemsvillkor</a> och <a href="/datapolicy" className="underline hover:text-primary">datapolicy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

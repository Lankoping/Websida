import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ShieldCheck, Info, Clock } from 'lucide-react'
import { getPageBySlugFn } from '../../server/functions/cms'

export const Route = createFileRoute('/_public/privacy')({
  loader: async () => {
    try {
      const privacyPage = await getPageBySlugFn({ data: 'privacy' })
      return { privacyPage }
    } catch (error) {
      console.error('[v0] Error loading privacy page:', error)
      return { privacyPage: null }
    }
  },
  component: PrivacyPage,
})

function PrivacyPage() {
  const { privacyPage } = Route.useLoaderData()

  const collectionItems = [
    { 
      title: 'E-postadress', 
      desc: 'För inloggning och utskick av viktig information.',
      icon: Info,
    },
    { 
      title: 'Manuella uppgifter', 
      desc: 'Vid manuella biljettköp kan vi efterfråga namn och kontaktuppgifter för att verifiera din plats.',
      icon: Info,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            <span>Tillbaka</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="mb-16">
          <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Datapolicy</p>
          <h1 className="font-bold text-3xl md:text-5xl text-foreground mb-4">Integritet</h1>
          <p className="text-lg text-muted-foreground">
            Hur vi hanterar dina personuppgifter för Länköping.se
          </p>
        </div>

        {/* Data Collection Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center bg-secondary">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-bold text-xl text-foreground">Insamling av personuppgifter</h2>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8">
            För att vi ska kunna genomföra ett säkert och välorganiserat event samlar vi in och behandlar följande uppgifter från våra deltagare:
          </p>
          
          <div className="space-y-4">
            {collectionItems.map((item) => (
              <div 
                key={item.id || item.title} 
                className="flex gap-4 p-4 border border-border bg-card hover:border-primary/20 transition-colors"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-secondary">
                  <item.icon className="w-4 h-4 text-primary" />
                </span>
                <div className="pt-1">
                  <p className="text-primary font-medium mb-1">{item.title}</p>
                  <p className="text-foreground/80 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why We Collect Section */}
        <section className="mb-16">
          <h2 className="font-display text-2xl text-foreground mb-6">Varför samlar vi in detta?</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>Uppgifterna används uteslutande för administration av eventet, säkerhetsåtgärder och verifiering av din biljett.</p>
            <p>Eftersom biljettköp hanteras manuellt lagras inga betalningsuppgifter på denna webbplats.</p>
            <p>Vi delar aldrig dina uppgifter med tredje part i vinstdrivande syfte. Information kan dock komma att delas med myndigheter (t.ex. polis eller sjukvård) om en nödsituation uppstår.</p>
          </div>
        </section>

        {/* After Event Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center bg-secondary">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display text-2xl text-foreground">Vad händer efter eventet?</h2>
          </div>
          
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              Om allt är grönt (inga regelbrott) så tas dina personuppgifter bort från våra servrar.
              Det innebär att de lagras <strong className="text-foreground">max 30 dagar</strong> efter avslutat event.
            </p>
            
            <div className="p-6 border border-primary/30 bg-primary/5">
              <h3 className="font-bold text-lg text-primary mb-3">Information som vi inte tar bort</h3>
              <p className="text-foreground/80">
                Vi tar bort all information såsom vi inte behöver behålla den. Exempelvis om du har brutit mot eventets regler så sparar vi den informationen.
                Detta betyder att du kan bli portad från framtida events.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 Länköping.se — Din integritet är viktig för oss.
          </p>
        </footer>
      </main>
    </div>
  )
}

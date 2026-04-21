import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ShieldAlert } from 'lucide-react'

export const Route = createFileRoute('/_public/rules')({
  component: RulesPage,
})

function RulesPage() {
  const rules = [
    { title: "Ingen alkohol eller droger", details: "Det är inte tillåtet att ta med, använda eller sälja droger eller andra berusningsmedel under eventet." },
    { title: "Nolltolerans mot trakasserier", details: "Inget hat, hot, diskriminering, mobbning eller sexuella trakasserier. Respektera allas gränser." },
    { title: "Var schysst och visa hänsyn", details: "Håll en trevlig ton, både på plats och online (till exempel i Discord)." },
    { title: "Följ arrangörernas instruktioner", details: "Om en arrangör säger till, så gäller det direkt." },
    { title: "Ta hand om lokalen", details: "Ingen skadegörelse. Håll rent efter dig och använd soptunnor." },
    { title: "Respektera andras utrustning", details: "Rör inte andras datorer, skärmar eller kablar utan att fråga." },
    { title: "Säkerhet först", details: "Håll gångar och nödutgångar fria. Dra kablar så att ingen snubblar." },
    { title: "Ljudnivå", details: "Använd hörlurar vid spel. Högtalare endast om arrangörerna godkänner det." },
    { title: "Foto och film", details: "Fråga innan du fotar eller filmar någon. Respektera om någon säger nej." },
    { title: "Konsekvenser", details: "Vid regelbrott kan du få varning, bli avstängd från eventet och vid allvarliga incidenter kan polis kontaktas." }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            <span>Tillbaka</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-16">
          <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Riktlinjer</p>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-4">Regler</h1>
          <p className="text-lg text-muted-foreground">
            För allas komfort och säkerhet på Lankoping.se
          </p>
        </div>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center bg-secondary">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display text-2xl text-foreground">Eventregler</h2>
          </div>
          
          <div className="space-y-4">
            {rules.map((rule, i) => (
              <div 
                key={i} 
                className="flex gap-4 p-4 border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                  {i + 1}
                </span>
                <div className="pt-1">
                  <h3 className="font-bold text-foreground mb-1">{rule.title}</h3>
                  <p className="text-foreground/90 leading-relaxed">{rule.details}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 Lankoping.se — See you at the event!
          </p>
        </footer>
      </main>
    </div>
  )
}

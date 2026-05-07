import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export const Route = createFileRoute('/_public/datapolicy/se')({
  component: DataPolicySwedish,
})

function DataPolicySwedish() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors uppercase italic">
            <ArrowLeft size={16} />
            <span>Tillbaka</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {/* Page Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase italic mb-6">
            <ShieldCheck size={14} />
            Juridisk Information
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Datapolicy</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Genom att använda Lankoping.se och våra tjänster accepterar du denna policy och hur vi hanterar din data.
          </p>
        </div>

        <div className="space-y-12">
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">Vad vi loggar</h2>
            <p className="text-foreground/80 leading-relaxed font-medium">
              Vi loggar säkerhets- och administrationshändelser för volontärer och organisatörer, inklusive inloggning,
              ändringar i adminsystemet och utförda åtgärder för att säkerställa systemets integritet.
            </p>
          </section>

          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">Lagringstid (Volontärer & Organisatörer)</h2>
            <p className="text-foreground/80 leading-relaxed font-medium">
              För volontärer och organisatörer i Lankoping.se lagras data tills vidare. Radering sker när du lämnar
              föreningen och en signerad avgång/uppsägningshandling har registrerats.
            </p>
          </section>

          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">Biljettdata och Deltagare</h2>
            <p className="text-foreground/80 leading-relaxed font-medium">
              Personuppgifter kopplade till biljetter (namn och e-post) anonymiseras automatiskt efter 1 år i enlighet med GDPR:s princip om lagringsminimering.
            </p>
          </section>

          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">IP-adresser</h2>
            <p className="text-foreground/80 leading-relaxed font-medium">
              IP-relaterad metadata lagras i maximalt 7 dagar för säkerhetsändamål och rensas därefter automatiskt.
            </p>
          </section>

          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">Radering</h2>
            <p className="text-foreground/80 leading-relaxed font-medium">
              Data för konto och aktivitet raderas i samband med godkänd och signerad avgångsprocess eller på begäran där det är lagligt möjligt.
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
           <span className="font-black tracking-tighter uppercase italic">Lankoping.se<span className="text-primary">.se</span></span>
           <p className="text-xs text-muted-foreground uppercase font-bold italic">
            Uppdaterad 2026-05-07
          </p>
        </footer>
      </main>
    </div>
  )
}

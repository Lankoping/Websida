import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, FileText, Scale } from 'lucide-react'

export const Route = createFileRoute('/_public/terms')({
  component: TermsPage,
})

function TermsPage() {
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
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase italic mb-6">
            <FileText size={14} />
            Juridiska Villkor
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Användarvillkor</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Genom att delta på våra event eller använda våra tjänster godkänner du dessa villkor.
          </p>
        </div>

        <div className="space-y-12">
          {/* Section 1 */}
          <section className="p-8 border border-border bg-card">
            <div className="flex items-center gap-3 mb-6">
                <Scale className="text-primary" size={20} />
                <h2 className="font-black text-xl uppercase italic tracking-tight">1. Allmänt</h2>
            </div>
            <p className="text-foreground/80 leading-relaxed font-medium">
              Dessa villkor gäller för alla besökare, deltagare och medlemmar i Länköping.se (ideell förening). 
              Villkoren är till för att säkerställa en trygg och rättvis miljö för alla inblandade.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">2. Deltagande och Ansvar</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm md:text-base">
              <p>Besökare ansvarar själva för sin personliga egendom. Länköping.se ansvarar inte för stöld, skada eller förlust av utrustning som medförs till våra lokaler.</p>
              <p>Skadegörelse på lokaler, nätverksutrustning eller annan egendom som tillhör föreningen eller hyresvärden kommer att debiteras den ansvarige deltagaren (eller målsman om deltagaren är under 18 år).</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">3. Biljetter och Betalning</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm md:text-base">
              <p>Köpta biljetter är personliga och får inte säljas vidare utan arrangörens skriftliga medgivande.</p>
              <p>Återköp av biljetter sker normalt inte, utom vid inställt event. Vid sjukdom eller förhinder kan vi i vissa fall erbjuda tillgodohavande för framtida event.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">4. Media och Marknadsföring</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm md:text-base">
              Länköping.se dokumenterar ofta sina event genom foto och film. Genom att delta godkänner du att du kan förekomma på bild eller film som publiceras i våra sociala kanaler eller på vår webbplats i syfte att visa upp vår verksamhet. 
              Om du önskar att en specifik bild på dig tas bort, kontakta oss så löser vi det.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-8 border border-border bg-card border-l-4 border-l-destructive">
            <h2 className="text-destructive font-black uppercase italic tracking-wider text-sm mb-4">5. Avstängning</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm md:text-base">
              Arrangörerna förbehåller sig rätten att avvisa eller stänga av deltagare som bryter mot våra <Link to="/rules" className="text-primary underline">regler</Link> eller agerar på ett sätt som skadar gemenskapen. Vid avstängning sker ingen återbetalning av biljettavgiften.
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
           <span className="font-black tracking-tighter uppercase italic">Lankoping<span className="text-primary">.se</span></span>
           <p className="text-xs text-muted-foreground uppercase font-bold italic">
            Senast uppdaterad: 2026-05-07
          </p>
        </footer>
      </main>
    </div>
  )
}
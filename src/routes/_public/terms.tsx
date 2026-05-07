import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, FileText, Scale, ShieldAlert, Gavel, AlertCircle } from 'lucide-react'

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
            <Scale size={14} />
            Juridisk Bindande Dokument
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Allmänna Villkor</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Dessa villkor utgör det fullständiga avtalet mellan dig som deltagare och föreningen Lankoping.se.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">1. Avtalets omfattning</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>1.1 Dessa allmänna villkor ("Villkoren") utgör det fullständiga och juridiskt bindande avtalet mellan dig ("Deltagaren", "Användaren" eller "Medlemmen") och den ideella föreningen Lankoping.se ("Föreningen").</p>
              <p>1.2 Genom att använda webbplatsen lankoping.se, logga in på våra tjänster, köpa en biljett eller teckna ett medlemskap godkänner du att vara bunden av dessa villkor i sin helhet. Om du inte godkänner dessa villkor äger du inte rätt att använda Föreningens tjänster.</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">2. Fiscal Hosting och Betalningar (HCB)</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>2.1 Lankoping.se är ett projekt som är föremål för "Fiscal Hosting" via <strong>Hack Foundation (HCB)</strong>, en icke-vinstdrivande organisation med säte i USA.</p>
              <p>2.2 Detta innebär att HCB juridiskt sett förvaltar Lankoping.se:s medel och ansvarar för transaktioner. Vid köp eller prenumeration kommer debiteringen på ditt kontoutdrag att visas som "HCB" eller "Hack Foundation" för Lankoping.se:s räkning.</p>
              <p>2.3 Föreningen ansvarar för tjänstens innehåll, medan HCB agerar uteslutande som finansiell infrastruktur. Eventuella krav rörande tjänsten ska riktas mot Lankoping.se.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-8 border border-border bg-card border-l-4 border-l-primary">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">3. Premium-medlemskap och Prenumeration</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>3.1 Deltagare kan teckna ett medlemskap mot en månadsavgift om 85 SEK inkl. eventuella avgifter.</p>
              <p>3.2 Förmåner inkluderar: 25% rabatt på ordinarie biljettpriser vid Lankoping.se:s egna LAN-event, samt förtur (Early Access) vid biljettsläpp.</p>
              <p>3.3 Medlemskapet förnyas automatiskt vid varje periodens slut (månadsvis) tills uppsägning sker. Uppsägning ska ske senast 24 timmar innan ny period påbörjas.</p>
              <p>3.4 Lankoping.se förbehåller sig rätten att justera avgifter och förmåner med 30 dagars varsel via e-post eller publicering på webbplatsen.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">4. Kontosäkerhet</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>4.1 Du är personligt ansvarig för att hålla dina inloggningsuppgifter hemliga. All aktivitet som sker via ditt konto anses vara utförd av dig.</p>
              <p>4.2 Lankoping.se ansvarar inte för skador som uppstår till följd av att obehöriga fått tillgång till ditt konto p.g.a. din oaktsamhet.</p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">5. Eventbiljetter och Ångerrätt</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>5.1 Köp av biljetter till specifika event är bindande och definitiva. Enligt svensk lag (Distansavtalslagen 2 kap. 11 § punkt 12) gäller <strong>ingen ångerrätt</strong> för idrottsevenemang, kulturmöten eller liknande fritidsaktiviteter som sker på en bestämd dag.</p>
              <p>5.2 Lankoping.se förbehåller sig rätten att kontrollera id-handling vid entré för att verifiera att biljetten används av rätt person.</p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">6. Uppförandekod och Avstängning</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>6.1 Deltagaren förbinder sig att följa Lankoping.se:s officiella <Link to="/rules" className="text-primary underline">regler</Link>. Detta inkluderar nolltolerans mot droger, alkohol, trakasserier och skadegörelse.</p>
              <p>6.2 Lankoping.se äger rätten att utan förvarning eller kompensation stänga av Deltagare som bryter mot dessa villkor eller agerar på ett sätt som bedöms skadligt för Föreningen eller dess medlemmar.</p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">7. Ansvar för Utrustning och Personskada</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>7.1 Lankoping.se ansvarar inte under några omständigheter för skada, förlust eller stöld av utrustning som medförs av Deltagaren. Deltagaren ansvarar själv för bevakning av sin utrustning.</p>
              <p>7.2 Lankoping.se ansvarar inte för personskador som uppstår under event, såvida inte skadan orsakats genom grov vårdslöshet av Föreningen.</p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">8. Immateriella rättigheter</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Allt material på lankoping.se (kod, design, logotyper, texter) ägs av Lankoping.se. Otillåten användning av Föreningens varumärke eller material kommer att beivras juridiskt.
            </p>
          </section>

          {/* Section 9 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">9. Ansvarsbegränsning</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Lankoping.se:s ansvar gentemot dig är under alla omständigheter begränsat till det belopp du faktiskt betalat till Föreningen under de senaste 12 månaderna. Lankoping.se ansvarar aldrig för indirekta skador eller följdförluster.
            </p>
          </section>

          {/* Section 10 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">10. Force Majeure</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Lankoping.se är befriat från ansvar för bristande fullgörande av avtalet som beror på hinder utanför vår kontroll, inklusive men inte begränsat till naturkatastrofer, krig, pandemi, strejk, elavbrott eller myndighetsbeslut.
            </p>
          </section>

          {/* Section 11 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">11. Ogiltighet (Severability)</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Skulle någon del av dessa villkor bedömas vara ogiltig eller ogenomförbar av behörig domstol, ska detta inte påverka giltigheten av övriga villkor i avtalet.
            </p>
          </section>

          {/* Section 12 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">12. Tvist och Lagval</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Detta avtal styrs av svensk lag. Tvister ska i första hand lösas genom förhandling och i andra hand av Norrköpings tingsrätt som första instans.
            </p>
          </section>
        </div>

          {/* Final Notice */}
          <div className="p-8 border-2 border-primary bg-primary/5 italic flex gap-4">
             <AlertCircle className="text-primary shrink-0" />
             <p className="text-sm font-bold uppercase leading-tight">
               Genom att genomföra ett biljettköp eller logga in på våra tjänster bekräftar du att du har läst, förstått och accepterat dessa villkor i sin helhet.
             </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
           <span className="font-black tracking-tighter uppercase italic">Lankoping.se<span className="text-primary">.se</span></span>
           <p className="text-xs text-muted-foreground uppercase font-bold italic">
            Dokument-ID: TOS-2026-V2 • Senast uppdaterad: 2026-05-07
          </p>
        </footer>
      </main>
    </div>
  )
}
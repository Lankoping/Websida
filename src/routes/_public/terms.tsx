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
            Dessa villkor utgör det fullständiga avtalet mellan dig som deltagare och föreningen Länköping.se.
          </p>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">1. Inledning och Definitioner</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>1.1 Dessa allmänna villkor ("Villkoren") gäller för all användning av webbplatsen länköping.se samt för deltagande i event arrangerade av den ideella föreningen Länköping.se ("Föreningen").</p>
              <p>1.2 Med "Deltagare" avses den person som köpt biljett, innehar en biljett eller på annat sätt deltar i Föreningens aktiviteter.</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">2. Medlemskap och Deltagande</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>2.1 Vid köp av biljett eller deltagande kan Deltagaren även komma att registreras som medlem i Föreningen i enlighet med Föreningens stadgar, för att uppfylla bidragskrav och administrativa behov.</p>
              <p>2.2 Deltagare under 18 år kräver målsmans godkännande för deltagande. Genom att köpa en biljett intygar köparen att sådant godkännande finns.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-8 border border-border bg-card border-l-4 border-l-primary">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">3. Medlemskap och Prenumeration</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>3.1 Deltagare har möjlighet att teckna ett premium-medlemskap i Länköping.se mot en månadsavgift om 85 SEK.</p>
              <p>3.2 Medlemskapet ger Deltagaren förmåner såsom tidigare åtkomst vid biljettsläpp samt 25% rabatt på ordinarie biljettpriser.</p>
              <p>3.3 Länköping.se är ett projekt som står under ekonomisk förvaltning (Fiscal Hosting) av <strong>Hack Foundation (HCB)</strong>. Genom att genomföra ett köp eller teckna en prenumeration godkänner du att HCB debiterar dig för det valda beloppet för Länköping.se:s räkning.</p>
              <p>3.4 Prenumerationer löper månadsvis och kan sägas upp när som helst, varvid förmånerna upphör vid utgången av den innevarande betalperioden.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">4. Biljetter och Ångerrätt</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>4.1 Köp av biljetter till Föreningens event är bindande. Enligt Lag (2005:59) om distansavtal och avtal utanför affärslokaler 2 kap. 11 § punkt 12, gäller inte ångerrätt för idrottsevenemang, kulturmöten eller liknande fritidsaktiviteter som sker på en bestämd dag eller under en bestämd tidsperiod.</p>
              <p>4.2 Återbetalning sker endast om Föreningen ställer in eventet i sin helhet och ingen ersättningsaktivitet erbjuds.</p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">5. Deltagarens Ansvar och Egendom</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>5.1 All utrustning (datorer, konsoler, kringutrustning etc.) medförs på Deltagarens egen risk. Föreningen tillhandahåller inget försäkringsskydd för Deltagarens egendom.</p>
              <p>5.2 Deltagaren är personligt ansvarig för eventuella skador som denne orsakar på lokal, Föreningens utrustning eller annan Deltagares egendom.</p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">6. Immateriella Rättigheter</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Allt innehåll på länköping.se, inklusive logotyper, design, text och källkod, tillhör Föreningen eller dess licensgivare och är skyddat av upphovsrättslagen.
            </p>
          </section>

          {/* Section 7 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">7. Media och Dokumentation</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>7.1 Föreningen förbehåller sig rätten att fotografera och filma under sina event för publicering i marknadsföringssyfte, sociala medier och dokumentation.</p>
              <p>7.2 Genom deltagande ger Deltagaren Föreningen en oåterkallelig rätt att använda Deltagarens bild och röst i sådant material utan ekonomisk kompensation.</p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">8. Säkerhet och Kontroll</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Föreningen och av Föreningen anlitad säkerhetspersonal har rätt att genomföra väskkontroller och neka tillträde till personer som medför förbjudna föremål (alkohol, droger, vapen etc.) eller som uppträder berusat eller aggressivt.
            </p>
          </section>

          {/* Section 9 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">9. Personuppgifter (GDPR)</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Föreningen behandlar personuppgifter i enlighet med gällande dataskyddslagstiftning. För detaljerad information om hur vi hanterar din data, se vår <Link to="/datapolicy/se" className="text-primary underline">Datapolicy</Link>.
            </p>
          </section>

          {/* Section 10 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">10. Ansvarsbegränsning</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Föreningen ansvarar inte för indirekta skador, utebliven vinst eller följdskador. Föreningens totala ansvar gentemot Deltagaren är under alla omständigheter begränsat till ett belopp motsvarande den erlagda biljettavgiften.
            </p>
          </section>

          {/* Section 11 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">11. Force Majeure</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Föreningen är befriad från påföljd för underlåtenhet att fullgöra viss förpliktelse enligt dessa Villkor om underlåtenheten har sin grund i omständighet utanför Föreningens kontroll, såsom krig, naturkatastrof, pandemi, elavbrott eller myndighetsbeslut.
            </p>
          </section>

          {/* Section 12 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">12. Tvistelösning och Lagval</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>12.1 Dessa Villkor ska tolkas och tillämpas i enlighet med svensk lag.</p>
              <p>12.2 Tvister som uppstår i anledning av dessa Villkor ska i första hand lösas genom förhandling. Om parterna inte kan enas ska tvisten avgöras av allmän domstol, med Norrköpings tingsrätt som första instans.</p>
            </div>
          </section>

          {/* Section 13 */}
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">13. Ändringar och Ogiltighet</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p>13.1 Föreningen förbehåller sig rätten att när som helst ändra dessa Villkor genom att publicera de uppdaterade villkoren på webbplatsen.</p>
              <p>13.2 Om någon bestämmelse i dessa Villkor skulle befinnas vara ogiltig eller ogenomförbar av domstol, ska detta inte påverka giltigheten av övriga bestämmelser.</p>
            </div>
          </section>

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
           <span className="font-black tracking-tighter uppercase italic">Länköping<span className="text-primary">.se</span></span>
           <p className="text-xs text-muted-foreground uppercase font-bold italic">
            Dokument-ID: TOS-2026-V2 • Senast uppdaterad: 2026-05-07
          </p>
        </footer>
      </main>
    </div>
  )
}
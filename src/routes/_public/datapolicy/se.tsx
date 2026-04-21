import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_public/datapolicy/se')({
  component: DataPolicySwedish,
})

function DataPolicySwedish() {
  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto max-w-3xl border border-border bg-card rounded-sm p-6 sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:text-foreground transition-colors text-sm uppercase tracking-[0.12em]">
          <ArrowLeft size={16} /> Tillbaka till inloggning
        </Link>

        <h1 className="mt-6 font-display text-4xl tracking-wide text-foreground">Datapolicy & Cookies</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Denna policy förklarar hur Lankoping ("vi", "oss", "vår") behandlar dina personuppgifter som arrangör eller volontär, samt hur vi använder cookies, i enlighet med Dataskyddsförordningen (GDPR).
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-primary uppercase tracking-[0.15em] text-xs mb-2">1. Personuppgiftsansvarig</h2>
            <p>
              Lankoping är personuppgiftsansvarig för behandlingen av dina personuppgifter i detta system. För integritetsrelaterade frågor, vänligen kontakta administrationen.
            </p>
          </section>

          <section>
            <h2 className="text-primary uppercase tracking-[0.15em] text-xs mb-2">2. Vad vi loggar & Rättslig grund</h2>
            <p>
              Vi loggar säkerhets- och administrationshändelser för volontärer och arrangörer, inklusive inloggningar, profiländringar och utförda åtgärder (t.ex. biljettscanning, publicering av innehåll).
              Den rättsliga grunden för denna behandling är vårt <strong>berättigade intresse</strong> (GDPR Artikel 6.1 f) av att säkerställa säkerheten, integriteten och spårbarheten i våra administrativa system.
            </p>
          </section>

          <section>
            <h2 className="text-primary uppercase tracking-[0.15em] text-xs mb-2">3. Datalagring</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Kontouppgifter:</strong> Lagras under den tid du har en aktiv roll som volontär eller arrangör. Vid din avgång och efter genomförd avslutningsprocess kommer ditt konto och tillhörande personuppgifter att raderas eller anonymiseras.</li>
              <li><strong>Aktivitetsloggar:</strong> Lagras för säkerhetsgranskning och rensas regelbundet enligt våra interna säkerhetspolicyer.</li>
              <li><strong>IP-adresser:</strong> IP-relaterad metadata lagras i maximalt 7 dagar och raderas därefter automatiskt.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-primary uppercase tracking-[0.15em] text-xs mb-2">4. Användning av Cookies</h2>
            <p>
              Vi använder cookies (små textfiler som sparas i din webbläsare) för att säkerställa att webbplatsen och administrationssystemet fungerar korrekt.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Nödvändiga cookies:</strong> Används för inloggning, säkerhet och för att spara dina inställningar (t.ex. ditt val angående cookies). Dessa kan inte stängas av.</li>
              <li><strong>Funktionella & Analytiska cookies:</strong> Används för att förstå hur systemet används så att vi kan förbättra det. Du kan välja att avvisa dessa via vår cookie-banner.</li>
            </ul>
            <p className="mt-2">
              Ditt samtycke till icke-nödvändiga cookies är frivilligt (GDPR Artikel 7) och kan när som helst återkallas genom att rensa din webbläsares cookies.
            </p>
          </section>

          <section>
            <h2 className="text-primary uppercase tracking-[0.15em] text-xs mb-2">5. Dina rättigheter</h2>
            <p>Enligt GDPR har du följande rättigheter gällande dina personuppgifter:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Rätt till tillgång:</strong> Du kan begära en kopia av de uppgifter vi har om dig.</li>
              <li><strong>Rätt till rättelse:</strong> Du kan begära att felaktiga uppgifter rättas.</li>
              <li><strong>Rätt till radering:</strong> Du kan begära att dina uppgifter raderas ("rätten att bli bortglömd"), med förbehåll för rättsliga och administrativa skyldigheter.</li>
              <li><strong>Rätt att göra invändningar & begränsning:</strong> Du kan invända mot eller begära begränsning av viss behandling.</li>
            </ul>
            <p className="mt-2">För att utöva dessa rättigheter, vänligen kontakta en systemadministratör.</p>
          </section>

          <section>
            <h2 className="text-primary uppercase tracking-[0.15em] text-xs mb-2">6. Klagomål</h2>
            <p>
              Om du anser att vår behandling av dina personuppgifter bryter mot dataskyddslagstiftningen har du rätt att lämna in ett klagomål till Integritetsskyddsmyndigheten (IMY).
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_public/datapolicy/se')({
  component: DataPolicySwedish,
})

function DataPolicySwedish() {
  return (
    <div className="min-h-screen bg-[#100E0C] text-[#F0E8D8] px-4 py-10">
      <div className="mx-auto max-w-3xl border border-[#C04A2A]/20 bg-[#141210]/70 rounded-sm p-6 sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-[#C04A2A] hover:text-[#F0E8D8] transition-colors text-sm uppercase tracking-[0.12em]">
          <ArrowLeft size={16} /> Tillbaka till inloggning
        </Link>

        <h1 className="mt-6 font-display text-4xl tracking-wide text-[#C04A2A]">Datapolicy (SV)</h1>
        <p className="mt-3 text-sm text-[#F0E8D8]/75">
          Denna policy förklarar hur Lankoping ("vi", "oss", "vår") behandlar dina personuppgifter som arrangör eller volontär, i enlighet med Dataskyddsförordningen (GDPR).
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#F0E8D8]/85">
          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">1. Personuppgiftsansvarig</h2>
            <p>
              Lankoping är personuppgiftsansvarig för behandlingen av dina personuppgifter i detta system. För integritetsrelaterade frågor, vänligen kontakta administrationen.
            </p>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">2. Vad vi loggar & Rättslig grund</h2>
            <p>
              Vi loggar säkerhets- och administrationshändelser för volontärer och arrangörer, inklusive inloggningar, profiländringar och utförda åtgärder (t.ex. biljettscanning, publicering av innehåll).
              Den rättsliga grunden för denna behandling är vårt <strong>berättigade intresse</strong> (GDPR Artikel 6.1 f) av att säkerställa säkerheten, integriteten och spårbarheten i våra administrativa system.
            </p>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">3. Datalagring</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Kontouppgifter:</strong> Lagras under den tid du har en aktiv roll som volontär eller arrangör. Vid din avgång och efter genomförd avslutningsprocess kommer ditt konto och tillhörande personuppgifter att raderas eller anonymiseras.</li>
              <li><strong>Aktivitetsloggar:</strong> Lagras för säkerhetsgranskning och rensas regelbundet enligt våra interna säkerhetspolicyer.</li>
              <li><strong>IP-adresser:</strong> IP-relaterad metadata lagras i maximalt 7 dagar och raderas därefter automatiskt.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">4. Dina rättigheter</h2>
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
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">5. Klagomål</h2>
            <p>
              Om du anser att vår behandling av dina personuppgifter bryter mot dataskyddslagstiftningen har du rätt att lämna in ett klagomål till Integritetsskyddsmyndigheten (IMY).
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

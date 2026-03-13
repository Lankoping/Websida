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
          <ArrowLeft size={16} /> Till inloggning
        </Link>

        <h1 className="mt-6 font-display text-4xl tracking-wide text-[#C04A2A]">Datapolicy (SV)</h1>
        <p className="mt-3 text-sm text-[#F0E8D8]/75">
          Genom att autentisera dig accepterar du denna policy och hur vi lagrar data.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#F0E8D8]/85">
          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">Vad vi loggar</h2>
            <p>
              Vi loggar säkerhets- och administrationshändelser för volontärer och organisatörer, inklusive inloggning,
              ändringar i adminsystemet och använd åtgärd.
            </p>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">Lagringstid för volontärer och organisatörer</h2>
            <p>
              För volontärer och organisatörer i Lanköping lagras data tills vidare. Radering sker först när du lämnar
              Lanköping och en signerad avgång/uppsägningshandling har registrerats.
            </p>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">IP-adresser</h2>
            <p>
              IP-relaterad metadata lagras i maximalt 7 dagar och rensas därefter automatiskt.
            </p>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">Radering vid avgång</h2>
            <p>
              Data för konto och aktivitet raderas i samband med godkänd och signerad avgångsprocess.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

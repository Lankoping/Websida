import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/_public/datapolicy/en')({
  component: DataPolicyEnglish,
})

function DataPolicyEnglish() {
  return (
    <div className="min-h-screen bg-[#100E0C] text-[#F0E8D8] px-4 py-10">
      <div className="mx-auto max-w-3xl border border-[#C04A2A]/20 bg-[#141210]/70 rounded-sm p-6 sm:p-10">
        <Link to="/login" className="inline-flex items-center gap-2 text-[#C04A2A] hover:text-[#F0E8D8] transition-colors text-sm uppercase tracking-[0.12em]">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <h1 className="mt-6 font-display text-4xl tracking-wide text-[#C04A2A]">Data Policy (EN)</h1>
        <p className="mt-3 text-sm text-[#F0E8D8]/75">
          By authenticating, you accept this policy and how we store data.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#F0E8D8]/85">
          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">What we log</h2>
            <p>
              We log security and administration events for volunteers and organizers, including sign-ins,
              admin changes, and performed actions.
            </p>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">Retention for volunteers and organizers</h2>
            <p>
              For volunteers and organizers at Lankoping, data is stored indefinitely. Deletion only happens when you
              leave Lankoping and a signed resignation record has been completed.
            </p>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">IP retention</h2>
            <p>
              IP-related metadata is retained for a maximum of 7 days and then automatically purged.
            </p>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">Deletion on resignation</h2>
            <p>
              Account and activity data is deleted as part of an approved and signed resignation flow.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

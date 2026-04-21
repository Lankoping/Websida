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
          This policy explains how Lankoping ("we", "us", "our") processes your personal data as an organizer or volunteer, in accordance with the General Data Protection Regulation (GDPR).
        </p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-[#F0E8D8]/85">
          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">1. Data Controller</h2>
            <p>
              Lankoping is the data controller for the processing of your personal data within this system. For privacy-related inquiries, please contact the administration team.
            </p>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">2. What We Log & Legal Basis</h2>
            <p>
              We log security and administration events for volunteers and organizers, including sign-ins, profile changes, and performed actions (e.g., ticket scanning, content publishing).
              The legal basis for this processing is our <strong>legitimate interest</strong> (GDPR Article 6(1)(f)) in ensuring the security, integrity, and accountability of our administrative systems.
            </p>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">3. Data Retention</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Data:</strong> Retained for the duration of your active role as a volunteer or organizer. Upon your departure and completion of the offboarding process, your account and associated personal data will be deleted or anonymized.</li>
              <li><strong>Activity Logs:</strong> Retained for security auditing purposes and periodically purged according to our internal security policies.</li>
              <li><strong>IP Addresses:</strong> IP-related metadata is retained for a maximum of 7 days and then automatically purged.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">4. Your Rights</h2>
            <p>Under the GDPR, you have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Right of Access:</strong> You can request a copy of the data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> You can request corrections to inaccurate data.</li>
              <li><strong>Right to Erasure:</strong> You can request the deletion of your data ("right to be forgotten"), subject to legal and administrative obligations.</li>
              <li><strong>Right to Object & Restrict:</strong> You can object to or request the restriction of certain processing activities.</li>
            </ul>
            <p className="mt-2">To exercise these rights, please contact a system administrator.</p>
          </section>

          <section>
            <h2 className="text-[#C04A2A] uppercase tracking-[0.15em] text-xs mb-2">5. Complaints</h2>
            <p>
              If you believe our processing of your personal data violates data protection laws, you have the right to lodge a complaint with the Swedish Authority for Privacy Protection (IMY).
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

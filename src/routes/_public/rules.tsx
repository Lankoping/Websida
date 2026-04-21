import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/rules')({
  component: Rules,
})

function Rules() {
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
    <div className="container mx-auto p-8 max-w-4xl text-black">
      <h1 className="text-4xl font-bold mb-8">Regler</h1>
      <div className="grid gap-6">
        {rules.map((rule, index) => (
          <div key={index} className="border border-gray-300 p-6 rounded-lg bg-white">
            <h2 className="font-bold text-xl mb-2 text-[#C04A2A]">{rule.title}</h2>
            <p className="text-gray-800">{rule.details}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ShieldAlert, MessageSquareText } from 'lucide-react'

export const Route = createFileRoute('/_public/rules')({
  component: RulesPage,
})

function RulesPage() {
  // Fallback content if database is empty
  const fallbackEventRules = [
    'Ingen alkohol eller droger. Det är inte tillåtet att ta med, använda eller sälja droger eller andra berusningsmedel under eventet.',
    'Nolltolerans mot trakasserier. Inget hat, hot, diskriminering, mobbning eller sexuella trakasserier. Respektera allas gränser.',
    'Var schysst och visa hänsyn. Håll en trevlig ton, både på plats och online (till exempel i Discord).',
    'Följ arrangörernas instruktioner. Om en arrangör säger till, så gäller det direkt.',
    'Ta hand om lokalen. Ingen skadegörelse. Håll rent efter dig och använd soptunnor.',
    'Respektera andras utrustning. Rör inte andras datorer, skärmar eller kablar utan att fråga.',
    'Säkerhet först. Håll gångar och nödutgångar fria. Dra kablar så att ingen snubblar.',
    'Ljudnivå. Använd hörlurar vid spel. Högtalare endast om arrangörerna godkänner det.',
    'Foto och film. Fråga innan du fotar eller filmar någon. Respektera om någon säger nej.',
    'Konsekvenser. Vid regelbrott kan du få varning, bli avstängd från eventet och vid allvarliga incidenter kan polis kontaktas.',
  ]

  const fallbackDiscordRules = [
    'Samma regler som på plats. Nolltolerans mot trakasserier, hat, hot och diskriminering.',
    'Håll dig till rätt kanal. Skriv i rätt textkanal och håll röstsamtal i rätt voice.',
    'Inga spoilers eller NSFW. Inget sexuellt innehåll, gore eller annat olämpligt material.',
    'Ingen spam. Inga mass-pings, flood, soundboards på max, eller upprepade memes som stör.',
    'Ingen reklam utan OK. Ingen reklam för servrar, streams eller produkter utan att arrangörerna sagt ja.',
    'Respektera integritet. Dela inte personuppgifter, IP-adresser, doxxing eller privata chattar.',
    'Ticket/roller = inga genvägar. Försök inte kringgå roller eller åtkomst. Missbruk kan leda till avstängning.',
    'Mod-teamet har sista ordet. Moddar kan ta bort innehåll, mute:a eller kicka/ban:a vid behov.',
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} />
            <span>Tillbaka</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Page Header */}
        <div className="mb-16">
          <p className="text-sm font-medium tracking-widest text-primary uppercase mb-3">Riktlinjer</p>
          <h1 className="font-bold text-3xl md:text-5xl text-foreground mb-4">Regler</h1>
          <p className="text-lg text-muted-foreground">
            För allas trivsel och säkerhet under Länköping.se
          </p>
        </div>

        {/* Event Rules Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center bg-secondary">
              <ShieldAlert className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-bold text-xl text-foreground">Eventregler</h2>
          </div>
          
          <div className="space-y-4">
            {fallbackEventRules.map((rule, i) => (
              <div 
                key={i} 
                className="flex gap-4 p-4 border border-border bg-card hover:border-primary/20 transition-colors"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                  {i + 1}
                </span>
                <p className="text-foreground/90 leading-relaxed pt-1">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Discord Rules Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center bg-secondary">
              <MessageSquareText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-bold text-xl text-foreground">Discordregler</h2>
          </div>
          
          <div className="space-y-4">
            {fallbackDiscordRules.map((rule, i) => (
              <div 
                key={i} 
                className="flex gap-4 p-4 border border-border bg-card hover:border-primary/20 transition-colors"
              >
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                  {i + 1}
                </span>
                <p className="text-foreground/90 leading-relaxed pt-1">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 Länköping.se — Vi ses på eventet!
          </p>
        </footer>
      </main>
    </div>
  )
}

import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ShieldAlert, MessageSquareText, ShieldCheck } from 'lucide-react'

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
            <ShieldCheck size={14} />
            Trygghet & Gemenskap
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Regler</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            För allas trivsel och säkerhet under Länköping.se event och i våra digitala kanaler.
          </p>
        </div>

        {/* Event Rules Section */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-12 border-l-4 border-primary pl-6">
            <h2 className="font-black text-2xl text-foreground uppercase italic tracking-tight">Eventregler</h2>
          </div>
          
          <div className="grid gap-4">
            {fallbackEventRules.map((rule, i) => (
              <div 
                key={i} 
                className="group flex gap-6 p-6 border border-border bg-card hover:border-primary/30 transition-all"
              >
                <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-secondary text-primary font-black italic text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {i + 1}
                </span>
                <p className="text-foreground/90 leading-relaxed pt-1.5 font-medium">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Discord Rules Section */}
        <section className="mb-24">
          <div className="flex items-center gap-3 mb-12 border-l-4 border-primary pl-6">
            <h2 className="font-black text-2xl text-foreground uppercase italic tracking-tight">Discordregler</h2>
          </div>
          
          <div className="grid gap-4">
            {fallbackDiscordRules.map((rule, i) => (
              <div 
                key={i} 
                className="group flex gap-6 p-6 border border-border bg-card hover:border-primary/30 transition-all"
              >
                <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-secondary text-primary font-black italic text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {i + 1}
                </span>
                <p className="text-foreground/90 leading-relaxed pt-1.5 font-medium">{rule}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-12 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <span className="font-black tracking-tighter uppercase italic">Lankoping<span className="text-primary">.se</span></span>
             <p className="text-sm text-muted-foreground font-bold uppercase italic">
              Vi ses på nästa event!
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

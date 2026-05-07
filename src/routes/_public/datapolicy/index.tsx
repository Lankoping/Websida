import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, ShieldCheck, Info, Clock } from 'lucide-react'

export const Route = createFileRoute('/_public/datapolicy/')({
  component: PrivacyPage,
})

function PrivacyPage() {
  const collectionItems = [
    { 
      title: 'E-postadress', 
      desc: 'För inloggning och utskick av viktig information.',
      icon: Info,
    },
    { 
      title: 'Manuella uppgifter', 
      desc: 'Vid manuella biljettköp kan vi efterfråga namn och kontaktuppgifter för att verifiera din plats.',
      icon: Info,
    },
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
            Datapolicy
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic mb-4">Integritet</h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Din trygghet är vår prioritet. Här förklarar vi hur vi hanterar dina personuppgifter för Länköping.se.
          </p>
        </div>

        <section className="mb-20">
          <div className="flex items-center gap-3 mb-10 border-l-4 border-primary pl-6">
            <h2 className="font-black text-2xl text-foreground uppercase italic tracking-tight">Insamling av personuppgifter</h2>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            För att vi ska kunna genomföra ett säkert och välorganiserat event samlar vi in och behandlar följande uppgifter från våra deltagare:
          </p>
          
          <div className="grid gap-4">
            {collectionItems.map((item) => (
              <div 
                key={item.title} 
                className="group flex gap-6 p-6 border border-border bg-card hover:border-primary/30 transition-all"
              >
                <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <item.icon className="w-6 h-6" />
                </span>
                <div className="pt-1">
                  <p className="text-primary font-black uppercase italic mb-1">{item.title}</p>
                  <p className="text-foreground/80 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 p-8 border-2 border-primary bg-primary/5 italic">
          <h2 className="text-2xl font-black uppercase mb-4 tracking-tight">Varför samlar vi in detta?</h2>
          <div className="space-y-4 text-foreground/80 leading-relaxed font-medium">
            <p>Uppgifterna används uteslutande för administration av eventet, säkerhetsåtgärder och verifiering av din biljett.</p>
            <p>Eftersom biljettköp hanteras manuellt lagras inga betalningsuppgifter på denna webbplats.</p>
            <p>Vi delar aldrig dina uppgifter med tredje part i vinstdrivande syfte. Information kan dock komma att delas med myndigheter (t.ex. polis eller sjukvård) om en nödsituation uppstår.</p>
          </div>
        </section>

        <section className="mb-24">
          <div className="flex items-center gap-3 mb-10 border-l-4 border-primary pl-6">
            <h2 className="font-black text-2xl text-foreground uppercase italic tracking-tight">Vad händer efter eventet?</h2>
          </div>
          
          <div className="space-y-8 text-muted-foreground leading-relaxed font-medium">
            <p className="text-lg">
              För att följa GDPR och principen om lagringsminimering anonymiseras personuppgifter kopplade till biljetter (namn och e-post) automatiskt.
              Det innebär att de lagras i <strong className="text-foreground">max 1 år</strong> efter att biljetten skapades, därefter tas de bort från våra servrar.
            </p>
            
            <div className="p-8 border border-border bg-card group hover:border-destructive/30 transition-colors">
              <h3 className="font-black text-xl text-destructive uppercase italic mb-4">Information som vi inte tar bort</h3>
              <p className="text-foreground/80">
                Vi tar bort all information som vi inte behöver behålla. Exempelvis om du har brutit mot eventets regler så sparar vi den informationen.
                Detta betyder att du kan bli portad från framtida events för att bibehålla en trygg miljö för andra.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-12 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <span className="font-black tracking-tighter uppercase italic">Lankoping<span className="text-primary">.se</span></span>
             <p className="text-sm text-muted-foreground font-bold uppercase italic">
              Din integritet är viktig för oss.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

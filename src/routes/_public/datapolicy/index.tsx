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
            Din trygghet är vår prioritet. Här förklarar vi hur vi hanterar dina personuppgifter för Lankoping.se.
          </p>
        </div>

        <div className="space-y-8">
          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">1. Personuppgiftsansvarig</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Lankoping.se (ideell förening) är personuppgiftsansvarig för behandlingen av de personuppgifter du lämnar till oss. För frågor rörande din data, kontakta oss via våra officiella kanaler eller elias@lankoping.se.
            </p>
          </section>

          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">2. Vilken data samlar vi in?</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p><strong>Identitetsdata:</strong> Namn, användarnamn och vid behov personnummer (för t.ex. bidragsansökningar till kommun/stat).</p>
              <p><strong>Kontaktdata:</strong> E-postadress och i vissa fall telefonnummer.</p>
              <p><strong>Transaktionsdata:</strong> Information om medlemskap, biljettköp och betalningshistorik (notera att betalningar hanteras via HCB, se TOS).</p>
              <p><strong>Teknisk data:</strong> IP-adress, inloggningsuppgifter och webbläsarinformation för säkerhetssyften.</p>
            </div>
          </section>

          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">3. Laglig grund för behandling</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p><strong>Avtal:</strong> För att kunna leverera biljetter, hantera medlemskap och ge tillgång till våra tjänster.</p>
              <p><strong>Rättslig förpliktelse:</strong> För bokföring och rapportering till myndigheter.</p>
              <p><strong>Intresseavvägning:</strong> För att kunna skicka ut relevant information om kommande event och skydda våra system mot missbruk.</p>
            </div>
          </section>

          <section className="p-8 border border-border bg-card">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">4. Hur länge sparar vi din data?</h2>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">
              Data kopplad till event (biljetter) anonymiseras normalt 1 år efter avslutat event. Medlemsdata sparas så länge medlemskapet är aktivt och i upp till 2 år därefter för att underlätta förnyelse och historik, såvida inte radering begärs.
            </p>
          </section>

          <section className="p-8 border border-border bg-card border-l-4 border-l-primary">
            <h2 className="text-primary font-black uppercase italic tracking-wider text-sm mb-4">5. Dina rättigheter (GDPR)</h2>
            <div className="space-y-4 text-foreground/80 leading-relaxed font-medium text-sm">
              <p><strong>Rätt till tillgång:</strong> Du har rätt att få ett utdrag på all data vi har om dig.</p>
              <p><strong>Rätt till rättelse:</strong> Du kan kräva att vi rättar felaktiga uppgifter.</p>
              <p><strong>Rätt till radering:</strong> Du kan begära att vi tar bort din data ("rätten att bli bortglömd"), förutsatt att den inte krävs för att uppfylla rättsliga krav (t.ex. bokföringslagen).</p>
              <p><strong>Rätt till invändning:</strong> Du kan invända mot att din data används för direktmarknadsföring.</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="pt-12 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <span className="font-black tracking-tighter uppercase italic">Lankoping.se<span className="text-primary">.se</span></span>
             <p className="text-sm text-muted-foreground font-bold uppercase italic">
              Din integritet är viktig för oss.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}

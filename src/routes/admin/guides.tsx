import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, Ticket, Building2, QrCode, ShieldCheck, Settings } from 'lucide-react'

export const Route = createFileRoute('/admin/guides')({
  component: GuidesPage,
})

function GuidesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <p className="text-xs font-medium tracking-widest text-primary uppercase mb-2">Hjälp & Support</p>
        <h1 className="font-display text-4xl text-foreground flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Systemguider
        </h1>
        <p className="text-muted-foreground mt-2">
          Här hittar du detaljerade instruktioner för hur du använder admin-systemets olika funktioner.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Guide 1: Grundläggande Biljetthantering */}
        <div className="bg-card border border-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <div className="p-3 bg-primary/10 text-primary">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display text-foreground">1. Grundläggande Biljetthantering</h2>
              <p className="text-sm text-muted-foreground">Hur du sätter upp event och biljettyper</p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-foreground leading-relaxed">
            <div className="space-y-1">
              <h3 className="font-medium text-primary">A. Skapa ett Event</h3>
              <p className="text-muted-foreground">
                Gå till <strong>Evenemang</strong> i menyn och klicka på <strong>Nytt Event</strong>. Fyll i titel, datum och en beskrivning. För att eventet ska synas och biljetter ska kunna utfärdas måste du markera det som <em>Publicerat</em>.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-primary">B. Skapa Biljettyper</h3>
              <p className="text-muted-foreground">
                Gå till <strong>Biljettyper</strong>. Här skapar du de övergripande kategorierna av biljetter (t.ex. "Standard", "VIP", "Student") och sätter deras standardpris.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-primary">C. Koppla biljetter till event</h3>
              <p className="text-muted-foreground">
                När du har skapat både event och biljettyper måste du koppla dem. Gå in på ett specifikt event, scrolla ner till <strong>Tillgängliga Biljettyper</strong> och aktivera de biljettyper som ska gälla för just detta event. Du kan även sätta ett maxantal per biljettyp.
              </p>
            </div>
          </div>
        </div>

        {/* Guide 2: Företagsbiljetter */}
        <div className="bg-card border border-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <div className="p-3 bg-primary/10 text-primary">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display text-foreground">2. Företagsbiljetter & Prissättning</h2>
              <p className="text-sm text-muted-foreground">Hantera företagskunder och specialpriser</p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-foreground leading-relaxed">
            <div className="space-y-1">
              <h3 className="font-medium text-primary">A. Lägg till företag</h3>
              <p className="text-muted-foreground">
                Gå till <strong>Företag</strong> i menyn. Använd formuläret för att lägga till ett nytt företag med kontaktuppgifter.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-primary">B. Sätt företagspriser (Prisregler)</h3>
              <p className="text-muted-foreground">
                Klicka på ett företag i listan för att fälla ut prispanelen. Här kan du lägga till specifika priser för olika biljettyper. 
                <br/><br/>
                <em>Viktigt: Dessa prisregler fungerar som undantag. Företag kan köpa <strong>alla</strong> biljettyper som är aktiverade för ett event. Om en prisregel finns för företaget och biljettypen tillämpas det priset, annars används standardpriset.</em>
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-primary">C. Utfärda företagsbiljett</h3>
              <p className="text-muted-foreground">
                Gå till <strong>Utfärda biljett</strong>. Välj event och ändra utfärdande typ till <strong>Företag</strong>. Välj företaget i listan. Dropdown-menyn för biljettyper kommer att visa alla tillgängliga biljetter för eventet, och priset uppdateras automatiskt baserat på företagets eventuella prisregler.
              </p>
            </div>
          </div>
        </div>

        {/* Guide 3: Skanning */}
        <div className="bg-card border border-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <div className="p-3 bg-primary/10 text-primary">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display text-foreground">3. Skanna och Verifiera Biljetter</h2>
              <p className="text-sm text-muted-foreground">Incheckning på plats</p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-foreground leading-relaxed">
            <div className="space-y-1">
              <h3 className="font-medium text-primary">A. QR-skanning (Rekommenderas)</h3>
              <p className="text-muted-foreground">
                Varje biljett som skickas ut via e-post innehåller en unik QR-kod. Använd en mobiltelefons kamera eller en QR-läsare för att skanna koden. Du skickas då till en verifieringssida där du med ett knapptryck kan checka in besökaren (biljetten markeras som <em>Använd</em>).
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-primary">B. Manuell inmatning</h3>
              <p className="text-muted-foreground">
                Om QR-koden inte fungerar kan du gå till <strong>Översikt</strong> under Biljetter och klicka på knappen <strong>Ange Kod</strong>. Skriv in biljettkoden (t.ex. <code>TK-ABC123XY</code>) för att manuellt verifiera och checka in biljetten.
              </p>
            </div>
          </div>
        </div>

        {/* Guide 4: Roller */}
        <div className="bg-card border border-border p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <div className="p-3 bg-primary/10 text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display text-foreground">4. Användarroller & Rättigheter</h2>
              <p className="text-sm text-muted-foreground">Vem kan göra vad i systemet?</p>
            </div>
          </div>
          <div className="space-y-4 text-sm text-foreground leading-relaxed">
            <div className="space-y-1">
              <h3 className="font-medium text-primary">Organisatör (Admin)</h3>
              <p className="text-muted-foreground">
                Har full tillgång till hela systemet. Kan skapa/redigera event, hantera biljettyper, lägga till företag och prisregler, utfärda biljetter, se aktivitetsloggar och hantera andra användare.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-primary">Volontär</h3>
              <p className="text-muted-foreground">
                Har begränsad tillgång anpassad för incheckning och kundtjänst. Volontärer kan se biljetter, utfärda nya biljetter och skanna/verifiera biljetter. De har <strong>inte</strong> tillgång till att ändra eventinställningar, priser, företag eller användare.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

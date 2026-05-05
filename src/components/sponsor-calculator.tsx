'use client'

import { useState, useMemo, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { getPublicTicketTypesFn } from '../server/functions/eventTicketTypes'

export default function SponsorCalculator() {
  const [sponsorAmount, setSponsorAmount] = useState(500)
  const [ticketCount, setTicketCount] = useState(10)
  const [standardPrice, setStandardPrice] = useState<number | null>(null)
  const [loadingPrices, setLoadingPrices] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoadingPrices(true)
    getPublicTicketTypesFn()
      .then((rows: any[]) => {
        if (!mounted) return
        if (rows && rows.length > 0) {
          const prices = rows.map((r) => (typeof r.price === 'number' ? r.price : parseInt(r.price || '0')))
          const minPrice = Math.min(...prices)
          setStandardPrice(minPrice)
        } else {
          setStandardPrice(null)
        }
      })
      .catch(() => setStandardPrice(null))
      .finally(() => setLoadingPrices(false))
    return () => {
      mounted = false
    }
  }, [])

  const unitPrice = standardPrice ?? 150

  const subsidyPerTicket = useMemo(() => (ticketCount > 0 ? sponsorAmount / ticketCount : 0), [sponsorAmount, ticketCount])
  const discountedUnitPrice = Math.max(0, unitPrice - subsidyPerTicket)
  const totalStandard = unitPrice * ticketCount
  const totalDiscounted = discountedUnitPrice * ticketCount

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl mb-4">Sponsor-kalkylator</h1>
      <p className="text-muted-foreground mb-6">
        Använd skjutreglagen för att se hur en sponsorinsats påverkar priset per ungdom. Kalkylatorn är endast visuell — för en exakt offert, mejla oss så återkommer vi med detaljerad kostnad.
      </p>

      {/* Explanation section */}
      <div className="mb-8 bg-primary/5 border border-primary/20 p-6">
        <h2 className="font-display text-lg mb-3">Anledningar till att sponsra</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Genom att sponsra kan vi <strong>sänka biljett priserna för ungdomarna</strong>! Sponsorns bidrag delas ut jämnt på alla deltagare, vilket gör att varje biljett blir billigare.
        </p>
        <div className="bg-background border border-border p-4 rounded">
          <p className="text-xs text-muted-foreground mb-2 font-medium">EXEMPEL:</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Sponsorbidrag:</span>
              <span className="font-mono font-bold">1 000 kr</span>
            </div>
            <div className="flex justify-between">
              <span>Antal deltagare:</span>
              <span className="font-mono font-bold">5 st</span>
            </div>
            <div className="flex justify-between">
              <span>Normalt biljett pris:</span>
              <span className="font-mono font-bold">150 kr</span>
            </div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between">
              <span>Subvention per biljett:</span>
              <span className="font-mono font-bold text-primary">200 kr</span>
            </div>
            <div className="flex justify-between">
              <span>Nytt pris per biljett:</span>
              <span className="font-mono font-bold text-primary">-50 kr (gratis!)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 bg-card p-6 border border-border">
        <div>
          <label className="text-sm font-medium">Sponsrad summa (SEK)</label>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex-1">
              <Slider value={[sponsorAmount]} onValueChange={(v) => setSponsorAmount(v[0])} min={0} max={20000} step={100} />
            </div>
            <input 
              type="number" 
              value={sponsorAmount} 
              onChange={(e) => setSponsorAmount(Math.max(0, parseInt(e.target.value || '0')))} 
              className="w-28 p-2 border border-border bg-background text-foreground text-right font-mono" 
              min="0"
              max="20000"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Antal deltagare</label>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex-1">
              <Slider value={[ticketCount]} onValueChange={(v) => setTicketCount(Math.max(1, Math.round(v[0])))} min={1} max={500} step={1} />
            </div>
            <input 
              type="number" 
              value={ticketCount} 
              onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value || '1')))} 
              className="w-28 p-2 border border-border bg-background text-foreground text-right font-mono" 
              min="1"
              max="500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Enhetspris (SEK)</label>
          <div className="flex items-center gap-4 mt-2">
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setStandardPrice(Math.max(0, parseInt(e.target.value || '0')))}
              className="w-40 p-2 border border-border bg-background text-foreground"
              disabled={loadingPrices}
            />
            <div className="text-sm text-muted-foreground">{loadingPrices ? 'Hämtar standardpris...' : 'Hämtade standardpriser används som utgångspunkt.'}</div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Subvention per biljett</p>
              <p className="font-mono text-xl">{subsidyPerTicket.toFixed(0)} kr</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Beräknat pris per ungdom</p>
              <p className="font-mono text-xl">{discountedUnitPrice.toFixed(0)} kr</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Totalt (utan sponsor)</p>
              <p className="font-mono text-lg">{totalStandard.toFixed(0)} kr</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Totalt (med sponsor)</p>
              <p className="font-mono text-lg">{totalDiscounted.toFixed(0)} kr</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-muted-foreground">Vill du att sponsringen går till en specifik grupp? Kontakta oss så hjälper vi till att rikta stödet.</p>
            <a
              href="mailto:elias@lankoping.se?subject=Sponsorförfrågan%20Kalkylator"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
            >
              Mejla oss för exakt kostnad
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

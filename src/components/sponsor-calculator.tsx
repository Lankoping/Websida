'use client'

import { useEffect, useMemo, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { getPublicTicketTypesFn } from '../server/functions/eventTicketTypes'

type SponsorCalculatorLanguage = 'sv' | 'en'

interface SponsorCalculatorProps {
  language?: SponsorCalculatorLanguage
}

const textByLanguage = {
  sv: {
    title: 'Sponsorkalkylator',
    subtitle: 'Se kostnaden for valt antal ungdomar med och utan sponsring.',
    sponsorshipAmount: 'Sponsrad summa',
    teensCount: 'Antal ungdomar',
    regularPricePerTeen: 'Ordinarie pris per ungdom',
    subsidyPerTeen: 'Subvention per ungdom',
    newPricePerTeen: 'Nytt pris per ungdom',
    totalWithoutSponsor: 'Totalt for {count} ungdomar utan sponsor',
    totalWithSponsor: 'Totalt for {count} ungdomar med sponsor',
    quoteText: 'Biljettpriser hamtas automatiskt nar tillgangliga. For exakt offert, mejla',
    us: 'oss',
    loading: 'Hamtar biljettpriser...',
    currency: 'kr',
    locale: 'sv-SE',
    maxAmount: '50 000 kr',
  },
  en: {
    title: 'Sponsor Calculator',
    subtitle: 'See the cost for your selected number of teens with and without sponsorship.',
    sponsorshipAmount: 'Sponsorship Amount',
    teensCount: 'Number of Teens',
    regularPricePerTeen: 'Regular Price per Teen',
    subsidyPerTeen: 'Subsidy per Teen',
    newPricePerTeen: 'New Price per Teen',
    totalWithoutSponsor: 'Total for {count} Teens without Sponsor',
    totalWithSponsor: 'Total for {count} Teens with Sponsor',
    quoteText: 'Ticket prices are fetched automatically when available. For an exact quote, email',
    us: 'us',
    loading: 'Loading ticket prices...',
    currency: 'SEK',
    locale: 'en-US',
    maxAmount: '50,000 SEK',
  },
} as const

export default function SponsorCalculator({ language = 'sv' }: SponsorCalculatorProps) {
  const [sponsorAmount, setSponsorAmount] = useState(5000)
  const [ticketCount, setTicketCount] = useState(50)
  const [standardPrice, setStandardPrice] = useState<number | null>(null)
  const [loadingPrices, setLoadingPrices] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoadingPrices(true)

    getPublicTicketTypesFn()
      .then((rows: any[]) => {
        if (!mounted) return

        if (rows && rows.length > 0) {
          const prices = rows.map((r) => (typeof r.price === 'number' ? r.price : parseInt(r.price || '0', 10)))
          setStandardPrice(Math.min(...prices))
          return
        }

        setStandardPrice(null)
      })
      .catch(() => setStandardPrice(null))
      .finally(() => {
        if (mounted) {
          setLoadingPrices(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  const unitPrice = standardPrice ?? 150
  const text = textByLanguage[language]

  const subsidyPerTicket = useMemo(() => (ticketCount > 0 ? sponsorAmount / ticketCount : 0), [sponsorAmount, ticketCount])
  const discountedUnitPrice = Math.max(0, unitPrice - subsidyPerTicket)

  const totalWithoutSponsor = unitPrice * ticketCount
  const totalWithSponsor = discountedUnitPrice * ticketCount

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-card border border-border p-8 rounded-lg">
        <h2 className="font-bold text-2xl mb-2">{text.title}</h2>
        <p className="text-muted-foreground text-sm mb-8">
          {text.subtitle}
        </p>

        <div className="mb-8">
          <div className="flex justify-between items-baseline mb-3">
            <label className="text-sm font-medium">{text.sponsorshipAmount}</label>
            <span className="text-2xl font-bold text-primary">{sponsorAmount.toLocaleString(text.locale)} {text.currency}</span>
          </div>
          <Slider
            value={[sponsorAmount]}
            onValueChange={(v) => setSponsorAmount(v[0])}
            min={0}
            max={50000}
            step={500}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 {text.currency}</span>
            <span>{text.maxAmount}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-baseline mb-3">
            <label className="text-sm font-medium">{text.teensCount}</label>
            <span className="text-2xl font-bold text-primary">{ticketCount}</span>
          </div>
          <Slider
            value={[ticketCount]}
            onValueChange={(v) => setTicketCount(Math.max(1, Math.round(v[0])))}
            min={1}
            max={200}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>200</span>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{text.regularPricePerTeen}</p>
              <p className="font-mono text-xl font-bold">{unitPrice.toFixed(0)} {text.currency}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{text.subsidyPerTeen}</p>
              <p className="font-mono text-xl font-bold text-primary">-{subsidyPerTicket.toFixed(0)} {text.currency}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{text.newPricePerTeen}</p>
              <p className="font-mono text-xl font-bold text-primary">{discountedUnitPrice.toFixed(0)} {text.currency}</p>
            </div>
          </div>

          <div className="border-t border-primary/20 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs text-muted-foreground mb-1">{text.totalWithoutSponsor.replace('{count}', ticketCount.toString())}</p>
              <p className="font-mono text-2xl font-bold">{totalWithoutSponsor.toFixed(0)} {text.currency}</p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-muted-foreground mb-1">{text.totalWithSponsor.replace('{count}', ticketCount.toString())}</p>
              <p className="font-mono text-2xl font-bold text-primary">{totalWithSponsor.toFixed(0)} {text.currency}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8">
          {text.quoteText}{' '}
          <a href="mailto:elias@lankoping.se" className="underline hover:text-foreground">
            {text.us}
          </a>
          .
        </p>

        {loadingPrices && <p className="text-xs text-muted-foreground text-center mt-3">{text.loading}</p>}
      </div>
    </div>
  )
}

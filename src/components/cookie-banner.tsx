'use client'

import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setIsVisible(false)
  }

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#141210] border-t border-[#C04A2A]/30 p-4 shadow-2xl">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[#F0E8D8] text-sm flex-1">
          <p className="mb-2">
            <strong>Vi använder cookies</strong> för att förbättra din upplevelse, analysera trafik och för säkerhetsändamål. 
            Genom att klicka på "Acceptera" godkänner du vår användning av cookies. 
            Läs mer i vår <Link to="/datapolicy/se" className="text-[#C04A2A] hover:underline">Datapolicy</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={declineCookies}
            className="px-4 py-2 text-sm font-medium text-[#F0E8D8] bg-transparent border border-[#F0E8D8]/20 rounded hover:bg-[#F0E8D8]/10 transition-colors"
          >
            Avvisa
          </button>
          <button 
            onClick={acceptCookies}
            className="px-4 py-2 text-sm font-medium text-[#100E0C] bg-[#C04A2A] rounded hover:bg-[#C04A2A]/90 transition-colors"
          >
            Acceptera
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 text-[#F0E8D8]/60 hover:text-[#F0E8D8] transition-colors ml-2"
            aria-label="Stäng"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

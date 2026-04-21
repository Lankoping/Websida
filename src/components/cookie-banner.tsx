'use client'

import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { X, Cookie } from 'lucide-react'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasConsented, setHasConsented] = useState<boolean | null>(null)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setIsVisible(true)
    } else {
      setHasConsented(consent === 'accepted')
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setHasConsented(true)
    setIsVisible(false)
  }

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setHasConsented(false)
    setIsVisible(false)
    
    // Clear any existing non-essential cookies here if needed
    // For now, we just rely on the 'cookie-consent' flag to prevent setting them
  }

  return (
    <>
      {/* Floating button to reopen preferences */}
      {hasConsented !== null && !isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-4 left-4 z-40 p-3 bg-[#141210] border border-[#C04A2A]/30 rounded-full shadow-lg text-[#F0E8D8] hover:bg-[#1A1816] hover:border-[#C04A2A] transition-all group"
          aria-label="Ändra cookie-inställningar"
          title="Cookie-inställningar"
        >
          <Cookie size={20} className="group-hover:text-[#C04A2A] transition-colors" />
        </button>
      )}

      {/* Main Banner */}
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#141210] border-t border-[#C04A2A]/30 p-4 shadow-2xl">
          <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[#F0E8D8] text-sm flex-1">
              <p className="mb-2">
                <strong>Vi använder cookies</strong> för att förbättra din upplevelse, analysera trafik och för säkerhetsändamål. 
                Genom att klicka på "Acceptera" godkänner du vår användning av cookies. 
                Läs mer i vår <Link to="/datapolicy/se" className="text-[#C04A2A] hover:underline" onClick={() => setIsVisible(false)}>Datapolicy</Link>.
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
              {hasConsented !== null && (
                <button 
                  onClick={() => setIsVisible(false)}
                  className="p-2 text-[#F0E8D8]/60 hover:text-[#F0E8D8] transition-colors ml-2"
                  aria-label="Stäng"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookie-consent')
    if (!hasConsented) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 md:p-8 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-lg shadow-lg p-6 pointer-events-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2 text-foreground">Vi använder cookies</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vi använder cookies för att förbättra din upplevelse på vår webbplats, analysera trafik och anpassa innehåll. Genom att fortsätta använda webbplatsen godkänner du vår användning av cookies.
            {' '}
            <Link to="/datapolicy/se" className="text-primary hover:underline">
              Läs mer i vår datapolicy
            </Link>.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          <Button 
            variant="outline" 
            onClick={() => setIsVisible(false)}
            className="w-full sm:w-auto"
          >
            Avvisa icke-nödvändiga
          </Button>
          <Button 
            onClick={handleAccept}
            className="w-full sm:w-auto"
          >
            Acceptera alla
          </Button>
        </div>
      </div>
    </div>
  )
}

import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getStadgarFn, updateStadgarFn, updateSignatureFn, exportStadgarPdfFn } from '../../server/functions/stadgar'
import { useState } from 'react'

export const Route = createFileRoute('/admin/stadgar')({
  loader: async () => {
    return { stadgar: await getStadgarFn() }
  },
  component: StadgarAdmin,
})

function StadgarAdmin() {
  const { stadgar: initialData } = Route.useLoaderData()
  const router = useRouter()
  const [content, setContent] = useState(initialData?.content || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [signatures, setSignatures] = useState(() => {
    try {
      return JSON.parse(initialData?.signatures || '{}')
    } catch {
      return {}
    }
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateStadgarFn({ data: { content } })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      await router.invalidate()
    } catch (err) {
      alert('Kunde inte spara stadgar: ' + err?.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignatureToggle = async (name: string) => {
    const newValue = !signatures[name]
    setSignatures({ ...signatures, [name]: newValue })
    try {
      await updateSignatureFn({ data: { name, signed: newValue } })
    } catch (err) {
      alert('Kunde inte uppdatera signatur: ' + err?.message)
      setSignatures({ ...signatures, [name]: !newValue })
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const result = await exportStadgarPdfFn()
      // Öppna Google Docs export dialog eller download PDF
      alert('Exportering påbörjad!\n\nI produktion skulle detta exporteras till Google Docs eller som PDF.')
    } catch (err) {
      alert('Kunde inte exportera: ' + err?.message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display text-3xl tracking-wide text-[#F0E8D8] mb-2">Stadgar</h2>
        <p className="text-[#F0E8D8]/60 text-sm">Hantera och godkänn organisationens stadgar</p>
      </div>

      {/* Success message */}
      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-sm text-green-400 text-sm">
          ✓ Stadgar sparade
        </div>
      )}

      {/* Signatures section */}
      <div className="bg-[#141210]/80 border border-[#C04A2A]/20 p-6 rounded-sm mb-8">
        <h3 className="font-display text-lg tracking-wide text-[#F0E8D8] mb-4">Signatur-status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['Elias', 'Victor', 'Tredje'].map((name) => (
            <div
              key={name}
              className="p-4 bg-[#1A1816]/50 border border-[#C04A2A]/20 rounded-sm flex items-center justify-between cursor-pointer hover:border-[#C04A2A]/50 transition-colors"
              onClick={() => handleSignatureToggle(name)}
            >
              <span className="text-[#F0E8D8] font-medium">{name}</span>
              <span className={`text-xl ${signatures[name] ? 'text-green-400' : 'text-red-400/50'}`}>
                {signatures[name] ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Editor section */}
      <div className="bg-[#141210]/80 border border-[#C04A2A]/20 p-6 rounded-sm mb-8">
        <h3 className="font-display text-lg tracking-wide text-[#F0E8D8] mb-4">Innehåll</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 p-4 bg-[#100E0C] border border-[#C04A2A]/20 focus:border-[#C04A2A]/60 outline-none rounded-sm text-[#F0E8D8] text-sm font-mono resize-none"
          placeholder="Stadgar-innehållet..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-[#C04A2A] text-white text-[11px] uppercase tracking-[0.15em] font-medium rounded-sm hover:bg-[#A03A1A] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(192,74,42,0.3)]"
        >
          {isSaving ? 'Sparar...' : 'Spara ändringar'}
        </button>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-6 py-3 bg-[#C04A2A]/20 text-[#C04A2A] border border-[#C04A2A]/50 text-[11px] uppercase tracking-[0.15em] font-medium rounded-sm hover:bg-[#C04A2A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? 'Exporterar...' : '↓ Google Docs Export'}
        </button>
      </div>
    </div>
  )
}

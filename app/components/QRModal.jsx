import { useEffect, useCallback, useRef } from 'react'

/**
 * QR code modal — shows the pre-generated QR data URL and lets the user download it.
 * The QR was generated server-side in the action — no client-side QR library needed.
 */
export default function QRModal({ entry, onClose }) {
  const overlayRef = useRef(null)

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  const download = () => {
    const a    = document.createElement('a')
    a.href     = entry.qrDataUrl
    a.download = `qr-${entry.code}.png`
    a.click()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="QR code"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs pointer-events-auto animate-slide-up text-center">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">QR Code</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-xs"
            >
              ✕
            </button>
          </div>

          {/* QR image */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 inline-block">
            <img
              src={entry.qrDataUrl}
              alt={`QR code for ${entry.shortUrl}`}
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>

          {/* Short URL */}
          <p className="text-brand-600 font-semibold text-sm mb-1">{entry.shortUrl}</p>
          <p className="text-xs text-gray-400 truncate mb-4 px-2">{entry.originalUrl}</p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={download}
              className="flex-1 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 active:scale-95 transition-all"
            >
              Download PNG
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

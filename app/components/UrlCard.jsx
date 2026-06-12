import { useState } from 'react'

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

/**
 * Displays a single shortened URL with copy button, QR trigger, and stats.
 */
export default function UrlCard({ entry, onQR }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(entry.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all animate-fade-in">
      <div className="flex items-start gap-3">

        {/* Icon */}
        <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={entry.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors"
            >
              {entry.shortUrl}
            </a>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400 font-mono">{timeAgo(entry.createdAt)}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{entry.originalUrl}</p>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {entry.clicks} click{entry.clicks !== 1 ? 's' : ''}
            </span>
            <span className="text-xs font-mono text-gray-300">/{entry.code}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={copy}
            title="Copy short URL"
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied
                ? 'bg-green-50 text-green-600 border border-green-200'
                : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-brand-200 hover:text-brand-600'
            }`}
          >
            {copied ? '✓' : 'Copy'}
          </button>
          <button
            onClick={onQR}
            title="Show QR code"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100 hover:border-brand-200 hover:text-brand-600 transition-all"
          >
            QR
          </button>
        </div>

      </div>
    </div>
  )
}

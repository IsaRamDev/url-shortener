import { json, redirect }          from '@remix-run/node'
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import { useState }                from 'react'
import { createUrl, getAllUrls, codeExists } from '../models/urls.server'
import { generateQR }             from '../utils/qr.server'
import { validateUrl, validateAlias } from '../utils/validation.server'
import UrlCard                    from '../components/UrlCard'
import QRModal                    from '../components/QRModal'

/**
 * LOADER — runs on every GET request to /.
 * Fetches all shortened URLs from the store and sends them to the component.
 *
 * In Remix, loaders are the idiomatic way to fetch data for a route —
 * no useEffect, no client-side fetch on mount.
 */
export async function loader({ request }) {
  const urls = getAllUrls()
  return json({ urls })
}

/**
 * ACTION — runs on every POST/PUT/DELETE to /.
 * Handles the shorten form submission entirely on the server:
 *   1. Validates the URL and optional alias
 *   2. Checks for alias conflicts
 *   3. Generates the QR code
 *   4. Persists to the store
 *   5. Returns the new entry (or validation errors)
 *
 * Remix re-runs the loader automatically after a successful action,
 * so the URL list updates without any client-side state management.
 */
export async function action({ request }) {
  const formData   = await request.formData()
  const rawUrl     = formData.get('url')
  const rawAlias   = formData.get('alias')

  // Validate URL
  const { url: originalUrl, error: urlError } = validateUrl(rawUrl)
  if (urlError) return json({ errors: { url: urlError } }, { status: 422 })

  // Validate alias (optional)
  const { code: customCode, error: aliasError } = validateAlias(rawAlias)
  if (aliasError) return json({ errors: { alias: aliasError } }, { status: 422 })

  // Check alias conflict
  if (customCode && codeExists(customCode)) {
    return json({ errors: { alias: `"${customCode}" is already taken.` } }, { status: 409 })
  }

  // Build base URL from the incoming request
  const reqUrl  = new URL(request.url)
  const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`

  // Generate QR code on the server
  const tentativeCode = customCode || 'preview'
  const shortUrl      = `${baseUrl}/${tentativeCode}`
  const qrDataUrl     = await generateQR(shortUrl)

  // Persist
  const entry = createUrl({ originalUrl, shortUrl: `${baseUrl}/`, qrDataUrl, customCode })
  const finalShortUrl = `${baseUrl}/${entry.code}`

  return json({ created: { ...entry, shortUrl: finalShortUrl } })
}

// ── Component ──────────────────────────────────────────────────────────────

export default function Index() {
  const { urls }       = useLoaderData()
  const actionData     = useActionData()
  const navigation     = useNavigation()
  const isSubmitting   = navigation.state === 'submitting'
  const [qrEntry, setQrEntry] = useState(null)
  const [showAlias, setShowAlias] = useState(false)

  const created = actionData?.created
  const errors  = actionData?.errors ?? {}

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-violet-50">

      {/* Hero */}
      <header className="text-center pt-16 pb-10 px-4">
        <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Free · No account needed
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-3">
          Snip<span className="text-brand-600">.</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-sm mx-auto">
          Shorten any URL and get a QR code instantly.
        </p>
      </header>

      {/* Shorten form */}
      <section className="max-w-2xl mx-auto px-4 mb-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/**
           * Using Remix's <Form> component instead of <form>.
           * This enables progressive enhancement — the form works without JS,
           * and with JS it submits via fetch without a full page reload.
           */}
          <Form method="post" className="space-y-4">

            {/* URL input */}
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1.5">
                Long URL
              </label>
              <div className="flex gap-2">
                <input
                  id="url"
                  name="url"
                  type="text"
                  placeholder="https://example.com/very/long/url"
                  autoComplete="off"
                  className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                    errors.url
                      ? 'border-red-300 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-brand-200 focus:border-brand-400'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? 'Shortening…' : 'Shorten ✂️'}
                </button>
              </div>
              {errors.url && <p className="text-red-500 text-xs mt-1.5">{errors.url}</p>}
            </div>

            {/* Custom alias (collapsible) */}
            <div>
              <button
                type="button"
                onClick={() => setShowAlias((v) => !v)}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                {showAlias ? '▾' : '▸'} Custom alias (optional)
              </button>

              {showAlias && (
                <div className="mt-2 animate-fade-in">
                  <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-brand-200 focus-within:border-brand-400 transition-all">
                    <span className="pl-4 text-sm text-gray-400 whitespace-nowrap select-none">
                      snip.link/
                    </span>
                    <input
                      name="alias"
                      type="text"
                      placeholder="my-custom-alias"
                      autoComplete="off"
                      className="flex-1 py-3 pr-4 text-sm focus:outline-none bg-transparent"
                    />
                  </div>
                  {errors.alias && <p className="text-red-500 text-xs mt-1.5">{errors.alias}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Letters, numbers, hyphens only · 3–30 characters
                  </p>
                </div>
              )}
            </div>

          </Form>

          {/* Result card */}
          {created && (
            <div className="mt-5 pt-5 border-t border-gray-100 animate-slide-up">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Your short link is ready
              </p>
              <ResultCard entry={created} onQR={() => setQrEntry(created)} />
            </div>
          )}
        </div>
      </section>

      {/* URL history */}
      {urls.length > 0 && (
        <section className="max-w-2xl mx-auto px-4 pb-16">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Recent links · {urls.length}
          </h2>
          <div className="space-y-3">
            {urls.map((entry) => (
              <UrlCard key={entry.code} entry={entry} onQR={() => setQrEntry(entry)} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {urls.length === 0 && !created && (
        <div className="text-center pb-20 text-gray-400 text-sm">
          No links yet — shorten your first URL above ↑
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-6 border-t border-gray-100 text-xs text-gray-400">
        Built by{' '}
        <a href="https://isaramdev.com" className="text-brand-500 hover:text-brand-600 underline underline-offset-2">
          Isabel Ramirez
        </a>
        {' '}· Remix + QR Code
      </footer>

      {/* QR Modal */}
      {qrEntry && <QRModal entry={qrEntry} onClose={() => setQrEntry(null)} />}
    </div>
  )
}

/** Inline result card shown right after shortening */
function ResultCard({ entry, onQR }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(entry.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl p-4 animate-pop">
      <div className="flex-1 min-w-0">
        <a
          href={entry.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-600 font-semibold text-base hover:text-brand-700 transition-colors"
        >
          {entry.shortUrl}
        </a>
        <p className="text-xs text-gray-400 truncate mt-0.5">{entry.originalUrl}</p>
      </div>
      <button
        onClick={copy}
        className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
          copied
            ? 'bg-green-100 text-green-600'
            : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
        }`}
      >
        {copied ? '✓ Copied' : 'Copy'}
      </button>
      <button
        onClick={onQR}
        title="Show QR code"
        className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-all"
      >
        QR
      </button>
    </div>
  )
}

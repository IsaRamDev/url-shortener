import { redirect } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { getUrl, recordClick } from '../models/urls.server'

/**
 * LOADER — handles /:code
 *
 * This is the redirect route. When someone visits a short link:
 *   1. Look up the code in the store
 *   2. Record the click (fire-and-forget — don't block the redirect)
 *   3. 301 redirect to the original URL
 *
 * If the code doesn't exist, return a 404 page instead of throwing.
 *
 * This demonstrates Remix's loader pattern for server-side redirects —
 * no client-side JS needed for the core redirect functionality.
 */
export async function loader({ params }) {
  const { code } = params
  const entry = getUrl(code)

  if (!entry) {
    // Return data for the 404 UI below instead of throwing
    return { notFound: true, code }
  }

  // Record the click before redirecting
  recordClick(code)

  // 301 = permanent redirect (browsers cache it — correct for a URL shortener)
  return redirect(entry.originalUrl, { status: 301 })
}

/**
 * This component only renders when the code is NOT found (404 case).
 * When the code IS found, the loader redirects before React ever renders.
 */
export default function CodeRoute() {
  const { code } = useLoaderData()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Link not found</h1>
        <p className="text-gray-500 mb-6">
          <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-sm">/{code}</code>{' '}
          doesn't exist or may have expired.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors"
        >
          ← Back to Snip
        </a>
      </div>
    </div>
  )
}

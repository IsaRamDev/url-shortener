/**
 * In-memory URL store.
 *
 * Uses a module-level Map as a singleton — in Node.js, modules are cached
 * after the first import, so this Map persists across requests for the
 * lifetime of the server process.
 *
 * In production this would be replaced with a database (Prisma + PostgreSQL,
 * PlanetScale, Turso, etc.). The interface stays identical — only this file changes.
 *
 * The `.server.js` suffix tells Remix/Vite to never bundle this for the browser.
 */

/** @type {Map<string, UrlEntry>} */
const store = new Map()

/**
 * @typedef {Object} UrlEntry
 * @property {string}  code        - Short code (e.g. "abc123")
 * @property {string}  originalUrl - Full destination URL
 * @property {string}  shortUrl    - Full short URL (e.g. "http://localhost:5173/abc123")
 * @property {string}  qrDataUrl   - Base64 QR code image
 * @property {number}  clicks      - How many times the link was followed
 * @property {number}  createdAt   - Unix timestamp
 */

const CHARS   = 'abcdefghijklmnopqrstuvwxyz0123456789'
const CODE_LEN = 6

function randomCode() {
  return Array.from({ length: CODE_LEN }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join('')
}

/** Creates and stores a new shortened URL. Returns the entry. */
export function createUrl({ originalUrl, shortUrl, qrDataUrl, customCode }) {
  let code = customCode?.trim().toLowerCase() || randomCode()

  // Make sure auto-generated codes don't collide
  while (!customCode && store.has(code)) code = randomCode()

  const entry = {
    code,
    originalUrl,
    shortUrl,
    qrDataUrl,
    clicks:    0,
    createdAt: Date.now(),
  }

  store.set(code, entry)
  return entry
}

/** Looks up a code. Returns the entry or null. */
export function getUrl(code) {
  return store.get(code) ?? null
}

/** Increments the click counter. */
export function recordClick(code) {
  const entry = store.get(code)
  if (entry) entry.clicks += 1
}

/** Returns all entries sorted newest first. */
export function getAllUrls() {
  return [...store.values()].sort((a, b) => b.createdAt - a.createdAt)
}

/** Returns true if a code is already taken. */
export function codeExists(code) {
  return store.has(code.toLowerCase())
}

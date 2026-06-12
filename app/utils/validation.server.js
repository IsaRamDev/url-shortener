const RESERVED = new Set(['api', 'admin', 'static', 'favicon', 'robots', 'sitemap'])

/**
 * Validates and normalises a URL string.
 * Returns { url } on success or { error } on failure.
 */
export function validateUrl(raw) {
  if (!raw?.trim()) return { error: 'URL is required.' }

  let str = raw.trim()
  if (!/^https?:\/\//i.test(str)) str = 'https://' + str

  try {
    const u = new URL(str)
    if (!u.hostname.includes('.')) return { error: 'Please enter a valid URL.' }
    return { url: u.toString() }
  } catch {
    return { error: 'Please enter a valid URL.' }
  }
}

/**
 * Validates a custom alias.
 * Returns { code } on success or { error } on failure.
 */
export function validateAlias(raw) {
  if (!raw?.trim()) return { code: null }

  const code = raw.trim().toLowerCase()

  if (code.length < 3)           return { error: 'Alias must be at least 3 characters.' }
  if (code.length > 30)          return { error: 'Alias must be 30 characters or less.' }
  if (!/^[a-z0-9-_]+$/.test(code))
    return { error: 'Alias can only contain letters, numbers, hyphens, and underscores.' }
  if (RESERVED.has(code))        return { error: `"${code}" is a reserved word.` }

  return { code }
}

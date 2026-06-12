# ✂️ Snip — URL Shortener

A full-stack URL shortener built with Remix, featuring server-side QR code generation, click tracking, and custom aliases. Demonstrates Remix's loader/action pattern for server-rendered forms with progressive enhancement.

**[Live Demo →](https://your-vercel-url.vercel.app)** · **[Portfolio →](https://isaramdev.com)**

---

## Features

- **Shorten any URL** — auto-generates a 6-character code
- **Custom aliases** — choose your own path (e.g. `snip.link/my-link`)
- **QR code generation** — server-side, included in every shortened link
- **Download QR** — save as PNG directly from the modal
- **Click tracking** — counts every redirect per link
- **Copy to clipboard** — one click
- **Validation** — URL format, alias rules, reserved words, conflict detection
- **301 redirects** — correct HTTP semantics for URL shorteners

---

## Getting Started

```bash
npm install
npm run dev   # http://localhost:5173
```

---

## Tech Stack

| | Choice | Why |
|---|---|---|
| Framework | Remix v2 | Loader/action pattern, progressive enhancement, server-side rendering |
| QR codes | `qrcode` | Server-side generation — no client JS, no external service |
| Styling | Tailwind CSS | Utility-first |
| Storage | In-memory Map | Demonstrates the pattern; swap for Prisma + DB in production |

---

## Architecture Decisions

### Remix loader/action pattern
The index route exports both a `loader` and an `action`:
- **`loader`** runs on every GET — fetches all URLs from the store, sends to the component via `useLoaderData()`
- **`action`** runs on every POST — validates input, generates QR, persists to store, returns the new entry via `useActionData()`

After a successful action, Remix **automatically re-runs the loader**, so the URL list updates without any manual `useState` or client-side fetch. This is the core Remix mental model: mutations go through actions, reads go through loaders.

### Progressive enhancement via `<Form>`
Using Remix's `<Form>` instead of `<form>` means the shortening flow works **without JavaScript** — the form posts to the action, the page re-renders with the result. With JS enabled, Remix intercepts the submit and uses `fetch` instead, avoiding a full page reload. Same code, two levels of capability.

### Server-side QR generation (`.server.js`)
Files named `*.server.js` are never bundled for the browser by Remix/Vite. The `qrcode` npm package (which uses Node.js APIs) runs entirely on the server in the action handler. The generated base64 PNG is sent to the client as a data URL — no client-side QR library needed, no extra network request.

### Module-level Map as singleton store
In Node.js, modules are cached after the first `import`. A `Map` declared at module level in `urls.server.js` persists across all requests for the server process lifetime. It resets on server restart — intentional for this demo. Replacing it with a real DB (Prisma + PostgreSQL, Turso, PlanetScale) only requires changing `urls.server.js`; the routes stay identical.

### 301 vs 302 for redirects
The `$code.jsx` loader returns `redirect(url, { status: 301 })`. A 301 (Permanent Redirect) is semantically correct for a URL shortener — it tells browsers and search engines to update their records. Remix defaults to 302 (Temporary) so the status code is explicit.

---

## Project Structure

```
app/
├── routes/
│   ├── _index.jsx      # Main page — loader (read all) + action (create)
│   └── $code.jsx       # Redirect route — loader looks up + redirects
├── models/
│   └── urls.server.js  # In-memory store (swap for DB here)
├── utils/
│   ├── qr.server.js    # Server-side QR generation
│   └── validation.server.js # URL + alias validation
├── components/
│   ├── UrlCard.jsx     # Link list item
│   └── QRModal.jsx     # QR code modal
└── root.jsx            # HTML shell, links, meta
```

---

## License

MIT

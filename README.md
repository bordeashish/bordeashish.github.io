# Professional AI Assistant Homepage

This is a single-page React app for recruiter engagement, featuring a summary and a chat interface backed by a Cloudflare Worker (which verifies Cloudflare Turnstile and talks to the AWS backend).

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run locally:**
   ```bash
   npm start
   ```
   The app will open at http://localhost:3000

   The chat works out of the box — the Worker URL and Turnstile sitekey are public
   values hardcoded in `src/Chat.js`. To point at a different Worker or sitekey,
   copy `.env.example` to `.env` and set the overrides there.

   Note: the dev server must run on port 3000 exactly — the Worker's origin
   allow-list only includes `http://localhost:3000` (and the production site), so
   requests from the port-3001 fallback are rejected with a 403.

## Deployment (GitHub Pages)

1. Set the `homepage` field in `package.json` to your repo URL.
2. Build and deploy:
   ```bash
   npm run build
   npm run deploy
   ```
3. Enable GitHub Pages in your repo settings, pointing to the `gh-pages` branch.

## Features
- Professional summary section
- Chat interface with session context
- Cloudflare Worker backend with invisible Turnstile bot protection
- Accessibility (ARIA), mobile responsiveness

## File Structure
- `src/` - React components and app code
- `public/` - Static assets and HTML

# Professional AI Assistant Homepage

This is a single-page React app for recruiter engagement, featuring a summary and chat interface with AWS integration. 

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set AWS endpoint (optional):**
   Edit `.env` and set `REACT_APP_AWS_ENDPOINT` to your AWS backend URL.
3. **Run locally:**
   ```bash
   npm start
   ```
   The app will open at http://localhost:3000

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
- AWS endpoint integration (pluggable)
- Accessibility (ARIA), mobile responsiveness
- Fallback logic for local preview

## File Structure
- `src/` - React components and app code
- `public/` - Static assets and HTML

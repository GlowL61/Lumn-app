# Quick Start Guide for Lumn-app on Windows

## Prerequisites
- Install Node.js (v16+) from [nodejs.org](https://nodejs.org/)
- Open project in VS Code

## Backend
1. Open cmd: `cd C:\Path\To\Lumn-app\backend`
2. Install: `npm install` (or `pnpm install`)
3. Start: `npm start` (initializes DB automatically, runs on http://localhost:3000)

## Frontend
1. Open new cmd: `cd C:\Path\To\Lumn-app\frontend`
2. Install: `npm install` (or `pnpm install`)
3. Build/Type check: `npm run build`
4. Start: `npm run dev` (runs on http://localhost:5173)

## Test
- Open browser to http://localhost:5173
- Check browser console for errors
- Test features like price charts and alerts

## Supported Platforms
- Amazon
- eBay
- Walmart
- Best Buy
- Target
- Qwen Coder

## Notes
- Use `pnpm` if preferred over `npm`
- Backend initializes database on first start
- Qwen Coder integration allows tracking of AI coding tools and products
# Rendez-vous

A web app that helps friends find a fair meeting spot. Add everyone's address, pick restaurant or bar, and get a list of nearby venues ranked by fairness — so no one has to travel more than the others.

Built with Svelte 5, Leaflet, and OpenStreetMap data. Runs entirely in the browser, no backend needed.

## Getting Started

```sh
npm install
npm run dev
```

## How It Works

1. Each person enters their address (geocoded via Nominatim)
2. The app computes the geographic centroid of all participants
3. Nearby restaurants or bars are fetched from the Overpass API
4. Venues are ranked by fairness — lowest variance in distance to all friends comes first

## Tech Stack

- **Svelte 5** (runes mode) + **Vite 8**
- **Tailwind CSS 4**
- **Leaflet** for the interactive map
- **Nominatim** for geocoding
- **Overpass API** for venue search

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

# Rendez-vous

A web app that helps friends find a fair meeting spot. Add everyone's address, pick restaurant or bar, and get a list of nearby venues ranked by fairness — so no one has to travel more than the others.

Built with Svelte 5, Leaflet, and OpenStreetMap data. Runs entirely in the browser, no backend needed.

## Getting Started

```sh
npm install
cp src/lib/config.example.js src/lib/config.js
```

Then:

```sh
npm run dev
```

## Features

- Add friends by name (optional) and address
- Two ranking modes: **equidistant** (straight-line distance) or **walking time** (via OpenRouteService)
- ORS API key can be entered in the app UI (click the settings icon) — stored in session only, never persisted
- Walking route visualization on the map with a different color per friend
- Per-friend distance breakdown when selecting a venue
- Save and load groups of addresses (persisted in localStorage)
- km / miles toggle
- Configurable max distance between friends and max number of addresses

## How It Works

1. Each person enters their address (geocoded via Nominatim)
2. The app computes the geographic centroid of all participants
3. Nearby restaurants or bars are fetched from the Overpass API
4. Venues are ranked by fairness — lowest variance in distance (or walking time) to all friends
5. Click a venue to see walking routes from each friend's address

## Configuration

Edit `src/lib/config.js`:

| Variable | Default | Description |
|----------|---------|-------------|
| `ORS_API_KEY` | `''` | OpenRouteService API key (optional — users can enter their own in the UI) |
| `MAX_DISTANCE` | `10` | Max allowed distance between any two friends (in km) |
| `MAX_ADDRESSES` | `10` | Max number of friends/addresses |

## Tech Stack

- **Svelte 5** (runes mode) + **Vite 8**
- **Tailwind CSS 4**
- **Leaflet** for the interactive map
- **Nominatim** for geocoding
- **Overpass API** for venue search
- **OpenRouteService** for walking directions and time matrix

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Deployment

Push a version tag to trigger a release and deploy to GitHub Pages:

```sh
git tag v1.0.0
git push origin v1.0.0
```

This automatically:
1. Bumps `package.json` version
2. Generates release notes from conventional commits
3. Creates a GitHub release
4. Deploys to GitHub Pages

Live at: https://bendns.github.io/rendez-vous/

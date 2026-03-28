# Rendez-vous

A Svelte 5 web app that helps friends find a fair meeting spot (restaurant or bar) based on everyone's location. Users add friends by address, the app geocodes them, computes the centroid, and queries the Overpass API for nearby venues ranked by fairness (equal distance to all participants).

## Tech Stack

- **Framework:** Svelte 5 (runes mode — `$state`, `$derived`, etc.)
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS 4 (via `@tailwindcss/vite` plugin)
- **Map:** Leaflet
- **Geocoding:** Nominatim (OpenStreetMap)
- **Venue data:** Overpass API

## Project Structure

```
src/
  App.svelte          — root layout (header, sidebar, map)
  main.js             — mount point
  app.css             — global styles / Tailwind
  lib/
    stores.svelte.js  — shared state (friends, venues, centroid) and business logic
    AddressInput.svelte — geocoded address input
    FriendList.svelte   — list of added friends
    ModeToggle.svelte   — restaurant / bar toggle
    VenueList.svelte    — ranked venue results
    MapView.svelte      — Leaflet map with markers
```

## Commands

```sh
npm run dev      # start dev server
npm run build    # production build (output: dist/)
npm run preview  # preview production build
```

## External APIs

This app calls these public APIs from the browser (no backend):

- **Nominatim** — address geocoding
- **Overpass API** — OpenStreetMap venue queries

No API keys required. Both are rate-limited; be mindful of request frequency.

## Notes

- No test framework is set up yet.
- No backend — everything runs client-side.
- State management uses Svelte 5 runes (`$state`) in `stores.svelte.js`, exported as shared reactive objects.

# Rendez-vous

A Svelte 5 web app that helps friends find a fair meeting spot (restaurant or bar) based on everyone's location. Users add friends by name and address, the app geocodes them, computes the centroid, and queries the Overpass API for nearby venues ranked by fairness (equal distance or walking time).

## Tech Stack

- **Framework:** Svelte 5 (runes mode — `$state`, `$derived`, etc.)
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS 4 (via `@tailwindcss/vite` plugin)
- **Map:** Leaflet
- **Geocoding:** Nominatim (OpenStreetMap)
- **Venue data:** Overpass API
- **Walking directions & time matrix:** OpenRouteService (requires API key)

## Project Structure

```
src/
  App.svelte              — root layout (header, sidebar, map)
  main.js                 — mount point
  app.css                 — global styles / Tailwind
  lib/
    config.js             — local config with API key and limits (gitignored)
    config.example.js     — config template (committed)
    stores.svelte.js      — shared state (friends, venues, centroid, ranking) and business logic
    groups.svelte.js      — saved groups CRUD with localStorage persistence
    AddressInput.svelte   — geocoded address input with optional name
    FriendList.svelte     — list of added friends
    GroupManager.svelte   — save / load / edit / delete groups
    ModeToggle.svelte     — restaurant / bar toggle
    VenueList.svelte      — ranked venue results with per-friend distance breakdown
    MapView.svelte        — Leaflet map with markers and walking route polylines
```

## Commands

```sh
npm run dev      # start dev server
npm run build    # production build (output: dist/)
npm run preview  # preview production build
```

## External APIs

This app calls these APIs from the browser (no backend):

- **Nominatim** — address geocoding (free, no key)
- **Overpass API** — OpenStreetMap venue queries (free, no key, rate-limited)
- **OpenRouteService** — walking directions and duration matrix (free tier, requires API key in `config.js`)

## Workflow Rules

- Before every commit or push, check that `README.md` and `CLAUDE.md` are up-to-date with any features, config changes, or structural changes introduced. Update them if needed before committing.
- Commit messages must follow conventional commit format: `type(scope): description`. Enforced by the `commit-msg` hook.
- To release: push a tag `v*` (e.g. `git tag v1.0.0 && git push origin v1.0.0`). The workflow bumps `package.json`, generates release notes from conventional commits, creates a GitHub release, and deploys to Pages.

## Notes

- No test framework is set up yet.
- No backend — everything runs client-side.
- State management uses Svelte 5 runes (`$state`) in `stores.svelte.js`, exported as shared reactive objects.
- Saved groups are persisted in `localStorage` (no database).
- `config.js` is gitignored — copy `config.example.js` and adjust values as needed.
- ORS API key is optional in config — users can enter their own key in the app UI (settings icon). Key is stored in `sessionStorage` only (cleared on browser close).

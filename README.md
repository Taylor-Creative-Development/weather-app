# Weather App

A responsive weather dashboard built with React and Vite. It provides current conditions, a five-day forecast, U.S. weather alerts, and an animated radar map.

## Features

- Current conditions for the selected location
- City and ZIP search through Open-Meteo geocoding
- Browser geolocation fallback with a saved last location
- Five-day forecast with daily and hourly detail
- U.S. weather alerts from the National Weather Service
- Animated radar map
  - Primary provider: MapTiler Weather SDK
  - Fallback provider: RainViewer when `VITE_MAPTILER_KEY` is not set
- GitHub Pages deployment through GitHub Actions

## Stack

- React 18
- Vite
- MapTiler SDK and MapTiler Weather
- Leaflet / React Leaflet for the RainViewer fallback
- Open-Meteo for forecast and geocoding
- National Weather Service for U.S. alerts
- GitHub Pages for hosting

## Local Setup

Install dependencies:

```bash
npm ci
```

Create a local environment file:

```bash
cp .env.example .env
```

Add your MapTiler key:

```bash
VITE_MAPTILER_KEY=your_maptiler_key_here
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## MapTiler API Key

The app uses `VITE_MAPTILER_KEY` for the primary animated radar map. This key is browser-exposed by design because the app is static and hosted on GitHub Pages.

Restrict the key in MapTiler Cloud to approved referrers, such as:

- `http://localhost:*`
- `http://127.0.0.1:*`
- The production GitHub Pages URL for this repo

If the key is missing, the app automatically falls back to RainViewer radar.

## Deployment

The app deploys to GitHub Pages from `main` using `.github/workflows/deploy-pages.yml`.

The GitHub Actions build expects `VITE_MAPTILER_KEY` as either a repository variable or secret:

```yaml
VITE_MAPTILER_KEY: ${{ vars.VITE_MAPTILER_KEY || secrets.VITE_MAPTILER_KEY }}
```

Recommended setup:

1. Open the repository settings in GitHub.
2. Go to **Settings -> Secrets and variables -> Actions -> Variables**.
3. Add a repository variable named `VITE_MAPTILER_KEY`.
4. Push to `main` or manually run the Pages workflow.

## Radar Behavior

MapTiler radar uses a lighter street basemap for better map detail and readability. The radar panel supports three playback windows:

- `Next 6h`
- `Next 24h`
- `Full forecast`

The default is `Next 6h` so the animation does not unexpectedly run through the full multi-day forecast.

## Data Sources

- Forecast and geocoding: [Open-Meteo](https://open-meteo.com/)
- U.S. alerts: [National Weather Service API](https://www.weather.gov/documentation/services-web-api)
- Primary radar: [MapTiler Weather](https://www.maptiler.com/weather/)
- Fallback radar: [RainViewer](https://www.rainviewer.com/)

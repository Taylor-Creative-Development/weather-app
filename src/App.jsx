import { useEffect, useMemo, useState } from 'react'
import { getAlerts, getRadarFrame, getWeather, searchLocations } from './weatherApi.js'

const savedLocationKey = 'weather-app:last-location'
const fallbackLocation = {
  name: 'Chicago',
  admin1: 'Illinois',
  country: 'United States',
  countryCode: 'US',
  latitude: 41.8781,
  longitude: -87.6298,
  timezone: 'America/Chicago',
}

export default function App() {
  const [location, setLocation] = useState(() => loadSavedLocation())
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [weather, setWeather] = useState(null)
  const [alerts, setAlerts] = useState({ available: true, alerts: [] })
  const [selectedDay, setSelectedDay] = useState(0)
  const [activeView, setActiveView] = useState('details')
  const [status, setStatus] = useState('Locating...')
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (location) return

    if (!navigator.geolocation) {
      setLocation(fallbackLocation)
      setStatus('Geolocation unavailable. Showing Chicago.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          name: 'Current location',
          countryCode: 'US',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      () => {
        setLocation(fallbackLocation)
        setStatus('Location permission denied. Showing Chicago.')
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 600000 },
    )
  }, [location])

  useEffect(() => {
    if (!location) return
    let cancelled = false

    async function load() {
      setStatus('Loading weather...')
      setError('')
      try {
        const [weatherData, alertData] = await Promise.all([
          getWeather(location),
          getAlerts(location),
        ])

        if (cancelled) return
        setWeather(weatherData)
        setAlerts(alertData)
        setSelectedDay(0)
        setStatus('')
        saveLocation(location)
      } catch (loadError) {
        if (cancelled) return
        setError('Weather data is temporarily unavailable. Try another location or refresh.')
        setStatus('')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [location])

  async function handleSearch(event) {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed.length < 2) return

    setSearching(true)
    setError('')
    try {
      const places = await searchLocations(trimmed)
      setResults(places)
      if (places.length === 0) setError('No matching locations found.')
    } catch {
      setError('Location search is temporarily unavailable.')
    } finally {
      setSearching(false)
    }
  }

  const selected = weather?.days?.[selectedDay]
  const placeName = formatLocation(location)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Weather</p>
          <h1>{placeName}</h1>
          <p className="subtle">{status || weather?.timezone || 'Live forecast'}</p>
        </div>
        <form className="search" onSubmit={handleSearch}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city or ZIP"
            aria-label="Search city or ZIP"
          />
          <button type="submit" disabled={searching}>{searching ? 'Searching' : 'Search'}</button>
        </form>
      </header>

      {results.length > 0 && (
        <section className="results" aria-label="Search results">
          {results.map((place) => (
            <button
              key={`${place.id}-${place.latitude}`}
              onClick={() => {
                setLocation(place)
                setResults([])
                setQuery('')
              }}
            >
              <span>{formatLocation(place)}</span>
              <small>{place.country}</small>
            </button>
          ))}
        </section>
      )}

      {error && <div className="notice error">{error}</div>}

      {weather ? (
        <>
          <main className="dashboard">
            <section className="current-panel">
              <div className={`weather-icon ${weather.current.icon}`} aria-hidden="true" />
              <div>
                <p className="eyebrow">Current conditions</p>
                <div className="temp-line">
                  <span>{round(weather.current.temp)}°</span>
                  <strong>{weather.current.condition}</strong>
                </div>
                <p className="subtle">Feels like {round(weather.current.feelsLike)}°</p>
              </div>
              <MetricGrid
                metrics={[
                  ['Cloud cover', percent(weather.current.cloudCover)],
                  ['Precipitation', inches(weather.current.precipitation)],
                  ['Humidity', percent(weather.current.humidity)],
                  ['Wind', `${round(weather.current.windSpeed)} mph`],
                ]}
              />
            </section>

            <AlertsPanel alerts={alerts} />

            <section className="forecast">
              <div className="section-heading">
                <h2>Five day forecast</h2>
                <div className="view-toggle" aria-label="View">
                  <button className={activeView === 'details' ? 'active' : ''} onClick={() => setActiveView('details')}>Details</button>
                  <button className={activeView === 'radar' ? 'active' : ''} onClick={() => setActiveView('radar')}>Radar</button>
                </div>
              </div>
              <div className="day-strip">
                {weather.days.map((day, index) => (
                  <button
                    key={day.date}
                    className={index === selectedDay ? 'day-card active' : 'day-card'}
                    onClick={() => setSelectedDay(index)}
                  >
                  <span>{day.dayLabel}</span>
                  <div className={`mini-icon ${day.icon}`} aria-hidden="true" />
                  <strong>{round(day.high)}° / {round(day.low)}°</strong>
                  <small>{day.condition}</small>
                  </button>
                ))}
              </div>
            </section>

            {activeView === 'details' && selected && <DayDetails day={selected} />}
            {activeView === 'radar' && <RadarPanel location={location} />}
          </main>
        </>
      ) : (
        <div className="loading-panel">Loading forecast...</div>
      )}
    </div>
  )
}

function AlertsPanel({ alerts }) {
  if (!alerts.available) {
    return <section className="notice">Official NWS alerts are available for U.S. locations only.</section>
  }

  if (alerts.alerts.length === 0) {
    return <section className="notice calm">No active weather alerts for this location.</section>
  }

  return (
    <section className="alerts">
      <h2>Weather alerts</h2>
      {alerts.alerts.map((alert) => (
        <details key={alert.id} open={alerts.alerts.length === 1}>
          <summary>
            <span>{alert.event}</span>
            <strong>{alert.severity}</strong>
          </summary>
          <p>{alert.headline}</p>
          <p className="subtle">{alert.areas}</p>
          <p>{alert.description}</p>
          {alert.instruction && <p className="instruction">{alert.instruction}</p>}
        </details>
      ))}
    </section>
  )
}

function DayDetails({ day }) {
  const daytimeHours = useMemo(() => day.hours.filter((_, index) => index % 3 === 0), [day])

  return (
    <section className="detail-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Day details</p>
          <h2>{day.dayLabel}</h2>
        </div>
        <strong>{day.condition}</strong>
      </div>

      <MetricGrid
        metrics={[
          ['Feels like', `${round(day.feelsHigh)}° / ${round(day.feelsLow)}°`],
          ['Cloud cover', percent(day.cloudCover)],
          ['Precip chance', percent(day.precipitationProbability)],
          ['Precip total', inches(day.precipitation)],
          ['Humidity', percent(day.humidity)],
          ['Max wind', `${round(day.windSpeed)} mph`],
          ['UV index', round(day.uvIndex)],
          ['Sunset', formatTime(day.sunset)],
        ]}
      />

      <div className="hourly">
        {daytimeHours.map((hour) => (
          <div key={hour.time} className="hour">
            <span>{hour.hour}</span>
            <div className={`mini-icon ${hour.icon}`} aria-hidden="true" />
            <strong>{round(hour.temp)}°</strong>
            <small>{percent(hour.precipitationProbability)} rain</small>
          </div>
        ))}
      </div>
    </section>
  )
}

function RadarPanel({ location }) {
  const [frame, setFrame] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadRadar() {
      setError('')
      try {
        const nextFrame = await getRadarFrame()
        if (!cancelled) setFrame(nextFrame)
      } catch {
        if (!cancelled) setError('Radar is temporarily unavailable.')
      }
    }

    loadRadar()
    return () => {
      cancelled = true
    }
  }, [])

  const tiles = useMemo(() => makeTiles(location, frame), [location, frame])

  return (
    <section className="radar-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Radar</p>
          <h2>Live precipitation map</h2>
        </div>
        <a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer">RainViewer</a>
      </div>
      {error && <div className="notice error">{error}</div>}
      <div className="map" aria-label="Radar map">
        {tiles.map((tile) => (
          <div className="tile" key={`${tile.x}-${tile.y}`} style={{ left: tile.left, top: tile.top }}>
            <img src={tile.baseUrl} alt="" />
            {tile.radarUrl && <img className="radar-tile" src={tile.radarUrl} alt="" />}
          </div>
        ))}
        <div className="pin" aria-label="Selected location" />
      </div>
      <p className="subtle">Map tiles by OpenStreetMap. Weather radar by RainViewer.</p>
    </section>
  )
}

function MetricGrid({ metrics }) {
  return (
    <div className="metric-grid">
      {metrics.map(([label, value]) => (
        <div className="metric" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  )
}

function makeTiles(location, frame) {
  const zoom = 6
  const center = latLngToTile(location.latitude, location.longitude, zoom)
  const tiles = []
  const size = 256

  for (let yOffset = -1; yOffset <= 1; yOffset += 1) {
    for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
      const x = center.x + xOffset
      const y = center.y + yOffset
      tiles.push({
        x,
        y,
        left: `calc(50% + ${xOffset * size - size / 2}px)`,
        top: `calc(50% + ${yOffset * size - size / 2}px)`,
        baseUrl: `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`,
        radarUrl: frame ? `https://tilecache.rainviewer.com${frame.path}/256/${zoom}/${x}/${y}/2/1_1.png` : '',
      })
    }
  }

  return tiles
}

function latLngToTile(lat, lon, zoom) {
  const scale = 2 ** zoom
  const x = Math.floor(((lon + 180) / 360) * scale)
  const radians = (lat * Math.PI) / 180
  const y = Math.floor(((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) * scale)
  return { x, y }
}

function loadSavedLocation() {
  try {
    const saved = localStorage.getItem(savedLocationKey)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function saveLocation(location) {
  try {
    localStorage.setItem(savedLocationKey, JSON.stringify(location))
  } catch {
    // Ignore storage errors; the app still works without persistence.
  }
}

function formatLocation(location) {
  if (!location) return 'Finding your location'
  return [location.name, location.admin1].filter(Boolean).join(', ')
}

function formatTime(value) {
  if (!value) return 'N/A'
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

function round(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  return Math.round(value)
}

function percent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  return `${Math.round(value)}%`
}

function inches(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A'
  return `${Number(value).toFixed(2)} in`
}

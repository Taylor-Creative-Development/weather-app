import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Droplets,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Pause,
  Play,
  Radar,
  RefreshCw,
  Search,
  Snowflake,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Umbrella,
  Wind,
} from 'lucide-react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { getAlerts, getRadarTimeline, getWeather, searchLocations } from './weatherApi.js'

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
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (location) return
    locateUser(setLocation, setStatus)
  }, [location])

  useEffect(() => {
    if (!location) return
    let cancelled = false

    async function load() {
      setStatus('Updating forecast...')
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
      } catch {
        if (cancelled) return
        setError('Weather data is temporarily unavailable. Try another location or refresh.')
        setStatus('')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [location, refreshKey])

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

  function useCurrentLocation() {
    setResults([])
    setQuery('')
    setLocation(null)
    setWeather(null)
    setStatus('Locating...')
  }

  const selected = weather?.days?.[selectedDay]
  const placeName = formatLocation(location)
  const accent = weatherAccent(weather?.current?.icon)
  const activeAlerts = alerts.alerts.length

  return (
    <div className="app-shell" style={{ '--accent': accent }}>
      <header className="command-bar">
        <div className="brand-block">
          <div className="brand-mark"><CloudSun size={22} /></div>
          <div>
            <p className="eyebrow">Forecast workspace</p>
            <h1>{placeName}</h1>
          </div>
        </div>

        <form className="search" onSubmit={handleSearch}>
          <Search size={18} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city or ZIP"
            aria-label="Search city or ZIP"
          />
          <button type="submit" disabled={searching}>
            {searching ? <Loader2 className="spin" size={17} /> : 'Search'}
          </button>
        </form>

        <div className="toolbar">
          <button type="button" className="icon-button" onClick={useCurrentLocation} aria-label="Use current location" title="Use current location">
            <LocateFixed size={18} />
          </button>
          <button type="button" className="icon-button" onClick={() => setRefreshKey((value) => value + 1)} aria-label="Refresh forecast" title="Refresh forecast">
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {results.length > 0 && (
        <section className="results" aria-label="Search results">
          {results.map((place) => (
            <button
              key={`${place.id}-${place.latitude}`}
              type="button"
              onClick={() => {
                setLocation(place)
                setResults([])
                setQuery('')
              }}
            >
              <MapPin size={17} aria-hidden="true" />
              <span>{formatLocation(place)}</span>
              <small>{place.country}</small>
            </button>
          ))}
        </section>
      )}

      {error && <div className="notice error"><AlertTriangle size={18} />{error}</div>}

      {weather ? (
        <main className="dashboard">
          <section className="current-panel">
            <div className="current-copy">
              <p className="eyebrow">Current conditions</p>
              <div className="temp-line">
                <span>{round(weather.current.temp)}°</span>
                <div>
                  <strong>{weather.current.condition}</strong>
                  <p>Feels like {round(weather.current.feelsLike)}°</p>
                </div>
              </div>
              <div className="status-row">
                <span><Navigation size={15} /> {weather.timezone}</span>
                <span><RefreshCw size={15} /> {status || 'Live forecast'}</span>
              </div>
            </div>
            <WeatherBadge icon={weather.current.icon} label={weather.current.condition} large />
            <MetricGrid
              metrics={[
                ['Cloud cover', percent(weather.current.cloudCover), Cloud],
                ['Precipitation', inches(weather.current.precipitation), Umbrella],
                ['Humidity', percent(weather.current.humidity), Droplets],
                ['Wind', `${round(weather.current.windSpeed)} mph`, Wind],
              ]}
            />
          </section>

          <AlertsPanel alerts={alerts} />

          <section className="forecast">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Next five days</p>
                <h2>Forecast outlook</h2>
              </div>
              <div className="view-toggle" aria-label="View">
                <button type="button" className={activeView === 'details' ? 'active' : ''} onClick={() => setActiveView('details')}>
                  <CalendarDays size={16} /> Details
                </button>
                <button type="button" className={activeView === 'radar' ? 'active' : ''} onClick={() => setActiveView('radar')}>
                  <Radar size={16} /> Radar
                </button>
              </div>
            </div>
            <div className="day-strip">
              {weather.days.map((day, index) => (
                <button
                  key={day.date}
                  type="button"
                  className={index === selectedDay ? 'day-card active' : 'day-card'}
                  onClick={() => setSelectedDay(index)}
                >
                  <span>{day.dayLabel}</span>
                  <WeatherBadge icon={day.icon} label={day.condition} />
                  <strong>{round(day.high)}° <small>{round(day.low)}°</small></strong>
                  <em>{percent(day.precipitationProbability)} precip</em>
                </button>
              ))}
            </div>
          </section>

          {activeView === 'details' && selected && <DayDetails day={selected} />}
          {activeView === 'radar' && <RadarPanel location={location} />}

          <footer className="page-footer">
            <span>{activeAlerts > 0 ? `${activeAlerts} active alert${activeAlerts === 1 ? '' : 's'}` : 'No active alerts'}</span>
            <span>Weather by Open-Meteo and NWS. Radar by RainViewer.</span>
          </footer>
        </main>
      ) : (
        <div className="loading-panel"><Loader2 className="spin" size={20} /> Loading forecast...</div>
      )}
    </div>
  )
}

function AlertsPanel({ alerts }) {
  if (!alerts.available) {
    return (
      <section className="notice">
        <AlertTriangle size={18} />
        Official NWS alerts are available for U.S. locations only.
      </section>
    )
  }

  if (alerts.alerts.length === 0) {
    return (
      <section className="notice calm">
        <CloudSun size={18} />
        No active weather alerts for this location.
      </section>
    )
  }

  return (
    <section className="alerts">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Warnings</p>
          <h2>Weather alerts</h2>
        </div>
        <span className="alert-count">{alerts.alerts.length}</span>
      </div>
      {alerts.alerts.map((alert) => (
        <details key={alert.id} open={alerts.alerts.length === 1}>
          <summary>
            <span><AlertTriangle size={18} />{alert.event}</span>
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
          <p className="eyebrow">Selected day</p>
          <h2>{day.dayLabel}</h2>
        </div>
        <div className="condition-pill">
          <WeatherIcon icon={day.icon} size={17} />
          {day.condition}
        </div>
      </div>

      <MetricGrid
        metrics={[
          ['Feels like', `${round(day.feelsHigh)}° / ${round(day.feelsLow)}°`, Thermometer],
          ['Cloud cover', percent(day.cloudCover), Cloud],
          ['Precip chance', percent(day.precipitationProbability), Umbrella],
          ['Precip total', inches(day.precipitation), CloudRain],
          ['Humidity', percent(day.humidity), Droplets],
          ['Max wind', `${round(day.windSpeed)} mph`, Wind],
          ['Sunrise', formatTime(day.sunrise), Sunrise],
          ['Sunset', formatTime(day.sunset), Sunset],
        ]}
      />

      <div className="hourly">
        {daytimeHours.map((hour) => (
          <div key={hour.time} className="hour">
            <span>{hour.hour}</span>
            <WeatherIcon icon={hour.icon} size={22} />
            <strong>{round(hour.temp)}°</strong>
            <small>{percent(hour.precipitationProbability)} rain</small>
          </div>
        ))}
      </div>
    </section>
  )
}

function RadarPanel({ location }) {
  const [frames, setFrames] = useState([])
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadRadar() {
      setError('')
      try {
        const timeline = await getRadarTimeline()
        if (!cancelled) {
          setFrames(timeline)
          setFrameIndex(Math.max(0, timeline.length - 1))
        }
      } catch {
        if (!cancelled) setError('Radar is temporarily unavailable.')
      }
    }

    loadRadar()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!playing || frames.length < 2) return
    const id = window.setInterval(() => {
      setFrameIndex((index) => (index + 1) % frames.length)
    }, 850)

    return () => window.clearInterval(id)
  }, [frames.length, playing])

  const currentFrame = frames[frameIndex]

  return (
    <section className="radar-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Radar</p>
          <h2>Live precipitation map</h2>
        </div>
        <a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer">RainViewer</a>
      </div>
      {error && <div className="notice error"><AlertTriangle size={18} />{error}</div>}
      <div className="map" aria-label="Radar map">
        <MapContainer center={[location.latitude, location.longitude]} zoom={7} scrollWheelZoom className="leaflet-map">
          <RecenterMap location={location} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {currentFrame && (
            <TileLayer
              key={currentFrame.path}
              attribution='Weather radar by <a href="https://www.rainviewer.com/">RainViewer</a>'
              className="radar-tile"
              opacity={0.72}
              url={currentFrame.tileUrl}
            />
          )}
          <CircleMarker
            center={[location.latitude, location.longitude]}
            radius={8}
            pathOptions={{ color: '#ffffff', fillColor: '#22d3ee', fillOpacity: 1, weight: 3 }}
          >
            <Popup>{formatLocation(location)}</Popup>
          </CircleMarker>
        </MapContainer>
      </div>
      <div className="radar-controls">
        <button type="button" onClick={() => setPlaying((value) => !value)} disabled={frames.length < 2}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min="0"
          max={Math.max(0, frames.length - 1)}
          value={frameIndex}
          onChange={(event) => {
            setPlaying(false)
            setFrameIndex(Number(event.target.value))
          }}
          disabled={frames.length === 0}
          aria-label="Radar frame"
        />
        <span>{currentFrame ? formatRadarTime(currentFrame.time) : 'Loading radar...'}</span>
      </div>
      <p className="subtle">Animated radar uses RainViewer past and nowcast frames. Map tiles by OpenStreetMap.</p>
    </section>
  )
}

function RecenterMap({ location }) {
  const map = useMap()

  useEffect(() => {
    map.setView([location.latitude, location.longitude], map.getZoom(), { animate: true })
  }, [location, map])

  return null
}

function MetricGrid({ metrics }) {
  return (
    <div className="metric-grid">
      {metrics.map(([label, value, Icon]) => (
        <div className="metric" key={label}>
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  )
}

function WeatherBadge({ icon, label, large = false }) {
  return (
    <div className={large ? 'weather-badge large' : 'weather-badge'} aria-label={label}>
      <WeatherIcon icon={icon} size={large ? 58 : 28} />
    </div>
  )
}

function WeatherIcon({ icon, size }) {
  const Icon = {
    sun: Sun,
    'cloud-sun': CloudSun,
    cloud: Cloud,
    fog: CloudFog,
    rain: CloudRain,
    snow: Snowflake,
    storm: CloudLightning,
  }[icon] ?? Cloud

  return <Icon size={size} strokeWidth={2.2} aria-hidden="true" />
}

function locateUser(setLocation, setStatus) {
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
}

function weatherAccent(icon) {
  return {
    sun: '#f59e0b',
    'cloud-sun': '#0ea5e9',
    cloud: '#64748b',
    fog: '#94a3b8',
    rain: '#2563eb',
    snow: '#38bdf8',
    storm: '#7c3aed',
  }[icon] ?? '#0f766e'
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

function formatRadarTime(value) {
  if (!value) return 'Radar frame'
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value * 1000))
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

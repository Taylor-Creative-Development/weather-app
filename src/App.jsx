import { useEffect, useMemo, useRef, useState } from 'react'
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
import { CircleMarker, MapContainer, Pane, Popup as LeafletPopup, TileLayer, useMap } from 'react-leaflet'
import { getAlerts, getRadarTimeline, getWeather, searchLocations } from './weatherApi.js'

const savedLocationKey = 'weather-app:last-location'
const stateAbbreviations = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
  'District of Columbia': 'DC',
}
const radarBaseMap = {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  labelsUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
}
const mapMaxZoom = 8
const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY?.trim()
const mapTilerAnimationSpeed = 3600
const radarPreloadFrameCount = 2
const radarFrameInterval = 1400
const radarLayerOpacity = 0.82
const radarMaxNativeZoom = 7
const radarTransitionMs = 650
const radarLabelOpacity = 0.68
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
  const titleScale = getTitleScale(placeName)
  const accent = weatherAccent(weather?.current?.icon)
  const activeAlerts = alerts.alerts.length
  const radarProvider = mapTilerKey ? 'MapTiler Weather' : 'RainViewer'

  return (
    <div className="app-shell" style={{ '--accent': accent }}>
      <header className="command-bar">
        <div className="brand-block">
          <div className="brand-mark"><CloudSun size={22} /></div>
          <div>
            <h1 style={{ '--title-scale': titleScale }}>{placeName}</h1>
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
            <span>Weather by Open-Meteo and NWS. Radar by {radarProvider}.</span>
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
  if (!mapTilerKey) return <RainViewerRadarPanel location={location} />
  return <MapTilerRadarPanel location={location} />
}

function MapTilerRadarPanel({ location }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const radarLayerRef = useRef(null)
  const [timeRange, setTimeRange] = useState(null)
  const [radarTime, setRadarTime] = useState(null)
  const [playing, setPlaying] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!mapContainerRef.current) return undefined

    let cancelled = false
    let map = null
    let marker = null
    let radarLayer = null
    let removeListeners = () => {}

    setError('')
    setTimeRange(null)
    setRadarTime(null)
    setPlaying(true)

    async function initializeMap() {
      try {
        const [{ config, Map, MapStyle, Marker, Popup }, { RadarLayer }] = await Promise.all([
          import('@maptiler/sdk'),
          import('@maptiler/weather'),
          import('@maptiler/sdk/style.css'),
        ])

        if (cancelled || !mapContainerRef.current) return

        config.apiKey = mapTilerKey

        map = new Map({
          container: mapContainerRef.current,
          style: MapStyle.DATAVIZ.DARK,
          center: [location.longitude, location.latitude],
          zoom: 9,
          minZoom: 3,
          maxZoom: 13,
          geolocateControl: false,
          navigationControl: 'top-right',
          scaleControl: true,
          attributionControl: {
            compact: 'auto',
            customAttribution: 'Weather radar by MapTiler',
          },
        })

        radarLayer = new RadarLayer({
          id: 'weather-radar',
          opacity: 0.76,
          smooth: true,
        })

        mapRef.current = map
        radarLayerRef.current = radarLayer

        const updateTimeline = () => {
          const start = radarLayer.getAnimationStart()
          const end = radarLayer.getAnimationEnd()
          const current = radarLayer.getAnimationTime()
          if (!Number.isFinite(start) || !Number.isFinite(end)) return
          setTimeRange({ start, end })
          setRadarTime(Number.isFinite(current) ? current : end)
        }

        const handleSourceReady = () => {
          updateTimeline()
          radarLayer.animateByFactor(mapTilerAnimationSpeed)
        }

        const handleTick = (event) => {
          setRadarTime(event.time)
        }

        const handleMapError = () => {
          setError('MapTiler radar is temporarily unavailable.')
        }

        radarLayer.on('sourceReady', handleSourceReady)
        radarLayer.on('tick', handleTick)
        map.on('error', handleMapError)

        map.on('load', () => {
          try {
            const firstSymbolLayer = map.getStyle().layers?.find((layer) => layer.type === 'symbol')?.id
            map.addLayer(radarLayer, firstSymbolLayer)
            marker = new Marker({ color: '#22d3ee' })
              .setLngLat([location.longitude, location.latitude])
              .setPopup(new Popup().setText(formatLocation(location)))
              .addTo(map)
            markerRef.current = marker
          } catch {
            setError('MapTiler radar is temporarily unavailable.')
          }
        })

        removeListeners = () => {
          radarLayer.animateByFactor(0)
          radarLayer.off('sourceReady', handleSourceReady)
          radarLayer.off('tick', handleTick)
          map.off('error', handleMapError)
        }
      } catch {
        if (!cancelled) setError('MapTiler radar is temporarily unavailable.')
      }
    }

    initializeMap()

    return () => {
      cancelled = true
      removeListeners()
      marker?.remove()
      map?.remove()
      mapRef.current = null
      markerRef.current = null
      radarLayerRef.current = null
    }
  }, [location])

  function togglePlayback() {
    const radarLayer = radarLayerRef.current
    if (!radarLayer) return

    setPlaying((value) => {
      const next = !value
      radarLayer.animateByFactor(next ? mapTilerAnimationSpeed : 0)
      return next
    })
  }

  function scrubTimeline(value) {
    const time = Number(value)
    const radarLayer = radarLayerRef.current
    if (!radarLayer) return
    radarLayer.animateByFactor(0)
    radarLayer.setAnimationTime(time)
    setPlaying(false)
    setRadarTime(time)
  }

  return (
    <section className="radar-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Radar</p>
          <h2>Live precipitation map</h2>
        </div>
        <a href="https://www.maptiler.com/weather/" target="_blank" rel="noreferrer">MapTiler</a>
      </div>
      {error && <div className="notice error"><AlertTriangle size={18} />{error}</div>}
      <div className="map" aria-label="Radar map">
        <div ref={mapContainerRef} className="maptiler-map" />
      </div>
      <div className="radar-controls">
        <button type="button" onClick={togglePlayback} disabled={!timeRange}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <input
          type="range"
          min={timeRange?.start ?? 0}
          max={timeRange?.end ?? 0}
          step="900"
          value={radarTime ?? timeRange?.end ?? 0}
          onChange={(event) => scrubTimeline(event.target.value)}
          disabled={!timeRange}
          aria-label="Radar time"
        />
        <span>{radarTime ? formatMapTilerTime(radarTime) : 'Loading radar...'}</span>
      </div>
      <p className="subtle">Animated radar uses MapTiler Weather data and MapTiler Cloud basemaps.</p>
    </section>
  )
}

function RainViewerRadarPanel({ location }) {
  const [frames, setFrames] = useState([])
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [error, setError] = useState('')
  const [visibleFrame, setVisibleFrame] = useState(null)
  const [previousFrame, setPreviousFrame] = useState(null)
  const [frameFadeIn, setFrameFadeIn] = useState(true)
  const fadeRequestRef = useRef(null)

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
    }, radarFrameInterval)

    return () => window.clearInterval(id)
  }, [frames.length, playing])

  const currentFrame = frames[frameIndex]

  useEffect(() => {
    if (!currentFrame) return
    setVisibleFrame((frame) => {
      if (!frame || frame.path === currentFrame.path) return currentFrame
      setPreviousFrame(frame)
      setFrameFadeIn(false)
      fadeRequestRef.current = window.requestAnimationFrame(() => {
        fadeRequestRef.current = window.requestAnimationFrame(() => {
          setFrameFadeIn(true)
        })
      })
      return currentFrame
    })

    return () => {
      if (fadeRequestRef.current) window.cancelAnimationFrame(fadeRequestRef.current)
    }
  }, [currentFrame])

  useEffect(() => {
    if (!previousFrame || !frameFadeIn) return
    const id = window.setTimeout(() => {
      setPreviousFrame(null)
    }, radarTransitionMs)

    return () => window.clearTimeout(id)
  }, [frameFadeIn, previousFrame])

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
        <MapContainer center={[location.latitude, location.longitude]} maxZoom={mapMaxZoom} zoom={8} scrollWheelZoom className="leaflet-map">
          <RecenterMap location={location} />
          <RadarFramePreloader frames={frames} frameIndex={frameIndex} />
          <TileLayer
            attribution={radarBaseMap.attribution}
            className="radar-base-tile"
            maxZoom={mapMaxZoom}
            url={radarBaseMap.url}
          />
          <Pane name="radar" style={{ zIndex: 300 }}>
            {previousFrame && (
              <TileLayer
                key={`previous-${previousFrame.path}`}
                attribution='Weather radar by <a href="https://www.rainviewer.com/">RainViewer</a>'
                className="radar-tile radar-tile-previous"
                maxNativeZoom={radarMaxNativeZoom}
                maxZoom={mapMaxZoom}
                opacity={frameFadeIn ? 0 : radarLayerOpacity}
                updateWhenIdle
                url={previousFrame.tileUrl}
                zIndex={1}
              />
            )}
            {visibleFrame && (
              <TileLayer
                key={`current-${visibleFrame.path}`}
                attribution='Weather radar by <a href="https://www.rainviewer.com/">RainViewer</a>'
                className="radar-tile radar-tile-current"
                maxNativeZoom={radarMaxNativeZoom}
                maxZoom={mapMaxZoom}
                opacity={!previousFrame || frameFadeIn ? radarLayerOpacity : 0}
                updateWhenIdle
                url={visibleFrame.tileUrl}
                zIndex={2}
              />
            )}
          </Pane>
          <Pane name="radar-labels" style={{ zIndex: 350 }}>
            <TileLayer
              attribution={radarBaseMap.attribution}
              className="radar-label-tile"
              maxZoom={mapMaxZoom}
              opacity={radarLabelOpacity}
              url={radarBaseMap.labelsUrl}
            />
          </Pane>
          <CircleMarker
            center={[location.latitude, location.longitude]}
            radius={8}
            pathOptions={{ color: '#ffffff', fillColor: '#22d3ee', fillOpacity: 1, weight: 3 }}
          >
            <LeafletPopup>{formatLocation(location)}</LeafletPopup>
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
        <span>{visibleFrame ? formatRadarTime(visibleFrame.time) : 'Loading radar...'}</span>
      </div>
      <p className="subtle">Animated radar uses RainViewer past and nowcast frames. Map tiles use OpenStreetMap data.</p>
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

function RadarFramePreloader({ frames, frameIndex }) {
  const map = useMap()

  useEffect(() => {
    if (frames.length < 2) return undefined

    const preload = () => {
      const zoom = Math.min(Math.round(map.getZoom()), radarMaxNativeZoom)
      const center = map.project(map.getCenter(), zoom)
      const halfSize = map.getSize().divideBy(2)
      const minTile = center.subtract(halfSize).divideBy(256).floor()
      const maxTile = center.add(halfSize).divideBy(256).floor()

      for (let offset = 1; offset <= radarPreloadFrameCount; offset += 1) {
        const frame = frames[(frameIndex + offset) % frames.length]
        if (!frame) continue

        for (let x = minTile.x; x <= maxTile.x; x += 1) {
          for (let y = minTile.y; y <= maxTile.y; y += 1) {
            const image = new Image()
            image.src = frame.tileUrl
              .replace('{z}', String(zoom))
              .replace('{x}', String(x))
              .replace('{y}', String(y))
          }
        }
      }
    }

    preload()
    map.on('moveend zoomend', preload)

    return () => {
      map.off('moveend zoomend', preload)
    }
  }, [frameIndex, frames, map])

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
  return [location.name, formatAdminArea(location)].filter(Boolean).join(', ')
}

function formatAdminArea(location) {
  if (!location?.admin1) return ''
  if (location.countryCode === 'US') return stateAbbreviations[location.admin1] ?? location.admin1
  return location.admin1
}

function getTitleScale(value) {
  if (!value) return 1
  if (value.length <= 18) return 1
  if (value.length <= 28) return 0.9
  if (value.length <= 38) return 0.78
  return 0.68
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

function formatMapTilerTime(value) {
  if (!value) return 'Radar time'
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
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

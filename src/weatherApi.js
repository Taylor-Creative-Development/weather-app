const OPEN_METEO_FORECAST = 'https://api.open-meteo.com/v1/forecast'
const OPEN_METEO_GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search'
const NWS_ALERTS = 'https://api.weather.gov/alerts/active'
const RAINVIEWER = 'https://api.rainviewer.com/public/weather-maps.json'
const RAINVIEWER_TILE_SIZE = 256
const RAINVIEWER_COLOR_SCHEME = 2
const RAINVIEWER_TILE_OPTIONS = '1_1'

const weatherCodes = {
  0: ['Clear', 'sun'],
  1: ['Mostly clear', 'sun'],
  2: ['Partly cloudy', 'cloud-sun'],
  3: ['Overcast', 'cloud'],
  45: ['Fog', 'fog'],
  48: ['Rime fog', 'fog'],
  51: ['Light drizzle', 'rain'],
  53: ['Drizzle', 'rain'],
  55: ['Heavy drizzle', 'rain'],
  56: ['Freezing drizzle', 'rain'],
  57: ['Freezing drizzle', 'rain'],
  61: ['Light rain', 'rain'],
  63: ['Rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  66: ['Freezing rain', 'rain'],
  67: ['Freezing rain', 'rain'],
  71: ['Light snow', 'snow'],
  73: ['Snow', 'snow'],
  75: ['Heavy snow', 'snow'],
  77: ['Snow grains', 'snow'],
  80: ['Light showers', 'rain'],
  81: ['Showers', 'rain'],
  82: ['Heavy showers', 'rain'],
  85: ['Snow showers', 'snow'],
  86: ['Heavy snow showers', 'snow'],
  95: ['Thunderstorm', 'storm'],
  96: ['Thunderstorm with hail', 'storm'],
  99: ['Severe thunderstorm', 'storm'],
}

export function describeWeather(code) {
  const [label, icon] = weatherCodes[code] ?? ['Unknown', 'cloud']
  return { condition: label, icon }
}

export async function searchLocations(query) {
  const params = new URLSearchParams({
    name: query,
    count: '8',
    language: 'en',
    format: 'json',
  })
  const data = await fetchJson(`${OPEN_METEO_GEOCODE}?${params}`)
  return (data.results ?? []).map((place) => ({
    id: place.id,
    name: place.name,
    admin1: place.admin1,
    country: place.country,
    countryCode: place.country_code,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone,
  }))
}

export async function getWeather(location) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'sunrise',
      'sunset',
      'uv_index_max',
      'cloud_cover_mean',
      'relative_humidity_2m_mean',
    ].join(','),
    forecast_days: '5',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timezone: 'auto',
  })
  const data = await fetchJson(`${OPEN_METEO_FORECAST}?${params}`)
  return normalizeWeather(data)
}

export async function getAlerts(location) {
  if (location.countryCode && location.countryCode !== 'US') {
    return { available: false, alerts: [] }
  }

  const params = new URLSearchParams({
    point: `${location.latitude},${location.longitude}`,
  })

  try {
    const data = await fetchJson(`${NWS_ALERTS}?${params}`, {
      headers: {
        Accept: 'application/geo+json',
      },
    })

    return {
      available: true,
      alerts: (data.features ?? []).map((feature) => {
        const props = feature.properties ?? {}
        return {
          id: feature.id,
          event: props.event,
          headline: props.headline,
          severity: props.severity,
          urgency: props.urgency,
          areas: props.areaDesc,
          effective: props.effective,
          expires: props.expires,
          description: props.description,
          instruction: props.instruction,
        }
      }),
    }
  } catch (error) {
    if (error.status === 404 || error.status === 400) {
      return { available: false, alerts: [] }
    }
    throw error
  }
}

export async function getRadarTimeline() {
  const data = await fetchJson(RAINVIEWER)
  const frames = [...(data.radar?.past ?? []), ...(data.radar?.nowcast ?? [])]
  const host = data.host ?? 'https://tilecache.rainviewer.com'

  return frames.map((frame) => ({
    ...frame,
    tileUrl: `${host}${frame.path}/${RAINVIEWER_TILE_SIZE}/{z}/{x}/{y}/${RAINVIEWER_COLOR_SCHEME}/${RAINVIEWER_TILE_OPTIONS}.png`,
  }))
}

function normalizeWeather(data) {
  const current = data.current ?? {}
  const daily = data.daily ?? {}
  const hourly = data.hourly ?? {}

  const days = (daily.time ?? []).map((date, index) => {
    const hours = (hourly.time ?? [])
      .map((time, hourIndex) => ({ time, hourIndex }))
      .filter(({ time }) => time.startsWith(date))
      .map(({ time, hourIndex }) => ({
        time,
        hour: formatHour(time),
        temp: hourly.temperature_2m?.[hourIndex],
        feelsLike: hourly.apparent_temperature?.[hourIndex],
        humidity: hourly.relative_humidity_2m?.[hourIndex],
        precipitation: hourly.precipitation?.[hourIndex],
        precipitationProbability: hourly.precipitation_probability?.[hourIndex],
        cloudCover: hourly.cloud_cover?.[hourIndex],
        windSpeed: hourly.wind_speed_10m?.[hourIndex],
        ...describeWeather(hourly.weather_code?.[hourIndex]),
      }))

    return {
      date,
      dayLabel: formatDay(date),
      high: daily.temperature_2m_max?.[index],
      low: daily.temperature_2m_min?.[index],
      feelsHigh: daily.apparent_temperature_max?.[index],
      feelsLow: daily.apparent_temperature_min?.[index],
      precipitation: daily.precipitation_sum?.[index],
      precipitationProbability: daily.precipitation_probability_max?.[index],
      cloudCover: daily.cloud_cover_mean?.[index],
      humidity: daily.relative_humidity_2m_mean?.[index],
      windSpeed: daily.wind_speed_10m_max?.[index],
      sunrise: daily.sunrise?.[index],
      sunset: daily.sunset?.[index],
      uvIndex: daily.uv_index_max?.[index],
      hours,
      ...describeWeather(daily.weather_code?.[index]),
    }
  })

  return {
    generatedAt: current.time,
    timezone: data.timezone,
    units: {
      temperature: data.current_units?.temperature_2m ?? '°F',
      wind: data.current_units?.wind_speed_10m ?? 'mph',
      precipitation: data.current_units?.precipitation ?? 'in',
    },
    current: {
      temp: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      cloudCover: current.cloud_cover,
      windSpeed: current.wind_speed_10m,
      windGusts: current.wind_gusts_10m,
      ...describeWeather(current.weather_code),
    },
    days,
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)
  if (!response.ok) {
    const error = new Error(`Request failed: ${response.status}`)
    error.status = response.status
    throw error
  }
  return response.json()
}

function formatDay(value) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function formatHour(value) {
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
  }).format(new Date(value))
}

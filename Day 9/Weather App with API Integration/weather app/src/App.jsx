import { useEffect, useMemo, useState } from 'react';
import WeatherGraphic from './components/WeatherGraphic';
import ForecastCards from './components/ForecastCards';
import {
  fetchForecast,
  fetchLocationWeather,
  fetchSuggestions,
  formatAQI,
  formatDate,
  formatTime,
  getMapEmbedUrl,
  getMapUrl,
  getWeatherTheme,
} from './weatherApi';

export default function App() {
  const [query, setQuery] = useState('Nagpur');
  const [units, setUnits] = useState('metric');
  const [results, setResults] = useState([]);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (location) => {
    if (!location) return;

    setLoading(true);
    setError('');

    try {
      const data = await fetchForecast(location);

      setWeather(data);
      setResults([]);
    } catch (err) {
      setError(err.message || 'Unable to fetch weather data right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Nagpur');
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      try {
        const data = await fetchSuggestions(query);
        setResults(data || []);
      } catch {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const data = await fetchLocationWeather(coords.latitude, coords.longitude);

          setWeather(data);
          setQuery(data.location.name);
        } catch (err) {
          setError(err.message || 'Failed to load your current location weather.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError('Location permission was denied. You can still search for a city manually.');
      }
    );
  };

  const tempLabel = units === 'metric' ? '°C' : '°F';

  const formattedWeather = useMemo(() => {
    if (!weather) return null;

    const current = weather.current;
    const today = weather.forecast?.forecastday?.[0] || null;
    const aqiValue = current.air_quality?.['us-epa-index'];

    return {
      location: weather.location,
      current: {
        temperature: units === 'metric' ? current.temp_c : current.temp_f,
        feelsLike: units === 'metric' ? current.feelslike_c : current.feelslike_f,
        wind: units === 'metric' ? current.wind_kph : current.wind_mph,
        humidity: current.humidity,
        pressure: current.pressure_mb,
        visibility: units === 'metric' ? current.vis_km : current.vis_miles,
        uv: current.uv,
        condition: current.condition.text,
        icon: current.condition.icon,
        lastUpdated: current.last_updated,
      },
      today,
      hourly: (today?.hour || []).slice(0, 8).map((item) => ({
        time: item.time,
        label: new Date(item.time).toLocaleTimeString([], { hour: 'numeric' }),
        temperature: units === 'metric' ? item.temp_c : item.temp_f,
        text: item.condition.text,
        icon: item.condition.icon,
        wind: units === 'metric' ? item.wind_kph : item.wind_mph,
        rain: item.chance_of_rain,
      })),
      daily: (weather.forecast?.forecastday || []).map((day) => ({
        date: day.date,
        label: formatDate(day.date),
        max: units === 'metric' ? day.day.maxtemp_c : day.day.maxtemp_f,
        min: units === 'metric' ? day.day.mintemp_c : day.day.mintemp_f,
        text: day.day.condition.text,
        icon: day.day.condition.icon,
        rain: day.day.daily_chance_of_rain,
        sunrise: day.astro.sunrise,
        sunset: day.astro.sunset,
      })),
      alerts: weather.alerts?.alert || [],
      aqi: {
        value: aqiValue,
        label: formatAQI(aqiValue),
      },
    };
  }, [weather, units]);

  const weatherTheme = getWeatherTheme(formattedWeather?.current?.condition || '');

  const lookingAheadNotes = useMemo(() => [
    'Looking ahead: clouds are drifting in, so the sky may turn brighter before the next shower.',
    'Looking ahead: keep an eye on wind shifts and rain chances as the day moves on.',
    'Looking ahead: the next update may bring warmer air, calmer skies, or a fresh storm alert.',
    'Looking ahead: forecast changes can happen quickly, so this panel keeps the next hour in view.',
  ], [weatherTheme]);

  const [noteIndex, setNoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNoteIndex((current) => (current + 1) % lookingAheadNotes.length);
    }, 3200);

    return () => clearInterval(interval);
  }, [lookingAheadNotes]);

  const liveSummary = useMemo(() => {
    if (!formattedWeather) {
      return {
        headline: 'Tracking live conditions...',
        copy: 'The dashboard is syncing the latest weather data and turning it into a richer live view.',
        chips: [],
      };
    }

    const rainChance = formattedWeather.today?.day?.daily_chance_of_rain ?? 0;
    const condition = formattedWeather.current?.condition || 'Current weather';
    const aqiLabel = formattedWeather.aqi?.label || 'Unknown';

    const themeLabel =
      weatherTheme === 'stormy' ? 'Storm watch' :
      weatherTheme === 'rainy' ? 'Rainy breeze' :
      weatherTheme === 'sunny' ? 'Sunny glow' :
      weatherTheme === 'cloudy' ? 'Cloud drift' :
      'Misty calm';

    return {
      headline: `${themeLabel} • ${condition}`,
      copy: `The live panel is updating with ${rainChance}% rain chance, UV ${formattedWeather.current?.uv ?? '—'}, and ${aqiLabel.toLowerCase()} air quality for ${formattedWeather.location?.name || 'your location'}.`,
      chips: [
        `${condition}`,
        `${rainChance}% rain chance`,
        `AQI ${aqiLabel}`,
        `UV ${formattedWeather.current?.uv ?? '—'}`,
      ],
    };
  }, [formattedWeather, weatherTheme]);

  return (
    <main className="app-shell">
      <section className="panel hero-card">
        <div>
          <p className="eyebrow">WeatherFlow</p>
          <h1>Real weather at a glance.</h1>
          <p className="lede">Powered by WeatherAPI, this dashboard shows live conditions, alerts, air quality, map links, and a 7-day outlook in one place.</p>
          <p className="lede accent-note">Looking ahead: the forecast, alerts, and live visuals update together so you can spot changes before they arrive.</p>
        </div>
        <div className="chip-row">
          <button className={units === 'metric' ? 'chip active' : 'chip'} onClick={() => setUnits('metric')}>°C</button>
          <button className={units === 'imperial' ? 'chip active' : 'chip'} onClick={() => setUnits('imperial')}>°F</button>
          <button className="chip ghost" onClick={useCurrentLocation}>Use my location</button>
        </div>
      </section>

      <WeatherGraphic
        theme={weatherTheme}
        condition={formattedWeather?.current?.condition || 'Loading weather...'}
        rainChance={formattedWeather?.today?.day?.daily_chance_of_rain ?? 0}
        humidity={formattedWeather?.current?.humidity ?? 0}
      />

      <section className="panel looking-ahead-card">
        <div>
          <p className="eyebrow">Looking ahead</p>
          <h3>Live weather notes</h3>
          <p className="lede">These quick comments shift through the forecast mood so the page feels like a live weather site.</p>
        </div>
        <div className="looking-ahead-note" key={lookingAheadNotes[noteIndex]}>
          {lookingAheadNotes[noteIndex]}
        </div>
      </section>

      <section className="panel search-card">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            fetchWeather(query);
          }}
          className="search-bar"
        >
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search city, region, or country"
            aria-label="City search"
          />
          <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Search'}</button>
        </form>
        {results.length > 0 && (
          <ul className="search-results">
            {results.map((item) => (
              <li key={`${item.id || item.name}-${item.lat}-${item.lon}`}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(item.name);
                    fetchWeather(item.name);
                  }}
                >
                  <strong>{item.name}</strong>
                  <span>{item.region ? `${item.region}, ` : ''}{item.country}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && <p className="error-banner">{error}</p>}

      {!formattedWeather ? (
        <section className="panel empty-state animated-empty" aria-live="polite">
          <div className="loading-orb" aria-hidden="true" />
          <div className="loading-copy">
            <p className="eyebrow">Syncing live weather</p>
            <h3>Loading real weather data...</h3>
            <p className="lede">Connecting to WeatherAPI and preparing the forecast visuals for you.</p>
          </div>
          <div className="loading-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </section>
      ) : (
        <>
          {formattedWeather.alerts.length > 0 ? (
            <section className="panel warning-strip">
              <div>
                <p className="eyebrow">Weather warnings</p>
                <h3>Live alerts for this area</h3>
              </div>
              <div className="warning-grid">
                {formattedWeather.alerts.map((alert, index) => (
                  <article key={`${alert.headline}-${index}`} className="warning-card">
                    <div className="warning-icon">⚠️</div>
                    <div>
                      <strong>{alert.event || 'Weather alert'}</strong>
                      <p>{alert.headline || alert.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            <section className="panel warning-strip quiet">
              <div>
                <p className="eyebrow">Weather warnings</p>
                <h3>No active warnings at the moment</h3>
              </div>
              <p className="lede">The live forecast is stable right now. You can still explore the map and forecast cards below.</p>
            </section>
          )}

          <section className="panel weather-grid">
            <article className="current-card">
              <div>
                <p className="eyebrow">Current weather</p>
                <h2>{formattedWeather.location.name}</h2>
                <p className="subtle">{formattedWeather.location.region || ''} · {formattedWeather.location.country}</p>
              </div>
              <div className="temperature-wrap">
                <strong>{formattedWeather.current.temperature.toFixed(0)}{tempLabel}</strong>
                <span>{formattedWeather.current.condition}</span>
                {formattedWeather.current.icon ? <img src={formattedWeather.current.icon} alt="Current weather icon" width="56" height="56" /> : null}
              </div>
              <div className="meta-grid">
                <article>
                  <span>Feels like</span>
                  <strong>{formattedWeather.current.feelsLike.toFixed(0)}{tempLabel}</strong>
                </article>
                <article>
                  <span>Humidity</span>
                  <strong>{formattedWeather.current.humidity}%</strong>
                </article>
                <article>
                  <span>Wind</span>
                  <strong>{formattedWeather.current.wind.toFixed(0)} {units === 'metric' ? 'km/h' : 'mph'}</strong>
                </article>
                <article>
                  <span>Pressure</span>
                  <strong>{Math.round(formattedWeather.current.pressure)} hPa</strong>
                </article>
              </div>
              <div className="live-badge">
                <span className="live-dot" />
                Live data synced from WeatherAPI
              </div>
            </article>

            <article className="info-card">
              <p className="eyebrow">Today at a glance</p>
              <ul className="detail-list">
                <li>
                  <span>Sunrise</span>
                  <strong>{formatTime(formattedWeather.today?.astro?.sunrise)}</strong>
                </li>
                <li>
                  <span>Sunset</span>
                  <strong>{formatTime(formattedWeather.today?.astro?.sunset)}</strong>
                </li>
                <li>
                  <span>Visibility</span>
                  <strong>{formattedWeather.current.visibility.toFixed(0)} {units === 'metric' ? 'km' : 'mi'}</strong>
                </li>
                <li>
                  <span>Last updated</span>
                  <strong>{formattedWeather.current.lastUpdated}</strong>
                </li>
              </ul>
            </article>
          </section>

          <section className="panel weather-grid">
            <article className="info-card live-card">
              <p className="eyebrow">Live weather pulse</p>
              <div className="live-hero">
                <div className="avatar-wrap" aria-hidden="true">🧑‍🌦️</div>
                <div>
                  <h3>Human-style live update</h3>
                  <p className="lede">This panel animates the live weather state with real-time cues, so the dashboard feels more like a live website than a static card.</p>
                </div>
              </div>
              <div className="pulse-grid">
                <article>
                  <span>Updated</span>
                  <strong>{formattedWeather.current.lastUpdated}</strong>
                </article>
                <article>
                  <span>UV index</span>
                  <strong>{formattedWeather.current.uv}</strong>
                </article>
                <article>
                  <span>Forecast trend</span>
                  <strong>{formattedWeather.daily[0]?.text || 'Stable'}</strong>
                </article>
                <article>
                  <span>Rain chance</span>
                  <strong>{formattedWeather.today?.day?.daily_chance_of_rain ?? 0}%</strong>
                </article>
              </div>
            </article>

            <article className="info-card map-card">
              <p className="eyebrow">Live map</p>
              <iframe
                className="map-frame"
                title="Weather map"
                src={getMapEmbedUrl(formattedWeather.location.lat, formattedWeather.location.lon)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a className="map-link" href={getMapUrl(`${formattedWeather.location.name}, ${formattedWeather.location.country}`)} target="_blank" rel="noreferrer">Open full map</a>
            </article>
          </section>

          <section className="panel weather-grid">
            <article className="info-card">
              <p className="eyebrow">Extra weather details</p>
              <div className="meta-grid">
                <article>
                  <span>UV index</span>
                  <strong>{formattedWeather.current.uv}</strong>
                </article>
                <article>
                  <span>Rain chance</span>
                  <strong>{formattedWeather.today?.day?.daily_chance_of_rain ?? 0}%</strong>
                </article>
                <article>
                  <span>Air quality</span>
                  <strong>{formattedWeather.aqi.label}</strong>
                </article>
                <article>
                  <span>US AQI</span>
                  <strong>{formattedWeather.aqi.value ?? 'N/A'}</strong>
                </article>
              </div>
            </article>

          </section>

          {formattedWeather.alerts.length > 0 && (
            <section className="panel">
              <p className="eyebrow">Weather alerts</p>
              <ul className="detail-list">
                {formattedWeather.alerts.map((alert, index) => (
                  <li key={`${alert.headline}-${index}`}>
                    <span>{alert.event || 'Alert'}</span>
                    <strong>{alert.headline || alert.desc}</strong>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ForecastCards
            title="Hourly outlook"
            subtitle="Next 8 hours"
            items={formattedWeather.hourly}
            tempLabel={tempLabel}
            type="hourly"
          />

          <ForecastCards
            title="7-day forecast"
            subtitle="Daily trend"
            items={formattedWeather.daily.map((day) => ({
              ...day,
              sunrise: formatTime(day.sunrise),
              sunset: formatTime(day.sunset),
            }))}
            tempLabel={tempLabel}
            type="daily"
          />
        </>
      )}
    </main>
  );
}

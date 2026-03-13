import { useState, useEffect } from 'react';
import { FiSearch, FiWind, FiDroplet, FiEye, FiThermometer, FiRefreshCw } from 'react-icons/fi';

const WEATHER_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const INDIA_CITIES = ['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai'];
const WORLD_CITIES = ['London', 'New York', 'Tokyo', 'Dubai', 'Sydney'];

const BASE = 'https://api.openweathermap.org/data/2.5/weather';

export default function Weather() {
  const [city, setCity]       = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [unit, setUnit]       = useState('metric');

  const [indiaCards, setIndiaCards] = useState([]);
  const [worldCards, setWorldCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);

  const sym = unit === 'metric' ? '°C' : '°F';

  const fetchCard = async (cityName, u) => {
    try {
      const res = await fetch(`${BASE}?q=${encodeURIComponent(cityName)}&appid=${WEATHER_KEY}&units=${u}`);
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  };

  const loadCards = async (u = unit) => {
    setCardsLoading(true);
    const [india, world] = await Promise.all([
      Promise.all(INDIA_CITIES.map(c => fetchCard(c, u))),
      Promise.all(WORLD_CITIES.map(c => fetchCard(c, u))),
    ]);
    setIndiaCards(india.filter(Boolean));
    setWorldCards(world.filter(Boolean));
    setCardsLoading(false);
  };

  useEffect(() => { loadCards(); }, []);

  const handleSearch = async (q) => {
    const query = (q || city).trim();
    if (!query) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BASE}?q=${encodeURIComponent(query)}&appid=${WEATHER_KEY}&units=${unit}`);
      if (!res.ok) throw new Error(res.status === 404 ? 'City not found' : 'Request failed');
      setWeather(await res.json());
    } catch (e) {
      setError(e.message); setWeather(null);
    } finally { setLoading(false); }
  };

  const toggleUnit = async () => {
    const next = unit === 'metric' ? 'imperial' : 'metric';
    setUnit(next);
    if (weather) {
      const res = await fetch(`${BASE}?q=${encodeURIComponent(weather.name)}&appid=${WEATHER_KEY}&units=${next}`);
      if (res.ok) setWeather(await res.json());
    }
    loadCards(next);
  };

  const getBg = (code) => {
    if (!code) return 'var(--bg-card)';
    if (code >= 200 && code < 300) return 'linear-gradient(135deg,#1a1a2e,#16213e)';
    if (code >= 300 && code < 600) return 'linear-gradient(135deg,#0d1b2a,#1b2838)';
    if (code === 800)               return 'linear-gradient(135deg,#1a1206,#2a1c08)';
    return 'linear-gradient(135deg,#1f1e1d,#252422)';
  };

  const CityCard = ({ data }) => (
    <div
      className="card"
      style={{
        padding: '14px 15px', cursor: 'pointer',
        background: getBg(data.weather[0]?.id),
        borderColor: 'rgba(200,184,154,0.1)',
        transition: 'transform 0.15s, border-color 0.2s',
      }}
      onClick={() => { setCity(data.name); handleSearch(data.name); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
          {data.name}
        </span>
        <img src={`https://openweathermap.org/img/wn/${data.weather[0]?.icon}.png`} alt="" style={{ width: 30, height: 30 }} />
      </div>
      <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 22, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
        {Math.round(data.main.temp)}{sym}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'capitalize' }}>
        {data.weather[0]?.description}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, display: 'flex', gap: 8 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><FiDroplet style={{ fontSize: 10 }} />{data.main.humidity}%</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><FiWind style={{ fontSize: 10 }} />{data.wind?.speed}m/s</span>
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="section-header">
        <h1 className="section-title">Weather Checker</h1>
        <p className="section-desc">Real-time weather — search any city or pick from defaults</p>
      </div>

      {/* Search */}
      <div className="input-group">
        <input
          className="input-field"
          placeholder="Search city... e.g. Pune, Paris, Toronto"
          value={city}
          onChange={e => setCity(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-outline" onClick={toggleUnit} title="Toggle unit">
          <FiThermometer />
          {unit === 'metric' ? 'C to F' : 'F to C'}
        </button>
        <button className="btn btn-primary" onClick={() => handleSearch()}>
          <FiSearch /> Search
        </button>
      </div>

      {/* Search result */}
      {loading && <div className="loading-box" style={{ padding: 24 }}><div className="loader" /></div>}

      {error && (
        <div className="card" style={{ borderColor: 'rgba(192,57,43,0.3)', marginBottom: 20 }}>
          <p style={{ color: '#e74c3c', fontSize: 13 }}>{error}</p>
        </div>
      )}

      {!loading && weather && (
        <div
          className="card"
          style={{
            background: getBg(weather.weather[0]?.id),
            borderColor: 'rgba(200,184,154,0.15)',
            padding: 0, overflow: 'hidden', marginBottom: 28,
          }}
        >
          <div style={{ padding: '22px 22px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 24, fontWeight: 700, color: '#e8e6e1', letterSpacing: -0.4 }}>
                  {weather.name}
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#9e9b94', marginLeft: 8 }}>{weather.sys?.country}</span>
                </h2>
                <p style={{ fontSize: 13, color: '#9e9b94', marginTop: 3, textTransform: 'capitalize' }}>
                  {weather.weather[0]?.description}
                </p>
              </div>
              <img src={`https://openweathermap.org/img/wn/${weather.weather[0]?.icon}@2x.png`} alt="" style={{ width: 60, height: 60 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <span style={{ fontFamily: 'Space Mono,monospace', fontSize: 44, fontWeight: 700, color: '#c8b89a', lineHeight: 1 }}>
                {Math.round(weather.main?.temp)}{sym}
              </span>
              <div style={{ fontSize: 12, color: '#9e9b94' }}>
                <div>Feels like {Math.round(weather.main?.feels_like)}{sym}</div>
                <div>H: {Math.round(weather.main?.temp_max)}{sym} / L: {Math.round(weather.main?.temp_min)}{sym}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 1, background: 'rgba(255,255,255,0.03)' }}>
            {[
              { icon: <FiDroplet />,     label: 'Humidity',   value: `${weather.main?.humidity}%` },
              { icon: <FiWind />,        label: 'Wind',       value: `${weather.wind?.speed} m/s` },
              { icon: <FiEye />,         label: 'Visibility', value: `${(weather.visibility/1000).toFixed(1)} km` },
              { icon: <FiThermometer />, label: 'Pressure',   value: `${weather.main?.pressure} hPa` },
            ].map(s => (
              <div key={s.label} style={{ padding: '13px 16px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#c8b89a', marginBottom: 3 }}>
                  {s.icon}<span style={{ fontSize: 10, color: '#9e9b94' }}>{s.label}</span>
                </div>
                <div style={{ fontFamily: 'Space Mono,monospace', fontSize: 13, color: '#e8e6e1' }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* India Top 5 */}
      <div style={{ marginBottom: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            India — Top 5 Cities
          </h2>
          {!cardsLoading && (
            <button className="btn btn-ghost btn-sm" onClick={() => loadCards()}>
              <FiRefreshCw style={{ fontSize: 12 }} />
            </button>
          )}
        </div>
        {cardsLoading
          ? <div className="loading-box" style={{ padding: 16 }}><div className="loader" /></div>
          : indiaCards.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Could not load city data. Check your API key.</p>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 10 }}>
                {indiaCards.map(d => <CityCard key={d.id} data={d} />)}
              </div>
        }
      </div>

      {/* World Top 5 */}
      <div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          World — Top 5 Cities
        </h2>
        {cardsLoading
          ? <div className="loading-box" style={{ padding: 16 }}><div className="loader" /></div>
          : worldCards.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Could not load city data. Check your API key.</p>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 10 }}>
                {worldCards.map(d => <CityCard key={d.id} data={d} />)}
              </div>
        }
      </div>
    </div>
  );
}
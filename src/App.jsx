import { useState, useMemo } from 'react';
import rideshareData from './data/rideshareData.json';
import RideshareCard from './components/RideshareCard';
import './App.css';

const { countries } = rideshareData;

function App() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  const suggestions = useMemo(() => {
    if (!query.trim() || selected) return [];
    return countries
      .filter((c) => c.country.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 6);
  }, [query, selected]);

  const handleSelect = (country) => {
    setSelected(country);
    setQuery(country.country);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (selected) setSelected(null);
  };

  return (
    <div className="page">
      <header className="hero">
        <div className="logo-row">
          <span className="logo-mark">◐</span>
          <span className="logo-text">Can I Rideshare Here?</span>
        </div>
        <h1>
          Get there, <span className="accent">anywhere</span>
        </h1>
        <p className="subhead">
          Search any country and see which rideshare apps actually work there —
          before you land.
        </p>

        <div className="search-wrap">
          <div className="search-bar">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search for a country…"
              autoComplete="off"
            />
          </div>
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((c) => (
                <li key={c.country} onClick={() => handleSelect(c)}>
                  {c.country}
                  <span className="suggestion-region">{c.region}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="meta-line">
          {countries.length} countries covered · last updated{' '}
          {rideshareData.last_updated}
        </p>
      </header>

      <main className="results">
        {!selected && (
          <div className="empty-state">
            <p>Try "Morocco", "Iran", or "Costa Rica" to see the trickier cases.</p>
          </div>
        )}

        {selected && (
          <div className="results-inner">
            <div className="results-title-row">
              <h2 className="results-title">{selected.country}</h2>
              {selected.volatile && (
                <span className="flag flag-volatile">Status recently changed</span>
              )}
              {selected.confidence === 'low' && (
                <span className="flag flag-confidence">Verify locally</span>
              )}
            </div>

            <div className="card-grid">
              {selected.apps.length > 0 ? (
                selected.apps.map((app) => (
                  <RideshareCard key={app.name} app={app} />
                ))
              ) : (
                <p className="no-apps">
                  No rideshare apps reported here — traditional taxis are the
                  main option.
                </p>
              )}
            </div>

            <div className="meta-panel">
              {selected.geographic_limitations &&
                selected.geographic_limitations !== 'N/A' && (
                  <div className="meta-row">
                    <span className="meta-label">Where it works</span>
                    <span>{selected.geographic_limitations}</span>
                  </div>
                )}
              {selected.airport_pickup && (
                <div className="meta-row">
                  <span className="meta-label">Airport pickup</span>
                  <span>{selected.airport_pickup}</span>
                </div>
              )}
              {selected.local_taxi_cash_requirement && (
                <div className="meta-row">
                  <span className="meta-label">Payment</span>
                  <span>{selected.local_taxi_cash_requirement}</span>
                </div>
              )}
            </div>

            {(selected.other_notes || selected.traveler_notes) && (
              <p className="notes">
                <strong>Also worth knowing:</strong>{' '}
                {selected.other_notes || selected.traveler_notes}
              </p>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          Curated from public reporting on app availability — status changes
          fast in some countries. Always verify locally before you travel.
        </p>
      </footer>
    </div>
  );
}

export default App;
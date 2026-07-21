import { useState, useMemo, useRef, useEffect } from 'react';
import rideshareData from './data/rideshareData.json';
import RideshareCard from './components/RideshareCard';
import { createCountrySearch } from './lib/search';
import './App.css';

const { countries } = rideshareData;
const searchCountries = createCountrySearch(countries);

// Countries with hand-reviewed recommendations (per the enrichment pass).
// Everything else uses a mechanical "first in list" fallback — flagged as lower-confidence.
const REVIEWED_COUNTRIES = new Set([
  'Morocco', 'Colombia', 'Costa Rica', 'Argentina', 'Venezuela', 'Hong Kong',
  'Türkiye', 'Cameroon', 'Tunisia', 'Togo', 'Nigeria', 'Bahamas', 'Jamaica',
  'Trinidad and Tobago', 'Serbia', 'Ethiopia', 'Senegal', 'Sudan', 'Yemen',
  'Honduras', 'Nicaragua', 'Nepal', 'Guyana', 'Vanuatu',
]);

const STATUS_RANK = {
  nationwide: 0, city_only: 1, taxi_only: 2, gray_area: 3, banned: 4, absent: 5,
};

function App() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);

  const suggestions = useMemo(() => {
    if (selected) return [];
    return searchCountries(query);
  }, [query, selected]);

  // The list scrolls, so arrowing past the visible rows has to drag the
  // viewport along or the highlight disappears off the bottom.
  useEffect(() => {
    listRef.current?.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, suggestions]);

  const sortedApps = useMemo(() => {
    if (!selected) return [];
    return [...selected.apps].sort(
      (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]
    );
  }, [selected]);

  const handleSelect = (country) => {
    setSelected(country);
    setQuery(country.country);
    setActiveIndex(0);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    setActiveIndex(0);
    if (selected) setSelected(null);
  };

  // Enter takes the highlighted match, so searching never requires the mouse.
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSelected(null);
      setQuery('');
      return;
    }
    if (!suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(suggestions[activeIndex] ?? suggestions[0]);
    }
  };

  const isReviewed = selected && REVIEWED_COUNTRIES.has(selected.country);
  const rec = selected?.recommended;

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
              onKeyDown={handleKeyDown}
              placeholder="Search for a country…"
              autoComplete="off"
              role="combobox"
              aria-expanded={suggestions.length > 0}
              aria-controls="country-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={
                suggestions.length > 0 ? `suggestion-${activeIndex}` : undefined
              }
            />
          </div>
          {suggestions.length > 0 && (
            <ul
              className="suggestions"
              id="country-suggestions"
              role="listbox"
              ref={listRef}
            >
              {suggestions.map((c, i) => (
                <li
                  key={c.country}
                  id={`suggestion-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={i === activeIndex ? 'is-active' : undefined}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => handleSelect(c)}
                >
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

            {rec && (
              <div className="recommended-panel">
                <div className="recommended-header">
                  <span className="recommended-eyebrow">
                    ★ Recommended {!isReviewed && '· auto-suggested'}
                  </span>
                  {rec.app ? (
                    <h3>{rec.app}</h3>
                  ) : (
                    <h3>No app — use a local taxi</h3>
                  )}
                </div>
                <p className="recommended-why">{rec.why}</p>
                {rec.alternative && (
                  <p className="recommended-line">
                    <strong>Backup:</strong> {rec.alternative}
                  </p>
                )}
                {rec.budget_note && (
                  <p className="recommended-line">
                    <strong>Budget tip:</strong> {rec.budget_note}
                  </p>
                )}
                {!isReviewed && (
                  <p className="recommended-caveat">
                    This pick hasn't been manually reviewed yet — treat it as a
                    starting point, not the final word.
                  </p>
                )}
              </div>
            )}

            {sortedApps.length > 0 && (
              <>
                <p className="section-label">All options</p>
                <div className="card-grid">
                  {sortedApps.map((app) => (
                    <RideshareCard
                      key={app.name}
                      app={app}
                      isRecommended={rec?.app === app.name}
                    />
                  ))}
                </div>
              </>
            )}

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
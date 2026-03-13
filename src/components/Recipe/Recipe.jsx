import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiHeart, FiChevronDown, FiChevronUp, FiFilter } from 'react-icons/fi';

const API = 'https://www.themealdb.com/api/json/v1/1';
const DEFAULT_QUERIES = ['chicken','pasta','beef','vegetable','fish'];
const LS_KEY = 'multihub_fav_recipes';

// Page size for infinite scroll
const PAGE_SIZE = 6;

export default function Recipe() {
  const [query, setQuery]       = useState('');
  const [allRecipes, setAllRecipes] = useState([]);  // full result list
  const [displayed, setDisplayed] = useState([]);    // what's rendered
  const [page, setPage]         = useState(1);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
  });
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [vegOnly, setVegOnly]   = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const loaderRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Load default recipes on mount
  useEffect(() => {
    loadDefaultRecipes();
  }, []);

  const loadDefaultRecipes = async () => {
    setLoading(true);
    try {
      // Fetch from multiple default queries
      const results = await Promise.all(
        DEFAULT_QUERIES.map(q =>
          fetch(`${API}/search.php?s=${q}`).then(r => r.json())
        )
      );
      const all = results.flatMap(r => r.meals || []);
      // Deduplicate by idMeal
      const seen = new Set();
      const unique = all.filter(m => {
        if (seen.has(m.idMeal)) return false;
        seen.add(m.idMeal); return true;
      });
      setAllRecipes(unique);
      setDisplayed(unique.slice(0, PAGE_SIZE));
      setPage(1);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const search = async () => {
    if (!query.trim()) { loadDefaultRecipes(); return; }
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`${API}/search.php?s=${encodeURIComponent(query)}`);
      const data = await res.json();
      const meals = data.meals || [];
      setAllRecipes(meals);
      setDisplayed(meals.slice(0, PAGE_SIZE));
      setPage(1);
    } catch { setAllRecipes([]); setDisplayed([]); }
    finally { setLoading(false); }
  };

  // Filter by veg
  const isVeg = (m) => {
    const c = (m.strCategory || '').toLowerCase();
    const t = (m.strTags || '').toLowerCase();
    return c.includes('vegetarian') || c.includes('vegan') || t.includes('vegetarian');
  };

  const filtered = vegOnly ? displayed.filter(isVeg) : displayed;
  const allFiltered = vegOnly ? allRecipes.filter(isVeg) : allRecipes;
  const hasMore = displayed.length < allFiltered.length;

  // Infinite scroll observer
  const handleObserver = useCallback((entries) => {
    if (entries[0].isIntersecting && hasMore && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        const next = page + 1;
        const nextSlice = (vegOnly ? allRecipes.filter(isVeg) : allRecipes).slice(0, next * PAGE_SIZE);
        setDisplayed(nextSlice);
        setPage(next);
        setLoadingMore(false);
      }, 400);
    }
  }, [hasMore, loadingMore, page, allRecipes, vegOnly]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const getIngredients = (meal) => {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const ing  = meal[`strIngredient${i}`];
      const meas = meal[`strMeasure${i}`];
      if (ing && ing.trim()) list.push(`${meas ? meas.trim() + ' ' : ''}${ing.trim()}`);
    }
    return list;
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 className="section-title">Recipe Finder</h1>
            <p className="section-desc">Search recipes by dish or ingredient</p>
          </div>
          {favorites.length > 0 && (
            <div style={{
              background: 'var(--accent-glow)', border: '1px solid rgba(200,184,154,0.25)',
              borderRadius: 8, padding: '5px 12px', fontSize: 12, color: 'var(--accent)',
              display: 'flex', alignItems: 'center', gap: 5
            }}>
              <FiHeart style={{ fontSize: 11 }} /> {favorites.length} Saved
            </div>
          )}
        </div>
      </div>

      <div className="input-group">
        <input
          className="input-field"
          placeholder="Search dish or ingredient... e.g. chicken, pasta"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
        />
        <button
          className={`btn ${vegOnly ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setVegOnly(v => !v)}
          title="Vegetarian only"
        >
          <FiFilter /> Veg
        </button>
        <button className="btn btn-primary" onClick={search}>
          <FiSearch /> Search
        </button>
      </div>

      {loading && (
        <div className="loading-box"><div className="loader" /><span>Loading recipes...</span></div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <FiSearch style={{ fontSize: 32, opacity: 0.3 }} />
          <p className="empty-state-text">
            {vegOnly ? 'No vegetarian recipes found. Try disabling the veg filter.' : 'No recipes found.'}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 14 }}>
        {filtered.map(meal => {
          const faved    = favorites.includes(meal.idMeal);
          const expanded = expandedId === meal.idMeal;
          const ings     = getIngredients(meal);

          return (
            <div key={meal.idMeal} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top,rgba(10,10,9,0.85) 0%,transparent 55%)'
                }} />
                {isVeg(meal) && (
                  <span style={{
                    position: 'absolute', top: 9, left: 9,
                    background: 'rgba(107,143,94,0.92)', color: '#fff',
                    fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600
                  }}>Veg</span>
                )}
                <button
                  onClick={() => toggleFav(meal.idMeal)}
                  style={{
                    position: 'absolute', top: 9, right: 9,
                    background: faved ? 'rgba(192,57,43,0.9)' : 'rgba(0,0,0,0.5)',
                    border: 'none', borderRadius: '50%',
                    width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff', fontSize: 14, transition: 'all 0.2s'
                  }}
                >
                  <FiHeart style={{ fill: faved ? '#fff' : 'transparent' }} />
                </button>
              </div>

              <div style={{ padding: '13px 14px' }}>
                <h3 style={{
                  fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 14,
                  color: 'var(--text-primary)', lineHeight: 1.35, marginBottom: 8
                }}>
                  {meal.strMeal}
                </h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {meal.strCategory && <span className="tag" style={{ fontSize: 11 }}>{meal.strCategory}</span>}
                  {meal.strArea    && <span className="tag" style={{ fontSize: 11 }}>{meal.strArea}</span>}
                </div>

                <button
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setExpandedId(expanded ? null : meal.idMeal)}
                >
                  {expanded ? <FiChevronUp /> : <FiChevronDown />}
                  {expanded ? 'Hide Details' : 'Show Details'}
                </button>

                {expanded && (
                  <div style={{ marginTop: 12, animation: 'fadeUp 0.2s ease' }}>
                    <div className="divider" />
                    <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                      Ingredients ({ings.length})
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 8px' }}>
                      {ings.map((ing, i) => (
                        <span key={i} style={{ fontSize: 11, color: 'var(--text-secondary)' }}>• {ing}</span>
                      ))}
                    </div>
                    {meal.strInstructions && (
                      <>
                        <div className="divider" />
                        <p style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                          Instructions
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.7, maxHeight: 130, overflow: 'auto' }}>
                          {meal.strInstructions.slice(0, 400)}...
                        </p>
                      </>
                    )}
                    {meal.strYoutube && (
                      <a
                        href={meal.strYoutube} target="_blank" rel="noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ marginTop: 10, display: 'inline-flex', textDecoration: 'none' }}
                      >
                        Watch on YouTube
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite scroll trigger */}
      <div ref={loaderRef} style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
        {loadingMore && <div className="loader" />}
        {!hasMore && filtered.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>All {filtered.length} recipes loaded</p>
        )}
      </div>
    </div>
  );
}
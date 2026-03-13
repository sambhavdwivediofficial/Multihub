import { useState, useEffect } from 'react';
import { FiExternalLink, FiCheckCircle, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';

const NEWS_KEY   = import.meta.env.VITE_NEWS_API_KEY;
const CATEGORIES = ['general','technology','business','sports','entertainment','health','science'];
const LS_KEY     = 'multihub_read_news';

// NewsAPI blocks direct browser requests (CORS) on free tier.
// We use a public CORS proxy so it works in development.
const fetchHeadlines = async (cat) => {
  const url = `https://newsapi.org/v2/top-headlines?country=in&category=${cat}&pageSize=20&apiKey=${NEWS_KEY}`;
  // Try direct first (works in some envs / paid plans)
  try {
    const res = await fetch(url);
    if (res.ok) return res.json();
  } catch { /* fall through to proxy */ }
  // Fallback: cors-anywhere proxy
  const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  const res   = await fetch(proxy);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  const data  = await res.json();
  return JSON.parse(data.contents);
};

export default function News() {
  const [articles, setArticles]     = useState([]);
  const [category, setCategory]     = useState('technology');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [readIds, setReadIds]       = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); }
    catch { return new Set(); }
  });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify([...readIds]));
  }, [readIds]);

  const loadNews = async (cat) => {
    setLoading(true); setError('');
    try {
      const data     = await fetchHeadlines(cat);
      const filtered = (data.articles || []).filter(a => a.title && a.title !== '[Removed]');
      setArticles(filtered.length ? filtered : getMockNews(cat));
    } catch (e) {
      setError('Could not fetch live news — showing sample articles.');
      setArticles(getMockNews(cat));
    } finally { setLoading(false); }
  };

  useEffect(() => { loadNews(category); }, [category]);

  const markRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="page-container">
      <div className="section-header">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <div>
            <h1 className="section-title">News Headlines</h1>
            <p className="section-desc">Latest news from India — powered by NewsAPI</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {readIds.size > 0 && (
              <span style={{
                background:'var(--accent-glow)', border:'1px solid rgba(200,184,154,0.25)',
                borderRadius:8, padding:'5px 11px', fontSize:12, color:'var(--accent)',
                display:'flex', alignItems:'center', gap:5
              }}>
                <FiCheckCircle style={{ fontSize:11 }} /> {readIds.size} read
              </span>
            )}
            <button className="btn btn-outline btn-sm" onClick={() => loadNews(category)}>
              <FiRefreshCw style={{ fontSize:12 }} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:18 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} className={`tag ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="card" style={{ borderColor:'rgba(200,184,154,0.2)', marginBottom:14 }}>
          <p style={{ fontSize:12, color:'var(--accent)' }}>{error}</p>
        </div>
      )}

      {loading && <div className="loading-box"><div className="loader" /></div>}

      {!loading && articles.length === 0 && (
        <div className="empty-state">
          <FiExternalLink style={{ fontSize:30, opacity:0.3 }} />
          <p className="empty-state-text">No headlines found.</p>
        </div>
      )}

      <div style={{ display:'grid', gap:9 }}>
        {articles.map((article, idx) => {
          const id         = article.url || String(idx);
          const isRead     = readIds.has(id);
          const isExpanded = expandedId === id;

          return (
            <div key={id} className="card" style={{ opacity: isRead ? 0.5 : 1, transition:'opacity 0.2s' }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                {article.urlToImage && (
                  <img
                    src={article.urlToImage} alt=""
                    style={{ width:78, height:54, objectFit:'cover', borderRadius:6, flexShrink:0 }}
                    onError={e => e.target.style.display = 'none'}
                  />
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <h3
                    style={{
                      fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:13,
                      color: isRead ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: isRead ? 'line-through' : 'none',
                      lineHeight:1.4, marginBottom:5, cursor:'pointer',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : id)}
                  >
                    {article.title}
                  </h3>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    {article.source?.name && (
                      <span style={{ fontSize:11, color:'var(--accent)', fontWeight:500 }}>{article.source.name}</span>
                    )}
                    {article.publishedAt && (
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>
                        {new Date(article.publishedAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short' })}
                      </span>
                    )}
                  </div>
                  {isExpanded && article.description && (
                    <p style={{ fontSize:12, color:'var(--text-secondary)', marginTop:8, lineHeight:1.6 }}>
                      {article.description}
                    </p>
                  )}
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:5, flexShrink:0 }}>
                  <button
                    className={`btn btn-sm ${isRead ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => markRead(id)}
                    style={{ fontSize:11, padding:'5px 9px' }}
                  >
                    <FiCheckCircle style={{ fontSize:10 }} />
                    {isRead ? 'Read' : 'Mark'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setExpandedId(isExpanded ? null : id)}
                    style={{ padding:'5px 9px' }}
                  >
                    {isExpanded ? <FiChevronUp style={{ fontSize:12 }} /> : <FiChevronDown style={{ fontSize:12 }} />}
                  </button>
                  {article.url && !article.url.startsWith('#') && (
                    <a
                      href={article.url} target="_blank" rel="noreferrer"
                      className="btn btn-ghost btn-sm"
                      style={{ textDecoration:'none', padding:'5px 9px' }}
                    >
                      <FiExternalLink style={{ fontSize:12 }} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getMockNews(cat) {
  const data = {
    technology: [
      { title:'India launches new AI policy framework for 2026', source:{ name:'TechCrunch' }, publishedAt:new Date().toISOString(), description:'The Indian government released a comprehensive AI policy framework to guide development across the country.', urlToImage:null, url:'#0' },
      { title:'Bengaluru startup raises 400Cr in Series B funding', source:{ name:'Economic Times' }, publishedAt:new Date().toISOString(), description:'A leading fintech startup secured major funding to expand across Southeast Asia.', urlToImage:null, url:'#1' },
      { title:'ISRO successfully tests new satellite propulsion system', source:{ name:'NDTV' }, publishedAt:new Date().toISOString(), description:'ISRO conducted ground tests of its advanced propulsion system for upcoming lunar missions.', urlToImage:null, url:'#2' },
    ],
    general: [
      { title:'India GDP growth exceeds expectations in Q4 2025', source:{ name:'Mint' }, publishedAt:new Date().toISOString(), description:'Strong manufacturing output and exports drive GDP growth above analyst forecasts.', urlToImage:null, url:'#3' },
      { title:'New metro lines approved for three major cities', source:{ name:'Hindustan Times' }, publishedAt:new Date().toISOString(), description:'Cabinet approves metro rail projects for Pune, Ahmedabad and Surat.', urlToImage:null, url:'#4' },
    ],
    business: [
      { title:'Sensex crosses 90,000 mark for first time', source:{ name:'Business Standard' }, publishedAt:new Date().toISOString(), description:'BSE Sensex hit a historic high driven by strong FII inflows.', urlToImage:null, url:'#5' },
      { title:'RBI holds repo rate steady at 6.25%', source:{ name:'Financial Express' }, publishedAt:new Date().toISOString(), description:'Reserve Bank maintains rate, signals focus on inflation management.', urlToImage:null, url:'#6' },
    ],
  };
  return (data[cat] || data.general);
}
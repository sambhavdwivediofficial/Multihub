import { useState, useEffect } from 'react';
import { FiSearch, FiBriefcase, FiBookmark, FiTrash2, FiMapPin, FiClock } from 'react-icons/fi';

const mapToJob = (post) => {
  const roles     = ['Frontend Developer','Backend Engineer','Product Designer','Data Analyst','DevOps Engineer','React Developer','Node.js Dev','UI/UX Designer','Python Engineer','ML Engineer'];
  const companies = ['Stripe','Notion','Figma','Linear','Vercel','Supabase','PlanetScale','Railway','Fly.io','Render'];
  const locations = ['Remote','Bangalore','Mumbai','Delhi','Hyderabad','Pune','San Francisco','New York'];
  const types     = ['Full-time','Part-time','Contract','Internship'];
  const tags      = [['React','TypeScript','CSS'],['Node.js','PostgreSQL','Redis'],['Figma','Prototyping','User Research'],['Python','SQL','Tableau'],['AWS','Docker','Kubernetes']];
  const idx = post.id % 10;
  return {
    id: post.id,
    role: roles[idx],
    company: companies[idx],
    location: locations[post.id % locations.length],
    type: types[post.id % types.length],
    tags: tags[post.id % tags.length],
    desc: post.body.slice(0, 120) + '...',
    posted: `${(post.id % 14) + 1}d ago`,
  };
};

const LS_KEY = 'multihub_saved_jobs';

export default function Jobs() {
  const [jobs, setJobs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savedJobs, setSavedJobs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
    catch { return []; }
  });
  const [view, setView] = useState('all');

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(r => r.json())
      .then(data => { setJobs(data.slice(0, 30).map(mapToJob)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(savedJobs));
  }, [savedJobs]);

  const toggleSave = (job) => {
    setSavedJobs(prev =>
      prev.find(j => j.id === job.id)
        ? prev.filter(j => j.id !== job.id)
        : [...prev, job]
    );
  };

  const isSaved = (id) => savedJobs.some(j => j.id === id);

  const filtered = (view === 'saved' ? savedJobs : jobs).filter(j =>
    j.role.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 className="section-title">Job Portal</h1>
            <p className="section-desc">Browse and save job listings</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className={`tag ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>
              All ({jobs.length})
            </button>
            <button className={`tag ${view === 'saved' ? 'active' : ''}`} onClick={() => setView('saved')}>
              <FiBookmark style={{ fontSize: 11 }} /> Saved ({savedJobs.length})
            </button>
          </div>
        </div>
      </div>

      <div className="input-group">
        <input
          className="input-field"
          placeholder="Search by role, company, location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-primary"><FiSearch /> Search</button>
      </div>

      {loading && <div className="loading-box"><div className="loader" /></div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <FiBriefcase style={{ fontSize: 36, opacity: 0.3 }} />
          <p className="empty-state-text">
            {view === 'saved' ? 'No saved jobs yet. Browse and save jobs you like!' : 'No jobs match your search.'}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.map(job => (
          <div key={job.id} className="card" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 9,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <FiBriefcase style={{ color: 'var(--accent)' }} />
            </div>

            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                  {job.role}
                </span>
                <span className="tag" style={{ fontSize: 11, padding: '2px 8px', cursor: 'default' }}>{job.type}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{job.company}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><FiMapPin style={{ fontSize: 10 }} />{job.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><FiClock style={{ fontSize: 10 }} />{job.posted}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>{job.desc}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {job.tags.map(t => (
                  <span key={t} className="tag" style={{ fontSize: 11, cursor: 'default' }}>{t}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                className={`btn btn-sm ${isSaved(job.id) ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => toggleSave(job)}
              >
                <FiBookmark style={{ fontSize: 12 }} />
                {isSaved(job.id) ? 'Saved' : 'Save'}
              </button>
              {isSaved(job.id) && (
                <button className="btn btn-ghost btn-sm" onClick={() => toggleSave(job)}>
                  <FiTrash2 style={{ fontSize: 12, color: 'var(--danger)' }} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
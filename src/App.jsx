import { useState, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';
import Sidebar from './components/Sidebar/Sidebar';
import Weather from './components/Weather/Weather';
import Jobs from './components/Jobs/Jobs';
import Recipe from './components/Recipe/Recipe';
import News from './components/News/News';
import './App.css';

const PAGE_META = {
  weather: { title: 'Weather Checker', subtitle: 'Real-time weather data' },
  jobs:    { title: 'Job Portal',       subtitle: 'Browse & save job listings' },
  recipe:  { title: 'Recipe Finder',    subtitle: 'Discover meals & ingredients' },
  news:    { title: 'News Headlines',   subtitle: 'Latest headlines from India' },
};

function App() {
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem('multihub_page') || 'weather';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('multihub_page', activePage);
  }, [activePage]);

  const meta = PAGE_META[activePage];

  const renderPage = () => {
    switch (activePage) {
      case 'weather': return <Weather />;
      case 'jobs':    return <Jobs />;
      case 'recipe':  return <Recipe />;
      case 'news':    return <News />;
      default:        return <Weather />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        active={activePage}
        setActive={setActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="topbar-hamburger"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle sidebar"
            >
              <FiMenu />
            </button>
            <div>
              <div className="topbar-title">{meta.title}</div>
              <div className="topbar-subtitle">{meta.subtitle}</div>
            </div>
          </div>
          <div className="topbar-right">
            <span className="topbar-badge">MultiHub</span>
          </div>
        </header>

        <main key={activePage}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
import { FiCloud, FiBriefcase, FiBook, FiFileText, FiChevronLeft, FiGrid, FiX } from 'react-icons/fi';

const NAV_ITEMS = [
  { id: 'weather', label: 'Weather', icon: <FiCloud /> },
  { id: 'jobs',    label: 'Jobs',    icon: <FiBriefcase /> },
  { id: 'recipe',  label: 'Recipes', icon: <FiBook /> },
  { id: 'news',    label: 'News',    icon: <FiFileText /> },
];

export default function Sidebar({ active, setActive, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  // On mobile, always show labels regardless of desktop collapsed state
  const showLabels = mobileOpen || !collapsed;

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <FiGrid style={{ color: '#0a0a09', fontSize: 17 }} />
          </div>
          {showLabels && <span className="sidebar-logo-text">MultiHub</span>}
          <button className="sidebar-mobile-close" onClick={() => setMobileOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              className={`sidebar-nav-item ${active === item.id ? 'active' : ''}`}
              onClick={() => { setActive(item.id); setMobileOpen(false); }}
              title={!showLabels ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {showLabels && <span className="nav-label">{item.label}</span>}
            </div>
          ))}
        </nav>

        <button className="sidebar-collapse-btn desktop-only" onClick={() => setCollapsed(c => !c)}>
          <FiChevronLeft style={{ fontSize: 15, flexShrink: 0, transition: 'transform 0.28s', transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          {!collapsed && <span>Collapse</span>}
        </button>

      </aside>
    </>
  );
}
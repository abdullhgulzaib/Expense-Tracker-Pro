import { Home, BarChart3, Receipt, FolderOpen, Settings, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import BrandLogo from './BrandLogo';

const navItems = [
  { label: 'Dashboard', icon: Home, to: '/' },
  { label: 'Analytics', icon: BarChart3, to: '/analytics' },
  { label: 'Transactions', icon: Receipt, to: '/transactions' },
  { label: 'Categories', icon: FolderOpen, to: '/categories' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

function Sidebar({ isOpen = false, onNavigate }) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <BrandLogo size="sm" showSubtitle={false} />
        <button
          type="button"
          className="sidebar__close-btn"
          onClick={() => onNavigate?.()}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/'}
            onClick={() => onNavigate?.()}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
import {
  Home,
  BarChart3,
  Receipt,
  FolderOpen,
  Settings,
  Users,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import BrandLogo from './BrandLogo';

const navItems = [
  { label: 'Dashboard', icon: Home, to: '/' },
  { label: 'Analytics', icon: BarChart3, to: '/analytics' },
  { label: 'Transactions', icon: Receipt, to: '/transactions' },
  { label: 'SplitVault', icon: Users, to: '/splitvault', badge: 'Active' },
  { label: 'Categories', icon: FolderOpen, to: '/categories' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

function Sidebar({ isOpen = false, isCollapsed = false, onToggleCollapse, onNavigate }) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__brand">
        <BrandLogo size="sm" showSubtitle={false} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Desktop Adjustable / Collapse Toggle Button (ChatGPT / Gemini style) */}
          <button
            type="button"
            className="sidebar__toggle-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          {/* Mobile Drawer Close Button */}
          <button
            type="button"
            className="sidebar__close-btn"
            onClick={() => onNavigate?.()}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(({ label, icon: Icon, to, badge }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/'}
            onClick={() => onNavigate?.()}
            title={isCollapsed ? label : undefined}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            <span>{label}</span>
            {badge && (
              <span
                className="splitvault-pill splitvault-pill--live"
                style={{ marginLeft: 'auto', fontSize: '0.62rem', padding: '2px 6px' }}
              >
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
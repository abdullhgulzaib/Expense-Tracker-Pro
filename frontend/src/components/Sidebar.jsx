import React, { useState, useEffect, useRef } from 'react';
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
  { label: 'SplitVault', icon: Users, to: '/splitvault', badge: 'Beta' },
  { label: 'Categories', icon: FolderOpen, to: '/categories' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

function Sidebar({ isOpen = false, isCollapsed = false, onToggleCollapse, onNavigate }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    return parseInt(localStorage.getItem('et_sidebar_width') || '240', 10);
  });
  const isDragging = useRef(false);

  // Apply saved width to CSS variable
  useEffect(() => {
    if (!isCollapsed) {
      document.documentElement.style.setProperty('--sidebar-width', `${sidebarWidth}px`);
    } else {
      document.documentElement.style.setProperty('--sidebar-width', '74px');
    }
  }, [sidebarWidth, isCollapsed]);

  // Handle Drag to resize sidebar width
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent) => {
      if (!isDragging.current) return;
      const newWidth = Math.max(190, Math.min(360, moveEvent.clientX));
      setSidebarWidth(newWidth);
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      localStorage.setItem('et_sidebar_width', String(sidebarWidth));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${isCollapsed ? 'sidebar--collapsed' : ''}`}
      style={{ width: isCollapsed ? '74px' : `${sidebarWidth}px` }}
    >
      <div className="sidebar__brand">
        <BrandLogo size="sm" showSubtitle={false} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Desktop Adjustable / Collapse Toggle Button */}
          <button
            type="button"
            className="sidebar__toggle-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
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
                className="splitvault-pill splitvault-pill--beta"
                style={{ marginLeft: 'auto', fontSize: '0.62rem', padding: '2px 6px' }}
              >
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Draggable Resizer Edge on Desktop */}
      {!isCollapsed && (
        <div
          className="sidebar__resizer"
          onMouseDown={handleMouseDown}
          title="Drag to resize sidebar width"
        />
      )}
    </aside>
  );
}

export default Sidebar;
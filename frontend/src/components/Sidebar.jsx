import { Home, BarChart3, Receipt, FolderOpen, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: Home, to: '/' },
  { label: 'Analytics', icon: BarChart3, to: '/analytics' },
  { label: 'Transactions', icon: Receipt, to: '/transactions' },
  { label: 'Categories', icon: FolderOpen, to: '/categories' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="brand__mark">ET</div>
        <span>Expense Tracker</span>
      </div>

      <nav className="sidebar__nav">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            end={to === '/'}
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

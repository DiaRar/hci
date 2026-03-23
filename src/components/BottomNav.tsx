import { Compass, Plus, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navigation = [
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/create', label: 'Create', icon: Plus },
  { to: '/profile/me', label: 'Profile', icon: UserRound },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `bottom-nav__link${isActive ? ' is-active' : ''}`}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

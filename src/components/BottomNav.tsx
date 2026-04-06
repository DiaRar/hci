import { Compass, MessageCircle, PlusCircle, UserRound } from 'lucide-react';
import { Button } from 'antd';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

type NavItem = {
  key: string;
  label: string;
  to: string;
  icon: ReactNode;
  isActive: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    key: 'discover',
    label: 'Discover',
    to: '/discover',
    icon: <Compass size={18} />,
    isActive: (pathname) => pathname.startsWith('/discover') || pathname.startsWith('/event/'),
  },
  {
    key: 'create',
    label: 'Create',
    to: '/create',
    icon: <PlusCircle size={18} />,
    isActive: (pathname) => pathname.startsWith('/create'),
  },
  {
    key: 'chats',
    label: 'Chats',
    to: '/chats',
    icon: <MessageCircle size={18} />,
    isActive: (pathname) => pathname.startsWith('/chats') || pathname.startsWith('/chat/'),
  },
  {
    key: 'profile',
    label: 'Profile',
    to: '/profile/me',
    icon: <UserRound size={18} />,
    isActive: (pathname) => pathname.startsWith('/profile/'),
  },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-[700] border-t border-[rgba(44,44,44,0.14)] bg-[color:var(--surface-strong)]/95 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur"
    >
      <ul className="m-0 grid list-none grid-cols-4 gap-2 rounded-2xl border border-[rgba(44,44,44,0.14)] bg-white/55 p-2">
        {NAV_ITEMS.map((item) => {
          const active = item.isActive(location.pathname);

          return (
            <li key={item.key} className="flex justify-center">
              <Link
                to={item.to}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
                className={cn(
                  'block',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]',
                )}
              >
                <Button
                  type={active ? 'primary' : 'default'}
                  shape="circle"
                  className={cn(
                    '!h-[52px] !w-[52px] !min-w-[52px] !p-0',
                    active ? '!shadow-[var(--shadow-cta)]' : '',
                  )}
                  icon={item.icon}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

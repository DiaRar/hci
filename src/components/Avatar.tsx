import type { CSSProperties } from 'react';

import { getInitials } from '../lib/format';
import type { User } from '../types';

type AvatarProps = {
  user: User;
  size?: 'sm' | 'md' | 'lg';
};

export function Avatar({ user, size = 'md' }: AvatarProps) {
  return (
    <span
      className={`avatar avatar--${size}`}
      style={{ '--avatar-color': user.avatarPreset } as CSSProperties}
      aria-label={user.displayName}
      title={user.displayName}
    >
      {getInitials(user.displayName)}
    </span>
  );
}

type AvatarStackProps = {
  users: User[];
  limit?: number;
};

export function AvatarStack({ users, limit = 3 }: AvatarStackProps) {
  const visibleUsers = users.slice(0, limit);
  const extraCount = Math.max(users.length - visibleUsers.length, 0);

  return (
    <div className="avatar-stack">
      {visibleUsers.map((user) => (
        <Avatar key={user.id} user={user} size="sm" />
      ))}
      {extraCount > 0 ? <span className="avatar avatar--sm avatar--ghost">+{extraCount}</span> : null}
    </div>
  );
}

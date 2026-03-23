import type { CSSProperties } from 'react';

import {
  Avatar as UiAvatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';

import { getInitials } from '../lib/format';
import type { User } from '../types';

type AvatarProps = {
  user: User;
  size?: 'sm' | 'md' | 'lg';
};

export function Avatar({ user, size = 'md' }: AvatarProps) {
  return (
    <UiAvatar
      size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
      className={`avatar avatar--${size}`}
      style={{ '--avatar-color': user.avatarPreset } as CSSProperties}
      aria-label={user.displayName}
      title={user.displayName}
    >
      <AvatarFallback className="avatar__fallback">
        {getInitials(user.displayName)}
      </AvatarFallback>
    </UiAvatar>
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
    <AvatarGroup className="avatar-stack">
      {visibleUsers.map((user) => (
        <Avatar key={user.id} user={user} size="sm" />
      ))}
      {extraCount > 0 ? (
        <AvatarGroupCount className="avatar avatar--sm avatar--ghost">
          +{extraCount}
        </AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  );
}

import type { CSSProperties } from "react";
import { Avatar as AntAvatar } from "antd";
import { getInitials } from "../lib/format";
import type { User } from "../types";

type AvatarProps = {
  user: User;
  size?: "sm" | "md" | "lg";
};

export function Avatar({ user, size = "md" }: AvatarProps) {
  const initials = getInitials(user.displayName);
  return (
    <span title={user.displayName}>
      <AntAvatar
        size={size === "sm" ? 24 : size === "md" ? 32 : 40}
        style={{
          backgroundColor: `color-mix(in srgb, ${user.avatarPreset} 20%, white)`,
          color: `color-mix(in srgb, ${user.avatarPreset} 72%, black)`,
        } as CSSProperties}
      >
        {initials}
      </AntAvatar>
    </span>
  );
}

type AvatarStackProps = {
  users: User[];
  limit?: number;
};

export function AvatarStack({ users, limit = 3 }: AvatarStackProps) {
  return (
    <AntAvatar.Group
      max={{
        count: limit,
        style: {
          backgroundColor: 'var(--muted)',
          color: 'var(--muted-foreground)',
          width: 24,
          height: 24,
          minWidth: 24,
          fontSize: 12,
          fontWeight: 700,
          lineHeight: '24px',
        },
      }}
    >
      {users.map((user) => (
        <span key={user.id} className="rounded-full ring-2 ring-background">
          <Avatar user={user} size="sm" />
        </span>
      ))}
    </AntAvatar.Group>
  );
}

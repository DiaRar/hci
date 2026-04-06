import { Clock3, Flag, Gauge, MapPin, ShieldAlert, Users } from 'lucide-react';
import { Card, Flex, Tag, Typography } from 'antd';

import { cn } from '@/lib/utils';

import { CATEGORY_META } from '../lib/constants';
import {
  computeDistanceKm,
  formatAttendanceStatus,
  formatCurrency,
  formatDistanceKm,
  formatEventWindow,
} from '../lib/format';
import { useBubbleStore } from '../store/BubbleStore';
import { AnimatedLink } from './AnimatedLink';
import { AvatarStack } from './Avatar';
import type { Event } from '../types';

type EventCardProps = {
  event: Event;
  selected?: boolean;
};

export function EventCard({ event, selected = false }: EventCardProps) {
  const { users, userLocation, currentUserId } = useBubbleStore();
  const category = CATEGORY_META[event.category];
  const host = users.find((user) => user.id === event.hostId);
  const attendees = event.attendeeIds
    .map((userId) => users.find((user) => user.id === userId))
    .filter((user): user is NonNullable<typeof user> => Boolean(user));
  const distance = computeDistanceKm(userLocation, event.location);
  const currentStatus = currentUserId
    ? event.attendanceStatuses[currentUserId]
    : undefined;

  return (
    <AnimatedLink className="block" to={`/event/${event.id}`} data-testid="event-card">
      <Card
        className={cn(
          'flex flex-col gap-[14px] rounded-2xl bg-card p-4',
          selected &&
            'border-[rgba(107,92,255,0.22)] shadow-[0_24px_54px_rgba(107,92,255,0.2)]'
        )}
      >
        <div className="flex flex-wrap gap-[10px]">
          <Tag
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[0.8rem] font-bold"
            style={{
              background: category.glow,
              color: category.accent,
            }}
          >
            <span>{category.emoji}</span>
            {category.label}
          </Tag>
          <Tag
            className="shrink-0 rounded-full px-3 py-2 text-[0.8rem] font-bold bg-[rgba(107,92,255,0.14)] text-primary dark:bg-[rgba(107,92,255,0.25)]"
          >
            {event.attendeeIds.length} players
          </Tag>
        </div>

        <div className="flex items-start gap-[14px]">
          <div
            className="grid w-[52px] h-[52px] place-items-center rounded-[18px] bg-white text-[1.5rem]"
            style={{ boxShadow: `0 18px 40px ${category.glow}` }}
          >
            {category.emoji}
          </div>
          <div>
            <h3 className="font-serif text-[1.28rem] leading-tight tracking-tight mb-1.5 text-ink-strong dark:text-foreground">
              {event.title}
            </h3>
            <p className="text-[0.9rem] leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          </div>
        </div>

        <div className="grid gap-[10px]">
          <Flex align="center" gap={8} className="rounded-xl bg-[color:var(--surface-strong)] p-3 text-[0.86rem] text-ink">
            <Clock3 size={14} />
            <Typography.Text className="!text-[0.86rem] !text-ink">{formatEventWindow(event.startTime, event.durationMinutes)}</Typography.Text>
          </Flex>
          <Flex align="center" gap={8} className="rounded-xl bg-[color:var(--surface-strong)] p-3 text-[0.86rem] text-ink">
            <MapPin size={14} />
            <Typography.Text className="!text-[0.86rem] !text-ink">
              {event.location.label} · {formatDistanceKm(distance)}
            </Typography.Text>
          </Flex>
          <Flex align="center" gap={8} className="rounded-xl bg-[color:var(--surface-strong)] p-3 text-[0.86rem] text-ink">
            <Gauge size={14} />
            <Typography.Text className="!text-[0.86rem] !text-ink">
              {formatCurrency(event.price)} · {event.skillLevel.replaceAll('_', ' ')}
            </Typography.Text>
          </Flex>
          <Flex align="center" gap={8} className="rounded-xl bg-[color:var(--surface-strong)] p-3 text-[0.86rem] text-ink">
            <Users size={14} />
            <Typography.Text className="!text-[0.86rem] !text-ink">
              {event.attendanceCounts.interested} interested ·{' '}
              {event.attendanceCounts.on_my_way} on way
            </Typography.Text>
          </Flex>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <AvatarStack users={attendees} />
            <div>
              <p className="font-bold text-ink-strong dark:text-foreground">
                {host?.displayName ?? 'Unknown host'}
              </p>
              <span className="text-[0.8rem] text-muted-foreground">
                {event.womenOnly ? 'Women-only' : 'Open to everyone'}
                {event.safetyNote ? ' · Safety note ready' : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-[10px]">
            {currentStatus ? (
              <Tag>
                {formatAttendanceStatus(currentStatus)}
              </Tag>
            ) : null}
            {event.womenOnly ? (
              <Tag>
                <ShieldAlert size={12} />
                Women-only
              </Tag>
            ) : null}
            {event.safetyNote ? (
              <Tag>
                <Flag size={12} />
                Safety note
              </Tag>
            ) : null}
          </div>
        </div>
      </Card>
    </AnimatedLink>
  );
}

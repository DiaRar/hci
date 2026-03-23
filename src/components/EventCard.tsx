import { Clock3, Flag, Gauge, MapPin, ShieldAlert, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { CATEGORY_META } from '../lib/constants';
import { computeDistanceKm, formatAttendanceStatus, formatCurrency, formatDistanceKm, formatEventWindow } from '../lib/format';
import { useBubbleStore } from '../store/BubbleStore';
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
  const currentStatus = currentUserId ? event.attendanceStatuses[currentUserId] : undefined;

  return (
    <Link className="event-card-link" to={`/event/${event.id}`}>
      <Card className={cn('event-card', selected && 'is-selected')}>
        <div className="event-card__topline">
          <Badge
            className="category-token"
            style={{
              background: category.glow,
              color: category.accent,
            }}
          >
            <span>{category.emoji}</span>
            {category.label}
          </Badge>
          <Badge variant="secondary" className="event-card__count-badge">
            {event.attendeeIds.length} players
          </Badge>
        </div>

        <div className="event-card__headline">
          <div className="event-card__emoji" style={{ boxShadow: `0 18px 40px ${category.glow}` }}>
            {category.emoji}
          </div>
          <div>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-pill">
            <Clock3 size={14} />
            <span>{formatEventWindow(event.startTime, event.durationMinutes)}</span>
          </div>
          <div className="info-pill">
            <MapPin size={14} />
            <span>
              {event.location.label} · {formatDistanceKm(distance)}
            </span>
          </div>
          <div className="info-pill">
            <Gauge size={14} />
            <span>
              {formatCurrency(event.price)} · {event.skillLevel.replace('_', ' ')}
            </span>
          </div>
          <div className="info-pill">
            <Users size={14} />
            <span>
              {event.attendanceCounts.interested} interested · {event.attendanceCounts.on_my_way} on way
            </span>
          </div>
        </div>

        <div className="event-card__footer">
          <div className="event-card__participants">
            <AvatarStack users={attendees} />
            <div>
              <p>{host?.displayName ?? 'Unknown host'}</p>
              <span>
                {event.womenOnly ? 'Women-only' : 'Open to everyone'}
                {event.safetyNote ? ' · Safety note ready' : ''}
              </span>
            </div>
          </div>

          <div className="event-card__footer-tags">
            {currentStatus ? (
              <Badge variant="outline">{formatAttendanceStatus(currentStatus)}</Badge>
            ) : null}
            {event.womenOnly ? (
              <Badge variant="outline">
                <ShieldAlert size={12} />
                Women-only
              </Badge>
            ) : null}
            {event.safetyNote ? (
              <Badge variant="outline">
                <Flag size={12} />
                Safety note
              </Badge>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}

import {
  ArrowRight,
  Clock3,
  Crosshair,
  MapPin,
  MessageCircle,
  Plus,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { Button, Card, Select, Tag } from 'antd';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AppFrame } from '../components/AppFrame';
import { Avatar } from '../components/Avatar';
import { EventMap } from '../components/EventMap';
import { CATEGORY_META } from '../lib/constants';
import { useAnimatedNavigate } from '../lib/useAnimatedNavigate';
import {
  computeDistanceKm,
  formatClock,
  formatDistanceKm,
} from '../lib/format';
import { useBubbleStore } from '../store/BubbleStore';
import type { CategoryId, CostFilter, SkillLevel, SortMode } from '../types';
type DiscoverFilters = {
  category: 'all' | CategoryId;
  cost: CostFilter;
  skill: 'all' | SkillLevel;
  womenOnly: boolean;
  sort: SortMode;
};

const initialFilters: DiscoverFilters = {
  category: 'all',
  cost: 'all',
  skill: 'all',
  womenOnly: false,
  sort: 'closest',
};

function hasReadableText(value: string): boolean {
  return /[A-Za-z0-9]/.test(value);
}

export function DiscoverPage() {
  const navigate = useAnimatedNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, events, userLocation } = useBubbleStore();
  const [filters, setFilters] = useState<DiscoverFilters>(initialFilters);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const blockedHosts = currentUser?.trustFlags.blockedUserIds ?? [];
  const filteredEvents = [...events]
    .filter((event) => !blockedHosts.includes(event.hostId))
    .filter((event) =>
      filters.category === 'all' ? true : event.category === filters.category,
    )
    .filter((event) => {
      if (filters.cost === 'all') {
        return true;
      }
      if (filters.cost === 'free') {
        return event.price === 0;
      }
      if (filters.cost === 'budget') {
        return event.price > 0 && event.price < 15;
      }
      return event.price >= 15;
    })
    .filter((event) =>
      filters.skill === 'all' ? true : event.skillLevel === filters.skill,
    )
    .filter((event) => (filters.womenOnly ? event.womenOnly : true))
    .sort((left, right) => {
      if (filters.sort === 'closest') {
        return (
          computeDistanceKm(userLocation, left.location) -
          computeDistanceKm(userLocation, right.location)
        );
      }

      return (
        new Date(left.startTime).getTime() - new Date(right.startTime).getTime()
      );
    });

  const focusedEventId = searchParams.get('focus');
  const effectiveSelectedEventId =
    [selectedEventId, focusedEventId].find(
      (eventId) => eventId && filteredEvents.some((event) => event.id === eventId),
    ) ?? null;
  const selectedEvent =
    filteredEvents.find((event) => event.id === effectiveSelectedEventId) ?? null;
  const filterSummary =
    filters.category === 'all' ? 'All sports' : CATEGORY_META[filters.category].label;
  const chatSendButtonStyle =
    '!h-11 !w-11 !min-w-11 !rounded-full !p-0 !shadow-[4px_4px_0_#2C2C2C]';

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const selectedEventTitle = selectedEvent
    ? hasReadableText(selectedEvent.title)
      ? selectedEvent.title
      : `${CATEGORY_META[selectedEvent.category].label} session`
    : '';
  const selectedEventDescription = selectedEvent
    ? hasReadableText(selectedEvent.description)
      ? selectedEvent.description
      : `Join this ${CATEGORY_META[selectedEvent.category].label.toLowerCase()} group and coordinate in chat.`
    : '';

  return (
    <AppFrame>
      <main className="flex min-h-0 flex-1 flex-col p-0">
        <section className="relative min-h-0 flex-1">
          <EventMap
            events={filteredEvents}
            userLocation={userLocation}
            selectedEventId={selectedEvent?.id ?? null}
            onSelectEvent={setSelectedEventId}
            fillHeight
            showZoomControl={false}
          />

          <div className="absolute left-0 right-0 top-0 z-[500] flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between gap-2">
              {currentUser ? (
                <Button
                  type="default"
                  shape="circle"
                  className={chatSendButtonStyle}
                  htmlType="button"
                  onClick={() => navigate('/profile/me')}
                  aria-label="Open profile"
                >
                  <Avatar user={currentUser} size="md" />
                </Button>
              ) : (
                <span className="h-11 w-11 rounded-full border border-border bg-[color:var(--surface-strong)]" />
              )}

              <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-purple px-3.5 py-2 text-[0.82rem] font-bold text-white shadow-[var(--shadow-soft)]">
                Bubbleverse
              </div>

              <Button
                type="default"
                shape="circle"
                className={chatSendButtonStyle}
                htmlType="button"
                onClick={() => navigate('/chats')}
                aria-label="Open chats"
              >
                <MessageCircle size={18} />
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button
                  type="default"
                  htmlType="button"
                  onClick={() => setFiltersOpen((current) => !current)}
                >
                  <SlidersHorizontal size={15} />
                  <span>{filterSummary}</span>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-purple-light text-[0.72rem] font-bold text-primary">
                    {filteredEvents.length}
                  </span>
                </Button>
              </div>

              {filtersOpen ? (
                <Card className="flex flex-col gap-4 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filters</p>
                      <h2 className="text-base font-bold text-foreground mt-0.5">Tune the session feed.</h2>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      htmlType="button"
                      onClick={clearFilters}
                    >
                      Reset
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type={filters.category === 'all' ? 'primary' : 'default'}
                      size="small"
                      htmlType="button"
                      onClick={() =>
                        setFilters((current) => ({ ...current, category: 'all' }))
                      }
                    >
                      All
                    </Button>
                    {Object.entries(CATEGORY_META).map(([id, meta]) => (
                      <Button
                        key={id}
                        htmlType="button"
                        type={filters.category === id ? 'primary' : 'default'}
                        size="small"
                        onClick={() =>
                          setFilters((current) => ({
                            ...current,
                            category: id as DiscoverFilters['category'],
                          }))
                        }
                      >
                        <span>{meta.emoji}</span>
                        {meta.label}
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Cost</span>
                      <Select
                        value={filters.cost}
                        onChange={(val) =>
                          setFilters((current) => ({
                            ...current,
                            cost: val as DiscoverFilters['cost'],
                          }))
                        }
                        options={[
                          { value: 'all', label: 'Any' },
                          { value: 'free', label: 'Free' },
                          { value: 'budget', label: 'Budget' },
                          { value: 'premium', label: 'Premium' },
                        ]}
                      />
                    </label>

                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Skill</span>
                      <Select
                        value={filters.skill}
                        onChange={(val) =>
                          setFilters((current) => ({
                            ...current,
                            skill: val as DiscoverFilters['skill'],
                          }))
                        }
                        options={[
                          { value: 'all', label: 'All' },
                          { value: 'open', label: 'Open' },
                          { value: 'beginner', label: 'Beginner' },
                          { value: 'intermediate', label: 'Intermediate' },
                          { value: 'advanced', label: 'Advanced' },
                        ]}
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type={filters.womenOnly ? 'primary' : 'default'}
                      size="small"
                      htmlType="button"
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          womenOnly: !current.womenOnly,
                        }))
                      }
                    >
                      Women-only
                    </Button>

                    <Button
                      type={filters.sort === 'closest' ? 'primary' : 'default'}
                      size="small"
                      htmlType="button"
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          sort: current.sort === 'closest' ? 'soonest' : 'closest',
                        }))
                      }
                    >
                      {filters.sort === 'closest' ? 'Closest first' : 'Soonest first'}
                    </Button>
                  </div>
                </Card>
              ) : null}
            </div>
          </div>

          {selectedEvent ? (
            <div className="absolute bottom-0 left-0 right-0 z-[700] p-3">
              <Card
                hoverable
                className="w-full rounded-2xl"
                onClick={() => navigate(`/event/${selectedEvent.id}`)}
                styles={{ body: { padding: 14 } }}
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Tag
                      className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[0.78rem] font-bold"
                      style={{
                        background: CATEGORY_META[selectedEvent.category].glow,
                        color: CATEGORY_META[selectedEvent.category].accent,
                      }}
                    >
                      <span>{CATEGORY_META[selectedEvent.category].emoji}</span>
                      {CATEGORY_META[selectedEvent.category].label}
                    </Tag>

                    <div className="flex min-w-0 flex-col gap-1">
                      <h2 className="truncate text-base font-bold text-foreground">{selectedEventTitle}</h2>
                      <p className="truncate text-xs text-muted-foreground">{selectedEventDescription}</p>
                      <div className="flex items-center gap-3 text-[0.8rem] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock3 size={13} />
                          {formatClock(selectedEvent.startTime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={13} />
                          {selectedEvent.attendeeIds.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={13} />
                          {formatDistanceKm(
                            computeDistanceKm(userLocation, selectedEvent.location),
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    shape="circle"
                    className="!h-10 !w-10 !min-w-10 !rounded-full !p-0 !shadow-[4px_4px_0_#2C2C2C] shrink-0"
                    icon={<ArrowRight size={16} />}
                  />
                </div>
              </Card>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="absolute bottom-0 left-0 right-0 z-[700] p-3">
              <Card className="flex flex-col items-center justify-center gap-2 rounded-2xl p-6 text-center">
                <h2 className="text-base font-bold text-foreground">No sessions match these filters.</h2>
                <p className="text-sm text-muted-foreground">Reset the filters or launch a new session from the map.</p>
              </Card>
            </div>
          ) : (
            <div className="absolute bottom-0 left-0 right-0 z-[700] p-3">
              <div className="flex items-center justify-center">
                <Tag className="m-0 inline-flex items-center gap-2 rounded-full border border-border bg-[color:var(--surface-strong)] px-4 py-2 text-sm font-medium text-muted-foreground">
                  Tap a pin to preview, or tap map to clear.
                </Tag>
              </div>
            </div>
          )}

          <div
            className="absolute bottom-6 right-4 z-[600] flex flex-col gap-3"
          >
            <Button
              type="primary"
              shape="circle"
              className="!inline-flex !h-14 !w-14 !min-w-14 !items-center !justify-center !rounded-full !p-0 !shadow-[4px_4px_0_#2C2C2C]"
              htmlType="button"
              onClick={() => navigate('/create')}
              aria-label="Create event"
              icon={<Plus size={26} />}
            />
            <Button
              type="default"
              shape="circle"
              className="!inline-flex !h-[52px] !w-[52px] !min-w-[52px] !items-center !justify-center !rounded-full !p-0 !shadow-[4px_4px_0_#2C2C2C]"
              htmlType="button"
              onClick={() => setSelectedEventId(null)}
              aria-label="Clear selected session preview"
              icon={<Crosshair size={22} style={{ transform: 'translateY(1px)' }} />}
            />
          </div>
        </section>
      </main>
    </AppFrame>
  );
}

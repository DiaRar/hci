import {
  ArrowRight,
  Clock3,
  Crosshair,
  LogOut,
  MapPin,
  Plus,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { AppFrame } from '../components/AppFrame';
import { Avatar } from '../components/Avatar';
import { EventMap } from '../components/EventMap';
import type { DiscoverFilters } from '../components/FiltersBar';
import { CATEGORY_META } from '../lib/constants';
import {
  computeDistanceKm,
  formatClock,
  formatDistanceKm,
} from '../lib/format';
import { useBubbleStore } from '../store/BubbleStore';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { cn } from '@/lib/utils';

const initialFilters: DiscoverFilters = {
  category: 'all',
  cost: 'all',
  skill: 'all',
  womenOnly: false,
  sort: 'closest',
};

export function DiscoverPage() {
  const [searchParams] = useSearchParams();
  const { currentUser, events, userLocation, signOut } = useBubbleStore();
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

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <AppFrame showNav={false}>
      <main className="screen screen--discover">
        <section className="discover-map-wrap">
          <EventMap
            events={filteredEvents}
            userLocation={userLocation}
            selectedEventId={selectedEvent?.id ?? null}
            onSelectEvent={setSelectedEventId}
            showZoomControl={false}
          />

          <div className="discover-overlay discover-overlay--top">
            <div className="discover-toolbar">
              {currentUser ? (
                <Link
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'icon' }),
                    'discover-toolbar__icon',
                  )}
                  to="/profile/me"
                  aria-label="Open profile"
                >
                  <Avatar user={currentUser} size="md" />
                </Link>
              ) : (
                <span className="discover-toolbar__icon discover-toolbar__icon--placeholder" />
              )}

              <div className="discover-brand-pill">Bubbleverse</div>

              <Button
                variant="outline"
                size="icon"
                className="discover-toolbar__icon"
                type="button"
                onClick={signOut}
                aria-label="Sign out"
              >
                <LogOut size={18} />
              </Button>
            </div>

            <div className="discover-filter-stack">
              <Button
                variant={filtersOpen ? 'secondary' : 'outline'}
                className="discover-filter-chip"
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
              >
                <SlidersHorizontal size={15} />
                <span>{filterSummary}</span>
                <span className="discover-filter-chip__count">{filteredEvents.length}</span>
              </Button>

              {filtersOpen ? (
                <Card className="discover-filter-popover">
                  <div className="discover-filter-popover__header">
                    <div>
                      <p className="eyebrow">Filters</p>
                      <h2>Tune the session feed.</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-button"
                      type="button"
                      onClick={clearFilters}
                    >
                      Reset
                    </Button>
                  </div>

                  <div className="discover-filter-pills">
                    <Button
                      variant={filters.category === 'all' ? 'default' : 'outline'}
                      size="sm"
                      className="pill-button"
                      type="button"
                      onClick={() =>
                        setFilters((current) => ({ ...current, category: 'all' }))
                      }
                    >
                      All
                    </Button>
                    {Object.entries(CATEGORY_META).map(([id, meta]) => (
                      <Button
                        key={id}
                        type="button"
                        variant={filters.category === id ? 'default' : 'outline'}
                        size="sm"
                        className="pill-button"
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

                  <div className="discover-filter-grid">
                    <label className="field field--compact">
                      <span className="field__label">Cost</span>
                      <NativeSelect
                        className="w-full"
                        value={filters.cost}
                        onChange={(event) =>
                          setFilters((current) => ({
                            ...current,
                            cost: event.target.value as DiscoverFilters['cost'],
                          }))
                        }
                      >
                        <NativeSelectOption value="all">Any</NativeSelectOption>
                        <NativeSelectOption value="free">Free</NativeSelectOption>
                        <NativeSelectOption value="budget">Budget</NativeSelectOption>
                        <NativeSelectOption value="premium">Premium</NativeSelectOption>
                      </NativeSelect>
                    </label>

                    <label className="field field--compact">
                      <span className="field__label">Skill</span>
                      <NativeSelect
                        className="w-full"
                        value={filters.skill}
                        onChange={(event) =>
                          setFilters((current) => ({
                            ...current,
                            skill: event.target.value as DiscoverFilters['skill'],
                          }))
                        }
                      >
                        <NativeSelectOption value="all">All</NativeSelectOption>
                        <NativeSelectOption value="open">Open</NativeSelectOption>
                        <NativeSelectOption value="beginner">Beginner</NativeSelectOption>
                        <NativeSelectOption value="intermediate">Intermediate</NativeSelectOption>
                        <NativeSelectOption value="advanced">Advanced</NativeSelectOption>
                      </NativeSelect>
                    </label>
                  </div>

                  <div className="discover-filter-actions">
                    <Button
                      variant={filters.womenOnly ? 'default' : 'outline'}
                      size="sm"
                      className="pill-button"
                      type="button"
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
                      variant={filters.sort === 'closest' ? 'default' : 'outline'}
                      size="sm"
                      className="pill-button"
                      type="button"
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
            <div className="discover-overlay discover-overlay--bottom">
              <Link className="discover-event-preview" to={`/event/${selectedEvent.id}`}>
                <div className="discover-event-preview__main">
                  <Badge
                    className="category-token"
                    style={{
                      background: CATEGORY_META[selectedEvent.category].glow,
                      color: CATEGORY_META[selectedEvent.category].accent,
                    }}
                  >
                    <span>{CATEGORY_META[selectedEvent.category].emoji}</span>
                    {CATEGORY_META[selectedEvent.category].label}
                  </Badge>

                  <div className="discover-event-preview__copy">
                    <h2>{selectedEvent.title}</h2>
                    <div className="discover-event-preview__meta">
                      <span>
                        <Clock3 size={13} />
                        {formatClock(selectedEvent.startTime)}
                      </span>
                      <span>
                        <Users size={13} />
                        {selectedEvent.attendeeIds.length}
                      </span>
                      <span>
                        <MapPin size={13} />
                        {formatDistanceKm(
                          computeDistanceKm(userLocation, selectedEvent.location),
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="discover-event-preview__action">
                  <ArrowRight size={16} />
                </span>
              </Link>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="discover-overlay discover-overlay--bottom">
              <Card className="discover-empty-card">
                <h2>No sessions match these filters.</h2>
                <p>Reset the filters or launch a new session from the map.</p>
              </Card>
            </div>
          ) : (
            <div className="discover-overlay discover-overlay--bottom">
              <div className="discover-hint-pill">
                Tap a pin to preview the session.
              </div>
            </div>
          )}

          <div className="discover-fab-stack">
            <Link
              className={cn(
                buttonVariants({ size: 'icon-lg' }),
                'discover-fab discover-fab--primary',
              )}
              to="/create"
              aria-label="Create event"
            >
              <Plus size={26} />
            </Link>
            <Button
              variant="outline"
              size="icon-lg"
              className="discover-fab discover-fab--secondary"
              type="button"
              onClick={() => setSelectedEventId(null)}
              aria-label="Center on your location"
            >
              <Crosshair size={20} />
            </Button>
          </div>
        </section>
      </main>
    </AppFrame>
  );
}

import { useEffect } from 'react';
import { CircleMarker, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { divIcon, type LeafletMouseEvent } from 'leaflet';

import { CATEGORY_META } from '../lib/constants';
import type { Event, EventLocation } from '../types';

type EventMapProps = {
  events: Event[];
  userLocation: EventLocation;
  selectedEventId?: string | null;
  onSelectEvent?: (eventId: string) => void;
  pickerLocation?: EventLocation;
  onPickLocation?: (location: EventLocation) => void;
  compact?: boolean;
  showZoomControl?: boolean;
};

export function EventMap({
  events,
  userLocation,
  selectedEventId,
  onSelectEvent,
  pickerLocation,
  onPickLocation,
  compact = false,
  showZoomControl = !compact,
}: EventMapProps) {
  const selectedEvent = events.find((event) => event.id === selectedEventId);
  const center = pickerLocation ?? selectedEvent?.location ?? userLocation;
  const centerPoint: [number, number] = [center.lat, center.lng];

  return (
    <div className={`map-shell${compact ? ' map-shell--compact' : ''}`}>
      <MapContainer
        center={centerPoint}
        zoom={14}
        className="event-map"
        scrollWheelZoom={false}
        zoomControl={showZoomControl}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapViewport center={center} compact={compact} />
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={compact ? 8 : 10}
          pathOptions={{
            color: '#6b5cff',
            fillColor: '#6b5cff',
            fillOpacity: 0.24,
            weight: 2,
          }}
        />

        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.location.lat, event.location.lng]}
            icon={buildEventPin(event, event.id === selectedEventId)}
            eventHandlers={{
              click: () => onSelectEvent?.(event.id),
            }}
          />
        ))}

        {pickerLocation ? (
          <Marker
            position={[pickerLocation.lat, pickerLocation.lng]}
            icon={divIcon({
              className: 'bubble-map-pin',
              html: `
                <div class="map-pin map-pin--picker">
                  <span class="map-pin__glow"></span>
                  <span class="map-pin__core">
                    <span class="map-pin__emoji">📍</span>
                  </span>
                </div>
              `,
              iconSize: [56, 56],
              iconAnchor: [28, 42],
            })}
          />
        ) : null}

        {onPickLocation ? (
          <MapPicker
            pickerLocation={pickerLocation}
            onPickLocation={onPickLocation}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}

function MapViewport({ center, compact }: { center: EventLocation; compact: boolean }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([center.lat, center.lng], compact ? 14 : 14, {
      animate: true,
      duration: 0.7,
    });
  }, [center.lat, center.lng, compact, map]);

  return null;
}

function MapPicker({
  pickerLocation,
  onPickLocation,
}: {
  pickerLocation?: EventLocation;
  onPickLocation: (location: EventLocation) => void;
}) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPickLocation({
        label: pickerLocation?.label || 'Pinned location',
        lat: Number(event.latlng.lat.toFixed(5)),
        lng: Number(event.latlng.lng.toFixed(5)),
      });
    },
  });

  return null;
}

function buildEventPin(event: Event, isSelected: boolean) {
  const category = CATEGORY_META[event.category];
  const selectedClassName = isSelected ? ' map-pin--selected' : '';

  return divIcon({
    className: 'bubble-map-pin',
    html: `
      <div class="map-pin ${category.pinClassName}${selectedClassName}">
        <span class="map-pin__glow"></span>
        <span class="map-pin__core">
          <span class="map-pin__emoji">${category.emoji}</span>
        </span>
        <span class="map-pin__count">${event.attendeeIds.length}</span>
      </div>
    `,
    iconSize: [58, 58],
    iconAnchor: [29, 44],
  });
}

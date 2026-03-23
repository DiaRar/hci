import { ATTENDANCE_LABELS } from './constants';
import type { AttendanceStatus, EventLocation, LocationPoint } from '../types';

export function formatEventWindow(startTime: string, durationMinutes: number) {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  return `${new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(start)} · ${new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(start)} - ${new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(end)}`;
}

export function formatClock(startTime: string) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(startTime));
}

export function formatCurrency(price: number) {
  if (price <= 0) {
    return 'Free';
  }

  return `€${price}`;
}

export function formatDistanceKm(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
}

export function computeDistanceKm(a: LocationPoint, b: LocationPoint) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const startLat = toRadians(a.lat);
  const endLat = toRadians(b.lat);

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2) *
      Math.cos(startLat) *
      Math.cos(endLat);

  const angle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadiusKm * angle;
}

export function formatAttendanceStatus(status: AttendanceStatus) {
  return ATTENDANCE_LABELS[status];
}

export function getInitials(name: string) {
  const parts = name
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function toLocalDateTimeInputValue(isoString?: string) {
  const source = isoString ? new Date(isoString) : new Date(Date.now() + 90 * 60_000);
  const pad = (value: number) => value.toString().padStart(2, '0');
  const year = source.getFullYear();
  const month = pad(source.getMonth() + 1);
  const day = pad(source.getDate());
  const hours = pad(source.getHours());
  const minutes = pad(source.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getLocationLabel(location: EventLocation) {
  return `${location.label} · ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

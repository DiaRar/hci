/**
 * Bubbleverse Formatting Utilities
 *
 * This module contains all date/time, currency, and distance formatting
 * functions. Keeping these centralized ensures consistent formatting
 * across the app and makes it easy to adjust formats later.
 *
 * All functions are pure (no side effects) and return strings ready
 * for display in the UI.
 */

import { ATTENDANCE_LABELS } from './constants';
import type { AttendanceStatus, EventLocation, LocationPoint } from '../types';

/**
 * Format an event's start time and duration into a human-readable window.
 * Example output: "Thu, Jun 15 · 6:30 PM - 8:00 PM"
 *
 * Uses Intl.DateTimeFormat for locale-aware formatting.
 */
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

/**
 * Format a time as a simple clock string.
 * Example output: "6:30 PM"
 */
export function formatClock(startTime: string) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(startTime));
}

/**
 * Format a price for display.
 * Free events return "Free" instead of "€0".
 */
export function formatCurrency(price: number) {
  if (price <= 0) {
    return 'Free';
  }

  return `€${price}`;
}

/**
 * Format a distance in a human-readable way.
 * - Under 1km: shows meters ("450 m away")
 * - 1km or more: shows kilometers with one decimal ("2.3 km away")
 */
export function formatDistanceKm(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }

  return `${distanceKm.toFixed(1)} km away`;
}

/**
 * Calculate distance between two geographic coordinates using the Haversine formula.
 * This is the standard formula for computing great-circle distance on a sphere.
 *
 * @param a - First location (user location or event location)
 * @param b - Second location (user location or event location)
 * @returns Distance in kilometers
 */
export function computeDistanceKm(a: LocationPoint, b: LocationPoint) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const startLat = toRadians(a.lat);
  const endLat = toRadians(b.lat);

  // Haversine formula for great-circle distance
  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2) *
      Math.cos(startLat) *
      Math.cos(endLat);

  const angle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
  return earthRadiusKm * angle;
}

/**
 * Convert an AttendanceStatus enum value to a human-readable label.
 * Uses ATTENDANCE_LABELS from constants.
 */
export function formatAttendanceStatus(status: AttendanceStatus) {
  return ATTENDANCE_LABELS[status];
}

/**
 * Extract initials from a display name.
 * Takes first letter of first two words, uppercased.
 * Examples: "John Doe" -> "JD", "Alice" -> "A", "John Paul Smith" -> "JP"
 */
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

/**
 * Generate a value for <input type="datetime-local">.
 * Defaults to 90 minutes from now if no ISO string provided.
 *
 * This is used in CreatePage to set the default start time for new events.
 * The 90-minute offset gives the user time to fill out the form before
 * the event starts without being so far in the future that it feels irrelevant.
 */
export function toLocalDateTimeInputValue(isoString?: string) {
  // Default to 90 minutes from now for new event defaults
  const source = isoString ? new Date(isoString) : new Date(Date.now() + 90 * 60_000);
  const pad = (value: number) => value.toString().padStart(2, '0');
  const year = source.getFullYear();
  const month = pad(source.getMonth() + 1);
  const day = pad(source.getDate());
  const hours = pad(source.getHours());
  const minutes = pad(source.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Format an EventLocation as a single string for display.
 * Includes coordinates at low precision.
 * Example: "X TU Delft Outdoor Courts · 51.998, 4.365"
 */
export function getLocationLabel(location: EventLocation) {
  return `${location.label} · ${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`;
}

/** Helper: convert degrees to radians for Haversine calculation */
function toRadians(value: number) {
  return (value * Math.PI) / 180;
}
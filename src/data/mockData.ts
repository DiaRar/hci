/**
 * Bubbleverse Mock Data
 *
 * This module contains the initial state for the application - demo users,
 * events, and messages that populate the app on first load (or after
 * localStorage is cleared).
 *
 * ============================================================================
 * DESIGN DECISIONS
 * ============================================================================
 *
 * Time-based data:
 * - All event start times are generated relative to "now" using buildFutureDate()
 *   This ensures the demo always shows upcoming events, never past ones.
 * - Messages use buildRecentDate() to show realistic conversation timestamps.
 *
 * Realistic scenarios:
 * - Each user has a distinct personality reflected in their bio and interests
 * - Events span different sports, price points, skill levels, and timing
 * - A "flagged" message demonstrates the demo moderation system
 * - Some users have trustFlags.noShowStrikes or trustFlags.reportCount > 0
 *   to demonstrate the trust system UI
 *
 * Geographic clustering:
 * - All events are centered around X TU Delft (51.99935, 4.37344) in Delft, Netherlands
 * - This creates a realistic "nearby" discovery experience
 * - In production, you'd pull real venues from an API
 *
 * ============================================================================
 * DATA STRUCTURE
 * ============================================================================
 *
 * The mock data mirrors what would come from a real backend:
 * - Users are fully fleshed out with profiles
 * - Events reference user IDs (hostId, attendeeIds) not full objects
 * - Messages are scoped to events (eventId) not direct user-to-user
 *
 * This shape matches the BubbleState type defined in types.ts
 */

import { CATEGORY_META } from '../lib/constants';
import type { AttendanceStatus, BubbleState, Event, Message, User } from '../types';

// ============================================================================
// HELPERS - Date Building
// ============================================================================

/**
 * Generate a future date ISO string.
 * Used for event start times that are relative to "today".
 *
 * @param dayOffset - Days from today (0 = today, 1 = tomorrow)
 * @param hour - Hour in 24h format
 * @param minute - Minutes
 * @returns ISO date string
 */
function buildFutureDate(dayOffset: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

/**
 * Generate a past date ISO string relative to now.
 * Used for message timestamps that show realistic "X hours ago" formatting.
 *
 * @param hoursAgo - How many hours in the past
 * @param minuteOffset - Additional minutes to subtract
 * @returns ISO date string
 */
function buildRecentDate(hoursAgo: number, minuteOffset = 0) {
  return new Date(Date.now() - hoursAgo * 60 * 60_000 - minuteOffset * 60_000).toISOString();
}

/**
 * Build attendance counts object from a statuses map.
 * This is the inverse of what recalculateAttendanceCounts() does in the store -
 * it's used to initialize event data with the correct counts.
 *
 * @param statuses - Map of userId -> AttendanceStatus
 * @returns Record with counts for each status
 */
function buildAttendanceCounts(statuses: Record<string, AttendanceStatus>) {
  return {
    interested: Object.values(statuses).filter((status) => status === 'interested').length,
    on_my_way: Object.values(statuses).filter((status) => status === 'on_my_way').length,
    here: Object.values(statuses).filter((status) => status === 'here').length,
  };
}

// ============================================================================
// DEMO USERS
// ============================================================================

/**
 * Five demo users with varied profiles, interests, and trust histories.
 *
 * Notable patterns:
 * - user-iulia: verifiedHost=true (organizes sessions), friends with Rares and Miruna
 * - user-rares: verifiedHost=true, friends with Iulia and Calin
 * - user-calin: has 1 noShowStrike (demonstrates the strikes UI)
 * - user-miruna: has 1 reportCount (demonstrates the reports UI)
 * - user-alina: verifiedHost=true, friends with Calin and Miruna
 */
const users: User[] = [
  {
    id: 'user-iulia',
    displayName: 'Iulia',
    bio: 'Organizes racket sessions with clear start times, proper pairings, and zero guesswork.',
    interests: ['Padel', 'Tennis', 'Training'],
    languages: ['English', 'Romanian'],
    nearbyDiscoveryEnabled: true,
    avatarPreset: '#d96f4a',
    friends: ['user-rares', 'user-miruna'],
    trustFlags: {
      verifiedHost: true,
      noShowStrikes: 0,
      reportCount: 0,
      blockedUserIds: [],
    },
  },
  {
    id: 'user-rares',
    displayName: 'Rares',
    bio: 'Likes football, gym sessions, and event cards that make the format obvious before you commit.',
    interests: ['Football', 'Training', 'Running'],
    languages: ['English', 'Dutch'],
    nearbyDiscoveryEnabled: true,
    avatarPreset: '#e6a241',
    friends: ['user-iulia', 'user-calin'],
    trustFlags: {
      verifiedHost: true,
      noShowStrikes: 0,
      reportCount: 0,
      blockedUserIds: [],
    },
  },
  {
    id: 'user-calin',
    displayName: 'Calin',
    bio: 'Best with small running groups, clean pacing notes, and low-chaos training plans.',
    interests: ['Running', 'Training', 'Basketball'],
    languages: ['English', 'Romanian'],
    nearbyDiscoveryEnabled: true,
    avatarPreset: '#0f8d84',
    friends: ['user-rares', 'user-alina'],
    trustFlags: {
      // Calin has 1 no-show strike - demonstrates the strikes badge on profile
      verifiedHost: false,
      noShowStrikes: 1,
      reportCount: 0,
      blockedUserIds: [],
    },
  },
  {
    id: 'user-alina',
    displayName: 'Alina',
    bio: 'Hosts welcoming court sessions with simple rules, clear skill levels, and visible attendance.',
    interests: ['Tennis', 'Basketball', 'Running'],
    languages: ['English', 'Romanian'],
    nearbyDiscoveryEnabled: true,
    avatarPreset: '#7a9f2f',
    friends: ['user-calin', 'user-miruna'],
    trustFlags: {
      verifiedHost: true,
      noShowStrikes: 0,
      reportCount: 0,
      blockedUserIds: [],
    },
  },
  {
    id: 'user-miruna',
    displayName: 'Miruna',
    bio: 'Usually joins if the sport, court, and player count all look solid from the start.',
    interests: ['Basketball', 'Padel', 'Football'],
    languages: ['English', 'Romanian'],
    nearbyDiscoveryEnabled: true,
    avatarPreset: '#5f7cff',
    friends: ['user-iulia', 'user-alina'],
    trustFlags: {
      // Miruna has 1 report - demonstrates the report count badge
      verifiedHost: false,
      noShowStrikes: 0,
      reportCount: 1,
      blockedUserIds: [],
    },
  },
];

// ============================================================================
// DEMO EVENTS
// ============================================================================

/**
 * Six demo events spanning different sports, timing, and configurations.
 *
 * Event selection for variety:
 * - event-tennis: women-only, beginner, has 'here' attendees (live now feeling)
 * - event-padel: open level, near-term, mixed statuses
 * - event-football: tomorrow, lowest price
 * - event-basketball: tonight, intermediate timing
 * - event-running: very early morning (hardcoded 7:15 AM)
 * - event-training: highest price, demonstration of equipment/facilities
 *
 * Events are spread across the broader TU Delft / X TU Delft area (~0.4-1.2km apart)
 */
const events: Event[] = [
  {
    id: 'event-tennis',
    hostId: 'user-alina',
    title: 'Women-Only Beginner Tennis',
    description:
      'Starter-friendly doubles session with simple drills, easy rallies, and a clear court meeting point.',
    category: 'tennis',
    icon: CATEGORY_META.tennis.emoji,
    location: {
      label: 'X TU Delft Outdoor Courts North',
      lat: 52.00042,
      lng: 4.37248,
    },
    // Today at 18:30 - good evening slot
    startTime: buildFutureDate(0, 18, 30),
    durationMinutes: 90,
    price: 12,
    skillLevel: 'beginner',
    womenOnly: true,
    requiredEquipment: ['Tennis racket', 'Water bottle'],
    extraFacilities: ['Lockers', 'Showers'],
    // Alina (host), Iulia (on_my_way), Miruna (here)
    // The 'here' status makes it feel like people are already there
    attendeeIds: ['user-alina', 'user-iulia', 'user-miruna'],
    attendanceStatuses: {
      'user-alina': 'interested',
      'user-iulia': 'on_my_way',
      'user-miruna': 'here',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-alina': 'interested',
      'user-iulia': 'on_my_way',
      'user-miruna': 'here',
    }),
    chatId: 'chat-tennis',
    reminderUserIds: ['user-alina', 'user-iulia'],
    safetyNote: 'Court number is posted in chat before first serve.',
  },
  {
    id: 'event-padel',
    hostId: 'user-iulia',
    title: 'Padel Doubles Warm-Up',
    description:
      'Short rotation-based padel session for players who want fast games, clean pairings, and a visible start time.',
    category: 'padel',
    icon: CATEGORY_META.padel.emoji,
    location: {
      label: 'X TU Delft Padel Courts',
      lat: 51.99868,
      lng: 4.37512,
    },
    // Today at 17:45 - slightly earlier afternoon
    startTime: buildFutureDate(0, 17, 45),
    durationMinutes: 75,
    price: 10,
    skillLevel: 'open',
    womenOnly: false,
    requiredEquipment: ['Padel racket', 'Water bottle'],
    extraFacilities: ['Equipment rental', 'Outdoor courts'],
    attendeeIds: ['user-iulia', 'user-rares', 'user-miruna'],
    attendanceStatuses: {
      'user-iulia': 'interested',
      'user-rares': 'interested',
      'user-miruna': 'on_my_way',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-iulia': 'interested',
      'user-rares': 'interested',
      'user-miruna': 'on_my_way',
    }),
    chatId: 'chat-padel',
    reminderUserIds: ['user-iulia', 'user-miruna'],
    safetyNote: 'Meet beside the padel fence before splitting into pairs.',
  },
  {
    id: 'event-football',
    hostId: 'user-rares',
    title: '5-a-Side Football Runout',
    description:
      'Casual small-sided game with rotating subs, clear teams, and a quick warm-up before kickoff.',
    category: 'football',
    icon: CATEGORY_META.football.emoji,
    location: {
      label: 'X TU Delft Football Field',
      lat: 51.99694,
      lng: 4.37136,
    },
    // Tomorrow at 19:00 - evening slot next day
    startTime: buildFutureDate(1, 19, 0),
    durationMinutes: 80,
    price: 6, // Budget-friendly
    skillLevel: 'open',
    womenOnly: false,
    requiredEquipment: ['Football boots', 'Water bottle'],
    extraFacilities: ['Outdoor courts', 'Water fountain'],
    attendeeIds: ['user-rares', 'user-calin', 'user-alina', 'user-miruna'],
    attendanceStatuses: {
      'user-rares': 'interested',
      'user-calin': 'interested',
      'user-alina': 'on_my_way',
      'user-miruna': 'interested',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-rares': 'interested',
      'user-calin': 'interested',
      'user-alina': 'on_my_way',
      'user-miruna': 'interested',
    }),
    chatId: 'chat-football',
    reminderUserIds: ['user-rares'],
    safetyNote: 'We meet at the sideline gate before picking bib colors.',
  },
  {
    id: 'event-basketball',
    hostId: 'user-miruna',
    title: 'Basketball Shootaround',
    description:
      'Light indoor run with shooting reps, quick half-court games, and room for a few late joiners.',
    category: 'basketball',
    icon: CATEGORY_META.basketball.emoji,
    location: {
      label: 'X TU Delft Indoor Hall East',
      lat: 51.99786,
      lng: 4.37466,
    },
    // Today at 20:00 - late evening
    startTime: buildFutureDate(0, 20, 0),
    durationMinutes: 70,
    price: 8,
    skillLevel: 'open',
    womenOnly: false,
    requiredEquipment: ['Basketball shoes', 'Water bottle'],
    extraFacilities: ['Indoor courts', 'Lockers'],
    attendeeIds: ['user-miruna', 'user-alina', 'user-iulia'],
    attendanceStatuses: {
      'user-miruna': 'interested',
      'user-alina': 'interested',
      'user-iulia': 'here',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-miruna': 'interested',
      'user-alina': 'interested',
      'user-iulia': 'here',
    }),
    chatId: 'chat-basketball',
    reminderUserIds: ['user-miruna'],
    safetyNote: 'Hall entrance is public and visible from the map pin.',
  },
  {
    id: 'event-running',
    hostId: 'user-calin',
    title: 'Mekelpark Tempo Run',
    description:
      'Structured campus run with one easy warm-up loop, one tempo block, and a clear finish point.',
    category: 'running',
    icon: CATEGORY_META.running.emoji,
    location: {
      label: 'X TU Delft Mekelpark South Loop Start',
      lat: 52.00218,
      lng: 4.36982,
    },
    // Today at 07:15 - early morning run (hardcoded for demo variety)
    startTime: buildFutureDate(0, 7, 15),
    durationMinutes: 50,
    price: 0, // Free
    skillLevel: 'intermediate',
    womenOnly: false,
    requiredEquipment: ['Running shoes', 'Water bottle'],
    extraFacilities: ['Water fountain', 'Outdoor courts'],
    attendeeIds: ['user-calin', 'user-rares', 'user-iulia', 'user-miruna'],
    attendanceStatuses: {
      'user-calin': 'interested',
      'user-rares': 'interested',
      'user-iulia': 'on_my_way',
      'user-miruna': 'interested',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-calin': 'interested',
      'user-rares': 'interested',
      'user-iulia': 'on_my_way',
      'user-miruna': 'interested',
    }),
    chatId: 'chat-running',
    reminderUserIds: ['user-calin', 'user-rares'],
    safetyNote: 'We regroup at the same visible start point after the final interval.',
  },
  {
    id: 'event-training',
    hostId: 'user-rares',
    title: 'Strength Circuit Hour',
    description:
      'Small-group training block with guided rounds, clear rest timing, and enough space for all levels.',
    category: 'training',
    icon: CATEGORY_META.training.emoji,
    location: {
      label: 'X TU Delft Gym Floor West',
      lat: 51.99572,
      lng: 4.37608,
    },
    // Tomorrow at 18:15 - early evening tomorrow
    startTime: buildFutureDate(1, 18, 15),
    durationMinutes: 60,
    price: 14, // Highest price - premium session
    skillLevel: 'open',
    womenOnly: false,
    requiredEquipment: ['Resistance band', 'Water bottle'],
    extraFacilities: ['Showers', 'Equipment rental'],
    attendeeIds: ['user-rares', 'user-calin', 'user-iulia'],
    attendanceStatuses: {
      'user-rares': 'interested',
      'user-calin': 'interested',
      'user-iulia': 'interested',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-rares': 'interested',
      'user-calin': 'interested',
      'user-iulia': 'interested',
    }),
    chatId: 'chat-training',
    reminderUserIds: ['user-rares'],
    safetyNote: 'Check in at the gym desk before heading to the marked training zone.',
  },
];

// ============================================================================
// DEMO MESSAGES
// ============================================================================

/**
 * Sample chat messages across different events.
 *
 * Demonstrates:
 * - Natural conversation flow (questions, confirmations)
 * - Realistic timing (some events have more chat activity)
 * - Demo moderation: one message is flagged (contains "pills" keyword)
 *
 * Message timing:
 * - event-padel has 2 messages, recent (2h and 1h58m ago)
 * - event-tennis has 1 message, older (5h ago)
 * - event-basketball has 1 FLAGGED message (4h43m ago) - demo moderation demo
 * - event-football has 1 message, very recent (1h35m ago)
 * - event-running has 1 message, oldest (8h ago)
 */
const messages: Message[] = [
  {
    id: 'message-1',
    eventId: 'event-padel',
    senderId: 'user-iulia',
    text: 'I booked the left court. We can rotate partners every 15 minutes.',
    createdAt: buildRecentDate(2, 10),
    demoModerationState: 'clean',
  },
  {
    id: 'message-2',
    eventId: 'event-padel',
    senderId: 'user-miruna',
    text: 'Perfect. I am coming in from the bike racks and should be there in five.',
    createdAt: buildRecentDate(1, 58),
    demoModerationState: 'clean',
  },
  {
    id: 'message-3',
    eventId: 'event-tennis',
    senderId: 'user-alina',
    text: 'Bring water. We start with easy rallies before moving into doubles games.',
    createdAt: buildRecentDate(5, 12),
    demoModerationState: 'clean',
  },
  {
    id: 'message-4',
    eventId: 'event-basketball',
    senderId: 'user-calin',
    // This message gets flagged by demo moderation (contains "pills")
    text: 'Anyone want to buy pills after the run?',
    createdAt: buildRecentDate(4, 43),
    demoModerationState: 'flagged',
  },
  {
    id: 'message-5',
    eventId: 'event-football',
    senderId: 'user-rares',
    text: 'I will bring bibs. If we hit 10 players we stay 5-a-side with rolling subs.',
    createdAt: buildRecentDate(1, 35),
    demoModerationState: 'clean',
  },
  {
    id: 'message-6',
    eventId: 'event-running',
    senderId: 'user-calin',
    text: 'Warm-up pace stays easy. The faster block starts only after the second bridge.',
    createdAt: buildRecentDate(8, 8),
    demoModerationState: 'clean',
  },
];

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * The complete initial state for the application.
 * This is loaded on first visit or when localStorage is cleared.
 *
 * Default values:
 * - currentUserId: null (no one logged in)
 * - lastCreatedEventId: null (no events created yet)
 * - userLocation: X TU Delft center (realistic demo location)
 * - reports: empty array (no safety reports yet)
 */
export const initialBubbleState: BubbleState = {
  currentUserId: null,
  lastCreatedEventId: null,
  // Mock user location - in production would use navigator.geolocation
  userLocation: {
    label: 'X TU Delft',
    lat: 51.99935,
    lng: 4.37344,
  },
  users,
  events,
  messages,
  reports: [],
};

/**
 * Recalculate attendance counts from a statuses map.
 * Exported for use in BubbleStore when mutating attendance.
 *
 * @param statuses - Map of userId -> AttendanceStatus
 * @returns Record with counts for interested, on_my_way, and here
 */
export function recalculateAttendanceCounts(statuses: Record<string, AttendanceStatus>) {
  return buildAttendanceCounts(statuses);
}
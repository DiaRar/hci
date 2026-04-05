/**
 * Bubbleverse Type Definitions
 *
 * This file contains all TypeScript types used throughout the application.
 * Types are organized by domain: User, Event, Message, and App-level types.
 *
 * Design decisions:
 * - Union types (CategoryId, SkillLevel) are used for controlled vocabularies
 * - EventLocation extends LocationPoint to model coordinate + label pattern
 * - AttendanceStatus does NOT include 'cant_make_it' to keep UI simpler
 * - trustFlags is a flat object rather than nested for easier serialization
 */

/**
 * Supported sport categories.
 * Each category has associated metadata in CATEGORY_META (lib/constants.ts).
 */
export type CategoryId =
  | 'tennis'
  | 'padel'
  | 'football'
  | 'basketball'
  | 'running'
  | 'training';

/**
 * Skill levels for sports sessions.
 * Used for filtering and displaying session difficulty.
 */
export type SkillLevel = 'open' | 'beginner' | 'intermediate' | 'advanced';

/**
 * Attendance statuses a user can have for an event.
 * Note: 'cant_make_it' was removed to simplify the UI flow - users can
 * just not join, or update their status to 'interested' if their plans change.
 */
export type AttendanceStatus = 'interested' | 'on_my_way' | 'here';

/** Cost filter options for the discover page filter UI. */
export type CostFilter = 'all' | 'free' | 'budget' | 'premium';

/** Sort mode for event listings - by proximity or by start time. */
export type SortMode = 'soonest' | 'closest';

/**
 * Demo moderation state for messages.
 * In production, this would be replaced with actual AI moderation or
 * community reporting workflows. For the demo, we flag messages
 * containing certain keywords.
 */
export type DemoModerationState = 'clean' | 'flagged';

/** Types of entities that can be reported in the trust & safety system. */
export type ReportTargetType = 'user' | 'event' | 'message';

/**
 * A geographic coordinate point.
 * Used as the base for user location and event locations.
 */
export type LocationPoint = {
  lat: number;
  lng: number;
};

/**
 * An event location with a human-readable label.
 * Extends LocationPoint with the venue name/address.
 */
export type EventLocation = LocationPoint & {
  label: string;
};

/**
 * User entity representing a person in the app.
 *
 * Note: 'friends' is a list of user IDs, not full objects.
 * This avoids circular references and keeps serialization simple.
 * We look up friend details from the users array when needed.
 *
 * trustFlags.noShowStrikes is a simple counter - in production,
 * you'd want timestamps and dispute mechanisms.
 */
export type User = {
  id: string;
  displayName: string;
  bio: string;
  interests: string[];
  languages: string[];
  nearbyDiscoveryEnabled: boolean;
  /** Hex color string for avatar background when no uploaded image */
  avatarPreset: string;
  /** IDs of users this person is friends with */
  friends: string[];
  trustFlags: {
    /** Whether this user has hosted verified sessions */
    verifiedHost: boolean;
    /** Count of no-show reports from other users */
    noShowStrikes: number;
    /** Total reports filed against this user */
    reportCount: number;
    /** IDs of users this person has blocked */
    blockedUserIds: string[];
  };
};

/**
 * Event entity representing a sports session.
 *
 * Key design decisions:
 * - hostId is stored separately from attendeeIds to quickly identify organizer
 * - attendanceStatuses is a map of userId -> status (not an array) for O(1) lookups
 * - attendanceCounts is denormalized for display efficiency (computed on mutation)
 * - chatId follows pattern 'chat-{eventId}' for easy relationship lookups
 * - safetyNote is optional, shown on women-only and some other sessions
 */
export type Event = {
  id: string;
  /** The user who created and organizes this session */
  hostId: string;
  title: string;
  description: string;
  category: CategoryId;
  /** Emoji character for the sport, stored for display efficiency */
  icon: string;
  location: EventLocation;
  startTime: string;
  durationMinutes: number;
  price: number;
  skillLevel: SkillLevel;
  womenOnly: boolean;
  requiredEquipment: string[];
  extraFacilities: string[];
  /** Users who have joined this event (includes host) */
  attendeeIds: string[];
  /** Denormalized count of each attendance status for fast display */
  attendanceCounts: Record<AttendanceStatus, number>;
  /** Map of userId -> their attendance status for this event */
  attendanceStatuses: Record<string, AttendanceStatus>;
  /** Links to the chat thread for this event */
  chatId: string;
  /** IDs of users who have enabled start-time reminders */
  reminderUserIds: string[];
  /** Optional safety note displayed to potential attendees */
  safetyNote?: string;
};

/**
 * A chat message within an event's group chat.
 *
 * demoModerationState allows showing "flagged" content differently
 * in the UI without removing it - this is a demo-appropriate approach.
 * In production, you'd want separate states like 'pending_review', 'approved', 'rejected'.
 */
export type Message = {
  id: string;
  eventId: string;
  senderId: string;
  text: string;
  createdAt: string;
  demoModerationState: DemoModerationState;
};

/** Payload for creating a report (before it's saved with an ID) */
export type ReportDraft = {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  notes: string;
};

/** A saved report with system-generated metadata */
export type ReportRecord = ReportDraft & {
  id: string;
  reporterId: string;
  createdAt: string;
};

/**
 * The complete application state shape.
 *
 * This is the schema that gets serialized to localStorage.
 * Changes here should be reflected in the mockData initial state
 * and the loadInitialState function in BubbleStore.
 */
export type BubbleState = {
  /** ID of the currently authenticated user, null if logged out */
  currentUserId: string | null;
  /** ID of the last event the user created (for navigation after creation) */
  lastCreatedEventId: string | null;
  /** Mock user location - in production this would come from geolocation API */
  userLocation: EventLocation;
  users: User[];
  events: Event[];
  messages: Message[];
  reports: ReportRecord[];
};

/** Payload for the authentication action (login or signup) */
export type AuthPayload = {
  displayName: string;
  interests: string[];
  nearbyDiscoveryEnabled: boolean;
};

/**
 * Payload for creating a new event.
 * This is a subset of Event fields - the store fills in IDs,
 * hostId, computed fields, and defaults.
 */
export type EventDraft = {
  title: string;
  description: string;
  category: CategoryId;
  startTime: string;
  durationMinutes: number;
  price: number;
  skillLevel: SkillLevel;
  womenOnly: boolean;
  requiredEquipment: string[];
  extraFacilities: string[];
  location: EventLocation;
};

/** Payload for updating the current user's profile */
export type ProfilePatch = {
  displayName: string;
  bio: string;
  interests: string[];
  languages: string[];
  nearbyDiscoveryEnabled: boolean;
};
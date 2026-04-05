/* eslint-disable react-refresh/only-export-components */
/**
 * Bubbleverse Global State Store
 *
 * This module implements a React Context-based state management solution
 * with localStorage persistence. It serves as the single source of truth
 * for all application data including users, events, messages, and auth state.
 *
 * ============================================================================
 * ARCHITECTURE OVERVIEW
 * ============================================================================
 *
 * The store follows a "Zustand-like" pattern adapted for React Context:
 *
 *   - BubbleStoreProvider wraps the app and manages state
 *   - useBubbleStore() hook gives components access to state AND actions
 *   - All state mutations happen via the action functions (no direct setState)
 *   - State is automatically persisted to localStorage on every change
 *
 * ============================================================================
 * LOCALSTORAGE PERSISTENCE
 * ============================================================================
 *
 * State is serialized to localStorage under key 'bubbleverse-demo-v4'.
 * On app load, we try to restore from localStorage, falling back to the
 * mock data defaults if nothing is stored or parsing fails.
 *
 * This means:
 *   - User stays logged in across page refreshes
 *   - Created events persist across browser sessions
 *   - Chat messages survive page reloads
 *
 * ============================================================================
 * DATA NORMALIZATION
 * ============================================================================
 *
 * Events maintain denormalized attendance counts (Record<AttendanceStatus, number>)
 * to avoid recalculating on every display. When attendanceStatuses changes,
 * we call recalculateAttendanceCounts() to update the counts.
 *
 * User IDs are used as references rather than object references.
 * This makes serialization simple and avoids circular reference issues.
 *
 * ============================================================================
 * AUTHENTICATION FLOW
 * ============================================================================
 *
 * Authentication works by:
 *   1. Looking up existing user by displayName (case-insensitive)
 *   2. If found, switching currentUserId to that user
 *   3. If not found, creating a new user with a generated ID
 *
 * This means users can "log in" by just entering their display name -
 * no passwords needed for this demo prototype.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';

import { initialBubbleState, recalculateAttendanceCounts } from '../data/mockData';
import { CATEGORY_META } from '../lib/constants';
import type {
  AttendanceStatus,
  AuthPayload,
  BubbleState,
  Event,
  EventDraft,
  ProfilePatch,
  ReportDraft,
  User,
} from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

/** localStorage key for persisting app state */
const STORAGE_KEY = 'bubbleverse-demo-v4';

/**
 * Color palette for auto-assigning avatar colors to new users.
 * Cycles through these colors based on user count.
 * In production, you'd allow users to upload profile photos.
 */
const avatarPalette = [
  '#8d5f48', '#efab47', '#4eb5a6',
  '#b4d63d', '#6b5cff', '#ff8b6d', '#5c9ded'
];

// ============================================================================
// TYPES
// ============================================================================

/**
 * The full store value shape - state + all action functions.
 * Components consume this via useBubbleStore().
 */
type BubbleStoreValue = BubbleState & {
  /** The currently authenticated user object (derived from currentUserId) */
  currentUser: User | null;
  /** Authenticate with display name - logs in existing user or creates new one */
  authenticate: (payload: AuthPayload) => void;
  /** Clear currentUserId to log out */
  signOut: () => void;
  /** Create a new event, returns eventId or null if no current user */
  createEvent: (draft: EventDraft) => string | null;
  /** Add current user to event attendees with 'interested' status */
  joinEvent: (eventId: string) => void;
  /** Update current user's attendance status for an event */
  setAttendance: (eventId: string, status: AttendanceStatus) => void;
  /** Toggle whether current user receives start-time reminders */
  toggleReminder: (eventId: string) => void;
  /** Send a message to an event's chat, runs demo moderation on content */
  sendMessage: (eventId: string, text: string) => void;
  /** Update current user's profile fields */
  updateProfile: (patch: ProfilePatch) => void;
  /** Add or remove a friend relationship with another user */
  toggleFriend: (targetUserId: string) => void;
  /** File a report against a user, event, or message */
  submitReport: (draft: ReportDraft) => void;
  /** Block a user - they can't join your sessions, you can't join theirs */
  blockUser: (targetUserId: string) => void;
  /** Export all current user's data as JSON (GDPR compliance helper) */
  exportCurrentUserData: () => string;
  /** Delete the current user account and all associated data */
  deleteCurrentUser: () => void;
};

// ============================================================================
// CONTEXT
// ============================================================================

const BubbleStoreContext = createContext<BubbleStoreValue | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * Wrap the app with this provider to give all components access to
 * the Bubbleverse store. Should be placed high in the component tree,
 * typically in main.tsx or App.tsx.
 */
export function BubbleStoreProvider({ children }: PropsWithChildren) {
  // Load initial state from localStorage, falling back to mock data
  const [state, setState] = useState<BubbleState>(loadInitialState);

  // Persist state to localStorage on every change
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Derive the currentUser object from currentUserId
  // This is stored on the value object for convenient access
  const currentUser = state.users.find((user) => user.id === state.currentUserId) ?? null;

  // -------------------------------------------------------------------------
  // All store actions are defined here
  // -------------------------------------------------------------------------
  const value: BubbleStoreValue = {
    ...state,
    currentUser,

    /**
     * Authenticate a user by display name.
     *
     * Flow:
     * 1. Normalize the display name (trim whitespace)
     * 2. Search for existing user with matching name (case-insensitive)
     * 3. If found, switch currentUserId to that user
     * 4. If not found, create a new user and add to users array
     *
     * New users get:
     * - Auto-generated ID
     * - Default bio
     * - Selected interests (or ['Running'] if none)
     * - Auto-assigned avatar color from palette
     * - Empty friends list
     * - No trust flags set
     */
    authenticate(payload) {
      const normalizedName = payload.displayName.trim();

      if (!normalizedName) {
        return; // Guard: empty names not allowed
      }

      setState((previous) => {
        // Check if user already exists (case-insensitive match)
        const existingUser = previous.users.find(
          (user) => user.displayName.toLowerCase() === normalizedName.toLowerCase(),
        );

        if (existingUser) {
          // Existing user found - just switch to them
          return {
            ...previous,
            currentUserId: existingUser.id,
          };
        }

        // New user - create them with generated ID and assigned avatar color
        const id = createId('user');
        const newUser: User = {
          id,
          displayName: normalizedName,
          bio: 'New around here. Looking for a first low-pressure sports session.',
          interests: payload.interests.length > 0 ? payload.interests : ['Running'],
          languages: ['English'],
          nearbyDiscoveryEnabled: payload.nearbyDiscoveryEnabled,
          avatarPreset: avatarPalette[previous.users.length % avatarPalette.length],
          friends: [],
          trustFlags: {
            verifiedHost: false,
            noShowStrikes: 0,
            reportCount: 0,
            blockedUserIds: [],
          },
        };

        return {
          ...previous,
          users: [newUser, ...previous.users], // Add to front of list
          currentUserId: id,
        };
      });
    },

    /**
     * Sign out by clearing the current user ID.
     * Note: We don't clear localStorage - the user stays in the user list.
     * They can log back in by just entering their name again.
     */
    signOut() {
      setState((previous) => ({
        ...previous,
        currentUserId: null,
      }));
    },

    /**
     * Create a new sports session event.
     *
     * Called from CreatePage after the multi-step form is completed.
     * The host is automatically added as an attendee with 'interested' status.
     * A welcome message is added to the event's chat.
     *
     * @returns The new event's ID, or null if no current user
     */
    createEvent(draft) {
      if (!state.currentUserId) {
        return null;
      }

      const eventId = createId('event');

      // Host's own attendance status - they start as 'interested'
      const hostStatus: Record<string, AttendanceStatus> = {
        [state.currentUserId]: 'interested',
      };

      // Build the complete event object
      const nextEvent: Event = {
        id: eventId,
        hostId: state.currentUserId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category,
        icon: CATEGORY_META[draft.category].emoji, // Look up emoji from category
        location: draft.location,
        startTime: draft.startTime,
        durationMinutes: draft.durationMinutes,
        price: draft.price,
        skillLevel: draft.skillLevel,
        womenOnly: draft.womenOnly,
        requiredEquipment: draft.requiredEquipment,
        extraFacilities: draft.extraFacilities,
        attendeeIds: [state.currentUserId],
        attendanceStatuses: hostStatus,
        attendanceCounts: recalculateAttendanceCounts(hostStatus),
        chatId: `chat-${eventId}`, // Follows naming convention for easy lookups
        reminderUserIds: [state.currentUserId], // Host gets reminder by default
        safetyNote: 'Exact court, field, or meetup point stays visible on the map in this demo.',
      };

      // Add welcome message to the event's chat
      const welcomeMessage = {
        id: createId('message'),
        eventId,
        senderId: state.currentUserId,
        text: 'Session launched. Share warm-up details or last-minute changes here.',
        createdAt: new Date().toISOString(),
        demoModerationState: 'clean' as const,
      };

      setState((previous) => ({
        ...previous,
        lastCreatedEventId: eventId, // Store for post-creation navigation
        events: [nextEvent, ...previous.events], // Add to front of events list
        messages: [welcomeMessage, ...previous.messages],
      }));

      return eventId;
    },

    /**
     * Join an event - adds current user to attendee list.
     * If already attending, this is a no-op.
     * Uses existing status if present (e.g., if coming from interested -> here).
     */
    joinEvent(eventId) {
      if (!state.currentUserId) {
        return;
      }

      setState((previous) => ({
        ...previous,
        events: previous.events.map((event) => {
          if (event.id !== eventId) return event;

          const nextStatuses = {
            ...event.attendanceStatuses,
            [state.currentUserId!]: event.attendanceStatuses[state.currentUserId!] ?? 'interested',
          };

          return {
            ...event,
            // Ensure user is in attendeeIds (Deduplicated via uniqueIds)
            attendeeIds: uniqueIds([...event.attendeeIds, state.currentUserId!]),
            attendanceStatuses: nextStatuses,
            attendanceCounts: recalculateAttendanceCounts(nextStatuses),
          };
        }),
      }));
    },

    /**
     * Update the current user's attendance status for a specific event.
     * Examples: 'interested' -> 'on_my_way', 'on_my_way' -> 'here'
     *
     * Also ensures the user is in attendeeIds (they might have
     * joined via joinEvent but then want to set a more specific status).
     */
    setAttendance(eventId, status) {
      if (!state.currentUserId) {
        return;
      }

      setState((previous) => ({
        ...previous,
        events: previous.events.map((event) => {
          if (event.id !== eventId) return event;

          const nextStatuses = {
            ...event.attendanceStatuses,
            [state.currentUserId!]: status,
          };

          return {
            ...event,
            attendeeIds: uniqueIds([...event.attendeeIds, state.currentUserId!]),
            attendanceStatuses: nextStatuses,
            attendanceCounts: recalculateAttendanceCounts(nextStatuses),
          };
        }),
      }));
    },

    /**
     * Toggle the start-time reminder for the current user.
     * If already enabled, disable it. If disabled, enable it.
     *
     * When enabled, the user is added to reminderUserIds.
     * In production, this would trigger a notification at startTime.
     * For the demo, it just toggles the switch state.
     */
    toggleReminder(eventId) {
      if (!state.currentUserId) {
        return;
      }

      setState((previous) => ({
        ...previous,
        events: previous.events.map((event) => {
          if (event.id !== eventId) return event;

          const isEnabled = event.reminderUserIds.includes(state.currentUserId!);
          return {
            ...event,
            reminderUserIds: isEnabled
              ? event.reminderUserIds.filter((userId) => userId !== state.currentUserId)
              : [...event.reminderUserIds, state.currentUserId!],
          };
        }),
      }));
    },

    /**
     * Send a message to an event's group chat.
     *
     * Demo moderation:
     * - Scans message text for keywords like 'drug', 'hate', 'sell'
     * - If found, marks message as 'flagged' instead of 'clean'
     * - Flagged messages still appear but could be styled differently
     *
     * Also auto-adds sender to event attendees if not already present.
     */
    sendMessage(eventId, text) {
      if (!state.currentUserId || !text.trim()) {
        return;
      }

      // Simple keyword-based demo moderation
      // In production, you'd use actual AI moderation or community reporting
      const demoModerationState = /drug|pills|weed|idiot|hate|sell/i.test(text)
        ? 'flagged'
        : 'clean';

      setState((previous) => {
        // Update event attendance - auto-join if not already attending
        const nextEvents = previous.events.map((event) => {
          if (event.id !== eventId) return event;

          const nextStatuses = {
            ...event.attendanceStatuses,
            [state.currentUserId!]: event.attendanceStatuses[state.currentUserId!] ?? 'interested',
          };

          return {
            ...event,
            attendeeIds: uniqueIds([...event.attendeeIds, state.currentUserId!]),
            attendanceStatuses: nextStatuses,
            attendanceCounts: recalculateAttendanceCounts(nextStatuses),
          };
        });

        // Add the new message to messages array
        return {
          ...previous,
          events: nextEvents,
          messages: [
            ...previous.messages,
            {
              id: createId('message'),
              eventId,
              senderId: state.currentUserId!,
              text: text.trim(),
              createdAt: new Date().toISOString(),
              demoModerationState,
            },
          ],
        };
      });
    },

    /**
     * Update the current user's profile fields.
     * Only updates fields that are provided; others are preserved.
     * Display name is trimmed; empty names fall back to existing.
     */
    updateProfile(patch) {
      if (!state.currentUserId) {
        return;
      }

      setState((previous) => ({
        ...previous,
        users: previous.users.map((user) =>
          user.id === state.currentUserId
            ? {
                ...user,
                displayName: patch.displayName.trim() || user.displayName,
                bio: patch.bio.trim(),
                interests: patch.interests,
                // Filter out any empty language strings
                languages: patch.languages.filter(Boolean),
                nearbyDiscoveryEnabled: patch.nearbyDiscoveryEnabled,
              }
            : user,
        ),
      }));
    },

    /**
     * Toggle friendship with another user.
     * Mutual friendship - adds/removes from both users' friends arrays.
     * Prevents self-friendship (user can't be friends with themselves).
     */
    toggleFriend(targetUserId) {
      if (!state.currentUserId || state.currentUserId === targetUserId) {
        return;
      }

      setState((previous) => {
        const currentUser = previous.users.find((user) => user.id === state.currentUserId);
        if (!currentUser) return previous;

        const isFriend = currentUser.friends.includes(targetUserId);

        return {
          ...previous,
          users: previous.users.map((user) => {
            // Update current user's friends list
            if (user.id === state.currentUserId) {
              return {
                ...user,
                friends: isFriend
                  ? user.friends.filter((friendId) => friendId !== targetUserId)
                  : uniqueIds([...user.friends, targetUserId]),
              };
            }

            // Update target user's friends list (mutual friendship)
            if (user.id === targetUserId) {
              return {
                ...user,
                friends: isFriend
                  ? user.friends.filter((friendId) => friendId !== state.currentUserId)
                  : uniqueIds([...user.friends, state.currentUserId!]),
              };
            }

            return user;
          }),
        };
      });
    },

    /**
     * Submit a report against a user, event, or message.
     * Reports are stored in the reports array with a generated ID.
     * In production, you'd want escalation workflows and resolution states.
     */
    submitReport(draft) {
      if (!state.currentUserId) {
        return;
      }

      setState((previous) => ({
        ...previous,
        reports: [
          ...previous.reports,
          {
            ...draft,
            id: createId('report'),
            reporterId: state.currentUserId!,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    },

    /**
     * Block a user. Effects:
     * - Current user's trustFlags.blockedUserIds includes target
     * - Target user cannot join current user's events (filtered in DiscoverPage)
     * - Current user cannot join target's events (filtered in DiscoverPage)
     *
     * Note: This doesn't affect existing attendance or messages.
     */
    blockUser(targetUserId) {
      if (!state.currentUserId || state.currentUserId === targetUserId) {
        return;
      }

      setState((previous) => ({
        ...previous,
        users: previous.users.map((user) =>
          user.id === state.currentUserId
            ? {
                ...user,
                trustFlags: {
                  ...user.trustFlags,
                  blockedUserIds: uniqueIds([...user.trustFlags.blockedUserIds, targetUserId]),
                },
              }
            : user,
        ),
      }));
    },

    /**
     * Export all data associated with the current user.
     * Useful for GDPR compliance - users can download their data.
     *
     * Returns JSON string containing:
     * - Export timestamp
     * - User profile
     * - Events the user owns (as host)
     * - Events the user has joined
     * - Messages the user has sent
     * - Reports involving the user
     */
    exportCurrentUserData() {
      if (!state.currentUserId) {
        return JSON.stringify({ error: 'No active user session.' }, null, 2);
      }

      const ownedEvents = state.events.filter((event) => event.hostId === state.currentUserId);
      const joinedEvents = state.events.filter((event) => event.attendeeIds.includes(state.currentUserId!));
      const sentMessages = state.messages.filter((message) => message.senderId === state.currentUserId);
      const reports = state.reports.filter(
        (report) =>
          report.reporterId === state.currentUserId || report.targetId === state.currentUserId,
      );

      return JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          profile: currentUser,
          ownedEvents,
          joinedEvents,
          sentMessages,
          reports,
        },
        null,
        2,
      );
    },

    /**
     * Delete the current user's account and all associated data.
     *
     * This is a comprehensive cleanup:
     * 1. Remove user from users array
     * 2. Remove from all event attendeeIds
     * 3. Update all attendanceStatuses maps
     * 4. Recalculate all attendanceCounts
     * 5. Remove from all reminderUserIds
     * 6. Delete all messages the user sent
     * 7. Delete all events the user hosted (and their messages)
     * 8. Remove from all reports (as reporter or target)
     * 9. Clear currentUserId
     * 10. Clear lastCreatedEventId
     *
     * In production, you'd want confirmation flows and soft deletes.
     */
    deleteCurrentUser() {
      if (!state.currentUserId) {
        return;
      }

      setState((previous) => {
        // Find IDs of events hosted by this user (to clean up their messages)
        const deletedEventIds = previous.events
          .filter((event) => event.hostId === state.currentUserId)
          .map((event) => event.id);

        return {
          ...previous,
          currentUserId: null,
          lastCreatedEventId: null,
          // Remove user from users array
          users: previous.users.filter((user) => user.id !== state.currentUserId),
          // Update all events: remove from attendeeIds, statuses, reminders
          events: previous.events
            .filter((event) => event.hostId !== state.currentUserId) // Remove hosted events
            .map((event) => {
              const remainingStatuses = { ...event.attendanceStatuses };
              delete remainingStatuses[state.currentUserId!];
              return {
                ...event,
                attendeeIds: event.attendeeIds.filter((userId) => userId !== state.currentUserId),
                attendanceStatuses: remainingStatuses,
                attendanceCounts: recalculateAttendanceCounts(remainingStatuses),
                reminderUserIds: event.reminderUserIds.filter(
                  (userId) => userId !== state.currentUserId,
                ),
              };
            }),
          // Remove messages: from deleted events OR sent by this user
          messages: previous.messages.filter(
            (message) =>
              message.senderId !== state.currentUserId &&
              !deletedEventIds.includes(message.eventId),
          ),
          // Remove reports where this user is reporter or target
          reports: previous.reports.filter(
            (report) =>
              report.reporterId !== state.currentUserId && report.targetId !== state.currentUserId,
          ),
        };
      });
    },
  };

  return <BubbleStoreContext.Provider value={value}>{children}</BubbleStoreContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Access the Bubbleverse store from any component.
 *
 * Must be used within a BubbleStoreProvider.
 * Throws error if used outside provider (helps catch misconfiguration).
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { currentUser, events } = useBubbleStore();
 *   // ...
 * }
 * ```
 */
export function useBubbleStore() {
  const context = useContext(BubbleStoreContext);

  if (!context) {
    throw new Error('useBubbleStore must be used inside BubbleStoreProvider.');
  }

  return context;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Load initial state from localStorage or fall back to mock data.
 *
 * Attempts to:
 * 1. Read from localStorage by key
 * 2. Parse as BubbleState
 * 3. Merge with initialBubbleState (ensures all fields exist)
 *
 * On any failure (no stored data, JSON parse error), returns initialBubbleState.
 * This ensures the store always has a complete, valid state.
 */
function loadInitialState() {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return initialBubbleState;
    }

    const parsed = JSON.parse(storedValue) as BubbleState;
    // Merge ensures any new fields in initialBubbleState are included
    return {
      ...initialBubbleState,
      ...parsed,
    };
  } catch {
    // Corrupted storage or version mismatch - reset to defaults
    return initialBubbleState;
  }
}

/**
 * Generate a unique ID with a prefix for readability in debugging.
 * Uses crypto.randomUUID() for proper uniqueness.
 *
 * @param prefix - Something like 'user', 'event', 'message' for debugging
 * @returns Something like 'user-a1b2c3d4'
 */
function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto.randomUUID().slice(0, 8)}`;
}

/**
 * Deduplicate an array of IDs.
 * Used when adding users to attendeeIds or friends to ensure no duplicates.
 *
 * @param values - Array that may contain duplicates
 * @returns New array with only unique values, preserving order
 */
function uniqueIds(values: string[]) {
  return Array.from(new Set(values));
}
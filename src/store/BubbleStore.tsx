/* eslint-disable react-refresh/only-export-components */
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

const STORAGE_KEY = 'bubbleverse-demo-v4';
const avatarPalette = ['#8d5f48', '#efab47', '#4eb5a6', '#b4d63d', '#6b5cff', '#ff8b6d', '#5c9ded'];

type BubbleStoreValue = BubbleState & {
  currentUser: User | null;
  authenticate: (payload: AuthPayload) => void;
  signOut: () => void;
  createEvent: (draft: EventDraft) => string | null;
  joinEvent: (eventId: string) => void;
  setAttendance: (eventId: string, status: AttendanceStatus) => void;
  toggleReminder: (eventId: string) => void;
  sendMessage: (eventId: string, text: string) => void;
  updateProfile: (patch: ProfilePatch) => void;
  toggleFriend: (targetUserId: string) => void;
  submitReport: (draft: ReportDraft) => void;
  blockUser: (targetUserId: string) => void;
  exportCurrentUserData: () => string;
  deleteCurrentUser: () => void;
};

const BubbleStoreContext = createContext<BubbleStoreValue | null>(null);

export function BubbleStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<BubbleState>(loadInitialState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const currentUser = state.users.find((user) => user.id === state.currentUserId) ?? null;

  const value: BubbleStoreValue = {
    ...state,
    currentUser,
    authenticate(payload) {
      const normalizedName = payload.displayName.trim();

      if (!normalizedName) {
        return;
      }

      setState((previous) => {
        const existingUser = previous.users.find(
          (user) => user.displayName.toLowerCase() === normalizedName.toLowerCase(),
        );

        if (existingUser) {
          return {
            ...previous,
            currentUserId: existingUser.id,
          };
        }

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
          users: [newUser, ...previous.users],
          currentUserId: id,
        };
      });
    },
    signOut() {
      setState((previous) => ({
        ...previous,
        currentUserId: null,
      }));
    },
    createEvent(draft) {
      if (!state.currentUserId) {
        return null;
      }

      const eventId = createId('event');
      const hostStatus: Record<string, AttendanceStatus> = {
        [state.currentUserId]: 'interested',
      };
      const nextEvent: Event = {
        id: eventId,
        hostId: state.currentUserId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: draft.category,
        icon: CATEGORY_META[draft.category].emoji,
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
        chatId: `chat-${eventId}`,
        reminderUserIds: [state.currentUserId],
        safetyNote: 'Exact court, field, or meetup point stays visible on the map in this demo.',
      };

      setState((previous) => ({
        ...previous,
        lastCreatedEventId: eventId,
        events: [nextEvent, ...previous.events],
        messages: [
          {
            id: createId('message'),
            eventId,
            senderId: state.currentUserId!,
            text: 'Session launched. Share warm-up details or last-minute changes here.',
            createdAt: new Date().toISOString(),
            demoModerationState: 'clean',
          },
          ...previous.messages,
        ],
      }));

      return eventId;
    },
    joinEvent(eventId) {
      if (!state.currentUserId) {
        return;
      }

      setState((previous) => ({
        ...previous,
        events: previous.events.map((event) => {
          if (event.id !== eventId) {
            return event;
          }

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
        }),
      }));
    },
    setAttendance(eventId, status) {
      if (!state.currentUserId) {
        return;
      }

      setState((previous) => ({
        ...previous,
        events: previous.events.map((event) => {
          if (event.id !== eventId) {
            return event;
          }

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
    toggleReminder(eventId) {
      if (!state.currentUserId) {
        return;
      }

      setState((previous) => ({
        ...previous,
        events: previous.events.map((event) => {
          if (event.id !== eventId) {
            return event;
          }

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
    sendMessage(eventId, text) {
      if (!state.currentUserId || !text.trim()) {
        return;
      }

      const demoModerationState = /drug|pills|weed|idiot|hate|sell/i.test(text)
        ? 'flagged'
        : 'clean';

      setState((previous) => {
        const nextEvents = previous.events.map((event) => {
          if (event.id !== eventId) {
            return event;
          }

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
                languages: patch.languages.filter(Boolean),
                nearbyDiscoveryEnabled: patch.nearbyDiscoveryEnabled,
              }
            : user,
        ),
      }));
    },
    toggleFriend(targetUserId) {
      if (!state.currentUserId || state.currentUserId === targetUserId) {
        return;
      }

      setState((previous) => {
        const currentUser = previous.users.find((user) => user.id === state.currentUserId);
        if (!currentUser) {
          return previous;
        }

        const isFriend = currentUser.friends.includes(targetUserId);
        return {
          ...previous,
          users: previous.users.map((user) => {
            if (user.id === state.currentUserId) {
              return {
                ...user,
                friends: isFriend
                  ? user.friends.filter((friendId) => friendId !== targetUserId)
                  : uniqueIds([...user.friends, targetUserId]),
              };
            }

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
    deleteCurrentUser() {
      if (!state.currentUserId) {
        return;
      }

      setState((previous) => {
        const deletedEventIds = previous.events
          .filter((event) => event.hostId === state.currentUserId)
          .map((event) => event.id);

        return {
          ...previous,
          currentUserId: null,
          lastCreatedEventId: null,
          users: previous.users.filter((user) => user.id !== state.currentUserId),
          events: previous.events
            .filter((event) => event.hostId !== state.currentUserId)
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
          messages: previous.messages.filter(
            (message) =>
              message.senderId !== state.currentUserId &&
              !deletedEventIds.includes(message.eventId),
          ),
          reports: previous.reports.filter(
            (report) => report.reporterId !== state.currentUserId && report.targetId !== state.currentUserId,
          ),
        };
      });
    },
  };

  return <BubbleStoreContext.Provider value={value}>{children}</BubbleStoreContext.Provider>;
}

export function useBubbleStore() {
  const context = useContext(BubbleStoreContext);

  if (!context) {
    throw new Error('useBubbleStore must be used inside BubbleStoreProvider.');
  }

  return context;
}

function loadInitialState() {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return initialBubbleState;
    }

    const parsed = JSON.parse(storedValue) as BubbleState;
    return {
      ...initialBubbleState,
      ...parsed,
    };
  } catch {
    return initialBubbleState;
  }
}

function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto.randomUUID().slice(0, 8)}`;
}

function uniqueIds(values: string[]) {
  return Array.from(new Set(values));
}

import { CATEGORY_META } from '../lib/constants';
import type { AttendanceStatus, BubbleState, Event, Message, User } from '../types';

function buildFutureDate(dayOffset: number, hour: number, minute: number) {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function buildRecentDate(hoursAgo: number, minuteOffset = 0) {
  return new Date(Date.now() - hoursAgo * 60 * 60_000 - minuteOffset * 60_000).toISOString();
}

function buildAttendanceCounts(statuses: Record<string, AttendanceStatus>) {
  return {
    interested: Object.values(statuses).filter((status) => status === 'interested').length,
    on_my_way: Object.values(statuses).filter((status) => status === 'on_my_way').length,
    here: Object.values(statuses).filter((status) => status === 'here').length,
  };
}

const users: User[] = [
  {
    id: 'user-daria',
    displayName: 'Daria Ionescu',
    bio: 'Coffee-fueled planner who likes a clear vibe and clear meeting point.',
    interests: ['Coffee', 'Walks', 'Tennis'],
    languages: ['Romanian', 'English'],
    nearbyDiscoveryEnabled: true,
    avatarPreset: '#8d5f48',
    friends: ['user-sergiu', 'user-teo'],
    trustFlags: {
      verifiedHost: true,
      noShowStrikes: 0,
      reportCount: 0,
      blockedUserIds: [],
    },
  },
  {
    id: 'user-sergiu',
    displayName: 'Sergiu Pavel',
    bio: 'Sports-first organizer. Wants filters, skill levels, and no confusion.',
    interests: ['Tennis', 'Run club', 'Tech'],
    languages: ['Romanian', 'English'],
    nearbyDiscoveryEnabled: true,
    avatarPreset: '#b4d63d',
    friends: ['user-daria'],
    trustFlags: {
      verifiedHost: true,
      noShowStrikes: 1,
      reportCount: 0,
      blockedUserIds: [],
    },
  },
  {
    id: 'user-teo',
    displayName: 'Teo M.',
    bio: 'Joined for the people count, stayed for the spontaneous plans.',
    interests: ['Food', 'Coffee', 'Movies'],
    languages: ['Romanian', 'English'],
    nearbyDiscoveryEnabled: true,
    avatarPreset: '#ff8b6d',
    friends: ['user-daria', 'user-trache'],
    trustFlags: {
      verifiedHost: false,
      noShowStrikes: 0,
      reportCount: 0,
      blockedUserIds: [],
    },
  },
  {
    id: 'user-trache',
    displayName: 'Trache S.',
    bio: 'Likes clear filters, safety tools, and group energy without chaos.',
    interests: ['Study', 'Cowork', 'Food'],
    languages: ['Romanian'],
    nearbyDiscoveryEnabled: false,
    avatarPreset: '#4eb5a6',
    friends: ['user-teo'],
    trustFlags: {
      verifiedHost: false,
      noShowStrikes: 0,
      reportCount: 1,
      blockedUserIds: [],
    },
  },
  {
    id: 'user-alex',
    displayName: 'Alex Pop',
    bio: 'Usually joins after work if the map pin looks legit.',
    interests: ['Cowork', 'Walks', 'Music'],
    languages: ['English'],
    nearbyDiscoveryEnabled: true,
    avatarPreset: '#6b5cff',
    friends: [],
    trustFlags: {
      verifiedHost: false,
      noShowStrikes: 0,
      reportCount: 0,
      blockedUserIds: [],
    },
  },
  {
    id: 'user-sam',
    displayName: 'Sam Carter',
    bio: 'New in town. Uses chat first, then decides fast.',
    interests: ['Study', 'Coffee', 'Food'],
    languages: ['English'],
    nearbyDiscoveryEnabled: true,
    avatarPreset: '#5c9ded',
    friends: [],
    trustFlags: {
      verifiedHost: false,
      noShowStrikes: 2,
      reportCount: 1,
      blockedUserIds: [],
    },
  },
];

const events: Event[] = [
  {
    id: 'event-coffee',
    hostId: 'user-daria',
    title: 'Sunrise Coffee Swap',
    description:
      'Low-pressure meetup for anyone who wants a quick coffee, chat, and a plan for the day.',
    category: 'coffee',
    icon: CATEGORY_META.coffee.emoji,
    location: {
      label: 'Piata Romana',
      lat: 44.4477,
      lng: 26.0975,
    },
    startTime: buildFutureDate(0, 8, 30),
    durationMinutes: 75,
    price: 0,
    skillLevel: 'open',
    womenOnly: false,
    requiredEquipment: ['Good mood'],
    extraFacilities: ['Coffee on site', 'Wi-Fi'],
    attendeeIds: ['user-daria', 'user-teo', 'user-alex'],
    attendanceStatuses: {
      'user-daria': 'interested',
      'user-teo': 'interested',
      'user-alex': 'on_my_way',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-daria': 'interested',
      'user-teo': 'interested',
      'user-alex': 'on_my_way',
    }),
    chatId: 'chat-coffee',
    reminderUserIds: ['user-daria', 'user-teo'],
    safetyNote: 'Public cafe entrance. Meet outside before heading in.',
  },
  {
    id: 'event-tennis',
    hostId: 'user-sergiu',
    title: 'Women-Only Beginner Tennis',
    description:
      'A welcoming court session for beginners. Come for friendly rallies and easy intros.',
    category: 'sports',
    icon: CATEGORY_META.sports.emoji,
    location: {
      label: 'Parcul Herastrau Courts',
      lat: 44.4692,
      lng: 26.0867,
    },
    startTime: buildFutureDate(0, 18, 45),
    durationMinutes: 120,
    price: 35,
    skillLevel: 'beginner',
    womenOnly: true,
    requiredEquipment: ['Tennis racket', 'Water bottle'],
    extraFacilities: ['Lockers', 'Showers'],
    attendeeIds: ['user-sergiu', 'user-daria', 'user-sam'],
    attendanceStatuses: {
      'user-sergiu': 'interested',
      'user-daria': 'interested',
      'user-sam': 'interested',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-sergiu': 'interested',
      'user-daria': 'interested',
      'user-sam': 'interested',
    }),
    chatId: 'chat-tennis',
    reminderUserIds: ['user-sergiu'],
    safetyNote: 'Court number is shared in chat once you join.',
  },
  {
    id: 'event-cowork',
    hostId: 'user-alex',
    title: 'Cowork Sprint + Filter Test',
    description:
      'Two focused work blocks, one coffee break, and a clean attendee list so you know who is coming.',
    category: 'cowork',
    icon: CATEGORY_META.cowork.emoji,
    location: {
      label: 'M60, near Amzei',
      lat: 44.4414,
      lng: 26.0946,
    },
    startTime: buildFutureDate(0, 13, 0),
    durationMinutes: 180,
    price: 20,
    skillLevel: 'open',
    womenOnly: false,
    requiredEquipment: ['Laptop', 'Headphones'],
    extraFacilities: ['Wi-Fi', 'Coffee on site'],
    attendeeIds: ['user-alex', 'user-trache', 'user-sam', 'user-teo'],
    attendanceStatuses: {
      'user-alex': 'interested',
      'user-trache': 'interested',
      'user-sam': 'on_my_way',
      'user-teo': 'here',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-alex': 'interested',
      'user-trache': 'interested',
      'user-sam': 'on_my_way',
      'user-teo': 'here',
    }),
    chatId: 'chat-cowork',
    reminderUserIds: ['user-alex', 'user-sam'],
    safetyNote: 'If the host changes tables, the new location is synced here in under five seconds.',
  },
  {
    id: 'event-study',
    hostId: 'user-trache',
    title: 'Quiet Study + Matcha',
    description:
      'Come with one concrete task. We start with silent focus and end with quick accountability.',
    category: 'study',
    icon: CATEGORY_META.study.emoji,
    location: {
      label: 'Seneca Anticafe',
      lat: 44.4301,
      lng: 26.1013,
    },
    startTime: buildFutureDate(1, 11, 0),
    durationMinutes: 150,
    price: 0,
    skillLevel: 'intermediate',
    womenOnly: false,
    requiredEquipment: ['Notebook', 'Laptop'],
    extraFacilities: ['Wi-Fi', 'Snacks'],
    attendeeIds: ['user-trache', 'user-daria'],
    attendanceStatuses: {
      'user-trache': 'interested',
      'user-daria': 'interested',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-trache': 'interested',
      'user-daria': 'interested',
    }),
    chatId: 'chat-study',
    reminderUserIds: ['user-trache'],
    safetyNote: 'Host confirms the exact table in chat when the space gets busy.',
  },
  {
    id: 'event-walk',
    hostId: 'user-teo',
    title: 'Golden Hour Walk',
    description:
      'Short city walk for people who want conversation without committing to a whole evening.',
    category: 'walk',
    icon: CATEGORY_META.walk.emoji,
    location: {
      label: 'Calea Victoriei',
      lat: 44.4396,
      lng: 26.0969,
    },
    startTime: buildFutureDate(0, 19, 30),
    durationMinutes: 60,
    price: 0,
    skillLevel: 'open',
    womenOnly: false,
    requiredEquipment: ['Comfortable shoes'],
    extraFacilities: ['Public transit nearby'],
    attendeeIds: ['user-teo', 'user-daria', 'user-sergiu', 'user-alex'],
    attendanceStatuses: {
      'user-teo': 'interested',
      'user-daria': 'interested',
      'user-sergiu': 'on_my_way',
      'user-alex': 'interested',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-teo': 'interested',
      'user-daria': 'interested',
      'user-sergiu': 'on_my_way',
      'user-alex': 'interested',
    }),
    chatId: 'chat-walk',
    reminderUserIds: ['user-teo'],
    safetyNote: 'Shared start point is public and easy to verify from the map pin.',
  },
  {
    id: 'event-food',
    hostId: 'user-sam',
    title: 'Late Dumpling Run',
    description:
      'Small dinner group for people who want food, not a giant loud table. Cost visible up front.',
    category: 'food',
    icon: CATEGORY_META.food.emoji,
    location: {
      label: 'Universitate',
      lat: 44.4358,
      lng: 26.1025,
    },
    startTime: buildFutureDate(1, 20, 0),
    durationMinutes: 90,
    price: 45,
    skillLevel: 'open',
    womenOnly: false,
    requiredEquipment: ['Appetite'],
    extraFacilities: ['Vegetarian options'],
    attendeeIds: ['user-sam', 'user-teo'],
    attendanceStatuses: {
      'user-sam': 'interested',
      'user-teo': 'interested',
    },
    attendanceCounts: buildAttendanceCounts({
      'user-sam': 'interested',
      'user-teo': 'interested',
    }),
    chatId: 'chat-food',
    reminderUserIds: [],
    safetyNote: 'Public restaurant spot only. No pre-booked sponsor placements in this mock.',
  },
];

const messages: Message[] = [
  {
    id: 'message-1',
    eventId: 'event-coffee',
    senderId: 'user-daria',
    text: 'I booked the corner table by the window. Wave if you arrive first.',
    createdAt: buildRecentDate(2, 15),
    demoModerationState: 'clean',
  },
  {
    id: 'message-2',
    eventId: 'event-coffee',
    senderId: 'user-teo',
    text: 'Perfect. I am grabbing a flat white and will be there in ten.',
    createdAt: buildRecentDate(2, 2),
    demoModerationState: 'clean',
  },
  {
    id: 'message-3',
    eventId: 'event-tennis',
    senderId: 'user-sergiu',
    text: 'Bring water. We start with easy drills and pair up by confidence level.',
    createdAt: buildRecentDate(5, 10),
    demoModerationState: 'clean',
  },
  {
    id: 'message-4',
    eventId: 'event-tennis',
    senderId: 'user-sam',
    text: 'Anyone selling pills after the game?',
    createdAt: buildRecentDate(4, 48),
    demoModerationState: 'flagged',
  },
  {
    id: 'message-5',
    eventId: 'event-cowork',
    senderId: 'user-alex',
    text: 'If the cafe fills up, I will update the exact table here so nobody gets left waiting.',
    createdAt: buildRecentDate(1, 40),
    demoModerationState: 'clean',
  },
  {
    id: 'message-6',
    eventId: 'event-study',
    senderId: 'user-trache',
    text: 'No pressure to talk during focus blocks. We can debrief after.',
    createdAt: buildRecentDate(8, 5),
    demoModerationState: 'clean',
  },
];

export const initialBubbleState: BubbleState = {
  currentUserId: null,
  lastCreatedEventId: null,
  userLocation: {
    label: 'Piata Romana',
    lat: 44.4477,
    lng: 26.0975,
  },
  users,
  events,
  messages,
  reports: [],
};

export function recalculateAttendanceCounts(statuses: Record<string, AttendanceStatus>) {
  return buildAttendanceCounts(statuses);
}

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
      verifiedHost: false,
      noShowStrikes: 0,
      reportCount: 1,
      blockedUserIds: [],
    },
  },
];

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
      label: 'X TU Delft Outdoor Courts',
      lat: 51.9978,
      lng: 4.3654,
    },
    startTime: buildFutureDate(0, 18, 30),
    durationMinutes: 90,
    price: 12,
    skillLevel: 'beginner',
    womenOnly: true,
    requiredEquipment: ['Tennis racket', 'Water bottle'],
    extraFacilities: ['Lockers', 'Showers'],
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
      lat: 51.9975,
      lng: 4.3658,
    },
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
      label: 'TU Delft Football Pitch',
      lat: 51.9986,
      lng: 4.3672,
    },
    startTime: buildFutureDate(1, 19, 0),
    durationMinutes: 80,
    price: 6,
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
      label: 'X TU Delft Indoor Hall',
      lat: 51.9982,
      lng: 4.3664,
    },
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
      label: 'Mekelpark South Start',
      lat: 52.0008,
      lng: 4.3708,
    },
    startTime: buildFutureDate(0, 7, 15),
    durationMinutes: 50,
    price: 0,
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
      label: 'X TU Delft Gym Floor',
      lat: 51.9977,
      lng: 4.3661,
    },
    startTime: buildFutureDate(1, 18, 15),
    durationMinutes: 60,
    price: 14,
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

export const initialBubbleState: BubbleState = {
  currentUserId: null,
  lastCreatedEventId: null,
  userLocation: {
    label: 'X TU Delft',
    lat: 51.9979,
    lng: 4.3658,
  },
  users,
  events,
  messages,
  reports: [],
};

export function recalculateAttendanceCounts(statuses: Record<string, AttendanceStatus>) {
  return buildAttendanceCounts(statuses);
}

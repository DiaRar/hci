export type CategoryId =
  | 'tennis'
  | 'padel'
  | 'football'
  | 'basketball'
  | 'running'
  | 'training';

export type SkillLevel = 'open' | 'beginner' | 'intermediate' | 'advanced';

export type AttendanceStatus = 'interested' | 'on_my_way' | 'here';

export type CostFilter = 'all' | 'free' | 'budget' | 'premium';

export type SortMode = 'soonest' | 'closest';

export type DemoModerationState = 'clean' | 'flagged';

export type ReportTargetType = 'user' | 'event' | 'message';

export type LocationPoint = {
  lat: number;
  lng: number;
};

export type EventLocation = LocationPoint & {
  label: string;
};

export type User = {
  id: string;
  displayName: string;
  bio: string;
  interests: string[];
  languages: string[];
  nearbyDiscoveryEnabled: boolean;
  avatarPreset: string;
  friends: string[];
  trustFlags: {
    verifiedHost: boolean;
    noShowStrikes: number;
    reportCount: number;
    blockedUserIds: string[];
  };
};

export type Event = {
  id: string;
  hostId: string;
  title: string;
  description: string;
  category: CategoryId;
  icon: string;
  location: EventLocation;
  startTime: string;
  durationMinutes: number;
  price: number;
  skillLevel: SkillLevel;
  womenOnly: boolean;
  requiredEquipment: string[];
  extraFacilities: string[];
  attendeeIds: string[];
  attendanceCounts: Record<AttendanceStatus, number>;
  attendanceStatuses: Record<string, AttendanceStatus>;
  chatId: string;
  reminderUserIds: string[];
  safetyNote?: string;
};

export type Message = {
  id: string;
  eventId: string;
  senderId: string;
  text: string;
  createdAt: string;
  demoModerationState: DemoModerationState;
};

export type ReportDraft = {
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  notes: string;
};

export type ReportRecord = ReportDraft & {
  id: string;
  reporterId: string;
  createdAt: string;
};

export type BubbleState = {
  currentUserId: string | null;
  lastCreatedEventId: string | null;
  userLocation: EventLocation;
  users: User[];
  events: Event[];
  messages: Message[];
  reports: ReportRecord[];
};

export type AuthPayload = {
  displayName: string;
  interests: string[];
  nearbyDiscoveryEnabled: boolean;
};

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

export type ProfilePatch = {
  displayName: string;
  bio: string;
  interests: string[];
  languages: string[];
  nearbyDiscoveryEnabled: boolean;
};

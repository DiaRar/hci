import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  BriefcaseBusiness,
  Coffee,
  Footprints,
  Sparkles,
  Trophy,
  UtensilsCrossed,
} from 'lucide-react';

import type { AttendanceStatus, CategoryId, CostFilter, SkillLevel } from '../types';

type CategoryMeta = {
  label: string;
  emoji: string;
  accent: string;
  glow: string;
  icon: LucideIcon;
  pinClassName: string;
};

export const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
  coffee: {
    label: 'Coffee',
    emoji: '☕',
    accent: '#8d5f48',
    glow: 'rgba(177, 119, 86, 0.26)',
    icon: Coffee,
    pinClassName: 'pin-coffee',
  },
  cowork: {
    label: 'Cowork',
    emoji: '💻',
    accent: '#efab47',
    glow: 'rgba(239, 171, 71, 0.28)',
    icon: BriefcaseBusiness,
    pinClassName: 'pin-cowork',
  },
  study: {
    label: 'Study',
    emoji: '📚',
    accent: '#4eb5a6',
    glow: 'rgba(78, 181, 166, 0.28)',
    icon: BookOpen,
    pinClassName: 'pin-study',
  },
  sports: {
    label: 'Sports',
    emoji: '🎾',
    accent: '#b4d63d',
    glow: 'rgba(180, 214, 61, 0.3)',
    icon: Trophy,
    pinClassName: 'pin-sports',
  },
  walk: {
    label: 'Walk',
    emoji: '🚶',
    accent: '#5c9ded',
    glow: 'rgba(92, 157, 237, 0.28)',
    icon: Footprints,
    pinClassName: 'pin-walk',
  },
  food: {
    label: 'Food',
    emoji: '🍜',
    accent: '#ff8b6d',
    glow: 'rgba(255, 139, 109, 0.3)',
    icon: UtensilsCrossed,
    pinClassName: 'pin-food',
  },
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  interested: 'Interested',
  on_my_way: 'On my way',
  here: 'Here',
};

export const SKILL_LEVELS: Array<{ value: SkillLevel; label: string }> = [
  { value: 'open', label: 'Open level' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const COST_FILTERS: Array<{ value: CostFilter; label: string }> = [
  { value: 'all', label: 'Any cost' },
  { value: 'free', label: 'Free' },
  { value: 'budget', label: '< 50 lei' },
  { value: 'premium', label: '50+ lei' },
];

export const INTEREST_OPTIONS = [
  'Coffee',
  'Cowork',
  'Tennis',
  'Gym',
  'Study',
  'Walks',
  'Food',
  'Movies',
  'Tech',
  'Art',
  'Music',
  'Run club',
];

export const EQUIPMENT_OPTIONS = [
  'Laptop',
  'Notebook',
  'Tennis racket',
  'Water bottle',
  'Yoga mat',
  'Headphones',
];

export const FACILITY_OPTIONS = [
  'Coffee on site',
  'Lockers',
  'Showers',
  'Parking',
  'Wi-Fi',
  'Snacks',
];

export const REPORT_REASONS = [
  'Fake event',
  'Safety concern',
  'Harassment or bullying',
  'Spam or selling',
  'No-show host',
];

export const HERO_TAGLINES = [
  'Find a plan near you in under a minute.',
  'Join real people, not endless group chats.',
  'Discover nearby vibes with clear context.',
];

export const COMMUNITY_NOTES = [
  'Calls and image uploads stay disabled in this v1 mock.',
  'Women-only filters are host-controlled and visible up front.',
  'Safety actions are demo placeholders, not a live moderation backend.',
];

export const HIGHLIGHT_BADGES = [
  'Open map mode',
  'Text chat only',
  'Mock encrypted badge',
  'No sponsored venues',
];

export const SparklesIcon = Sparkles;

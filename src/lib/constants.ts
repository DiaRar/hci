import type { LucideIcon } from 'lucide-react';
import {
  CircleDotDashed,
  Dumbbell,
  Footprints,
  Goal,
  Sparkles,
  Trophy,
  Volleyball,
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
  tennis: {
    label: 'Tennis',
    emoji: '🎾',
    accent: '#7a9f2f',
    glow: 'rgba(122, 159, 47, 0.28)',
    icon: Trophy,
    pinClassName: 'pin-tennis',
  },
  padel: {
    label: 'Padel',
    emoji: '🏓',
    accent: '#0f8d84',
    glow: 'rgba(15, 141, 132, 0.28)',
    icon: CircleDotDashed,
    pinClassName: 'pin-padel',
  },
  football: {
    label: 'Football',
    emoji: '⚽',
    accent: '#e2a33f',
    glow: 'rgba(226, 163, 63, 0.28)',
    icon: Goal,
    pinClassName: 'pin-football',
  },
  basketball: {
    label: 'Basketball',
    emoji: '🏀',
    accent: '#e56d3a',
    glow: 'rgba(229, 109, 58, 0.28)',
    icon: Volleyball,
    pinClassName: 'pin-basketball',
  },
  running: {
    label: 'Running',
    emoji: '🏃',
    accent: '#5f7cff',
    glow: 'rgba(95, 124, 255, 0.28)',
    icon: Footprints,
    pinClassName: 'pin-running',
  },
  training: {
    label: 'Training',
    emoji: '🏋️',
    accent: '#3f5567',
    glow: 'rgba(63, 85, 103, 0.24)',
    icon: Dumbbell,
    pinClassName: 'pin-training',
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
  { value: 'budget', label: 'Under €15' },
  { value: 'premium', label: '€15+' },
];

export const INTEREST_OPTIONS = [
  'Tennis',
  'Padel',
  'Football',
  'Basketball',
  'Running',
  'Training',
  'Cycling',
  'Volleyball',
  'Badminton',
  'Gym',
  'Mobility',
  'Recovery',
];

export const EQUIPMENT_OPTIONS = [
  'Tennis racket',
  'Padel racket',
  'Football boots',
  'Basketball shoes',
  'Running shoes',
  'Water bottle',
  'Resistance band',
];

export const FACILITY_OPTIONS = [
  'Lockers',
  'Showers',
  'Indoor courts',
  'Outdoor courts',
  'Equipment rental',
  'Water fountain',
];

export const REPORT_REASONS = [
  'Fake event',
  'Safety concern',
  'Harassment or bullying',
  'Spam or selling',
  'No-show host',
];

export const HERO_TAGLINES = [
  'Find a game around campus in under a minute.',
  'Join real players, not another dead team chat.',
  'See the sport, the pin, and the turnout before you go.',
];

export const COMMUNITY_NOTES = [
  'Calls and image uploads stay disabled in this v1 mock.',
  'Women-only filters are host-controlled and visible up front.',
  'Safety actions are demo placeholders, not a live moderation backend.',
];

export const HIGHLIGHT_BADGES = [
  'Open map mode',
  'Live player count',
  'Text chat only',
  'Mock encrypted badge',
  'No sponsored clubs',
];

export const SparklesIcon = Sparkles;

# Bubbleverse Documentation

## Project Overview

Bubbleverse is a mobile-first sports discovery web app prototype. Users discover nearby sports sessions on a map, create events, join them, chat with attendees, and manage their profile.

**Important**: This is a frontend-only demo with mock data and localStorage persistence — no real backend.

## Quick Start

```bash
bun install    # Install dependencies
bun run dev    # Start dev server with HMR
bun run build  # TypeScript compile + Vite build
bun run lint   # ESLint static analysis
bun run preview # Preview production build
```

## Architecture

### Tech Stack

- **React 19** + TypeScript + Vite
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin (no tailwind.config.js)
- **shadcn/ui-style components** in `src/components/ui/`
- **React Router DOM v7** for routing
- **Zustand-like** React Context store with localStorage persistence
- **Leaflet + react-leaflet** for maps
- **lucide-react** for icons
- **class-variance-authority** for component variants

### State Management

Global state lives in `src/store/BubbleStore.tsx` — a React Context-based store with localStorage persistence.

```typescript
const { currentUser, events, users, messages } = useBubbleStore();
```

Key state:
- `users` — All demo users
- `events` — All sports sessions
- `messages` — Chat messages per event
- `currentUser` — Currently authenticated user
- `userLocation` — User's mock location

### Data Flow

`src/data/mockData.ts` → `BubbleStore` (localStorage) → Pages consume via `useBubbleStore()` hook → Components receive via props or store access.

### Routing

React Router DOM v7 with protected routes in `src/App.tsx`. Auth guard redirects unauthenticated users to `/auth`.

Routes:
- `/auth` — Login/demo user selection
- `/discover` — Map view with event list overlay + filters
- `/create` — Create new event form (4-step wizard)
- `/event/:eventId` — Event detail + attendee list
- `/chat/:eventId` — Per-event group chat
- `/profile/:userId` — User profile

## Component Library

### shadcn/ui-style Components

Components are in `src/components/ui/` following shadcn/ui patterns but custom-built for this project. Key components:

- **Button** — Variants: `default`, `outline`, `secondary`, `ghost`, `destructive`
- **Card** — Rounded containers with surface styling
- **Badge** — Small status indicators
- **Input** / **Textarea** — Form inputs
- **Select** / **SelectContent** / **SelectItem** / **SelectTrigger** / **SelectValue** — Dropdowns
- **Switch** — Toggle switches
- **Checkbox** — Checkboxes
- **Dialog** — Modal dialogs
- **Tabs** / **TabsContent** / **TabsList** / **TabsTrigger** — Tabbed interfaces
- **Avatar** — User avatars with fallback initials
- **AvatarStack** — Stacked avatar groups

### App-Specific Components

- **AppFrame** — Mobile device frame wrapper with decorative orbs
- **BottomNav** — Primary navigation bar
- **EventCard** — Event preview cards
- **EventMap** — Leaflet map with event pins
- **PageHeader** — Page title/subtitle with back navigation
- **Avatar** / **AvatarStack** — User avatar components

## Type Definitions

All TypeScript types centralized in `src/types.ts`:

```typescript
type User = {
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

type Event = {
  id: string;
  hostId: string;
  title: string;
  description: string;
  category: CategoryId;
  location: EventLocation;
  startTime: string;
  durationMinutes: number;
  price: number;
  skillLevel: SkillLevel;
  womenOnly: boolean;
  attendeeIds: string[];
  attendanceStatuses: Record<string, AttendanceStatus>;
  attendanceCounts: AttendanceCounts;
  requiredEquipment: string[];
  extraFacilities: string[];
  safetyNote?: string;
};
```

## CSS Architecture

Tailwind CSS v4 with design tokens defined in `@theme inline` block in `src/index.css`. This exposes CSS variables as Tailwind utilities.

Key theme variables:
- `--color-bg` — Background
- `--color-surface` / `--surface-border` / `--surface-shadow` — Card surfaces
- `--color-ink` / `--ink-strong` — Text colors
- `--color-primary` / `--accent-purple` — Brand colors
- `--color-success` / `--danger` — Status colors

## Constants

`src/lib/constants.ts` contains:
- `CATEGORY_META` — Sport categories with emoji, colors, labels
- `SKILL_LEVELS` — Skill level options
- `EQUIPMENT_OPTIONS` / `FACILITY_OPTIONS` — Equipment/facility lists
- `INTEREST_OPTIONS` — User interest options
- `ATTENDANCE_LABELS` — Attendance status labels
- `REPORT_REASONS` — Report reason options

## Formatting Utilities

`src/lib/format.ts` contains:
- `formatClock` / `formatEventWindow` — Time formatting
- `formatCurrency` — Price formatting
- `formatDistanceKm` — Distance formatting
- `formatAttendanceStatus` — Status badge formatting
- `toLocalDateTimeInputValue` — datetime-local input values

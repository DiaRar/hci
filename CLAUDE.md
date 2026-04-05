# OpenWolf

@.wolf/OPENWOLF.md

This project uses OpenWolf for context management. Read and follow .wolf/OPENWOLF.md every session. Check .wolf/cerebrum.md before generating code. Check .wolf/anatomy.md before reading files.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bubbleverse is a mobile-first sports discovery web app prototype. Users discover nearby sports sessions on a map, create events, join them, chat with attendees, and manage their profile. **This is a frontend-only demo with mock data and localStorage persistence — no real backend.**

## Commands

```bash
bun install    # Install dependencies
bun run dev    # Start dev server with HMR
bun run build  # TypeScript compile + Vite build
bun run lint   # ESLint static analysis
bun run preview # Preview production build
```

## Architecture

### State Management
Global state lives in `src/store/BubbleStore.tsx` — a React Context-based store (Zustand-like pattern) with localStorage persistence. Access via `useBubbleStore()` hook. Key state: `users`, `events`, `messages`, `currentUserId`, `userLocation`.

### Data Flow
`src/data/mockData.ts` → `BubbleStore` (localStorage) → Pages consume via `useBubbleStore()` hook → Components receive via props or store access.

### Routing
React Router DOM v7 with protected routes in `src/App.tsx`. Auth guard redirects unauthenticated users to `/auth`.

### Pages
- `/auth` — Login/demo user selection
- `/discover` — Map view with event list overlay + filters
- `/create` — Create new event form
- `/event/:eventId` — Event detail + attendee list
- `/chat/:eventId` — Per-event group chat
- `/profile/:userId` — User profile

### UI Components
- `AppFrame.tsx` wraps pages in a mobile-phone device frame with decorative orbs
- `BottomNav.tsx` for navigation
- `EventMap.tsx` — Leaflet map with category-based pin icons
- `EventCard.tsx` — Event preview cards
- `src/components/ui/` — shadcn/ui-style component library (button, card, dialog, etc.)

### Key Libraries
- React 19 + TypeScript + Vite
- Tailwind CSS 4 + shadcn/ui-style components
- Leaflet + react-leaflet for maps
- lucide-react for icons
- class-variance-authority for component variants

## Type Definitions

All TypeScript types are centralized in `src/types.ts`: `User`, `Event`, `Message`, `BubbleState`, etc.

## Important Notes

- This is a **demo/prototype** — mock data in `mockData.ts` initializes state; actions persist to localStorage only
- Event categories, attendance statuses, and filter options are defined in `src/lib/constants.ts`
- Formatting utilities (date, currency, distance) are in `src/lib/format.ts`
- The `cn()` utility (clsx + tailwind-merge) is in `src/lib/utils.ts`

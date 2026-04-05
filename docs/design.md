# Bubbleverse Design System

## Design Principles

1. **Mobile-first** — Optimized for 430px width (iPhone-style frames)
2. **Glass morphism** — Frosted glass effects using `backdrop-blur` and semi-transparent backgrounds
3. **Bold typography** — Serif headings, clean sans-serif body text
4. **Friendly pastel accents** — Duolingo-style green CTAs with soft lilac support
5. **Playful sports** — Emoji-driven sport icons, energetic color scheme

## Color Palette

### Brand Colors

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-primary` | `#58cc66` | `#62d86f` | Primary action green |
| `--accent-purple` | `rgba(107,92,255,0.12)` | (same) | Purple tints |
| `--accent-purple-light` | `rgba(107,92,255,0.08)` | (same) | Subtle backgrounds |
| Gradient CTA | `#58cc66` → `#39b85a` | `#62d86f` → `#4cc962` | Primary actions |

### Semantic Colors

| Token | Usage |
|-------|-------|
| `--color-success` | Success states, confirmations |
| `--color-danger` | Errors, danger actions |
| `--color-warning` | Warnings |

### Text Colors

| Token | Usage |
|-------|-------|
| `--color-ink-strong` | Headlines, important text |
| `--color-ink` | Body text |
| `--color-muted-foreground` | Secondary text, captions |

### Surface Colors

| Token | Usage |
|-------|-------|
| `--color-surface` | Card backgrounds / elevated panels |
| `--surface-border` | Card borders |
| `--surface-shadow` | Card shadows |
| `--bg` | Page background |

## Typography

### Font Families

- **Headlines**: Serif — `font-serif` class
- **Body**: `Space Grotesk` (`font-sans`)

### Type Scale

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `text-2xl` + `font-serif` | ~2.3rem | normal | Hero headlines |
| `text-lg` + `font-serif` | ~1.28rem | normal | Card titles |
| `text-base` | 1rem | bold | Section headers |
| `text-sm` | 0.875rem | bold/medium | Labels, badges |
| `text-xs` | 0.75rem | semibold/medium | Captions, meta |

## Spacing System

Base unit: 4px (Tailwind default)

| Token | Value | Usage |
|-------|-------|-------|
| `gap-[10px]` | 10px | Card internal spacing |
| `gap-3` / `gap-4` | 12px / 16px | Section spacing |
| `p-3` / `p-4` / `p-5` | 12px / 16px / 20px | Card padding |
| `p-5 pb-24` | 20px top/bottom, 96px bottom | Page padding (above nav) |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-full` | 9999px | Pills, avatars |
| `rounded-xl` | tokenized | Inputs, compact controls |
| `rounded-2xl` | tokenized | Cards and panels |
| `rounded-3xl` | tokenized | Hero cards and large surfaces |

## Component Patterns

### Cards

```tsx
<Card className="p-4 rounded-2xl bg-card border border-border">
  {/* content */}
</Card>
```

### Buttons

Primary CTA (gradient):
```tsx
<Button>
  Action
</Button>
```

Outline secondary:
```tsx
<Button variant="outline">
  Cancel
</Button>
```

Icon button:
```tsx
<Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
  <Icon size={18} />
</Button>
```

### Badges

Category badges with glow:
```tsx
<Badge
  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[0.8rem] font-bold"
  style={{ background: category.glow, color: category.accent }}
>
  <span>{category.emoji}</span>
  {category.label}
</Badge>
```

### Form Fields

Label above input:
```tsx
<label className="flex flex-col gap-2">
  <span className="block text-sm font-bold text-ink-strong">Label</span>
  <Input type="text" placeholder="Placeholder" />
</label>
```

### Navigation

Bottom nav with active state:
```tsx
<NavLink
  to="/discover"
  className={({ isActive }) =>
    cn('flex flex-col items-center gap-1.5 text-[0.74rem] font-bold',
       isActive && 'bg-accent-purple-light text-primary')
  }
>
  <Icon size={18} />
  <span>Label</span>
</NavLink>
```

## Shadows

| Shadow | Usage |
|--------|-------|
| `var(--shadow-cta)` | Primary CTA buttons |
| `var(--shadow-card)` | Floating cards, overlays |
| `var(--shadow-soft)` | Secondary surfaces and icon buttons |

## Icons

Use **lucide-react** exclusively. Key icons:

- Navigation: `Compass`, `MessageCircle`, `Plus`, `UserRound`
- Actions: `ArrowRight`, `LogOut`, `Settings`
- Event info: `Clock3`, `MapPin`, `Users`, `Gauge`, `ShieldAlert`
- Trust: `ShieldCheck`, `ShieldAlert`

Sizes:
- Nav icons: 18px
- Inline icons: 14px
- Card icons: 14-16px
- Feature icons: 20-26px

## Dark Mode

Dark mode via CSS class `.dark` on html element. Key dark mode adjustments:

- Background: `--bg: oklch(0.145 0 0)`
- Surface: `--surface: oklch(0.24 0 0)`
- Text: Use `dark:text-foreground` instead of `text-ink-strong`

## Animation

- **Hover lift**: `hover:-translate-y-px` on interactive cards
- **Transitions**: `transition-all` for smooth state changes
- **Duration**: 150-200ms typically

## Device Frame

AppFrame component wraps content in an iPhone-style device frame with decorative orbs. This is purely visual for the demo prototype.

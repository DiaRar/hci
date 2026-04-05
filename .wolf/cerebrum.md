# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-04-05

## User Preferences

<!-- How the user likes things done. Code style, tools, patterns, communication. -->
- For visual polish work, the user wants an iterative page-by-page process and explicitly wants the agent to stop and rethink after each page before moving on.

## Key Learnings

- **Project:** bubbleverse
- **Description:** This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
- `FINAL.md` is now the canonical product concept document for Bubbleverse and should be treated as the single source of truth for the app's audience, scope, positioning, and route map.
- The implemented route surface includes `/chats` and `/profile/me`, which older docs omitted; the root `README.md` is still generic Vite boilerplate and should not be used as the product reference.
- Ant Design `Card` applies a separate inner body wrapper, so layout utility classes like `flex` on `className` affect the outer shell, not direct content flow; use `styles.body` or a plain wrapper div for composer-like inline layouts.

## Do-Not-Repeat

<!-- Mistakes made and corrected. Each entry prevents the same mistake recurring. -->
<!-- Format: [YYYY-MM-DD] Description of what went wrong and what to do instead. -->
- [2026-04-05] Do not rely on dynamic Tailwind class strings like `bottom-${...}` for layout-critical positioning in this app; use explicit styles or statically enumerable classes so floating controls actually move.

## Decision Log

<!-- Significant technical decisions with rationale. Why X was chosen over Y. -->
- [2026-04-05] Positioned Bubbleverse explicitly toward young expats and international newcomers while keeping the prototype grounded in the existing Delft/TU Delft-style local sports meetup demo.

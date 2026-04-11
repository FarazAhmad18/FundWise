# Chunk 1 — Premium UI Shell

## What Was Built

Upgraded every screen from basic placeholder to a premium, interview-ready UI shell with sample data, real charts, and reusable components. No business logic yet — this is the visual foundation.

### Reusable Components Created (`src/components/ui/`)
- **Button** — Primary, secondary, ghost, danger variants with size options
- **Badge** — Color-coded labels (emerald, blue, purple, amber, red, cyan, gray)
- **StatCard** — Dashboard metric card with icon, value, and change indicator
- **WorkspaceCard** — Linked card with ticker, source/query counts, and last active
- **SourceCard** — Research source with type badge, sentiment badge, snippet, and URL
- **ChatMessage** — User and assistant message bubbles with source citations and thinking state
- **ModeToggle** — Hybrid / Live Web / Research Base mode selector
- **PageHeader** — Consistent page title with description, badges, and action buttons
- **Tabs** — Tab navigation with active indicator and count badges
- **Input** — Form input with label, hint, and error state
- **EmptyState** — Centered placeholder with icon, title, description, and action
- **Skeleton** — Loading placeholders (card, chart, list variants)

### Screens Upgraded
1. **Landing Page** — Sticky glassmorphic nav, hero with gradient orb, app preview mockup (browser chrome with mini sidebar + chat), 6 feature cards, stats bar, CTA section, footer
2. **Login / Signup** — Card-elevated forms, Google OAuth button, forgot password, terms notice, split name fields on signup
3. **Dashboard** — StatCards with icons, workspace cards with tickers, watchlist with live prices + change %, recent queries with mode badges
4. **Workspace** — Full chat interface with sample conversation (user + assistant messages), mode toggle, attachment button, right panel with Sources/Evidence tabs, evidence cards with confidence levels
5. **Analytics** — 6 real Recharts: sentiment donut, sentiment over time (area chart), topic frequency (horizontal bars), source coverage (vertical bars), event timeline (with colored dots), signal balance donut
6. **Reports** — Full Tesla risk memo with executive summary, key findings (with sentiment dots), side-by-side bullish/bearish signals, risk assessment table (severity + likelihood badges), event timeline, source list
7. **Compare** — TSLA vs NVDA comparison with company headers, key metrics table, sentiment comparison bar chart, side-by-side risk/catalyst cards, summary paragraph

## Why It Exists

Building the full UI shell before business logic serves three purposes:

1. **Faster iteration** — when you wire up real data later, the UI is already done. You only swap sample data for API calls.
2. **Interview demo** — even before the backend works, every screen looks like a real product. You can show the UI in a portfolio.
3. **Design validation** — seeing all screens together reveals inconsistencies in spacing, color usage, and component patterns before they become expensive to fix.

## How It Works

### Component Architecture

Components follow a simple hierarchy:
```
Pages (route files)
  └── PageHeader, StatCard, WorkspaceCard, etc. (ui components)
       └── Badge, Button (primitive components)
```

All reusable components live in `src/components/ui/` with a barrel export in `index.js`. Pages import from `@/components/ui/ComponentName` or `@/components/ui`.

### Layout Hierarchy

```
RootLayout (fonts, CSS)
  ├── (marketing)/layout.js → full width, no chrome
  ├── (auth)/layout.js → centered card
  └── (app)/layout.js → AppShell (sidebar + main)
       ├── dashboard → page-container (max-width + padding)
       ├── workspace → full height flex (chat + right panel)
       ├── analytics → page-container with chart grid
       ├── reports → page-container with stacked sections
       ├── compare → page-container with comparison grid
       └── settings → page-container with form cards
```

The workspace page is unique — it uses full viewport height (`h-screen`) instead of `page-container` because the chat interface needs to fill the screen with the input pinned to the bottom.

### Chart Integration

Analytics and compare screens use Recharts with custom styling:
- Axis lines and ticks hidden for cleaner look
- Grid uses `var(--border-light)` for subtle appearance
- Tooltips styled with the design system (card bg, border, shadow)
- Chart colors imported from `@/constants/design.js` for consistency
- Responsive containers ensure charts adapt to card width

## Core Concepts

### Reusable UI Components
Components should be **props-driven** and **presentation-only**. A `SourceCard` doesn't know where its data comes from — it just renders what it receives. This separation makes components reusable across different contexts (workspace panel, report sources, search results).

### Why UI Shell First Helps Faster Iteration
When business logic is added later, the developer only needs to:
1. Replace sample data arrays with API calls
2. Add loading states (skeletons already exist)
3. Wire up event handlers (buttons already exist)

No visual design work is needed during the logic phase, reducing context switching.

### UX Choices for Chat + Analytics Products
- **Chat stays minimal** — no clutter in the message area. Sources and evidence go in the right panel.
- **Mode toggle is visible** — users should always know whether they're querying live web, stored sources, or both.
- **Evidence panel uses tabs** — keeps the right sidebar manageable without overwhelming the user.
- **Reports use visual hierarchy** — colored left borders, sentiment dots, and badge-based severity create scannable documents.
- **Compare uses a table for metrics** — side-by-side numbers in monospace font for easy comparison.

## Interview Questions You Might Get

**Q: Why build the UI before the backend?**
A: It validates the product design early, creates a demo-ready portfolio piece, and makes backend integration faster since you're just swapping data sources.

**Q: How do your components handle different states?**
A: Components accept props for different variants (Badge color, Button variant), loading states (Skeleton components), and empty states (EmptyState component). This pattern scales well as the product grows.

**Q: Why Recharts over D3 or Chart.js?**
A: Recharts is React-native (uses JSX), composable, and handles responsive containers well. D3 is more powerful but overkill for dashboard charts. Chart.js uses imperative APIs that don't fit React's declarative model.

**Q: How do you keep the UI consistent across screens?**
A: Design tokens in CSS custom properties, reusable utility classes (@utility card, btn-primary), and a shared component library. Colors, spacing, and typography are defined once and used everywhere.

**Q: Walk me through the workspace screen layout.**
A: It's a flex container. Left side is the chat (flex-1, takes remaining space). Right side is a fixed-width panel (340px) with tabbed Sources/Evidence views. The chat input is pinned to the bottom with border-top. The header shows workspace name, ticker, mode toggle, and menu. On mobile, the right panel hides.

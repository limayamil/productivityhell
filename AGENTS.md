# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

All commands run from the `app/` directory:

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint
```

No test runner is configured.

## Architecture

**Productivity Hell** is a gamified task management SPA — a Pomodoro-style round timer with RPG progression mechanics (score, multiplier, streaks, perks, ranks).

### Stack

- React 19 + Vite 8, plain JavaScript (no TypeScript)
- No routing library — screen is a `useState` string in `App.jsx`
- No state management library — `useState` only, state owned by `App.jsx` and passed as props
- No CSS framework — inline `style` objects throughout all components
- No backend or persistence — all state is in-memory only (no localStorage)

### Component hierarchy

```
App.jsx                     # owns: screen, overlay, tasks; renders BottomNav
├── screens/Dashboard.jsx   # owns: timeLeft, score, multiplier, streak, floaters; receives tasks
├── screens/DayView.jsx     # stateless; reads DAY_ROUNDS constant
├── screens/PerksLibrary.jsx # stateless; reads ACTIVE_PERKS_LIBRARY constant
├── overlays/TaskModal.jsx  # owns: form fields; calls onAdd(task)
├── overlays/RoundSummary.jsx # mostly hardcoded mock data; calls onNext or onPerkSelect
└── overlays/PerkSelection.jsx # owns: selected perk, picks 3 from PERK_POOL on mount
    └── components/PerkCard.jsx  # reused in PerksLibrary
```

Overlays render as `position: fixed` modals layered over the active screen. All overlay/screen transitions go through `App.jsx` state.

### Overlay state machine

`App.jsx` drives overlays with a single `overlay` string (`null | 'taskModal' | 'roundSummary' | 'perkSelection'`):

```
null ──onAddTask──► taskModal ──onClose/onAdd──► null
null ──onEndRound──► roundSummary ──onNext──► null
                                 ──onPerkSelect──► perkSelection ──onSelect──► null
```

**Gotcha:** `App.jsx` currently hardcodes `score={4820}` and `roundRank="A"` when rendering overlays. Dashboard's live score is not yet wired to overlay props.

### Scoring formula

Points per task (calculated in `TaskModal`): `priority.pts + Math.floor(duration * 2.5)`

- Priority base pts — Low: 60, Medium: 130, High: 260, Critical: 480
- On completion (in `Dashboard.completeTask`): `earned = Math.round(task.points * multiplier)`
- Multiplier starts at 1.5×, increments +0.25 per completion, caps at 5.0×
- Round status: `score >= 3000 → 'safe'`, `timeLeft < 10min → 'hell'`, `score/3000 > 0.5 → 'safe'`, else `'risky'`
- `getRank(score)` in `constants.js` maps thresholds to F/D/C/B/A/S/SS/SSS ranks

**Gotcha:** Perks are displayed but have no effect on the scoring logic — `completeTask` doesn't read the active perks list.

### Game data

`src/data/constants.js` is the single source of truth for all game mechanics. Three separate perk arrays serve different parts of the UI:

- `SAMPLE_PERKS` — active perks shown in Dashboard's current-round sidebar
- `PERK_POOL` — full pool PerkSelection draws from (shuffled, picks 3 at mount)
- `ACTIVE_PERKS_LIBRARY` — inventory shown in PerksLibrary screen

These are static and not synced to each other. `RANKS`, `PRIORITIES`, `CATEGORIES`, `DURATIONS`, `RARITY_STYLES`, `PRIORITY_COLORS`, and `CAT_COLORS` are also defined here.

### Design system

`src/styles/tokens.css` defines CSS custom properties used as fallback values; most styling is inline. Fixed 390×844px viewport (iPhone Pro). Three fonts: Bebas Neue (headings), Space Grotesk (body), Space Mono (numbers). Key palette: `#FF3B3B` hell-red, `#3DDCFF` arc-blue, `#FFD166` loot-gold, `#8F5CFF` void-violet, `#7CFF6B` acid-green, `#0B0B10` background. Rarity tiers: common → uncommon → rare → epic → legendary → cursed → hellborn.

Every major screen includes a CRT scanline overlay rendered as a `position: fixed, pointerEvents: none` div at `zIndex: 999` using `repeating-linear-gradient`.

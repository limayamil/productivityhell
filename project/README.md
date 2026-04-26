# Productivity Hell — Design System

## Product Overview

**Productivity Hell** is a mobile-first gamified productivity app that turns each hour of the workday into a roguelite "round." Users load tasks, complete them before the hour ends, earn points, activate perks, build combos, and receive a rank at the end of each round. The experience should feel addictive, tactile, and visually intense — closer to a game than a typical productivity tool.

**Core metaphor:** Each hour = a round. Each task = a play. Perks = collectible cards/relics. Score = survival.

**No existing codebase or Figma was provided.** This design system was built entirely from the brand brief.

---

## Products / Surfaces

1. **Mobile App (primary)** — The main experience. Mobile-first, scales to desktop.
   - Dashboard / Active Round
   - Quick Task Creation
   - Perk Selection (post-round)
   - Round Summary
   - Full Day View

---

## Content Fundamentals

### Voice & Tone
- **Infernal, dramatic, slightly tongue-in-cheek.** Not corporate. Not cute. Not minimalist.
- Feels like a game announcer crossed with a demonic productivity coach.
- Copy uses short, punchy sentences. Often imperative or declarative.
- **No sentence is boring.** Every micro-copy moment is an opportunity.

### Casing
- UI labels: **ALL CAPS** for game-state labels (ROUND, COMBO, RANK, HELLMODE)
- Task titles: Sentence case
- Perk names: Title Case ("Deep Work Demon")
- System messages: Sentence case with attitude

### Pronouns
- Direct second-person: **"You survived."** Not "User completed task."
- App speaks TO the user, like an opponent or referee.

### Emoji
- **Not used.** The aesthetic uses custom iconography, glyphs and typographic emphasis instead.

### Examples
- ❌ "Task completed!" → ✅ "Task sacrificed."
- ❌ "Good job!" → ✅ "Combo ignited."
- ❌ "Time's almost up" → ✅ "The hour demands more."
- ❌ "Points added" → ✅ "Debt reduced."
- ❌ "Perk activated" → ✅ "Focus pact activated."
- ❌ "Round over" → ✅ "You survived this round."
- ❌ "Bonus applied" → ✅ "Hell bonus applied."
- ❌ "Multiplier increased" → ✅ "Multiplier awakened."

---

## Visual Foundations

### Color System
See `colors_and_type.css` for all CSS variables.

| Role | Name | Hex |
|---|---|---|
| Background | Hell Black | `#0B0B10` |
| Surface | Dark Card | `#13131C` |
| Surface Elevated | `#1C1C2A` |
| Border | Metal | `#2A2A35` |
| Red / Hell | Hell Red | `#FF3B3B` |
| Yellow / Reward | Loot Gold | `#FFD166` |
| Purple / Rarity | Void Violet | `#8F5CFF` |
| Green / Success | Acid Green | `#7CFF6B` |
| Blue / Energy | Arc Blue | `#3DDCFF` |
| Text Primary | Off-White | `#F0EDE8` |
| Text Secondary | Dim | `#8A8A9A` |

### Rarity Color Mapping
- Common → `#8A8A9A` (gray-metal)
- Uncommon → `#7CFF6B` (acid green)
- Rare → `#3DDCFF` (arc blue)
- Epic → `#8F5CFF` (void violet)
- Legendary → `#FFD166` (loot gold)
- Cursed → `#FF3B3B` (hell red)
- Hellborn → gradient: `#FF3B3B` → `#8F5CFF` (animated)

### Typography
See `colors_and_type.css`.

- **Display / Headlines:** "Bebas Neue" (Google Fonts) — tall, condensed, uppercase impact
- **UI / Labels:** "Space Grotesk" (Google Fonts) — technical, slightly quirky, legible
- **Mono / Numbers / Scores:** "Space Mono" (Google Fonts) — retro terminal feel for counts, timers, scores

### Backgrounds & Textures
- Base: near-black `#0B0B10`
- Subtle CRT scanline overlay (CSS repeating-linear-gradient, very low opacity ~4%)
- Subtle noise texture via SVG filter or CSS
- No full-bleed photos. No gradients on backgrounds (only on elements, borders, glows)
- Cards sit on the dark surface, differentiated by border + glow, not background color

### Cards & Surfaces
- **Border-first design:** Cards use 1-2px solid borders in rarity/category colors
- Corner radius: `6px` (not rounded — deliberately sharp/angular)
- Inner shadow: slight inward glow matching border color at ~20% opacity
- Outer glow: `box-shadow: 0 0 12px {color}40` — neon glow effect
- Background: `#13131C` base, never white or light

### Animations & Interactions
- Completing a task: points fly upward (translateY + opacity out), screen flashes briefly
- Perk activation: card flips or "slams" into place with a hard drop shadow
- Multiplier increase: number ticks up with a quick scale bounce (1 → 1.3 → 1.0)
- Combo activation: red/gold pulse radiates from the score display
- Easing: prefer `cubic-bezier(0.22, 1, 0.36, 1)` — fast start, snappy settle
- Transitions: 120–200ms for UI state; 300–500ms for reward moments
- No slow fades. No gentle easing. Everything is sharp and punchy.

### Hover & Press States
- Hover: `brightness(1.15)` + subtle border glow intensification
- Press/active: `scale(0.97)` + `brightness(0.9)` — feels tactile, like pressing a physical button
- No color changes on hover — only glow intensity and brightness

### Borders
- Default UI border: `1px solid #2A2A35`
- Active/focus: `1px solid {accent-color}` + `box-shadow: 0 0 8px {accent-color}60`
- Perk cards: `2px solid {rarity-color}` + outer glow
- NEVER use border-radius > 8px. Most elements use 4–6px.

### Shadows
- Hard drop shadows (offset, no blur): `4px 4px 0px #000` — arcade/pixel art feel
- Soft neon glow (no offset, high spread): `0 0 16px #FF3B3B40`
- Combine both on critical elements (e.g. perk cards)

### Spacing
- Base unit: 4px
- Common spacings: 4, 8, 12, 16, 24, 32, 48px
- Dense UI — tasks are compact, not airy. Think: arcade scoreboard density.

### Iconography
See ICONOGRAPHY section below.

### Priority System
- Low → `#8A8A9A`
- Medium → `#FFD166`
- High → `#FF3B3B`
- Critical → `#8F5CFF` + glow

### Round Status
- Safe → `#7CFF6B`
- Risky → `#FFD166`
- Hell Mode → `#FF3B3B` (with pulsing animation)
- Combo Active → `#3DDCFF`

---

## Iconography

**No external icon library used.** Icons are rendered as:
1. Unicode/typographic glyphs styled with CSS (primary approach)
2. Inline SVG for complex custom icons
3. Text characters used decoratively (e.g., ◆ ▲ ● ✦ ⬡)

**Thematic icon vocabulary:**
- ⏱ Timers / clocks → round pressure
- ◆ Diamonds / gems → rarity indicators
- ▲ Triangles up → multipliers / increases
- ✕ / ✗ → failures / missed tasks
- ✓ → completions (styled, not default)
- ⚡ → combos / energy
- ★ → score / rank stars
- 🔥 → hell mode (exception: flame used as metaphor)
- ◉ → targets / objectives

**Decorative separators:** `·` `—` `×` `∞` used in UI labels.

---

## File Index

```
README.md                    ← This file
SKILL.md                     ← Agent skill definition
colors_and_type.css          ← All CSS design tokens
preview/
  colors-base.html           ← Base color palette
  colors-rarity.html         ← Rarity color system
  colors-semantic.html       ← Semantic / role colors
  type-display.html          ← Display type specimens
  type-ui.html               ← UI type scale
  type-mono.html             ← Mono / score type
  spacing-tokens.html        ← Spacing + radius tokens
  shadows-borders.html       ← Shadow + border system
  components-buttons.html    ← Button variants
  components-tasks.html      ← Task card variants
  components-perks.html      ← Perk card variants
  components-badges.html     ← Rank + status badges
  components-round-status.html ← Round state indicators
ui_kits/
  app/
    README.md
    index.html               ← Full interactive prototype
    Dashboard.jsx
    TaskCard.jsx
    PerkCard.jsx
    TaskModal.jsx
    PerkSelection.jsx
    RoundSummary.jsx
    DayView.jsx
assets/
  (icons and visual assets)
```

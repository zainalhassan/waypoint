# Design System

Waypoint uses a **stack-agnostic design system** so the same Figma designs can be implemented in Next.js, Laravel/Vue, or other stacks without redesign.

## Source of truth

| Layer | Location | Purpose |
|-------|----------|---------|
| Design tokens | [`design/tokens.json`](../design/tokens.json) | Colors, spacing, typography (W3C format) |
| Figma components | [`design/figma/COMPONENT_MAP.md`](../design/figma/COMPONENT_MAP.md) | Figma ↔ code naming |
| CSS variables | [`app/globals.css`](../app/globals.css) | Next.js runtime theme (shadcn) |

## Workflow

1. **Design in Figma** using Variables that match `design/tokens.json`
2. **Export tokens** (Tokens Studio → JSON) and commit to `design/tokens.json`
3. **Implement per stack:**
   - Next.js: update `globals.css` CSS variables
   - Vue/Laravel: generate SCSS or Tailwind theme from tokens JSON

## Figma setup (recommended)

Create a Figma library file: **Waypoint Design System**

**Collections:**
- `color/brand` — primary, accent
- `color/semantic` — success, warning, destructive
- `color/stage` — pipeline stage colors
- `spacing/*` — 4, 8, 16, 24, 32
- `radius/*` — sm, md, lg
- `typography/*` — font families and sizes

**Components to build:**
- Button (primary, secondary, ghost)
- Input, Textarea, Select
- Card
- Badge (especially stage/status variant)
- Table row / header
- App navigation bar
- Empty state block
- Stat card (analytics)
- Sankey chart placeholder frame

## Principles

1. **Tokens over hardcoded values** — no random hex in components
2. **Component names match code** — see COMPONENT_MAP.md
3. **Stages use semantic colors** — from `color.stage.*` tokens
4. **Layouts use 8px grid** — spacing tokens

## This project (Next.js)

UI built with **shadcn/ui** primitives in `components/ui/`. Domain components in `components/` follow Figma screen names:

- `PipelineCard` → Pipelines / List / Card
- `ItemTable` → Pipeline / Dashboard / Table
- `StageBadge` → Badge / Stage
- `SankeyChart` → Analytics / Sankey

When updating designs, change tokens first, then Figma, then CSS — never the reverse.

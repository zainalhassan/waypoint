# Figma → Code Component Map

Use this map to keep Waypoint designs consistent in Figma and portable across stacks (Next.js, Laravel/Vue, etc.).

## Figma file structure (recommended)

```
Waypoint Design System
├── 🎨 Foundations
│   ├── Colors        → linked to design/tokens.json
│   ├── Typography
│   ├── Spacing
│   └── Radius
├── 🧩 Components
│   ├── Button        (variants: primary, secondary, ghost, destructive)
│   ├── Input
│   ├── Card
│   ├── Badge
│   ├── Table
│   ├── Select
│   └── Dialog
└── 📱 Screens
    ├── Auth / Login
    ├── Auth / Register
    ├── Pipelines / List
    ├── Pipeline / Dashboard
    ├── Item / Detail
    └── Analytics / Sankey
```

## Component naming (Figma ↔ code)

| Figma component | Waypoint (React/shadcn) | Laravel/Vue equivalent |
|-----------------|-------------------------|-------------------------|
| `Button/Primary` | `components/ui/button` variant `default` | `<Button>` / `<v-btn color="primary">` |
| `Button/Secondary` | `variant="secondary"` | secondary button class |
| `Button/Ghost` | `variant="ghost"` | text button |
| `Input/Default` | `components/ui/input` | `<input class="input">` |
| `Card/Default` | `components/ui/card` | card partial |
| `Badge/Stage` | `components/StageBadge` | status pill component |
| `Table/Default` | `components/ui/table` | data table |
| `Nav/App` | `components/layout/AppNav` | layout nav partial |

## Stage badge colors

Use Figma variables bound to `color.stage.*` tokens in `design/tokens.json`. Same hex values are used in pipeline templates (`lib/pipelines/templates.ts`).

## Sankey chart

Design the analytics screen layout in Figma (cards + chart area). The chart itself is rendered by ECharts in code — annotate the frame with:

- Min height: 400px
- Full width of content column
- Tooltip on hover (dev implements via ECharts)

## Tokens workflow

1. Define **Figma Variables** matching `design/tokens.json` groups.
2. Export tokens via [Tokens Studio](https://tokens.studio/) → JSON (W3C format).
3. Commit to `design/tokens.json` (single source of truth in repo).
4. Per stack:
   - **Next.js:** map to CSS variables in `app/globals.css`
   - **Vue/Laravel:** import JSON → SCSS variables or Tailwind theme extension

Do **not** hardcode colors in app code — use tokens or CSS variables.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Dropdown nav animation parameters

`src/components/DropdownNav.tsx`

Live demo: **[ngen-design.vercel.app/chevron-nav](https://ngen-design.vercel.app/chevron-nav)** — use the 0.1x / 0.5x buttons in the bottom-left corner to slow every animation on the page down and see exactly what's happening.

**Panel open / close**

| Parameter | Open | Close |
| --- | --- | --- |
| Duration | 250ms | 150ms |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Scale | 0.97 → 1 | 1 → 0.99 |
| Y offset | -10px → 0 | 0 → -10px |
| Opacity | 0 → 1 | 1 → 0 |

**Content swap** (when hovering between triggers while a dropdown is open)

Switching triggers while the panel is already open doesn't close and reopen it — the panel stays put and only its inner content is replaced, so the swap reads as one continuous surface rather than a flicker.

- **Direction is derived from trigger order**, not raw cursor position: moving to a trigger further right sets direction `1`, further left sets `-1`. The exiting content slides out toward the side the cursor came *from*, and the entering content slides in from the opposite side — so the motion always points the way the cursor is travelling.
- **Exit and enter overlap** (`CONTENT_SWAP_ENTER_DELAY = 0`): the entering content starts animating in the instant the exiting content starts animating out, rather than waiting for the exit to finish. This is what keeps rapid back-to-back trigger switches feeling responsive instead of sluggish.
- **Reduced motion** drops the slide and blur but keeps the opacity crossfade, so the change still reads as a change without any position movement.

*Implementation:* the inner `AnimatePresence` keeps its default `mode="sync"` (not `"wait"`), so the outgoing and incoming content — swapped via `key={activeIndex}` — animate at the same time instead of enter waiting for exit.

**Overlap by `CONTENT_SWAP_ENTER_DELAY`**

| `CONTENT_SWAP_ENTER_DELAY` | Overlap |
| --- | --- |
| `0` (current) | Full — enter starts the instant exit starts |
| `> 0`, `< duration` | Partial |
| `≥ duration` | None — fully sequential |

**Content swap parameters**

| Parameter | Value |
| --- | --- |
| Duration | 140ms |
| Easing | `ease-in-out` |
| Translate X | 32px (direction-aware: exiting content moves toward the side the cursor came from, entering content moves in from the opposite side) |
| Blur | 4px |
| Opacity | 0 → 1 |

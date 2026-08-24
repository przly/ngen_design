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

**Panel open / close**

| Parameter | Open | Close |
| --- | --- | --- |
| Duration | 250ms | 150ms |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Scale | 0.97 → 1 | 1 → 0.99 |
| Y offset | -10px → 0 | 0 → -10px |
| Opacity | 0 → 1 | 1 → 0 |

**Content swap** (when hovering between triggers while a dropdown is open)

| Parameter | Value |
| --- | --- |
| Duration | 140ms |
| Easing | `ease-in-out` |
| Translate X | 32px (direction-aware: exiting content moves toward the side the cursor came from, entering content moves in from the opposite side) |
| Blur | 4px |
| Opacity | 0 → 1 |

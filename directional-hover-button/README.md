# Directional Hover Button

A button/link with a pill background that slides in from whichever side the
cursor enters, and slides out toward whichever side it exits. Also supports
a `dropdown` variant with a chevron that rotates 180° on hover.

## Install

```
npm i motion
```

Requires React 19 + TypeScript + Tailwind CSS (utility classes are used
directly on the elements).

## Setup

The pill and label colors reference two CSS variables. Define them in your
global stylesheet, or replace the two `bg-[var(...)]` / `text-[var(...)]`
classes in the component with your own tokens:

```css
--ngen-grayscale-50: #f4f6f7;
--ngen-grayscale-500: #7c868e;
```

The `dropdown` variant renders a chevron via an `icon-symbol` class using
the ligature text `keyboard_arrow_down` (Material Symbols font). Swap this
for your own icon system if different.

## Usage

```tsx
import DirectionalHoverButton from "./DirectionalHoverButton";

<DirectionalHoverButton text="Button" href="#" />
<DirectionalHoverButton text="Button" variant="dropdown" href="#" />
```

## Props

| Prop      | Type                      | Default     | Notes                                   |
| --------- | ------------------------- | ----------- | ---------------------------------------- |
| `text`    | `string`                  | `"Button"`  | Label text                               |
| `variant` | `"default" \| "dropdown"` | `"default"` | `dropdown` adds a rotating chevron       |
| `href`    | `string`                  | —           | Renders as `<a>`; omit to render `<button>` |
| `onClick` | `() => void`              | —           | Click handler                            |

## How it works

- On `mouseenter`/`mouseleave`, the cursor's horizontal position relative to
  the button's midpoint decides which side ("left" or "right") the pill
  animates from/to.
- The pill starts resting 1000px off-canvas (clipped by `overflow-hidden`)
  before first hover.
- The animation is a spring tuned to match the source Figma prototype
  (Smart Animate, "Slow" spring, 120ms duration, 0 bounce).

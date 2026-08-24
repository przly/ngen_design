import { createContext, useContext } from "react";

// Multiplies animation playback speed for any DropdownNav/NavLink rendered
// under a provider — 1 = normal, 0.5 = half speed, 0.1 = one-tenth speed.
// Defaults to 1 for consumers outside a provider, so pages that don't opt
// in (e.g. the plain NavLink demo) are unaffected.
export const AnimationSpeedContext = createContext(1);

export function useAnimationSpeed(): number {
  return useContext(AnimationSpeedContext);
}

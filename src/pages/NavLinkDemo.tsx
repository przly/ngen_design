import { useState } from "react";
import NavLink from "../components/NavLink";

export default function NavLinkDemo() {
  const [slowMotion, setSlowMotion] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-white">
      <div className="flex items-center gap-5">
        <NavLink text="Button" variant="default" href="#" slowMotion={slowMotion} />
        <NavLink text="Button" variant="dropdown" href="#" slowMotion={slowMotion} />
      </div>

      <label className="flex select-none items-center gap-2 text-sm text-[var(--ngen-grayscale-500)]">
        <input
          type="checkbox"
          checked={slowMotion}
          onChange={(event) => setSlowMotion(event.target.checked)}
        />
        Slow motion (0.1x)
      </label>
    </div>
  );
}

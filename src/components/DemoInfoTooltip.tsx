import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DEMO_ROUTES } from "../demoRoutes";

// Fixed-position "i" badge shown on every demo page, listing every demo
// route so you can jump between them without editing the URL by hand.
// Add new demos to src/demoRoutes.ts, not here — this component just
// renders whatever that list contains.
export default function DemoInfoTooltip() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="fixed right-4 top-4 z-[70]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Demo pages"
        className="icon-symbol flex size-8 items-center justify-center rounded-full border border-[var(--ngen-grayscale-50)] bg-white text-base leading-none text-[var(--ngen-grayscale-500)] shadow-sm transition-colors hover:text-[var(--ngen-grayscale-900)]"
      >
        info
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 w-56 rounded-xl border border-[var(--ngen-grayscale-50)] bg-white p-2 shadow-xl"
        >
          <p className="eyebrow px-2 pb-1.5 pt-1 text-[10px] leading-none text-[var(--ngen-grayscale-500)]">
            Demo pages
          </p>
          <div className="flex flex-col">
            {DEMO_ROUTES.map((route) => {
              const isActive = location.pathname === route.path;
              return (
                <Link
                  key={route.path}
                  to={route.path}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-2 py-1.5 text-sm leading-[1.3] transition-colors ${
                    isActive
                      ? "bg-[var(--ngen-grayscale-50)] font-medium text-[var(--ngen-grayscale-900)]"
                      : "text-[var(--ngen-grayscale-500)] hover:bg-[var(--ngen-grayscale-50)] hover:text-[var(--ngen-grayscale-900)]"
                  }`}
                >
                  <span className="block">{route.label}</span>
                  <span className="block text-xs text-[var(--ngen-grayscale-500)]">{route.path}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

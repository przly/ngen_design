type SpeedControlProps = {
  speed: number;
  onChange: (speed: number) => void;
  position?: "bottom-left" | "bottom-right";
};

// Debug control for reviewing motion frame-by-frame — not a product
// feature. 1 (unselected) is normal speed. Pair with an
// AnimationSpeedContext.Provider (or, for pages predating that context,
// like ContactForm's CSS-driven stagger, a consumer reading `speed`
// directly and dividing its own base durations by it).
const SPEED_OPTIONS = [0.5, 0.1] as const;

export default function SpeedControl({ speed, onChange, position = "bottom-left" }: SpeedControlProps) {
  return (
    <div
      className={`fixed bottom-4 z-[60] flex gap-1 rounded-full border border-[var(--color-gray-50)] bg-white p-1 shadow-sm ${
        position === "bottom-right" ? "right-4" : "left-4"
      }`}
      role="group"
      aria-label="Animation speed"
    >
      {SPEED_OPTIONS.map((option) => {
        const isActive = speed === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(isActive ? 1 : option)}
            aria-pressed={isActive}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive
                ? "bg-[var(--color-gray-900)] text-white"
                : "text-[var(--color-gray-500)] hover:bg-[var(--color-gray-50)]"
            }`}
          >
            {option}x
          </button>
        );
      })}
    </div>
  );
}

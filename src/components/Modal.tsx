import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";

type Phase = "closed" | "open" | "closing";

// Fallback only — the real value is read from --modal-close-dur at close
// time, so a change to the CSS token can't silently desync from this timer.
const CLOSE_DUR_FALLBACK = 150;

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({ open, onClose, children }: ModalProps) {
  const [phase, setPhase] = useState<Phase>("closed");

  // Runs before paint so the browser only ever commits "open" then
  // "closing" — never a bare unclassed frame in between, which would
  // otherwise snap the modal shut instead of animating it closed.
  useLayoutEffect(() => {
    setPhase((prev) => {
      if (open) return "open";
      return prev === "closed" ? "closed" : "closing";
    });
  }, [open]);

  useEffect(() => {
    if (phase !== "closing") return;
    const closeMs =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--modal-close-dur")
      ) || CLOSE_DUR_FALLBACK;
    const timeout = window.setTimeout(() => setPhase("closed"), closeMs);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const visible = phase !== "closed";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ pointerEvents: visible ? "auto" : "none" }}
      aria-hidden={!visible}
    >
      <div
        className={`t-modal-backdrop absolute inset-0 bg-[var(--ngen-grayscale-900)]/40 ${
          phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : ""
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`t-modal relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ${
          phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

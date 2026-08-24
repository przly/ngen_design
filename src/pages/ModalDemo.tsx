import { useEffect, useState } from "react";
import Modal from "../components/Modal";

// Fallback only — the real value is read from --toast-close at dismiss
// time, so a change to the CSS token can't silently desync from this timer.
const TOAST_CLOSE_DUR_FALLBACK = 250;

export default function ModalDemo() {
  const [open, setOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(true);
  const [cardMounted, setCardMounted] = useState(true);

  useEffect(() => {
    if (cardOpen) return;
    const closeMs =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--toast-close")
      ) || TOAST_CLOSE_DUR_FALLBACK;
    const timeout = window.setTimeout(() => setCardMounted(false), closeMs);
    return () => window.clearTimeout(timeout);
  }, [cardOpen]);

  return (
    <div className="min-h-screen w-full bg-white">
      {cardMounted && (
        <div
          className={`t-toast fixed bottom-6 right-6 flex w-64 flex-col gap-3 rounded-2xl border border-[var(--ngen-grayscale-50)] bg-white p-4 shadow-xl ${
            cardOpen ? "is-open" : ""
          }`}
          style={{ pointerEvents: cardOpen ? "auto" : "none" }}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-[var(--ngen-grayscale-900)] px-5 py-3 text-sm font-medium text-white transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            Open modal
          </button>
          <button
            type="button"
            onClick={() => setCardOpen(false)}
            className="w-fit rounded-full border border-[var(--ngen-grayscale-50)] px-[14px] py-[10px] text-xs text-[var(--ngen-grayscale-900)] transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            Dismiss
          </button>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="text-xl font-medium leading-[1.2] tracking-[-0.4px] text-[var(--ngen-grayscale-900)]">
          Modal title
        </h2>
        <p className="mt-2 text-sm leading-[1.5] text-[var(--ngen-grayscale-500)]">
          This is a modal opened from a button, using the scale-up transition.
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-6 w-fit rounded-full border border-[var(--ngen-grayscale-50)] px-[14px] py-[10px] text-xs text-[var(--ngen-grayscale-900)] transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          Close
        </button>
      </Modal>
    </div>
  );
}

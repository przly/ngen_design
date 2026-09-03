import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import DemoInfoTooltip from "../components/DemoInfoTooltip";

// Figma prototype spring for the input border color transition
// (Smart animate, mass 1 / stiffness 720 / damping 60).
const ERROR_SPRING = { type: "spring", stiffness: 720, damping: 60, mass: 1 } as const;

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [showError, setShowError] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowError((error) => !error);
  };

  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-[var(--ngen-grayscale-900)] pt-[30vh]">
      <DemoInfoTooltip />
      <form onSubmit={handleSubmit} className="flex w-[484px] flex-col items-start">
        <label htmlFor="newsletter-email" className="mb-1 text-xs leading-[1.5] text-white/50">
          Your E-mail
        </label>

        <motion.div
          className="w-full rounded-lg border-[0.5px] bg-white/10"
          initial={false}
          animate={{ borderColor: showError ? "#fb2c36" : "rgba(255,255,255,0.1)" }}
          transition={ERROR_SPRING}
        >
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setShowError(false);
            }}
            placeholder="E-mail"
            className="w-full bg-transparent px-4 py-2.5 text-sm font-medium text-white placeholder:text-white/50 focus:outline-none"
          />
        </motion.div>

        {/* transitions-dev accordion panel (21-accordion.md): grid-template-rows
            0fr -> 1fr animates height with no JS measuring and, unlike a scaleY
            reveal, never distorts the message text. */}
        <div className="t-acc w-full" data-open={showError}>
          <div className="t-acc-panel">
            <div className="t-acc-panel-inner pb-1.5 text-xs leading-[1.5] text-[#fb2c36]">
              This is an error message to let the user know they made a mistake.
            </div>
          </div>
        </div>

        <p className="mb-4 text-xs leading-[1.5] text-[var(--ngen-grayscale-500)]">
          By signing up, you agree to receive NGEN updates. You can unsubscribe at any time.
        </p>
        <button
          type="submit"
          className="rounded-full border border-[var(--ngen-grayscale-50)] bg-white px-[14px] py-[10px] text-xs text-[var(--ngen-grayscale-900)] transition-transform duration-150 ease-out active:scale-[0.97]"
        >
          Sign up
        </button>
      </form>
    </div>
  );
}

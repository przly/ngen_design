import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import DemoInfoTooltip from "../components/DemoInfoTooltip";

// Figma prototype spring for the input border color transition
// (Smart animate, mass 1 / stiffness 720 / damping 60).
const ERROR_SPRING = { type: "spring", stiffness: 720, damping: 60, mass: 1 } as const;

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const showError = status === "error";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (event.currentTarget.checkValidity()) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-[var(--color-gray-900)] pt-[30vh]">
      <DemoInfoTooltip />
      <form noValidate onSubmit={handleSubmit} className="flex w-[484px] flex-col items-start">
        <label htmlFor="newsletter-email" className="mb-1 text-xs leading-[1.5] text-white/50">
          Your E-mail
        </label>

        <motion.div
          className="w-full rounded-lg border-[0.5px] bg-white/10"
          initial={false}
          animate={{ borderColor: showError ? "var(--color-validation-failed)" : "rgba(255,255,255,0.1)" }}
          transition={ERROR_SPRING}
        >
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setStatus("idle");
            }}
            placeholder="E-mail"
            className="w-full bg-transparent px-4 py-2.5 text-sm font-medium text-white placeholder:text-white/50 focus:outline-none autofill:[-webkit-text-fill-color:white] autofill:[transition:background-color_9999s_ease-out_0s]"
          />
        </motion.div>

        {/* transitions-dev accordion panel (21-accordion.md): grid-template-rows
            0fr -> 1fr animates height with no JS measuring and, unlike a scaleY
            reveal, never distorts the message text. */}
        <div className="t-acc w-full" data-open={showError}>
          <div className="t-acc-panel">
            <div className="t-acc-panel-inner pb-1.5 text-xs leading-[1.5] text-[var(--color-validation-failed)]">
              This is an error message to let the user know they made a mistake.
            </div>
          </div>
        </div>

        <p className="mb-4 text-xs leading-[1.5] text-[var(--color-gray-500)]">
          By signing up, you agree to receive NGEN updates. You can unsubscribe at any time.
        </p>
        <div className="flex items-center gap-6">
          <button
            type="submit"
            className="rounded-full border border-[var(--color-gray-50)] bg-white px-[14px] py-[10px] text-xs text-[var(--color-gray-900)] transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            Sign up
          </button>
          <div aria-live="polite">
            <AnimatePresence>
              {status === "success" && (
                <motion.p
                  className="text-xs leading-[1.5] text-[var(--color-green-600)]"
                  initial={{ opacity: 0, x: -4, filter: "blur(2px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeIn" } }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  Sign up successful. Thank you!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>
    </div>
  );
}

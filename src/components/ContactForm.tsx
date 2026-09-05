import { useLayoutEffect, useState, type FormEvent } from "react";

type ContactType = "home" | "business" | "asset-owners";

const TYPE_OPTIONS: { value: ContactType; label: string }[] = [
  { value: "home", label: "For Home" },
  { value: "business", label: "For Business" },
  { value: "asset-owners", label: "For Asset Owners" },
];

// Figma's second "Topic" frame (node 4479:20758) — revealed once a type
// above is picked. Unlike the type selector this one is multi-select, per
// its "You can select multiple options" hint. Each type gets its own list,
// deliberately different lengths — the row stagger below groups by
// position (first 3 = row 1, rest = row 2+), so it already generalizes to
// any count without changes.
const TOPIC_OPTIONS_BY_TYPE: Record<ContactType, string[]> = {
  home: ["Home solutions", "Technical support", "Other"],
  business: ["Business solutions", "Partnerships", "Billing & invoicing", "Technical support", "Other"],
  "asset-owners": ["Utility & Grid", "Partnerships", "Technical support", "Other"],
};

type SelectorButtonProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
};

// Shared by the type selector (single-select) and the topic selector
// (multi-select) — both use the same three Figma states: default
// (white/10), hover (white/20), and selected (solid white, dark text).
function SelectorButton({ label, selected, onClick, className }: SelectorButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg border-[0.5px] py-2.5 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98] ${
        selected
          ? "border-transparent bg-white text-[var(--ngen-grayscale-900)]"
          : "border-white/10 bg-white/10 text-white hover:bg-white/20"
      } ${className ?? ""}`}
    >
      {label}
    </button>
  );
}

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
};

// Mirrors the Figma "Inputfield" component (dark, no icon/hint variant) —
// label row with an optional required asterisk, plus a white/10 field.
function FormField({ id, label, required, type = "text", value, onChange, placeholder, className }: FieldProps) {
  return (
    <div className={`flex w-full flex-1 flex-col items-start gap-2 ${className ?? ""}`}>
      <label htmlFor={id} className="flex items-start gap-1 text-xs leading-[1.5] text-white/50">
        {label}
        {required && <span className="text-[#fb2c36]">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border-[0.5px] border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white placeholder:text-white/50 focus:border-white/20 focus:outline-none"
      />
    </div>
  );
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [postNumber, setPostNumber] = useState("");
  const [type, setType] = useState<ContactType | null>(null);
  // Separate from `type` on purpose: when deselecting, `type` needs to go
  // null immediately (canSubmit, the type button's own selected state),
  // but the topic grid should keep rendering the just-deselected type's
  // list while the .t-acc panel is still visually collapsing — otherwise
  // the buttons would vanish instantly instead of fading out with the
  // rest of the 250ms close transition. handleTypeSelect always sets this
  // to the clicked type, whether that click is selecting it or
  // deselecting it, so it only ever goes stale in a way nobody can see.
  // It's also what each topic button gets keyed by (below) — keying by
  // "<type>-<topic>" rather than just "<topic>" means a label that exists
  // under two types (e.g. "Partnerships" appears for both Business and
  // Asset Owners) still forces a genuine remount on switch, instead of
  // React reusing that DOM node and skipping its entrance animation.
  const [topicSourceType, setTopicSourceType] = useState<ContactType | null>(null);
  const topicOptions = topicSourceType ? TOPIC_OPTIONS_BY_TYPE[topicSourceType] : [];
  // Drives the topic stagger independently of .t-acc's own data-open (the
  // shell's open/close). .t-acc[data-open] only *changes value* when the
  // section opens or closes — switching directly between two already-open
  // types never touches it, so a CSS selector keyed off it alone can't
  // replay the stagger for a pure content swap (a freshly-inserted node
  // under an ancestor that was already "open" has no prior frame to
  // transition from — it just appears at its final opacity with no fade).
  // Resetting this to false and flipping it back to true one frame later,
  // every time `type` becomes a new truthy value, forces a real off->on
  // transition for both the first open and every later switch.
  const [topicsReady, setTopicsReady] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = Boolean(
    name && surname && email && country && postNumber && type && topics.length > 0 && message && agreed
  );

  // useLayoutEffect, not useEffect: this must reset topicsReady to false
  // BEFORE the browser paints the render that just swapped in new topic
  // content, or a slow paint could show the new buttons at full opacity
  // for one frame before they drop to 0 and fade back in.
  //
  // Double rAF, not a single one: a single requestAnimationFrame doesn't
  // reliably guarantee the browser actually PAINTS the reset (opacity 0 /
  // scaled down) state before flipping back to open — browsers are free
  // to batch the reset and the reopen into the same frame and skip the
  // intermediate paint, which is exactly what made this flaky (sometimes
  // stagger-fading in, sometimes just popping in at once with no visible
  // transition). Nesting a second rAF inside the first only flips
  // topicsReady back to true after a full frame has definitely been
  // painted with the reset state, so the CSS transition always has a
  // real "before" value to animate from.
  useLayoutEffect(() => {
    if (!type) return; // closing — the shell's own transition handles it, no stagger replay needed
    setTopicsReady(false);
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setTopicsReady(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [type]);

  // Picking a type opens the topic sub-selection; clicking the already-
  // selected type deselects it again (collapsing the topic section).
  // Either way, topics from the previous type don't carry over.
  const handleTypeSelect = (value: ContactType) => {
    setType((current) => (current === value ? null : value));
    setTopicSourceType(value);
    setTopics([]);
  };

  const toggleTopic = (topic: string) => {
    setTopics((current) => (current.includes(topic) ? current.filter((value) => value !== topic) : [...current, topic]));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-[714px] flex-col items-start gap-9 bg-[var(--ngen-grayscale-900)] p-6"
    >
      <div className="flex w-full flex-col items-start gap-12">
        <div className="flex w-full flex-col items-start gap-6">
          <div className="flex w-full flex-col items-start gap-5 sm:flex-row">
            <FormField id="name" label="Name" required value={name} onChange={setName} placeholder="Name" />
            <FormField
              id="surname"
              label="SURName"
              required
              value={surname}
              onChange={setSurname}
              placeholder="Surname"
            />
          </div>

          <FormField
            id="email"
            label="E-mail"
            type="email"
            required
            value={email}
            onChange={setEmail}
            placeholder="E-mail"
          />

          <FormField
            id="phone"
            label="Phone number"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="Phone number"
          />

          <div className="flex w-full flex-col items-start gap-5 sm:flex-row">
            <FormField
              id="country"
              label="Country"
              required
              value={country}
              onChange={setCountry}
              placeholder="Country"
            />
            <FormField
              id="post-number"
              label="Post Number"
              required
              value={postNumber}
              onChange={setPostNumber}
              placeholder="Post Number"
            />
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex items-start gap-1 text-xs leading-[1.5] text-white/50">
            <span>Select the type:</span>
            <span className="text-[#fb2c36]">*</span>
          </div>
          <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center" role="group" aria-label="Contact type">
            {TYPE_OPTIONS.map((option) => (
              <SelectorButton
                key={option.value}
                label={option.label}
                selected={type === option.value}
                onClick={() => handleTypeSelect(option.value)}
                className="flex-1"
              />
            ))}
          </div>

          {/* transitions-dev accordion panel (21-accordion.md) — same .t-acc
              technique as the post-submit confirmation below and
              NewsletterSignup's error banner, reused here instead of a
              second, JS-driven height animation. t-acc--instant-open makes
              the shell's own open transition close to instant (60ms, see
              index.css for why it isn't shorter) so first appear reads
              like a later type switch — in both cases the container is
              essentially already at full size and the topicsReady-driven
              content stagger is the motion that actually reads. */}
          {/* inert (not just visually collapsed) while closed — .t-acc-panel's
              overflow:hidden/0-height only hides this from sighted mouse
              users; without it, keyboard focus and screen readers could
              still reach buttons sitting inside a section that looks like
              it doesn't exist. */}
          <div className="t-acc t-acc--instant-open w-full" data-open={Boolean(type)} inert={!type}>
            <div className="t-acc-panel">
              {/* .t-acc-panel-inner must stay free of its own padding — padding
                  is part of the box itself and isn't clipped to 0 the way
                  overflowing content is, so it would leak a phantom height
                  into the collapsed (closed) state. The pt-6 spacing lives on
                  this nested div instead. */}
              <div className="t-acc-panel-inner w-full">
                <div className="t-stagger-group flex w-full flex-col items-start gap-2 pt-6" data-open={topicsReady}>
                  <div className="t-stagger-item flex w-full flex-col items-start gap-1 text-xs leading-[1.5] text-white/50 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                    <div className="flex items-start gap-1">
                      <span>Select a topic:</span>
                      <span className="text-[#fb2c36]">*</span>
                    </div>
                    <span>You can select multiple options</span>
                  </div>
                  <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-3" role="group" aria-label="Topic">
                    {/* t-stagger-item lives on this wrapper, not the button itself —
                        its own entrance transform (translateY) would otherwise
                        collide with the button's transition-transform (press
                        feedback) on the same element. Separate elements, separate
                        transform users, no cascade conflict. */}
                    {topicOptions.map((topic) => (
                      <div key={`${topicSourceType}-${topic}`} className="t-stagger-item t-stagger-item--pop w-full">
                        <SelectorButton
                          label={topic}
                          selected={topics.includes(topic)}
                          onClick={() => toggleTopic(topic)}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <label htmlFor="message" className="flex items-start gap-1 text-xs leading-[1.5] text-white/50">
            Message
            <span className="text-[#fb2c36]">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write us a message..."
            className="h-[196px] w-full resize-none rounded-lg border-[0.5px] border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white placeholder:text-white/50 focus:border-white/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-[18px]">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="sr-only"
          />
          <span
            className={`icon-symbol flex size-[18px] shrink-0 items-center justify-center rounded border-[0.5px] text-[14px] leading-none text-[var(--ngen-grayscale-900)] transition-colors duration-150 ${
              agreed ? "border-[var(--ngen-green-400)] bg-[var(--ngen-green-600)]" : "border-white/10 bg-white/10"
            }`}
          >
            {agreed ? "check" : ""}
          </span>
          <span className="text-sm leading-[1.5] text-white">
            I agree to <span className="underline decoration-solid [text-underline-position:from-font]">Terms & Conditions</span>
          </span>
        </label>

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--ngen-green-400)] bg-[var(--ngen-green-600)] px-4 py-3 text-sm font-medium text-[var(--ngen-grayscale-900)] transition-transform duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send Message
          <span className="icon-symbol text-sm leading-none">arrow_forward</span>
        </button>

        {/* transitions-dev accordion panel (21-accordion.md), same pattern as
            NewsletterSignup's error banner, for the post-submit confirmation. */}
        <div className="t-acc w-full" data-open={submitted}>
          <div className="t-acc-panel">
            <div className="t-acc-panel-inner text-xs leading-[1.5] text-[var(--ngen-green-400)]">
              Thanks — your message has been sent.
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

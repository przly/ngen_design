import { useState } from "react";
import ContactForm from "../components/ContactForm";
import DemoInfoTooltip from "../components/DemoInfoTooltip";
import SpeedControl from "../components/SpeedControl";
import { AnimationSpeedContext } from "../context/AnimationSpeedContext";

export default function ContactFormDemo() {
  const [speed, setSpeed] = useState(1);

  return (
    <AnimationSpeedContext.Provider value={speed}>
      <div className="flex min-h-screen w-full items-start justify-center bg-[var(--color-gray-900)] py-16">
        <DemoInfoTooltip />
        <ContactForm />
      </div>
      <SpeedControl speed={speed} onChange={setSpeed} position="bottom-right" />
    </AnimationSpeedContext.Provider>
  );
}

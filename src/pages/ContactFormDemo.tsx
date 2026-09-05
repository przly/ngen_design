import ContactForm from "../components/ContactForm";
import DemoInfoTooltip from "../components/DemoInfoTooltip";

export default function ContactFormDemo() {
  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-[var(--ngen-grayscale-900)] py-16">
      <DemoInfoTooltip />
      <ContactForm />
    </div>
  );
}

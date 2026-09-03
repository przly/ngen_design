import HeroCards from "../components/HeroCards";
import DemoInfoTooltip from "../components/DemoInfoTooltip";

export default function HeroCardsDemo() {
  return (
    <div className="flex min-h-screen w-full items-center justify-start bg-[var(--ngen-grayscale-900)] pl-6">
      <DemoInfoTooltip />
      <HeroCards />
    </div>
  );
}

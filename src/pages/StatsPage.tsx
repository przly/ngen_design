import StatsModule from "../components/StatsModule";
import DemoInfoTooltip from "../components/DemoInfoTooltip";

export default function StatsPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <DemoInfoTooltip />
      <StatsModule />
    </div>
  );
}

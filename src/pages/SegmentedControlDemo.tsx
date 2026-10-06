import { useState } from "react";
import SegmentedControl from "../components/SegmentedControl";
import DotCard from "../components/DotCard";
import DemoInfoTooltip from "../components/DemoInfoTooltip";

const OPTIONS = [
  {
    value: "monitoring",
    label: "Live monitoring",
    title: "Live monitoring",
    body: "See exactly how much energy you produce, use and store. At any moment.",
  },
  {
    value: "settings",
    label: "Settings that fit you",
    title: "Settings that fit you",
    body: "Configure alerts, thresholds and automations that match exactly how you use energy.",
  },
  {
    value: "insights",
    label: "Insights that add up",
    title: "Insights that add up",
    body: "Track trends over time and spot savings you'd otherwise miss.",
  },
];

export default function SegmentedControlDemo() {
  const [value, setValue] = useState(OPTIONS[0].value);
  const [direction, setDirection] = useState<1 | -1>(1);
  const selected = OPTIONS.find((option) => option.value === value) ?? OPTIONS[0];

  const handleChange = (nextValue: string) => {
    const currentIndex = OPTIONS.findIndex((option) => option.value === value);
    const nextIndex = OPTIONS.findIndex((option) => option.value === nextValue);
    if (nextIndex !== currentIndex) {
      setDirection(nextIndex > currentIndex ? 1 : -1);
    }
    setValue(nextValue);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-white px-6">
      <DemoInfoTooltip />
      <div className="flex w-full max-w-4xl flex-col gap-4">
        <DotCard id={selected.value} title={selected.title} body={selected.body} direction={direction} />
        <SegmentedControl
          options={OPTIONS}
          value={value}
          onChange={handleChange}
          aria-label="Feature"
        />
      </div>
    </div>
  );
}

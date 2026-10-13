import BatteryStackBuilder, {
  type BatteryStackBuilderProps,
} from "@/components/modules/BatteryStackBuilder/BatteryStackBuilder";
import DemoInfoTooltip from "../components/DemoInfoTooltip";

// Stands in for the CMS: on the website this content arrives as the module's props.
// Values are from the website repo's "Sideways" story (NGEN Star EP5 and EP12, 1–4 units).
const content: BatteryStackBuilderProps = {
  slider_label: "Choose the total number of units",
  slider_mobile_label: "Total number of units",
  min: 1,
  max: 4,
  items: [
    {
      title: "NGEN Star EP5",
      text: "5,18 kWh",
      image: { src: "/battery-stack/master_module_3.webp", alt: "NGEN Star EP5" },
      capacity_kwh: 5.18,
    },
    {
      title: "NGEN Star EP12",
      text: "11,52 kWh",
      image: { src: "/battery-stack/master_module_4.webp", alt: "NGEN Star EP12" },
      capacity_kwh: 11.52,
    },
  ],
  total_title: "{count} units",
  total_text: "STAR S4 · Type 4800",
  total_image: { src: "/battery-stack/battery-pack-bg.webp", alt: "battery pack" },
};

export default function BatteryStackBuilderDemo() {
  return (
    <>
      <DemoInfoTooltip />
      {/* The website sets these on <body>; modules inherit them. */}
      <div className="font-primary flex min-h-screen flex-col justify-center text-sm leading-normal text-gray-500 md:text-base">
        <BatteryStackBuilder {...content} />
      </div>
    </>
  );
}

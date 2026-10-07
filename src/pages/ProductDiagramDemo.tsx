import { MotionConfig } from "motion/react";
import ProductDiagram, { type ProductDiagramProps } from "@/components/modules/ProductDiagram/ProductDiagram";
import DemoInfoTooltip from "../components/DemoInfoTooltip";

const asset = (name: string) => ({ src: `/diagram/assets/${name}` });

// Stands in for the CMS: on the website this content arrives as the module's props.
const content: ProductDiagramProps = {
  title: "How is NGEN’s<br/><strong>SG Connect structured?</strong>",
  text: "How the aggregator operates the SG Connect product to turn distributed assets into tradable flexibility. Check any block for details.",
  tag: "Product diagram",
  logo: { ...asset("imgSgConnectLong1.svg"), alt: "SG Connect" },
  site_tag: "At your site",
  weather_tag: "Weather",
  prices_tag: "Prices",
  nodes: [
    {
      slot: "markets",
      title: "Electricity markets",
      text: "Intraday · aFRR · mFRR",
      image: asset("imgImge1.png"),
      detail:
        "SG Connect connects distributed flexibility to electricity markets. The aggregator chooses the market and coordinates activation across the virtual power plant.",
    },
    {
      slot: "aggregator",
      title: "Aggregator",
      text: "Operates the platform, manages activations & trading",
      image: asset("imgImge5.png"),
      button: { title: "Explore", href: "#" },
      detail:
        "The aggregator operates the platform, manages activations and trading, and selects the electricity market. Activation signals go to the virtual power plant; metering, billing and rewards connect to Supply / Offtake.",
    },
    {
      slot: "vpp",
      title: "SG Connect Flexibility (VPP)",
      text: "the pool acts as one power plant",
      image: asset("imgImge1.png"),
      detail:
        "A virtual power plant pools distributed assets so they can act as one power plant. Activation signals from the aggregator are translated into control, with live data returning from the SG Connect App.",
    },
    {
      slot: "brain",
      title: "SG Brain",
      text: "Optimisation every 15 minutes",
      image: asset("imgImge4.png"),
      button: { title: "Explore", href: "#" },
      detail:
        "SG Brain uses live data, weather and electricity prices to optimise every 15 minutes. Its optimal plan feeds into the SG Connect App.",
    },
    {
      slot: "supply",
      title: "Supply / Offtake",
      text: "Contract · Dynamic Pricing · Billing · Settlement of Rewards",
      image: asset("imgImge.png"),
      button: { title: "Explore", href: "#" },
      detail:
        "Supply / Offtake connects contracts, dynamic pricing, billing and settlement of rewards. It provides electricity prices to the app and connects the home or business to metering, billing and rewards for activation.",
    },
    {
      slot: "synaptic",
      title: "Synaptic",
      text: "On-site device (HW) - Control & Live data pass through here",
      image: asset("imgImge2.png"),
      button: { title: "Explore", href: "#" },
      detail:
        "Synaptic is the on-site hardware device. Dispatch and control pass through it to connected assets, while live data and aggregated power return to the SG Connect App.",
    },
    {
      slot: "home",
      title: "Your Home or Business",
      text: "Operates the platform, manages activations & trading",
      image: asset("imgImge3.png"),
      button: { title: "Explore", href: "#" },
      detail:
        "Your home or business connects EV chargers, solar PV, inverters and batteries through Synaptic. The diagram links these assets to the supply / offtake contract and rewards for activation.",
    },
  ],
  app: {
    title: "SG Connect App",
    image: asset("imgCardImage.png"),
    logo: asset("imgScreenshot20260902At1941161.png"),
    features: [
      { text: "Live data" },
      { text: "Alerts" },
      { text: "My electricity prices" },
      { text: "Peak shaving" },
      { text: "Time-based control" },
      { text: "Devices" },
    ],
    button: { title: "Explore SG Connect App", href: "#" },
  },
  devices: [
    { title: "EV Charger", image: asset("imgImge9.png") },
    { title: "Solar PV", image: asset("imgImge6.png") },
    { title: "Inverter", image: asset("imgImge8.png") },
    { title: "Battery", image: asset("imgImge7.png") },
  ],
  connectors: [
    { slot: "chooses_market", title: "Chooses the market" },
    { slot: "activation_signal", title: "VPP activation signal" },
    { slot: "control", title: "Control" },
    { slot: "vpp_live_data", title: "Live data" },
    { slot: "brain_live_data", title: "Live data" },
    { slot: "optimal_plan", title: "Optimal plan" },
    { slot: "electricity_prices", title: "My electricity prices", text: "Prices · Bills · Contracts" },
    { slot: "dispatch", title: "Dispatch" },
    { slot: "aggregated_power", title: "Aggregated power - 2 s" },
    { slot: "metering", title: "Metering & billing", text: "Consumption / production" },
    { slot: "rewards_aggregator", title: "Rewards for activation" },
    { slot: "supply_contract", title: "Supply / offtake contract" },
    { slot: "rewards_site", title: "Rewards for activation" },
  ],
};

export default function ProductDiagramDemo() {
  return (
    <MotionConfig reducedMotion="user">
      <DemoInfoTooltip />
      {/* The website sets these on <body>; modules inherit them. */}
      <div className="font-primary pt-10 text-sm leading-normal text-gray-500 md:text-base lg:pt-16">
        <ProductDiagram {...content} />
      </div>
    </MotionConfig>
  );
}

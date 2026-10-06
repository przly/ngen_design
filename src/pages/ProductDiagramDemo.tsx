import { MotionConfig } from "motion/react";
import ProductDiagram from "../components/product-diagram/ProductDiagram";
import DemoInfoTooltip from "../components/DemoInfoTooltip";

export default function ProductDiagramDemo() {
  return (
    <MotionConfig reducedMotion="user">
      <DemoInfoTooltip />
      <ProductDiagram />
    </MotionConfig>
  );
}

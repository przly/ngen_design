import { Routes, Route } from "react-router-dom";
import NavLinkDemo from "./pages/NavLinkDemo";
import StatsPage from "./pages/StatsPage";
import ChevronNavDemo from "./pages/ChevronNavDemo";
import NewsletterSignup from "./pages/NewsletterSignup";
import ModalDemo from "./pages/ModalDemo";
import HeroCardsDemo from "./pages/HeroCardsDemo";
import ContactFormDemo from "./pages/ContactFormDemo";
import SegmentedControlDemo from "./pages/SegmentedControlDemo";
import ProductDiagramDemo from "./pages/ProductDiagramDemo";

function App() {
  return (
    <Routes>
      <Route path="/" element={<NavLinkDemo />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/chevron-nav" element={<ChevronNavDemo />} />
      <Route path="/newsletter-signup" element={<NewsletterSignup />} />
      <Route path="/modal-demo" element={<ModalDemo />} />
      <Route path="/hero-cards" element={<HeroCardsDemo />} />
      <Route path="/contact-form" element={<ContactFormDemo />} />
      <Route path="/segmented-control" element={<SegmentedControlDemo />} />
      <Route path="/product-diagram" element={<ProductDiagramDemo />} />
    </Routes>
  );
}

export default App;

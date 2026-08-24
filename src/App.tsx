import { Routes, Route } from "react-router-dom";
import NavLinkDemo from "./pages/NavLinkDemo";
import StatsPage from "./pages/StatsPage";
import ChevronNavDemo from "./pages/ChevronNavDemo";
import NewsletterSignup from "./pages/NewsletterSignup";
import ModalDemo from "./pages/ModalDemo";

function App() {
  return (
    <Routes>
      <Route path="/" element={<NavLinkDemo />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/chevron-nav" element={<ChevronNavDemo />} />
      <Route path="/newsletter-signup" element={<NewsletterSignup />} />
      <Route path="/modal-demo" element={<ModalDemo />} />
    </Routes>
  );
}

export default App;

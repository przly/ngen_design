export interface DemoRoute {
  path: string;
  label: string;
}

// Single source of truth for every demo route. DemoInfoTooltip reads this
// list directly, so a new route added here shows up in every page's info
// tooltip automatically — keep this in sync with src/App.tsx's <Route>s.
export const DEMO_ROUTES: DemoRoute[] = [
  { path: "/", label: "Nav link" },
  { path: "/stats", label: "Stats module" },
  { path: "/chevron-nav", label: "Chevron nav" },
  { path: "/newsletter-signup", label: "Newsletter signup" },
  { path: "/modal-demo", label: "Modal" },
  { path: "/hero-cards", label: "Hero cards" },
];

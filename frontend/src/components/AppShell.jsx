import { NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/", label: "Dashboard" },
  { to: "/analyze-product", label: "Analyze Product" },
  { to: "/product-opportunity", label: "Product Opportunity" },
  { to: "/integration-status", label: "Integration Status" },
  { to: "/add-product-data", label: "Add Product Data" }
];

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <p className="eyebrow">Local Demand Finder</p>
          <h1>Find the right products before everyone else does.</h1>
          <p className="muted">
            Track local demand, compare seller density, and price your entry with confidence.
          </p>
        </div>

        <nav className="nav-links">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-panel">
          <p className="eyebrow">Built for next steps</p>
          <p className="muted">
            The backend is mock-first today and ready for scraping jobs or marketplace APIs later.
          </p>
        </div>
      </aside>

      <main className="page-content">{children}</main>
    </div>
  );
}

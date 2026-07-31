import { NavLink } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="/inventory" aria-label="Inventory Sync home">
          <span className="brand-mark" aria-hidden="true">
            IS
          </span>
          <span>
            <strong>Inventory Sync</strong>
            <small>Student challenge · demo data</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <NavLink to="/inventory" activeClassName="active">
            Inventory
          </NavLink>
          <NavLink to="/alerts" activeClassName="active">
            Alerts
          </NavLink>
        </nav>
      </header>
      <main className="page-shell">{children}</main>
      <footer>
        Fictional retail network · Original student project · No official brand assets
      </footer>
    </>
  );
}

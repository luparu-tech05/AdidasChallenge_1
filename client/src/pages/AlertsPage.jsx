import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAlerts } from "../api.js";

export default function AlertsPage() {
  const [status, setStatus] = useState("OPEN");
  const [alerts, setAlerts] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    setState({ loading: true, error: "" });
    getAlerts(status)
      .then((data) => {
        setAlerts(data);
        setState({ loading: false, error: "" });
      })
      .catch((error) => setState({ loading: false, error: error.message }));
  }, [status]);

  return (
    <>
      <section className="hero compact-hero">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Low-stock alerts</h1>
          <p className="hero-copy">
            Alerts are created from the consolidated network total, never from a
            number sent by a store.
          </p>
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <h2>Alert history</h2>
          <div className="segmented" aria-label="Alert status filter">
            {["OPEN", "RESOLVED", "ALL"].map((item) => (
              <button
                key={item}
                className={status === item ? "selected" : ""}
                onClick={() => setStatus(item)}
                type="button"
              >
                {item.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {state.loading && <p className="state-message">Loading alerts…</p>}
        {state.error && <p className="error-message">{state.error}</p>}
        {!state.loading && !state.error && alerts.length === 0 && (
          <div className="empty-state">
            <span aria-hidden="true">✓</span>
            <h3>No {status.toLowerCase()} alerts</h3>
            <p>Use the movement simulator to lower a product below its threshold.</p>
          </div>
        )}
        {alerts.length > 0 && (
          <div className="alert-list">
            {alerts.map((alert) => (
              <article key={alert.id}>
                <div className="alert-icon" aria-hidden="true">
                  !
                </div>
                <div>
                  <strong>{alert.productName}</strong>
                  <span>{alert.productSku}</span>
                </div>
                <p>
                  <strong>{alert.observedQuantity}</strong> observed /{" "}
                  {alert.threshold} threshold
                </p>
                <span className={`status ${alert.status === "OPEN" ? "status-low" : "status-healthy"}`}>
                  {alert.status}
                </span>
                <Link className="text-link" to={`/products/${alert.productSku}`}>
                  Investigate →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

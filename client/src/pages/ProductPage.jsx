import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProduct } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function ProductPage() {
  const { sku } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getProduct(sku).then(setProduct).catch((requestError) => {
      setError(requestError.message);
    });
  }, [sku]);

  if (error) return <p className="error-message page-state">{error}</p>;
  if (!product) return <p className="state-message page-state">Loading product…</p>;

  const maximum = Math.max(...product.stores.map((store) => store.quantity), 1);

  return (
    <>
      <Link className="back-link" to="/inventory">
        ← Back to inventory
      </Link>
      <section className="product-header">
        <div>
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="sku">{product.sku}</p>
        </div>
        <StatusBadge status={product.status} />
      </section>

      <section className="metric-grid">
        <article>
          <span>Network total</span>
          <strong>{product.networkTotal}</strong>
          <small>units across all stores</small>
        </article>
        <article>
          <span>Alert threshold</span>
          <strong>{product.threshold}</strong>
          <small>an alert opens at or below this value</small>
        </article>
        <article>
          <span>Movements shown</span>
          <strong>{product.movements.length}</strong>
          <small>most recent API updates</small>
        </article>
      </section>

      <div className="detail-grid">
        <section className="content-card">
          <div className="section-heading">
            <h2>Store balances</h2>
          </div>
          <div className="balance-list">
            {product.stores.map((store) => (
              <div className="balance-row" key={store.code}>
                <div>
                  <strong>{store.name}</strong>
                  <span>{store.code}</span>
                </div>
                <div className="bar" aria-hidden="true">
                  <span style={{ width: `${(store.quantity / maximum) * 100}%` }} />
                </div>
                <strong>{store.quantity}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="content-card">
          <div className="section-heading">
            <h2>Recent movements</h2>
          </div>
          {product.movements.length === 0 ? (
            <p className="state-message">No movements have been reported yet.</p>
          ) : (
            <ol className="movement-list">
              {product.movements.map((movement) => (
                <li key={movement.id}>
                  <span className={`movement-type ${movement.type.toLowerCase()}`}>
                    {movement.type}
                  </span>
                  <div>
                    <strong>
                      {movement.quantity} unit{movement.quantity === 1 ? "" : "s"}
                    </strong>
                    <span>
                      {movement.storeCode} · balance {movement.resultingBalance}
                    </span>
                  </div>
                  <time dateTime={movement.occurredAt}>
                    {new Date(movement.occurredAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}

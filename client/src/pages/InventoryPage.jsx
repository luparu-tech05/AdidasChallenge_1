import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getInventory, getStores } from "../api.js";
import MovementSimulator from "../components/MovementSimulator.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const emptyFilters = { product: "", store: "", maxStock: "" };

export default function InventoryPage() {
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });

  const loadInventory = useCallback(async () => {
    setState({ loading: true, error: "" });
    try {
      const data = await getInventory(appliedFilters);
      setProducts(data);
      setState({ loading: false, error: "" });
    } catch (error) {
      setState({ loading: false, error: error.message });
    }
  }, [appliedFilters]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  useEffect(() => {
    getStores().then(setStores).catch(() => setStores([]));
  }, []);

  const change = (event) =>
    setFilters((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));

  const lowCount = products.filter((product) => product.status === "LOW").length;
  const totalUnits = products.reduce(
    (sum, product) => sum + product.networkTotal,
    0
  );

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Network overview</p>
          <h1>Know what is available. Act before it runs out.</h1>
          <p className="hero-copy">
            One consistent view built from stock movements reported by three
            simulated stores.
          </p>
        </div>
        <div className="hero-stats" aria-label="Inventory summary">
          <article>
            <span>Visible units</span>
            <strong>{totalUnits}</strong>
          </article>
          <article className={lowCount ? "attention" : ""}>
            <span>Low-stock products</span>
            <strong>{lowCount}</strong>
          </article>
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Inventory</p>
            <h2>Products across the network</h2>
          </div>
          <span className="updated">Live from the local API</span>
        </div>

        <form
          className="filters"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedFilters(filters);
          }}
        >
          <label>
            Search product
            <input
              name="product"
              value={filters.product}
              onChange={change}
              placeholder="SKU or product name"
            />
          </label>
          <label>
            Store
            <select name="store" value={filters.store} onChange={change}>
              <option value="">All stores</option>
              {stores.map((store) => (
                <option key={store.code} value={store.code}>
                  {store.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Maximum network stock
            <input
              name="maxStock"
              type="number"
              min="0"
              value={filters.maxStock}
              onChange={change}
              placeholder="Any"
            />
          </label>
          <button type="submit">Apply filters</button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setFilters(emptyFilters);
              setAppliedFilters(emptyFilters);
            }}
          >
            Clear
          </button>
        </form>

        {state.loading && <p className="state-message">Loading inventory…</p>}
        {state.error && <p className="error-message">{state.error}</p>}
        {!state.loading && !state.error && products.length === 0 && (
          <p className="state-message">No products match these filters.</p>
        )}
        {!state.loading && products.length > 0 && (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Network total</th>
                  {appliedFilters.store && <th>Selected store</th>}
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.sku}>
                    <td>
                      <strong>{product.sku}</strong>
                      <span>{product.name} · {product.category}</span>
                    </td>
                    <td className="number-cell">{product.networkTotal}</td>
                    {appliedFilters.store && (
                      <td className="number-cell">{product.stores[0]?.quantity ?? 0}</td>
                    )}
                    <td>{product.threshold} units</td>
                    <td>
                      <StatusBadge status={product.status} />
                    </td>
                    <td>
                      <Link className="text-link" to={`/products/${product.sku}`}>
                        View details <span aria-hidden="true">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {products.length > 0 && (
        <MovementSimulator products={products} onSaved={loadInventory} />
      )}
    </>
  );
}

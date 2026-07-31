import { useState } from "react";
import { postMovement } from "../api.js";

const demoKeys = {
  "BOG-CALLE82": "store-bogota-key",
  "MDE-POBLADO": "store-medellin-key",
  "CLO-JARDIN": "store-cali-key"
};

export default function MovementSimulator({ products, onSaved }) {
  const [form, setForm] = useState({
    store: "BOG-CALLE82",
    productSku: products[0]?.sku || "SAMBA-OG-WHT-42",
    type: "OUT",
    quantity: 1
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.name === "quantity"
          ? Number(event.target.value)
          : event.target.value
    }));

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setResult(null);
    try {
      const data = await postMovement({
        apiKey: demoKeys[form.store],
        idempotencyKey: `ui-${form.store}-${Date.now()}`,
        productSku: form.productSku,
        type: form.type,
        quantity: form.quantity,
        reference: "UI-DEMO"
      });
      setResult(data);
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="simulator" aria-labelledby="simulator-title">
      <div>
        <p className="eyebrow">Live API demo</p>
        <h2 id="simulator-title">Report a store movement</h2>
        <p className="supporting-copy">
          This form calls <code>POST /api/movements</code>. Demo keys are selected
          automatically and are never suitable for production.
        </p>
      </div>
      <form onSubmit={submit}>
        <label>
          Store
          <select name="store" value={form.store} onChange={update}>
            {Object.keys(demoKeys).map((store) => (
              <option key={store}>{store}</option>
            ))}
          </select>
        </label>
        <label>
          Product
          <select name="productSku" value={form.productSku} onChange={update}>
            {products.map((product) => (
              <option key={product.sku}>{product.sku}</option>
            ))}
          </select>
        </label>
        <label>
          Movement
          <select name="type" value={form.type} onChange={update}>
            <option value="IN">Stock in</option>
            <option value="OUT">Stock out</option>
          </select>
        </label>
        <label>
          Quantity
          <input
            name="quantity"
            type="number"
            min="1"
            step="1"
            value={form.quantity}
            onChange={update}
          />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? "Sending…" : "Send movement"}
        </button>
      </form>
      <div className="form-feedback" aria-live="polite">
        {result && (
          <p className="success-message">
            Saved. Store balance is now <strong>{result.resultingBalance}</strong>
            {result.alertOpened ? " and a low-stock alert was opened." : "."}
          </p>
        )}
        {error && <p className="error-message">{error}</p>}
      </div>
    </section>
  );
}

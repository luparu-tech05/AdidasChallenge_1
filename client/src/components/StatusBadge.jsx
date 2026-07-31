export default function StatusBadge({ status }) {
  const low = status === "LOW" || status === "OPEN";
  return (
    <span className={`status ${low ? "status-low" : "status-healthy"}`}>
      <span aria-hidden="true">{low ? "!" : "✓"}</span>
      {low ? "Low stock" : "Healthy"}
    </span>
  );
}

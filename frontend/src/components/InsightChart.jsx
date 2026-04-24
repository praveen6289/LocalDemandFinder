import { formatCurrency } from "../utils/format.js";

export default function InsightChart({ products }) {
  if (!products.length) {
    return null;
  }

  const maxDemand = Math.max(...products.map((product) => product.demandScore), 100);

  return (
    <div className="card chart-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Trending Snapshot</p>
          <h2>Demand leaderboard</h2>
        </div>
        <p className="muted">Compare demand score, pricing, and competition in one view.</p>
      </div>

      <div className="chart-bars">
        {products.map((product) => (
          <div key={product.id} className="chart-row">
            <div className="chart-row-header">
              <div>
                <strong>{product.productName}</strong>
                <span>
                  {product.location} - {product.competitionLevel} competition
                </span>
              </div>
              <div className="chart-meta">
                <strong>{product.demandScore}</strong>
                <span>{formatCurrency(product.averageSellingPrice)}</span>
              </div>
            </div>
            <div className="chart-track">
              <div
                className="chart-fill"
                style={{ width: `${Math.max((product.demandScore / maxDemand) * 100, 8)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format.js";
import AlertBanner from "./AlertBanner.jsx";
import RecommendationBadge from "./RecommendationBadge.jsx";

export default function ResultCard({ insight, showDetailsLink = true }) {
  if (!insight) {
    return null;
  }

  return (
    <div className="card result-card">
      <div className="result-card-header">
        <div>
          <p className="eyebrow">Analysis Result</p>
          <h3>{insight.productName}</h3>
          <p className="muted">
            {insight.category} - {insight.location}
          </p>
        </div>
        <RecommendationBadge recommendation={insight.recommendation} />
      </div>

      <AlertBanner message={insight.alert} />

      <div className="metric-grid">
        <article className="metric-card">
          <span>Demand score</span>
          <strong>{insight.demandScore}</strong>
        </article>
        <article className="metric-card">
          <span>Competition</span>
          <strong>{insight.competitionLevel}</strong>
        </article>
        <article className="metric-card">
          <span>Avg selling price</span>
          <strong>{formatCurrency(insight.averageSellingPrice)}</strong>
        </article>
        <article className="metric-card">
          <span>Suggested entry</span>
          <strong>{formatCurrency(insight.suggestedEntryPrice)}</strong>
        </article>
      </div>

      <div className="breakdown-grid">
        <article>
          <span>Search interest</span>
          <strong>{insight.searchInterest}</strong>
        </article>
        <article>
          <span>Reviews score</span>
          <strong>{insight.reviewsScore}</strong>
        </article>
        <article>
          <span>Price trend</span>
          <strong>{insight.priceTrend}</strong>
        </article>
        <article>
          <span>Observations</span>
          <strong>{insight.totalObservations}</strong>
        </article>
      </div>

      {showDetailsLink && insight.totalObservations > 0 ? (
        <Link className="secondary-link" to={`/products/${insight.id}`}>
          View product details
        </Link>
      ) : null}
    </div>
  );
}

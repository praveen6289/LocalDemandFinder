import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AlertBanner from "../components/AlertBanner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PageHeader from "../components/PageHeader.jsx";
import RecommendationBadge from "../components/RecommendationBadge.jsx";
import { getProductDetails } from "../services/api.js";
import { formatCurrency, formatDate } from "../utils/format.js";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        const data = await getProductDetails(id);
        setProduct(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return <div className="card">Loading product details...</div>;
  }

  if (error) {
    return <div className="card error-card">{error}</div>;
  }

  if (!product) {
    return (
      <EmptyState
        title="No product found"
        message="The requested product insight could not be loaded."
      />
    );
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Product Details"
        title={product.productName}
        description={`${product.category} in ${product.location}`}
        action={
          <Link className="secondary-link" to="/">
            Back to dashboard
          </Link>
        }
      />

      <div className="details-hero card">
        <div>
          <div className="result-card-header">
            <div>
              <p className="eyebrow">Recommendation</p>
              <h3>{product.productName}</h3>
            </div>
            <RecommendationBadge recommendation={product.recommendation} />
          </div>
          <AlertBanner message={product.alert} />
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <span>Demand score</span>
            <strong>{product.demandScore}</strong>
          </article>
          <article className="metric-card">
            <span>Competition score</span>
            <strong>{product.competitionScore}</strong>
          </article>
          <article className="metric-card">
            <span>Average price</span>
            <strong>{formatCurrency(product.averageSellingPrice)}</strong>
          </article>
          <article className="metric-card">
            <span>Entry price</span>
            <strong>{formatCurrency(product.suggestedEntryPrice)}</strong>
          </article>
        </div>
      </div>

      <div className="two-column-layout">
        <div className="card detail-panel">
          <p className="eyebrow">Score Breakdown</p>
          <div className="breakdown-grid">
            <article>
              <span>Search interest</span>
              <strong>{product.searchInterest}</strong>
            </article>
            <article>
              <span>Reviews score</span>
              <strong>{product.reviewsScore}</strong>
            </article>
            <article>
              <span>Price trend</span>
              <strong>{product.priceTrend}</strong>
            </article>
            <article>
              <span>Competition level</span>
              <strong>{product.competitionLevel}</strong>
            </article>
          </div>
          <p className="muted">
            Last updated {formatDate(product.lastUpdatedAt)} from {product.totalObservations} market
            observations.
          </p>
        </div>

        <div className="card detail-panel">
          <p className="eyebrow">Decision Guide</p>
          <ul className="decision-list">
            <li>ENTER when demand is above 70 and competition stays low.</li>
            <li>WAIT when interest is promising but the market needs another signal.</li>
            <li>AVOID when competition is already crowded or demand falls short.</li>
          </ul>
        </div>
      </div>

      <div className="card table-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Observation Log</p>
            <h2>Recent seller observations</h2>
          </div>
        </div>

        {product.observations?.length ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Observed</th>
                  <th>Price</th>
                  <th>Sellers</th>
                  <th>Reviews</th>
                  <th>Search interest</th>
                </tr>
              </thead>
              <tbody>
                {product.observations.map((observation) => (
                  <tr key={observation.id || observation.createdAt}>
                    <td>{formatDate(observation.createdAt || observation.observedAt)}</td>
                    <td>{formatCurrency(observation.price)}</td>
                    <td>{observation.numberOfSellers}</td>
                    <td>{observation.reviewsCount}</td>
                    <td>{observation.searchInterest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No observations yet"
            message="This result is based on fallback market heuristics. Add seller input to strengthen the recommendation."
          />
        )}
      </div>
    </section>
  );
}

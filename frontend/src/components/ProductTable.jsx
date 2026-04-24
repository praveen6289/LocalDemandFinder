import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format.js";
import RecommendationBadge from "./RecommendationBadge.jsx";

export default function ProductTable({ products }) {
  if (!products.length) {
    return null;
  }

  return (
    <div className="card table-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Product Overview</p>
          <h2>Trending products</h2>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Demand</th>
              <th>Competition</th>
              <th>Avg price</th>
              <th>Entry price</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <Link className="table-link" to={`/products/${product.id}`}>
                    {product.productName}
                  </Link>
                  <span className="table-subtitle">
                    {product.category} - {product.location}
                  </span>
                </td>
                <td>{product.demandScore}</td>
                <td>{product.competitionLevel}</td>
                <td>{formatCurrency(product.averageSellingPrice)}</td>
                <td>{formatCurrency(product.suggestedEntryPrice)}</td>
                <td>
                  <RecommendationBadge recommendation={product.recommendation} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

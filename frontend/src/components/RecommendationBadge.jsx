export default function RecommendationBadge({ recommendation }) {
  return <span className={`recommendation-badge ${recommendation?.toLowerCase()}`}>{recommendation}</span>;
}


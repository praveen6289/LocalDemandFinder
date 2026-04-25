import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import RecommendationBadge from "../components/RecommendationBadge.jsx";
import { analyzeOpportunity } from "../services/api.js";
import { formatCurrency } from "../utils/format.js";

const initialForm = {
  keyword: "",
  category: "",
  location: ""
};

export default function ProductOpportunityPage() {
  const [liveMode, setLiveMode] = useState(false);
  const [formState, setFormState] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formState,
        liveMode
      };
      const opportunity = await analyzeOpportunity(payload);
      setResult(opportunity);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Opportunity Engine"
        title="Analyze product opportunity with integrated signals"
        description="Blend marketplace supply, trend interest, social momentum, and price stability into a single stocking recommendation."
        action={
          <label className="toggle-pill">
            <input
              type="checkbox"
              checked={liveMode}
              onChange={(event) => setLiveMode(event.target.checked)}
            />
            <span>Live Data Mode</span>
          </label>
        }
      />

      <div className="two-column-layout">
        <form className="card form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="full-width">
              <span>Product keyword</span>
              <input
                name="keyword"
                value={formState.keyword}
                onChange={updateField}
                placeholder="Reusable Lunch Bag"
                required
              />
            </label>
            <label>
              <span>Category</span>
              <input
                name="category"
                value={formState.category}
                onChange={updateField}
                placeholder="Kitchen"
                required
              />
            </label>
            <label>
              <span>Location</span>
              <input
                name="location"
                value={formState.location}
                onChange={updateField}
                placeholder="Pune"
                required
              />
            </label>
          </div>

          {error ? <div className="error-inline">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze opportunity"}
          </button>
        </form>

        <div className="stack-column">
          <div className="card helper-card">
            <p className="eyebrow">Scoring inputs</p>
            <h3>Demand now blends search, YouTube, shopping reviews, and price stability.</h3>
            <p className="muted">
              Turn on Live Data Mode to use configured API keys. If a provider fails, the app will
              keep going and mark the result as partial.
            </p>
          </div>

          {result ? (
            <div className="card result-card">
              <div className="result-card-header">
                <div>
                  <p className="eyebrow">Opportunity Result</p>
                  <h3>{result.keyword}</h3>
                  <p className="muted">
                    {result.category} - {result.location}
                  </p>
                </div>
                <RecommendationBadge recommendation={result.recommendation} />
              </div>

              {result.partialData ? (
                <div className="warning-banner">
                  <strong>Partial data used.</strong>
                  <span>One or more live providers failed, so fallback data was used.</span>
                </div>
              ) : null}

              <div className="metric-grid">
                <article className="metric-card">
                  <span>Demand score</span>
                  <strong>{result.demandScore}</strong>
                </article>
                <article className="metric-card">
                  <span>Competition score</span>
                  <strong>{result.competitionScore}</strong>
                </article>
                <article className="metric-card">
                  <span>Average price</span>
                  <strong>{formatCurrency(result.averagePrice)}</strong>
                </article>
                <article className="metric-card">
                  <span>Shopping results</span>
                  <strong>{result.numberOfShoppingResults}</strong>
                </article>
              </div>

              <div className="breakdown-grid">
                <article>
                  <span>YouTube engagement</span>
                  <strong>{result.youtubeEngagementScore}</strong>
                </article>
                <article>
                  <span>Google search interest</span>
                  <strong>{result.googleSearchInterest}</strong>
                </article>
                <article>
                  <span>Shopping review score</span>
                  <strong>{result.shoppingReviewScore}</strong>
                </article>
                <article>
                  <span>Price stability score</span>
                  <strong>{result.priceStabilityScore}</strong>
                </article>
              </div>

              <div className="card reasoning-card">
                <p className="eyebrow">Reasoning Summary</p>
                <p>{result.reasoningSummary}</p>
              </div>

              {result.warnings?.length ? (
                <div className="card reasoning-card">
                  <p className="eyebrow">Warnings</p>
                  <ul className="flat-list">
                    {result.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {result.sources ? (
                <div className="source-grid">
                  <article className="card source-card">
                    <p className="eyebrow">Google Trends</p>
                    <strong>{result.sources.googleTrends.searchInterest}</strong>
                    <span>Direction: {result.sources.googleTrends.trendDirection}</span>
                    <span>
                      Mode: {result.sources.googleTrends.modeUsed || result.sources.googleTrends.providerType}
                    </span>
                  </article>
                  <article className="card source-card">
                    <p className="eyebrow">YouTube</p>
                    <strong>{result.sources.youtube.engagementScore}</strong>
                    <span>Videos: {result.sources.youtube.videoCount}</span>
                    <span>Views approx: {result.sources.youtube.totalViewsApprox}</span>
                  </article>
                  <article className="card source-card">
                    <p className="eyebrow">Google Shopping</p>
                    <strong>{result.sources.shopping.summary.numberOfShoppingResults}</strong>
                    <span>Avg reviews: {result.sources.shopping.summary.averageReviewCount}</span>
                    <span>Mode: {result.sources.shopping.modeUsed}</span>
                  </article>
                  <article className="card source-card">
                    <p className="eyebrow">Instagram</p>
                    <strong>{result.sources.instagram.enabled ? result.sources.instagram.postsCount : "Optional"}</strong>
                    <span>
                      {result.sources.instagram.enabled
                        ? `Engagement: ${result.sources.instagram.engagementScore}`
                        : "Provide Meta credentials to enable"}
                    </span>
                  </article>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

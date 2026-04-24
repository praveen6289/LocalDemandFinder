import { startTransition, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import ResultCard from "../components/ResultCard.jsx";
import { analyzeProduct } from "../services/api.js";

const initialForm = {
  productName: "",
  category: "",
  location: ""
};

export default function AnalyzeProductPage() {
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
      const insight = await analyzeProduct(formState);
      startTransition(() => setResult(insight));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Product Research"
        title="Analyze a product before you stock it"
        description="Enter a product, category, and location to estimate demand, competition, and pricing opportunity."
      />

      <div className="two-column-layout">
        <form className="card form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="full-width">
              <span>Product name</span>
              <input
                name="productName"
                value={formState.productName}
                onChange={updateField}
                placeholder="Organic Jaggery Cubes"
                required
              />
            </label>

            <label>
              <span>Category</span>
              <input
                name="category"
                value={formState.category}
                onChange={updateField}
                placeholder="Grocery"
                required
              />
            </label>

            <label>
              <span>Location</span>
              <input
                name="location"
                value={formState.location}
                onChange={updateField}
                placeholder="Bengaluru"
                required
              />
            </label>
          </div>

          {error ? <div className="error-inline">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze demand"}
          </button>
        </form>

        <div className="stack-column">
          <div className="card helper-card">
            <p className="eyebrow">Scoring model</p>
            <h3>Demand blends search, reviews, and price trend.</h3>
            <p className="muted">
              This first version uses mock observation data and market heuristics so we can ship a
              usable workflow before adding real scraping or marketplace integrations.
            </p>
          </div>

          <ResultCard insight={result} />
        </div>
      </div>
    </section>
  );
}


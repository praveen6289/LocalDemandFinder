import { startTransition, useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import ResultCard from "../components/ResultCard.jsx";
import { createObservation } from "../services/api.js";

const initialForm = {
  productName: "",
  category: "",
  location: "",
  price: "",
  numberOfSellers: "",
  reviewsCount: "",
  searchInterest: ""
};

export default function AddObservationPage() {
  const [formState, setFormState] = useState(initialForm);
  const [createdInsight, setCreatedInsight] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
    setSubmitting(true);
    setError("");

    try {
      const response = await createObservation({
        ...formState,
        price: Number(formState.price),
        numberOfSellers: Number(formState.numberOfSellers),
        reviewsCount: Number(formState.reviewsCount),
        searchInterest: Number(formState.searchInterest)
      });

      startTransition(() => {
        setCreatedInsight(response.insight);
        setFormState(initialForm);
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Seller Input"
        title="Add fresh product observations"
        description="Record what you see in the market so the opportunity model stays grounded in local reality."
      />

      <div className="two-column-layout">
        <form className="card form-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              <span>Product name</span>
              <input
                name="productName"
                value={formState.productName}
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

            <label>
              <span>Price</span>
              <input
                name="price"
                type="number"
                min="0"
                value={formState.price}
                onChange={updateField}
                placeholder="449"
                required
              />
            </label>

            <label>
              <span>Number of sellers</span>
              <input
                name="numberOfSellers"
                type="number"
                min="0"
                value={formState.numberOfSellers}
                onChange={updateField}
                placeholder="9"
                required
              />
            </label>

            <label>
              <span>Reviews count</span>
              <input
                name="reviewsCount"
                type="number"
                min="0"
                value={formState.reviewsCount}
                onChange={updateField}
                placeholder="420"
                required
              />
            </label>

            <label className="full-width">
              <span>Search interest (0-100)</span>
              <input
                name="searchInterest"
                type="number"
                min="0"
                max="100"
                value={formState.searchInterest}
                onChange={updateField}
                placeholder="88"
                required
              />
            </label>
          </div>

          {error ? <div className="error-inline">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={submitting}>
            {submitting ? "Saving observation..." : "Save observation"}
          </button>
        </form>

        <div className="stack-column">
          <div className="card helper-card">
            <p className="eyebrow">What happens next</p>
            <h3>Each observation updates market confidence.</h3>
            <p className="muted">
              The backend calculates a derived price trend, recomputes demand, and checks whether
              the opportunity now deserves an ENTER, WAIT, or AVOID recommendation.
            </p>
          </div>

          <ResultCard insight={createdInsight} />
        </div>
      </div>
    </section>
  );
}


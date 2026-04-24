import { useEffect, useMemo, useState, useDeferredValue } from "react";
import EmptyState from "../components/EmptyState.jsx";
import FilterBar from "../components/FilterBar.jsx";
import InsightChart from "../components/InsightChart.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ProductTable from "../components/ProductTable.jsx";
import StatCard from "../components/StatCard.jsx";
import { getDashboard } from "../services/api.js";
import { formatCurrency } from "../utils/format.js";

export default function DashboardPage() {
  const [location, setLocation] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [dashboard, setDashboard] = useState({
    highlights: {
      trackedProducts: 0,
      averageDemandScore: 0,
      lowCompetitionMarkets: 0,
      averageSellingPrice: 0,
      enterRecommendations: 0
    },
    trendingProducts: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredSearch = useDeferredValue(searchValue);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const data = await getDashboard(location);
        setDashboard(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [location]);

  const locations = useMemo(() => {
    const allLocations = dashboard.trendingProducts.map((product) => product.location);
    return [...new Set(allLocations)].sort();
  }, [dashboard.trendingProducts]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return dashboard.trendingProducts.filter((product) => {
      if (!normalizedSearch) {
        return true;
      }

      return (
        product.productName.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [dashboard.trendingProducts, deferredSearch]);

  return (
    <section className="page-section">
      <PageHeader
        eyebrow="Dashboard"
        title="Local market demand at a glance"
        description="Track what is trending, where competition is still manageable, and which items are worth stocking next."
      />

      <div className="stats-grid">
        <StatCard
          label="Tracked products"
          value={dashboard.highlights.trackedProducts}
          hint="Distinct opportunities currently tracked"
        />
        <StatCard
          label="Average demand"
          value={`${dashboard.highlights.averageDemandScore}/100`}
          hint="Average score across top insights"
        />
        <StatCard
          label="Low competition"
          value={dashboard.highlights.lowCompetitionMarkets}
          hint="Products with room for new sellers"
        />
        <StatCard
          label="Avg selling price"
          value={formatCurrency(dashboard.highlights.averageSellingPrice)}
          hint={`${dashboard.highlights.enterRecommendations} products are ready to enter`}
        />
      </div>

      <FilterBar
        location={location}
        onLocationChange={setLocation}
        locations={locations}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      {dashboard.alerts.length ? (
        <div className="alert-stack">
          {dashboard.alerts.map((alert) => (
            <div key={alert.id} className="alert-banner compact">
              <div>
                <p className="eyebrow">Opportunity Alert</p>
                <strong>
                  {alert.productName} in {alert.location}
                </strong>
                <p className="muted">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {loading ? <div className="card">Loading dashboard...</div> : null}
      {error ? <div className="card error-card">{error}</div> : null}

      {!loading && !error && filteredProducts.length ? (
        <>
          <InsightChart products={filteredProducts} />
          <ProductTable products={filteredProducts} />
        </>
      ) : null}

      {!loading && !error && !filteredProducts.length ? (
        <EmptyState
          title="No products match this filter"
          message="Try another location or clear the search to see available opportunities."
        />
      ) : null}
    </section>
  );
}

